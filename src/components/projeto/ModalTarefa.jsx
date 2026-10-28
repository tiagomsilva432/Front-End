import { useEffect, useRef, useState } from "react";
import {
  COLUNAS_TAREFA,
  PRIORIDADES_TAREFA,
  anexarFicheiroTarefa,
  apagarComentario,
  apagarTarefa,
  atualizarTarefa,
  comentarTarefa,
  corrigirComentario,
  criarTarefa,
  listarComentarios,
  moverTarefa,
  tirarAnexoTarefa,
} from "../../services/taskservice";
import { useNotificacoes } from "../../notificacoes/notificacoes";
import { useTheme } from "../../theme/tema";
import { idDe, isoLocal, nomeCompleto, tempoRelativo } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import Avatar from "../ui/Avatar";
import Campo from "../ui/Campo";
import Ficheiros from "../ui/Ficheiros";
import Modal from "../ui/Modal";
import { normalizarEtiquetas, podeApagar, podeAtribuir, podeEditarDetalhes, podeEditarTarefa, podeEditarTexto, podeMover } from "./regrasTarefa";

const formDe = (t) => ({
  title: t?.title || "",
  description: t?.description || "",
  assigneeId: t?.assigneeId || "",
  dueDate: t?.dueDate || "",
  priority: t?.priority || "medium",
  labels: (t?.labels || []).join(", "),
  status: t?.status === "in_progress" ? "in_progress" : "todo",
});

