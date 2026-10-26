import { useEffect, useState } from "react";
import {
  CATEGORIAS_COMPETENCIA,
  definirCompetenciaUser,
  listarCompetencias,
  listarCompetenciasUser,
  removerCompetenciaUser,
} from "../../services/skillservice";
import { useTheme } from "../../theme/tema";
import { nomeCompleto } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import Campo from "../ui/Campo";
import Modal from "../ui/Modal";
import NivelCompetencia from "../ui/NivelCompetencia";

const vazio = { skillId: "", proficiency: "", yearsExperience: "" };

// O PUT substitui: o que não for enviado fica a null.
const corpo = ({ proficiency, yearsExperience }) => ({
  ...(proficiency ? { proficiency: Number(proficiency) } : {}),
  ...(String(yearsExperience).trim() ? { yearsExperience: String(yearsExperience).trim() } : {}),
});

// Competências de um colaborador (GET/PUT/DELETE /users/:id/skills). Ninguém define as próprias.
export default function ModalCompetencias({ colaborador, token, onFechar }) {
  const tema = useTheme();
  const [competencias, setCompetencias] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [recarga, setRecarga] = useState(0);
  const [nova, setNova] = useState(vazio);
  const [emEdicao, setEmEdicao] = useState(null); // { skillId, proficiency, yearsExperience }
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    let ativo = true;
    Promise.all([listarCompetenciasUser(colaborador.id, token), listarCompetencias(token)])
      .then(([daPessoa, todas]) => {
        if (!ativo) return;
        setCompetencias(Array.isArray(daPessoa) ? daPessoa : []);
        setCatalogo(Array.isArray(todas) ? todas : []);
      })
      .catch((err) => {
        if (ativo) setErro(err.message || "Não foi possível carregar as competências.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [colaborador.id, token, recarga]);

  const executar = async (acao, mensagem) => {
    setAGuardar(true);
    setErro("");
    setSucesso("");
    try {
      await acao();
      setSucesso(mensagem);
      setEmEdicao(null);
      setCarregando(true);
      setRecarga((n) => n + 1);
      return true;
    } catch (err) {
      setErro(err.message || "Não foi possível guardar.");
      return false;
    } finally {
      setAGuardar(false);
    }
  };

  const adicionar = async (e) => {
    e.preventDefault();
    const nome = catalogo.find((s) => s.id === nova.skillId)?.name || "Competência";
    const ok = await executar(
      () => definirCompetenciaUser(colaborador.id, nova.skillId, corpo(nova), token),
      `${nome} atribuída.`,
    );
    if (ok) setNova(vazio);
  };

  const jaTem = new Set(competencias.map((c) => c.skillId));
  const disponiveis = catalogo.filter((s) => !jaTem.has(s.id));
  const nome = nomeCompleto(colaborador);

  const camposNivel = (valores, alterar, prefixo) => (
    <>
      <Campo
        id={`${prefixo}-nivel`}
        label="Proficiência"
        como="select"
        value={valores.proficiency}
        onChange={alterar("proficiency")}
        disabled={aGuardar}
      >
        <option value="">Sem nível</option>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n} / 5
          </option>
        ))}
      </Campo>
      <Campo
        id={`${prefixo}-anos`}
        label="Anos de experiência"
        type="number"
        min="0"
        max="999.9"
        step="0.5"
        value={valores.yearsExperience}
        onChange={alterar("yearsExperience")}
        disabled={aGuardar}
      />
    </>
  );

  return (
    <Modal
      id="competencias-colaborador"
      titulo="Competências do colaborador"
      subtitulo={nome ? `${nome} · ${colaborador.email}` : colaborador.email}
      onFechar={onFechar}
      bloqueado={aGuardar}
      largura="max-w-2xl"
    >
      <div className="space-y-5">
        {erro && <Alerta>{erro}</Alerta>}
        {sucesso && <Alerta tipo="sucesso">{sucesso}</Alerta>}

        <div>
          <h3 className="mb-3 text-sm font-semibold">Competências atribuídas</h3>
          {carregando || competencias.length === 0 ? (
            <p className={`rounded-xl border p-4 text-sm ${tema.border} ${tema.muted}`}>
              {carregando ? "A carregar competências…" : "Ainda não há competências atribuídas."}
            </p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {competencias.map((c) => (
                <div key={c.skillId} className={`rounded-xl border p-3 ${tema.border} ${tema.cardMuted}`}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{c.name}</p>
                      <p className={`mt-1 text-xs ${tema.muted}`}>
                        {CATEGORIAS_COMPETENCIA[c.category] || c.category}
                        {c.yearsExperience ? ` · ${Number(c.yearsExperience)} anos` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <NivelCompetencia nivel={c.proficiency} />
                      {emEdicao?.skillId !== c.skillId && (
                        <>
                          <button
                            type="button"
                            disabled={aGuardar}
                            onClick={() =>
                              setEmEdicao({
                                skillId: c.skillId,
                                proficiency: c.proficiency ? String(c.proficiency) : "",
                                yearsExperience: c.yearsExperience ?? "",
                              })
                            }
                            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${tema.secondaryBtn}`}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            disabled={aGuardar}
                            onClick={() =>
                              executar(() => removerCompetenciaUser(colaborador.id, c.skillId, token), `${c.name} removida.`)
                            }
                            className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                          >
                            Remover
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {emEdicao?.skillId === c.skillId && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        executar(
                          () => definirCompetenciaUser(colaborador.id, c.skillId, corpo(emEdicao), token),
                          `${c.name} atualizada.`,
                        );
                      }}
                      className={`mt-3 space-y-3 border-t pt-3 ${tema.border}`}
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        {camposNivel(
                          emEdicao,
                          (campo) => (e) => setEmEdicao((atual) => ({ ...atual, [campo]: e.target.value })),
                          `editar-${c.skillId}`,
                        )}
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={aGuardar}
                          onClick={() => setEmEdicao(null)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${tema.secondaryBtn}`}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={aGuardar}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${tema.primaryBtn}`}
                        >
                          {aGuardar ? "A guardar…" : "Guardar"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={adicionar} className={`space-y-4 border-t pt-5 ${tema.border}`}>
          <div>
            <h3 className="text-sm font-semibold">Atribuir competência</h3>
            <p className={`mt-1 text-xs ${tema.muted}`}>
              O catálogo é comum a todas as empresas. Se faltar alguma, peça ao administrador do sistema.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              id="nova-competencia"
              label="Competência"
              obrigatorio
              como="select"
              className="sm:col-span-2"
              value={nova.skillId}
              onChange={(e) => setNova((atual) => ({ ...atual, skillId: e.target.value }))}
              disabled={aGuardar || carregando}
            >
              <option value="">{disponiveis.length ? "Selecione uma competência" : "Não há mais competências no catálogo"}</option>
              {Object.entries(CATEGORIAS_COMPETENCIA).map(([categoria, rotulo]) => {
                const daCategoria = disponiveis.filter((s) => s.category === categoria);
                return daCategoria.length ? (
                  <optgroup key={categoria} label={rotulo}>
                    {daCategoria.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </optgroup>
                ) : null;
              })}
            </Campo>
            {camposNivel(nova, (campo) => (e) => setNova((atual) => ({ ...atual, [campo]: e.target.value })), "nova")}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={aGuardar}
              onClick={onFechar}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${tema.secondaryBtn}`}
            >
              Fechar
            </button>
            <button
              type="submit"
              disabled={aGuardar || carregando || !nova.skillId}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60 ${tema.primaryBtn}`}
            >
              {aGuardar ? "A guardar…" : "Atribuir"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
