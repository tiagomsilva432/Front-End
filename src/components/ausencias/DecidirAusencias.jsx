import { useEffect, useState } from "react";
import {
  ESTADOS_AUSENCIA,
  TIPOS_AUSENCIA,
  apagarDocumento,
  aprovarAusencia,
  cancelarAusencia,
  enviarDocumento,
  listarAusencias,
  recusarAusencia,
} from "../../services/absenceservice";
import { useNotificacoes } from "../../notificacoes/notificacoes";
import { useTheme } from "../../theme/tema";
import { formatarIntervalo, idDe, nomeCompleto, tempoRelativo } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import Ficheiros from "../ui/Ficheiros";
import { corDoEstado } from "./estiloAusencia";

// Os pedidos de ausência da empresa para decidir (GET /absences). Ninguém decide o próprio pedido.
// `destaqueId` (de uma notificação, ex.: documento novo) realça e mostra esse pedido.
export default function DecidirAusencias({ token, pessoas, meuId, destaqueId }) {
  const tema = useTheme();
  const { versaoDados } = useNotificacoes();
  // Vindo de uma notificação, mostra todos: uma baixa já chega aprovada.
  const [estado, setEstado] = useState(destaqueId ? "" : "pending");
  const [pessoa, setPessoa] = useState("");
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [recarga, setRecarga] = useState(0);
  const [aberto, setAberto] = useState(null); // { id, acao: "recusar" | "cancelar" }
  const [motivo, setMotivo] = useState("");
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    let ativo = true;
    listarAusencias(token, { estado, userId: pessoa })
      .then((lista) => {
        if (!ativo) return;
        setPedidos(Array.isArray(lista) ? lista : []);
        setErro("");
      })
      .catch((err) => ativo && setErro(err.message || "Não foi possível carregar os pedidos."))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [token, estado, pessoa, recarga, versaoDados]);

  useEffect(() => {
    if (!destaqueId || carregando) return;
    document.getElementById(`ausencia-${destaqueId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [destaqueId, carregando, pedidos]);

  const atualizarDocumentos = (id, fn) =>
    setPedidos((atuais) => atuais.map((a) => (a.id === id ? { ...a, documents: fn(a.documents || []) } : a)));

  const pessoaPorId = new Map(pessoas.map((p) => [idDe(p), p]));
  const nomeDe = (id) => nomeCompleto(pessoaPorId.get(id)) || pessoaPorId.get(id)?.email || "Colaborador";

  const decidir = async (acao, pedido, mensagem) => {
    setAGuardar(true);
    setErro("");
    setSucesso("");
    try {
      await acao();
      setSucesso(`${mensagem} (${nomeDe(pedido.userId)}, ${formatarIntervalo(pedido.startDate, pedido.endDate)}).`);
      setAberto(null);
      setMotivo("");
      setCarregando(true);
      setRecarga((n) => n + 1);
    } catch (err) {
      setErro(err.message || "Não foi possível concluir a decisão.");
    } finally {
      setAGuardar(false);
    }
  };

  const filtroEstado = (valor, rotulo) => (
    <button
      key={valor || "todos"}
      type="button"
      aria-pressed={estado === valor}
      onClick={() => {
        setCarregando(true);
        setEstado(valor);
      }}
      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${estado === valor ? tema.active : tema.secondaryBtn}`}
    >
      {rotulo}
    </button>
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold sm:text-2xl">Pedidos de ausência</h2>
        <p className={`mt-1 text-sm ${tema.muted}`}>
          Aprove ou recuse os pedidos da equipa. Os seus próprios pedidos são decididos por outro administrador.
        </p>
      </div>

      <div className={`flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between ${tema.card}`}>
        <div className="flex flex-wrap gap-2">
          {filtroEstado("pending", "Pendentes")}
          {filtroEstado("approved", "Aprovados")}
          {filtroEstado("", "Todos")}
        </div>
        <select
          aria-label="Filtrar por pessoa"
          value={pessoa}
          onChange={(e) => {
            setCarregando(true);
            setPessoa(e.target.value);
          }}
          className={`rounded-xl border px-3 py-2 text-xs outline-none ${tema.input}`}
        >
          <option value="">Todas as pessoas</option>
          {pessoas.map((p) => (
            <option key={idDe(p)} value={idDe(p)}>
              {nomeCompleto(p) || p.email}
            </option>
          ))}
        </select>
      </div>

      {erro && <Alerta>{erro}</Alerta>}
      {sucesso && <Alerta tipo="sucesso">{sucesso}</Alerta>}

      {carregando || pedidos.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center text-sm ${tema.card} ${tema.muted}`}>
          {carregando ? "A carregar pedidos…" : estado === "pending" ? "Não há pedidos por decidir." : "Não há pedidos com este filtro."}
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((a) => {
            const meu = a.userId === meuId;
            const estaAberto = aberto?.id === a.id;
            return (
              <article
                key={a.id}
                id={`ausencia-${a.id}`}
                className={`rounded-2xl border p-4 sm:p-5 ${tema.card} ${a.id === destaqueId ? "ring-2 ring-emerald-500" : ""}`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {nomeDe(a.userId)}
                      {meu && <span className={`ml-2 text-xs font-normal ${tema.muted}`}>(o seu pedido)</span>}
                    </p>
                    <p className="mt-1 text-sm">
                      {TIPOS_AUSENCIA[a.type] || a.type} · {formatarIntervalo(a.startDate, a.endDate)} ·{" "}
                      <span className={tema.muted}>
                        {a.workingDays} {a.workingDays === 1 ? "dia útil" : "dias úteis"}
                      </span>
                    </p>
                    <p className={`mt-1 text-xs ${tema.muted}`}>
                      Pedido {tempoRelativo(a.createdAt)}
                      {a.note ? ` · Nota: ${a.note}` : ""}
                      {a.decisionNote ? ` · Motivo: ${a.decisionNote}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <span className={`rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase ${corDoEstado(tema, a.status)}`}>
                      {ESTADOS_AUSENCIA[a.status] || a.status}
                    </span>
                    {!estaAberto && a.status === "pending" && !meu && (
                      <>
                        <button
                          type="button"
                          disabled={aGuardar}
                          onClick={() => decidir(() => aprovarAusencia(a.id, token), a, "Pedido aprovado")}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${tema.primaryBtn}`}
                        >
                          Aprovar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMotivo("");
                            setAberto({ id: a.id, acao: "recusar" });
                          }}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${tema.secondaryBtn}`}
                        >
                          Recusar
                        </button>
                      </>
                    )}
                    {!estaAberto && (a.status === "approved" || (a.status === "pending" && meu)) && (
                      <button
                        type="button"
                        onClick={() => {
                          setMotivo("");
                          setAberto({ id: a.id, acao: "cancelar" });
                        }}
                        className="text-xs font-semibold text-red-500 hover:underline"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>

                {(a.documents?.length > 0 || ["pending", "approved"].includes(a.status)) && (
                  <div className={`mt-3 border-t pt-3 ${tema.border}`}>
                    <p className={`mb-1.5 text-xs font-semibold ${tema.muted}`}>Documentos</p>
                    <Ficheiros
                      ficheiros={a.documents || []}
                      podeAlterar={["pending", "approved"].includes(a.status)}
                      rotulo="Juntar documento"
                      onEnviar={async (ficheiro) => {
                        const novo = await enviarDocumento(a.id, ficheiro, token);
                        atualizarDocumentos(a.id, (docs) => [...docs, novo]);
                      }}
                      onApagar={async (ficheiro) => {
                        await apagarDocumento(a.id, ficheiro.id, token);
                        atualizarDocumentos(a.id, (docs) => docs.filter((d) => d.id !== ficheiro.id));
                      }}
                    />
                  </div>
                )}

                {estaAberto && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (aberto.acao === "recusar") {
                        decidir(() => recusarAusencia(a.id, motivo.trim(), token), a, "Pedido recusado");
                      } else {
                        decidir(() => cancelarAusencia(a.id, motivo.trim(), token), a, "Pedido cancelado");
                      }
                    }}
                    className={`mt-3 space-y-3 border-t pt-3 ${tema.border}`}
                  >
                    <label htmlFor={`motivo-${a.id}`} className={`block text-xs font-semibold ${tema.label}`}>
                      Motivo (opcional, vai na notificação à pessoa)
                    </label>
                    <input
                      id={`motivo-${a.id}`}
                      maxLength={1000}
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      disabled={aGuardar}
                      placeholder={aberto.acao === "recusar" ? "Ex.: Já há duas pessoas da equipa fora nessa semana" : "Ex.: Voltou mais cedo"}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:ring-4 ${tema.input}`}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={aGuardar}
                        onClick={() => setAberto(null)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${tema.secondaryBtn}`}
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        disabled={aGuardar}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                      >
                        {aGuardar ? "A guardar…" : aberto.acao === "recusar" ? "Recusar pedido" : "Cancelar ausência"}
                      </button>
                    </div>
                  </form>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