// Criar (sem `tarefa`) ou ver/alterar uma tarefa do quadro, com mover, anexos e comentários.
// `onAlterada(tarefa, order?)` devolve ao quadro a versão nova (e a ordem das colunas, depois de mover).
export default function ModalTarefa({ projectId, tarefa: inicial, token, eu, gere, membros, pessoas, etiquetas, onFechar, onAlterada, onApagada }) {
  const tema = useTheme();
  const { ouvir } = useNotificacoes();
  const nova = !inicial;
  const [tarefa, setTarefa] = useState(inicial);
  const [original, setOriginal] = useState(() => formDe(inicial));
  const [form, setForm] = useState(original);
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState("");
  const [destino, setDestino] = useState(inicial?.status || "todo");
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [comentarioEmEdicao, setComentarioEmEdicao] = useState(null);
  const [aApagar, setAApagar] = useState(false);
  // Em ref: o pai passa uma função nova a cada render, e o efeito dos comentários não deve recomeçar por isso.
  const fechar = useRef(onFechar);
  useEffect(() => {
    fechar.current = onFechar;
  }, [onFechar]);

  const pessoaPorId = new Map(pessoas.map((p) => [idDe(p), p]));
  const nomeDe = (id) => (id === eu?.id ? "Eu" : nomeCompleto(pessoaPorId.get(id)) || pessoaPorId.get(id)?.email || "Membro");

  // Comentários: carga + tempo real (project_task_comment).
  useEffect(() => {
    if (nova) return;
    let ativo = true;
    listarComentarios(projectId, inicial.id, token)
      .then((lista) => ativo && setComentarios(Array.isArray(lista) ? lista : []))
      .catch((err) => console.error("Erro ao carregar os comentários:", err));
    const parar = ouvir("project_task_comment", (e) => {
      if (e.projectId !== projectId) return;
      if (e.action === "deleted") {
        if (e.taskId === inicial.id) setComentarios((c) => c.filter((x) => x.id !== e.id));
        return;
      }
      if (e.comment?.taskId !== inicial.id) return;
      setComentarios((c) => (c.some((x) => x.id === e.comment.id) ? c.map((x) => (x.id === e.comment.id ? e.comment : x)) : [...c, e.comment]));
    });
    // A própria tarefa também pode mudar enquanto está aberta (outro membro, outra aba).
    const pararTarefa = ouvir("project_task", (e) => {
      if (e.action === "deleted" && e.id === inicial.id) fechar.current();
      else if (e.task?.id === inicial.id) setTarefa(e.task);
    });
    return () => {
      ativo = false;
      parar();
      pararTarefa();
    };
  }, [nova, projectId, inicial?.id, token, ouvir]);

  const alterar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  const marcarErros = (err, padrao) => {
    const campos = Array.isArray(err.data?.data) ? err.data.data.map((d) => d.message).join(" ") : "";
    setErro(campos || err.message || padrao);
  };

  const guardar = async (e) => {
    e.preventDefault();
    setErro("");
    const etiquetas = normalizarEtiquetas(form.labels);
    setAGuardar(true);
    try {
      if (nova) {
        const criada = await criarTarefa(
          projectId,
          {
            title: form.title.trim(),
            status: form.status,
            priority: form.priority,
            ...(form.description.trim() ? { description: form.description.trim() } : {}),
            ...(form.assigneeId ? { assigneeId: form.assigneeId } : {}),
            ...(form.dueDate ? { dueDate: form.dueDate } : {}),
            ...(etiquetas.length ? { labels: etiquetas } : {}),
          },
          token,
        );
        onAlterada(criada);
        onFechar();
        return;
      }
      const alteracoes = {};
      if (form.title.trim() !== original.title) alteracoes.title = form.title.trim();
      if (form.description.trim() !== original.description) alteracoes.description = form.description.trim() || null;
      if (form.assigneeId !== original.assigneeId) alteracoes.assigneeId = form.assigneeId || null;
      if (form.dueDate !== original.dueDate) alteracoes.dueDate = form.dueDate || null;
      if (form.priority !== original.priority) alteracoes.priority = form.priority;
      if (etiquetas.join(",") !== normalizarEtiquetas(original.labels).join(",")) alteracoes.labels = etiquetas;
      if (Object.keys(alteracoes).length) {
        const atualizada = await atualizarTarefa(projectId, tarefa.id, alteracoes, token);
        setTarefa(atualizada);
        const novoOriginal = formDe(atualizada);
        setOriginal(novoOriginal);
        setForm(novoOriginal);
        onAlterada(atualizada);
      }
    } catch (err) {
      marcarErros(err, "Não foi possível guardar a tarefa.");
    } finally {
      setAGuardar(false);
    }
  };

  const mover = async () => {
    if (destino === tarefa.status) return;
    setErro("");
    setAGuardar(true);
    try {
      // Fica no topo da coluna de destino.
      const { task, order } = await moverTarefa(projectId, tarefa.id, destino, 0, token);
      setTarefa(task);
      onAlterada(task, order);
    } catch (err) {
      marcarErros(err, "Não foi possível mover a tarefa.");
    } finally {
      setAGuardar(false);
    }
  };

  const apagar = async () => {
    setErro("");
    try {
      await apagarTarefa(projectId, tarefa.id, token);
      onApagada(tarefa.id);
      onFechar();
    } catch (err) {
      setErro(err.message || "Não foi possível apagar a tarefa.");
    }
  };

  const comentar = async (e) => {
    e.preventDefault();
    const corpo = novoComentario.trim();
    if (!corpo) return;
    try {
      const c = await comentarTarefa(projectId, tarefa.id, corpo, token);
      setComentarios((atuais) => (atuais.some((x) => x.id === c.id) ? atuais : [...atuais, c]));
      setNovoComentario("");
    } catch (err) {
      setErro(err.message || "Não foi possível comentar.");
    }
  };

  const destinos = COLUNAS_TAREFA.filter(([s]) => s === tarefa?.status || (tarefa && podeMover(tarefa, s, { eu, gere })));
  const estadoAtual = COLUNAS_TAREFA.find(([s]) => s === tarefa?.status)?.[1];
  const podeEditar = podeEditarTarefa(tarefa, { gere });
  const podeTexto = podeEditarTexto(tarefa, { eu, gere });
  const podeDetalhes = podeEditarDetalhes(tarefa, { eu, gere }, form.assigneeId || null);
  const podeAnexar = podeEditarDetalhes(tarefa, { eu, gere });
  const semResponsavel = podeAtribuir(tarefa, null, { eu, gere });
  const responsaveis = membros.filter((p) => podeAtribuir(tarefa, idDe(p), { eu, gere }));
  const escolheResponsavel = podeEditar && responsaveis.length + (semResponsavel ? 1 : 0) > 1;
  const algoEditavel = podeTexto || podeDetalhes || escolheResponsavel;

  return (
    <Modal
      id="modal-tarefa"
      titulo={nova ? "Nova tarefa" : tarefa.title}
      subtitulo={nova ? undefined : `${estadoAtual} · criada por ${nomeDe(tarefa.createdBy)} ${tempoRelativo(tarefa.createdAt)}`}
      onFechar={onFechar}
      bloqueado={aGuardar}
      largura="max-w-3xl"
    >
      <div className="space-y-5">
        {erro && <Alerta>{erro}</Alerta>}

        {!nova && (
          <div className={`flex flex-wrap items-end gap-2 rounded-xl border p-3 ${tema.border} ${tema.cardMuted}`}>
            <Campo id="tarefa-destino" label="Mover para" como="select" value={destino} onChange={(e) => setDestino(e.target.value)} disabled={aGuardar || destinos.length < 2} className="min-w-44">
              {destinos.map(([s, rotulo]) => (
                <option key={s} value={s}>
                  {rotulo}
                  {s === "done" && tarefa.status === "review" ? " (aprovar)" : ""}
                </option>
              ))}
            </Campo>
            <button
              type="button"
              disabled={aGuardar || destino === tarefa.status}
              onClick={mover}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50 ${tema.primaryBtn}`}
            >
              {destino === "done" && tarefa.status === "review" ? "Aprovar" : tarefa.status === "review" && destino !== "done" && destino !== "review" ? "Devolver" : "Mover"}
            </button>
            <p className={`w-full text-[11px] ${tema.muted}`}>
              {tarefa.status === "review" && !gere
                ? "Só o gestor do projeto ou um administrador aprova (passa a Concluído)."
                : destinos.length < 2
                  ? "Só o responsável, o gestor ou um administrador mexem nesta tarefa."
                  : "Para ficar concluída, a tarefa passa primeiro pela revisão."}
            </p>
          </div>
        )}

        <form onSubmit={guardar} className="space-y-4">
          {!podeEditar ? (
            <p className={`text-[11px] ${tema.muted}`}>Uma tarefa concluída só é alterada pelo gestor ou por um administrador.</p>
          ) : !podeDetalhes ? (
            <p className={`text-[11px] ${tema.muted}`}>
              Só quem criou a tarefa, o responsável, o gestor ou um administrador a alteram. Pode comentar
              {escolheResponsavel ? ", ou ficar com ela." : "."}
            </p>
          ) : (
            !podeTexto && <p className={`text-[11px] ${tema.muted}`}>Só quem criou a tarefa, o gestor ou um administrador alteram o título e a descrição.</p>
          )}
          <Campo id="tarefa-titulo" label="Título" obrigatorio maxLength={150} value={form.title} onChange={alterar("title")} disabled={aGuardar || !podeTexto} />
          <Campo
            id="tarefa-descricao"
            label="Descrição"
            como="textarea"
            rows={3}
            maxLength={5000}
            value={form.description}
            onChange={alterar("description")}
            disabled={aGuardar || !podeTexto}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo id="tarefa-responsavel" label="Responsável" como="select" value={form.assigneeId} onChange={alterar("assigneeId")} disabled={aGuardar || !escolheResponsavel}>
              {semResponsavel && <option value="">Sem responsável</option>}
              {responsaveis.map((p) => (
                <option key={idDe(p)} value={idDe(p)}>
                  {nomeCompleto(p) || p.email}
                  {idDe(p) === eu?.id ? " (eu)" : ""}
                </option>
              ))}
            </Campo>
            <Campo id="tarefa-prazo" label="Prazo" type="date" value={form.dueDate} onChange={alterar("dueDate")} disabled={aGuardar || !podeDetalhes} />
            <Campo id="tarefa-prioridade" label="Prioridade" como="select" value={form.priority} onChange={alterar("priority")} disabled={aGuardar || !podeDetalhes}>
              {Object.entries(PRIORIDADES_TAREFA).map(([v, r]) => (
                <option key={v} value={v}>
                  {r}
                </option>
              ))}
            </Campo>
            {nova ? (
              <Campo id="tarefa-coluna" label="Coluna" como="select" value={form.status} onChange={alterar("status")} disabled={aGuardar}>
                <option value="todo">A fazer</option>
                <option value="in_progress">Em curso</option>
              </Campo>
            ) : (
              <div />
            )}
            <div className="sm:col-span-2">
              <Campo
                id="tarefa-etiquetas"
                label="Etiquetas (separadas por vírgulas)"
                list="etiquetas-do-projeto"
                placeholder="ex.: bug, frontend"
                value={form.labels}
                onChange={alterar("labels")}
                disabled={aGuardar || !podeDetalhes}
              />
              <datalist id="etiquetas-do-projeto">
                {etiquetas.map((e) => (
                  <option key={e} value={e} />
                ))}
              </datalist>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            {!nova && podeApagar(tarefa, { eu, gere }) ? (
              aApagar ? (
                <span className="flex items-center gap-2 text-xs">
                  <span className={tema.muted}>Apagar com os anexos e comentários?</span>
                  <button type="button" onClick={() => setAApagar(false)} className={`rounded-lg border px-2.5 py-1 font-semibold ${tema.secondaryBtn}`}>
                    Não
                  </button>
                  <button type="button" onClick={apagar} className="rounded-lg bg-red-600 px-2.5 py-1 font-semibold text-white">
                    Apagar
                  </button>
                </span>
              ) : (
                <button type="button" onClick={() => setAApagar(true)} className="text-xs font-semibold text-red-500 hover:underline">
                  Apagar tarefa
                </button>
              )
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button type="button" disabled={aGuardar} onClick={onFechar} className={`rounded-xl border px-4 py-2 text-sm ${tema.secondaryBtn}`}>
                {nova ? "Cancelar" : "Fechar"}
              </button>
              <button type="submit" disabled={aGuardar || !algoEditavel || !form.title.trim()} className={`rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60 ${tema.primaryBtn}`}>
                {aGuardar ? "A guardar…" : nova ? "Criar tarefa" : "Guardar alterações"}
              </button>
            </div>
          </div>
        </form>

        {!nova && (
          <>
            <div className={`border-t pt-4 ${tema.border}`}>
              <h3 className="mb-2 text-sm font-semibold">Anexos</h3>
              <Ficheiros
                ficheiros={tarefa.attachments || []}
                podeAlterar={podeAnexar}
                rotulo="Anexar ficheiro"
                onEnviar={async (f) => {
                  const anexo = await anexarFicheiroTarefa(projectId, tarefa.id, f, token);
                  const atualizada = { ...tarefa, attachments: [...(tarefa.attachments || []), anexo] };
                  setTarefa(atualizada);
                  onAlterada(atualizada);
                }}
                onApagar={async (f) => {
                  await tirarAnexoTarefa(projectId, tarefa.id, f.id, token);
                  const atualizada = { ...tarefa, attachments: (tarefa.attachments || []).filter((a) => a.id !== f.id) };
                  setTarefa(atualizada);
                  onAlterada(atualizada);
                }}
              />
            </div>

            <div className={`border-t pt-4 ${tema.border}`}>
              <h3 className="mb-3 text-sm font-semibold">Comentários ({comentarios.length})</h3>
              <ul className="space-y-3">
                {comentarios.map((c) => {
                  const pessoa = pessoaPorId.get(c.authorId);
                  const meu = c.authorId === eu?.id;
                  return (
                    <li key={c.id} className="flex gap-2.5">
                      <Avatar url={pessoa?.profile?.avatarUrl} nome={pessoa?.profile?.firstName || pessoa?.email} tamanho="sm" />
                      <div className="min-w-0 flex-1">
                        <p className={`text-[11px] ${tema.muted}`}>
                          <span className={`font-semibold ${tema.strong}`}>{nomeDe(c.authorId)}</span> · {tempoRelativo(c.createdAt)}
                          {c.editedAt && " · editado"}
                        </p>
                        {comentarioEmEdicao?.id === c.id ? (
                          <div className="mt-1 space-y-1">
                            <textarea
                              rows={2}
                              maxLength={2000}
                              value={comentarioEmEdicao.texto}
                              onChange={(e) => setComentarioEmEdicao((x) => ({ ...x, texto: e.target.value }))}
                              className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${tema.input}`}
                            />
                            <div className="flex gap-3 text-xs font-semibold">
                              <button
                                type="button"
                                className={tema.accent}
                                onClick={async () => {
                                  try {
                                    const novo = await corrigirComentario(projectId, tarefa.id, c.id, comentarioEmEdicao.texto.trim(), token);
                                    setComentarios((l) => l.map((x) => (x.id === c.id ? novo : x)));
                                    setComentarioEmEdicao(null);
                                  } catch (err) {
                                    setErro(err.message);
                                  }
                                }}
                              >
                                Guardar
                              </button>
                              <button type="button" className={tema.muted} onClick={() => setComentarioEmEdicao(null)}>
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-0.5 whitespace-pre-line break-words text-sm">{c.body}</p>
                        )}
                        {comentarioEmEdicao?.id !== c.id && (meu || gere) && (
                          <span className="mt-0.5 flex gap-3 text-[11px] font-semibold">
                            {meu && (
                              <button type="button" className={tema.muted} onClick={() => setComentarioEmEdicao({ id: c.id, texto: c.body })}>
                                Corrigir
                              </button>
                            )}
                            <button
                              type="button"
                              className="text-red-500"
                              onClick={async () => {
                                try {
                                  await apagarComentario(projectId, tarefa.id, c.id, token);
                                  setComentarios((l) => l.filter((x) => x.id !== c.id));
                                } catch (err) {
                                  setErro(err.message);
                                }
                              }}
                            >
                              Apagar
                            </button>
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <form onSubmit={comentar} className="mt-3 flex items-end gap-2">
                <textarea
                  rows={2}
                  maxLength={2000}
                  value={novoComentario}
                  placeholder="Escrever um comentário…"
                  aria-label="Escrever um comentário"
                  onChange={(e) => setNovoComentario(e.target.value)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:ring-4 ${tema.input}`}
                />
                <button type="submit" disabled={!novoComentario.trim()} className={`rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50 ${tema.primaryBtn}`}>
                  Comentar
                </button>
              </form>
            </div>
          </>
        )}
        {!nova && tarefa.dueDate && tarefa.status !== "done" && tarefa.dueDate < isoLocal(new Date()) && (
          <Alerta tipo="aviso">O prazo desta tarefa já passou.</Alerta>
        )}
      </div>
    </Modal>
  );
}
