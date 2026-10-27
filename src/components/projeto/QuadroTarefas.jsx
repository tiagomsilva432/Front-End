import { useCallback, useEffect, useRef, useState } from "react";
import { COLUNAS_TAREFA, PRIORIDADES_TAREFA, listarEtiquetas, moverTarefa, obterQuadro } from "../../services/taskservice";
import { useNotificacoes } from "../../notificacoes/notificacoes";
import { useTheme } from "../../theme/tema";
import { formatarData, idDe, isoLocal, nomeCompleto } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import Avatar from "../ui/Avatar";
import Icone from "../ui/Icone";
import ModalTarefa from "./ModalTarefa";
import { atrasada, podeMover } from "./regrasTarefa";

const VAZIO = { todo: [], in_progress: [], review: [], done: [] };
const COR_PRIORIDADE = { low: "chip", medium: "chip", high: "aviso", critical: "erro" };

// Aplica `order` (as colunas afetadas, de cima para baixo) com a versão nova de uma tarefa.
function aplicarOrdem(quadro, order, tarefa) {
  const todas = new Map(Object.values(quadro).flat().map((t) => [t.id, t]));
  if (tarefa) todas.set(tarefa.id, tarefa);
  const novo = { ...quadro };
  for (const [status, ids] of Object.entries(order || {})) {
    novo[status] = ids.map((id) => todas.get(id)).filter(Boolean);
  }
  return novo;
}

// Põe (ou atualiza) uma tarefa na sua coluna, pela posição.
function porNaColuna(quadro, tarefa) {
  const novo = {};
  for (const [status, lista] of Object.entries(quadro)) novo[status] = lista.filter((t) => t.id !== tarefa.id);
  novo[tarefa.status] = [...(novo[tarefa.status] || []), tarefa].sort((a, b) => a.position - b.position);
  return novo;
}

// Quadro kanban de um projeto: 4 colunas fixas, arrastar (ou "Mover para" no cartão), filtros e tempo real.
export default function QuadroTarefas({ projectId, token, eu, gere, membros, pessoas, tarefaInicial }) {
  const tema = useTheme();
  const { ouvir } = useNotificacoes();
  const [quadro, setQuadro] = useState(VAZIO);
  const [etiquetas, setEtiquetas] = useState([]);
  const [filtros, setFiltros] = useState({ assigneeId: "", priority: "", label: "" });
  const [carregando, setCarregando] = useState(true);
  const [recarga, setRecarga] = useState(0);
  const [erro, setErro] = useState("");
  const [aberta, setAberta] = useState(null); // null | "nova" | tarefa
  const [arrastada, setArrastada] = useState(null);
  const [alvo, setAlvo] = useState(null); // { status, posicao } enquanto se arrasta
  const abriuInicial = useRef(false);
  const hoje = isoLocal(new Date());

  const recarregar = useCallback(() => setRecarga((n) => n + 1), []);

  useEffect(() => {
    let ativo = true;
    Promise.all([obterQuadro(projectId, token, filtros), listarEtiquetas(projectId, token).catch(() => [])])
      .then(([q, e]) => {
        if (!ativo) return;
        setQuadro({ ...VAZIO, ...q });
        setEtiquetas(Array.isArray(e) ? e : []);
        setErro("");
        // Vindo de uma notificação: abre a tarefa (uma vez).
        if (tarefaInicial && !abriuInicial.current) {
          const t = Object.values(q || {}).flat().find((x) => x.id === tarefaInicial);
          if (t) setAberta(t);
          abriuInicial.current = true;
        }
      })
      .catch((err) => ativo && setErro(err.message || "Não foi possível carregar o quadro."))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [projectId, token, filtros, recarga, tarefaInicial]);

  // Tempo real (project_task). Com filtros ligados, é mais simples voltar a pedir o quadro.
  useEffect(
    () =>
      ouvir("project_task", (e) => {
        const doProjeto = e.task ? e.task.projectId === projectId : e.projectId === projectId;
        if (!doProjeto) return;
        if (filtros.assigneeId || filtros.priority || filtros.label) {
          recarregar();
          return;
        }
        if (e.action === "deleted") setQuadro((q) => Object.fromEntries(Object.entries(q).map(([s, l]) => [s, l.filter((t) => t.id !== e.id)])));
        else if (e.action === "moved") setQuadro((q) => aplicarOrdem(q, e.order, e.task));
        else setQuadro((q) => porNaColuna(q, e.task));
      }),
    [ouvir, projectId, filtros, recarregar],
  );

  // Os comentários vêm num evento à parte: só acerta o 💬 do cartão.
  useEffect(
    () =>
      ouvir("project_task_comment", (e) => {
        if (e.projectId !== projectId || e.action === "updated") return;
        const taskId = e.action === "deleted" ? e.taskId : e.comment?.taskId;
        const passo = e.action === "deleted" ? -1 : 1;
        setQuadro((q) =>
          Object.fromEntries(
            Object.entries(q).map(([s, l]) => [s, l.map((t) => (t.id === taskId ? { ...t, commentCount: Math.max(0, t.commentCount + passo) } : t))]),
          ),
        );
      }),
    [ouvir, projectId],
  );

  const mover = async (tarefa, status, posicao) => {
    if (!podeMover(tarefa, status, { eu, gere })) {
      setErro(
        status === "done" && tarefa.status !== "review" && tarefa.status !== "done"
          ? "Uma tarefa tem de passar pela revisão antes de ficar concluída."
          : "Não pode mover esta tarefa para aí: fale com o gestor do projeto.",
      );
      return;
    }
    setErro("");
    const antes = quadro;
    // Otimista: mexe já no ecrã e depois aplica a ordem que o servidor devolve.
    setQuadro((q) => {
      const sem = Object.fromEntries(Object.entries(q).map(([s, l]) => [s, l.filter((t) => t.id !== tarefa.id)]));
      const coluna = [...sem[status]];
      coluna.splice(Math.min(posicao, coluna.length), 0, { ...tarefa, status });
      return { ...sem, [status]: coluna };
    });
    try {
      const { task, order } = await moverTarefa(projectId, tarefa.id, status, posicao, token);
      setQuadro((q) => aplicarOrdem(q, order, task));
    } catch (err) {
      setQuadro(antes);
      setErro(err.message || "Não foi possível mover a tarefa.");
    }
  };

  const pessoaPorId = new Map(pessoas.map((p) => [idDe(p), p]));
  const alterarFiltro = (campo) => (e) => {
    setCarregando(true);
    setFiltros((f) => ({ ...f, [campo]: e.target.value }));
  };
  const total = Object.values(quadro).reduce((n, l) => n + l.length, 0);
  const selectCls = `rounded-xl border px-3 py-2 text-xs outline-none ${tema.input}`;

  return (
    <div className="space-y-4">
      <div className={`flex flex-col gap-3 rounded-2xl border p-3 lg:flex-row lg:items-center lg:justify-between ${tema.card}`}>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={filtros.assigneeId === eu?.id}
            onClick={() => {
              setCarregando(true);
              setFiltros((f) => ({ ...f, assigneeId: f.assigneeId === eu?.id ? "" : eu?.id }));
            }}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${filtros.assigneeId === eu?.id ? tema.active : tema.secondaryBtn}`}
          >
            Só as minhas
          </button>
          <select aria-label="Filtrar por responsável" value={filtros.assigneeId} onChange={alterarFiltro("assigneeId")} className={selectCls}>
            <option value="">Todos os responsáveis</option>
            {membros.map((p) => (
              <option key={idDe(p)} value={idDe(p)}>
                {nomeCompleto(p) || p.email}
              </option>
            ))}
          </select>
          <select aria-label="Filtrar por prioridade" value={filtros.priority} onChange={alterarFiltro("priority")} className={selectCls}>
            <option value="">Todas as prioridades</option>
            {Object.entries(PRIORIDADES_TAREFA).map(([v, r]) => (
              <option key={v} value={v}>
                {r}
              </option>
            ))}
          </select>
          {etiquetas.length > 0 && (
            <select aria-label="Filtrar por etiqueta" value={filtros.label} onChange={alterarFiltro("label")} className={selectCls}>
              <option value="">Todas as etiquetas</option>
              {etiquetas.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          )}
        </div>
        <button type="button" onClick={() => setAberta("nova")} className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-md ${tema.primaryBtn}`}>
          <Icone nome="mais" className="h-3.5 w-3.5" />
          Nova tarefa
        </button>
      </div>

      {erro && <Alerta>{erro}</Alerta>}

      <div className={`grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 ${carregando ? "opacity-60" : ""}`}>
        {COLUNAS_TAREFA.map(([status, rotulo]) => {
          const lista = quadro[status] || [];
          const largavel = arrastada && podeMover(arrastada, status, { eu, gere });
          return (
            <section
              key={status}
              aria-label={`${rotulo}: ${lista.length} tarefas`}
              onDragOver={(e) => {
                if (!largavel) return;
                e.preventDefault();
                // Sobre a coluna vazia ou abaixo do último cartão: vai para o fim.
                if (e.target === e.currentTarget || !alvo || alvo.status !== status) setAlvo({ status, posicao: lista.length });
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (arrastada && alvo?.status === status) {
                  const semEla = lista.filter((t) => t.id !== arrastada.id);
                  const posicao = Math.min(alvo.posicao, semEla.length);
                  mover(arrastada, status, posicao);
                }
                setArrastada(null);
                setAlvo(null);
              }}
              className={`flex min-h-48 flex-col rounded-2xl border p-3 transition ${tema.border} ${tema.cardMuted} ${
                arrastada ? (largavel ? "ring-2 ring-emerald-500/50" : "opacity-50") : ""
              }`}
            >
              <h3 className="mb-3 flex items-center justify-between px-1 text-xs font-bold uppercase tracking-wider">
                {rotulo}
                <span className={`rounded-full border px-2 py-0.5 text-[10px] ${tema.chip}`}>{lista.length}</span>
              </h3>
              <ul className="flex-1 space-y-2">
                {lista.map((t, i) => {
                  const responsavel = pessoaPorId.get(t.assigneeId);
                  return (
                    <li
                      key={t.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", t.id);
                        setArrastada(t);
                      }}
                      onDragEnd={() => {
                        setArrastada(null);
                        setAlvo(null);
                      }}
                      onDragOver={(e) => {
                        if (!arrastada || !podeMover(arrastada, status, { eu, gere })) return;
                        e.preventDefault();
                        e.stopPropagation();
                        const r = e.currentTarget.getBoundingClientRect();
                        setAlvo({ status, posicao: e.clientY < r.top + r.height / 2 ? i : i + 1 });
                      }}
                    >
                      {alvo?.status === status && alvo.posicao === i && arrastada?.id !== t.id && <div className="mb-2 h-1 rounded bg-emerald-500" />}
                      <button
                        type="button"
                        onClick={() => setAberta(t)}
                        className={`w-full cursor-grab rounded-xl border p-3 text-left shadow-sm transition hover:-translate-y-0.5 active:cursor-grabbing ${tema.card} ${
                          arrastada?.id === t.id ? "opacity-40" : ""
                        }`}
                      >
                        <span className="flex items-start justify-between gap-2">
                          <span className="min-w-0 break-words text-sm font-semibold">{t.title}</span>
                          {t.priority !== "medium" && (
                            <span className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase ${tema[COR_PRIORIDADE[t.priority]]}`}>
                              {PRIORIDADES_TAREFA[t.priority]}
                            </span>
                          )}
                        </span>
                        {t.labels.length > 0 && (
                          <span className="mt-2 flex flex-wrap gap-1">
                            {t.labels.map((l) => (
                              <span key={l} className={`rounded px-1.5 py-0.5 text-[10px] ${tema.chip} border`}>
                                {l}
                              </span>
                            ))}
                          </span>
                        )}
                        <span className={`mt-2.5 flex items-center justify-between gap-2 text-[11px] ${tema.muted}`}>
                          <span className="flex items-center gap-2.5">
                            {t.dueDate && (
                              <span className={atrasada(t, hoje) ? "font-semibold text-red-500" : ""}>
                                {atrasada(t, hoje) ? "Atrasada · " : ""}
                                {formatarData(t.dueDate)}
                              </span>
                            )}
                            {t.commentCount > 0 && <span aria-label={`${t.commentCount} comentários`}>💬 {t.commentCount}</span>}
                            {t.attachments.length > 0 && <span aria-label={`${t.attachments.length} anexos`}>📎 {t.attachments.length}</span>}
                          </span>
                          {responsavel ? (
                            <span title={nomeCompleto(responsavel) || responsavel.email}>
                              <Avatar url={responsavel.profile?.avatarUrl} nome={responsavel.profile?.firstName || responsavel.email} tamanho="sm" />
                            </span>
                          ) : (
                            <span className="text-[10px]">Sem responsável</span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
                {alvo?.status === status && alvo.posicao >= lista.length && arrastada && <li className="h-1 rounded bg-emerald-500" aria-hidden="true" />}
              </ul>
              {!carregando && lista.length === 0 && !arrastada && <p className={`px-1 py-6 text-center text-xs ${tema.muted}`}>Sem tarefas</p>}
            </section>
          );
        })}
      </div>
      {!carregando && total === 0 && !filtros.assigneeId && !filtros.priority && !filtros.label && (
        <p className={`text-center text-xs ${tema.muted}`}>Crie a primeira tarefa do projeto com “Nova tarefa”. Arraste os cartões para os mudar de coluna.</p>
      )}

      {aberta && (
        <ModalTarefa
          key={aberta === "nova" ? "nova" : aberta.id}
          projectId={projectId}
          tarefa={aberta === "nova" ? null : aberta}
          token={token}
          eu={eu}
          gere={gere}
          membros={membros}
          pessoas={pessoas}
          etiquetas={etiquetas}
          onFechar={() => setAberta(null)}
          onAlterada={(tarefa, order) => {
            setQuadro((q) => (order ? aplicarOrdem(q, order, tarefa) : porNaColuna(q, tarefa)));
            if (tarefa.labels?.some((l) => !etiquetas.includes(l))) setEtiquetas((e) => [...new Set([...e, ...tarefa.labels])].sort());
          }}
          onApagada={(id) => setQuadro((q) => Object.fromEntries(Object.entries(q).map(([s, l]) => [s, l.filter((t) => t.id !== id)])))}
        />
      )}
    </div>
  );
}
