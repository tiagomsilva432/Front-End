import { useEffect, useState } from "react";
import { ESTADOS_PEDIDO, listarMeusPedidos, recusarPedido, responderPedido } from "../../services/reviewservice";
import { listarUsers } from "../../services/userservice";
import { useTheme } from "../../theme/tema";
import { formatarData, idDe, nomeCompleto } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import Campo from "../ui/Campo";

const COR_ESTADO = { pending: "aviso", submitted: "sucesso", declined: "chip", expired: "chip" };
const respostaVazia = { recommendsRaise: "", performanceScore: "", comments: "" };

// Pedidos de avaliação dirigidos a quem tem a sessão (GET /review-requests/mine).
// Uma resposta é definitiva. Sem `pessoas`, carrega os colegas da empresa para mostrar os nomes.
export default function CaixaAvaliacoes({ token, pessoas: pessoasDadas }) {
  const tema = useTheme();
  const [pedidos, setPedidos] = useState([]);
  const [pessoasCarregadas, setPessoasCarregadas] = useState([]);
  const [filtro, setFiltro] = useState("pending");
  const [carregando, setCarregando] = useState(true);
  const [recarga, setRecarga] = useState(0);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [aberto, setAberto] = useState(null); // { id, modo: "responder" | "recusar" }
  const [resposta, setResposta] = useState(respostaVazia);
  const [aGuardar, setAGuardar] = useState(false);

  useEffect(() => {
    let ativo = true;
    listarMeusPedidos(token, filtro)
      .then((lista) => {
        if (!ativo) return;
        setPedidos(Array.isArray(lista) ? lista : []);
        setErro("");
      })
      .catch((err) => {
        if (ativo) setErro(err.message || "Não foi possível carregar os pedidos de avaliação.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [token, filtro, recarga]);

  useEffect(() => {
    if (pessoasDadas) return;
    let ativo = true;
    listarUsers({}, token)
      .then((lista) => ativo && Array.isArray(lista) && setPessoasCarregadas(lista))
      .catch((err) => console.error("Erro ao carregar os colegas:", err));
    return () => {
      ativo = false;
    };
  }, [pessoasDadas, token]);

  const pessoaPorId = new Map((pessoasDadas || pessoasCarregadas).map((p) => [idDe(p), p]));
  const nomeDe = (userId) => {
    const pessoa = pessoaPorId.get(userId);
    return nomeCompleto(pessoa) || pessoa?.email || "Colega";
  };

  const mudarFiltro = (novo) => {
    setCarregando(true);
    setAberto(null);
    setFiltro(novo);
  };

  const concluir = async (acao, mensagem) => {
    setAGuardar(true);
    setErro("");
    setSucesso("");
    try {
      await acao();
      setSucesso(mensagem);
      setAberto(null);
      setResposta(respostaVazia);
      setCarregando(true);
      setRecarga((n) => n + 1);
    } catch (err) {
      setErro(err.message || "Não foi possível concluir o pedido.");
      // Um pedido fora de prazo passa a "expired" no servidor: atualiza a lista.
      if (err.status === 409) setRecarga((n) => n + 1);
    } finally {
      setAGuardar(false);
    }
  };

  const enviarResposta = (pedido) => (e) => {
    e.preventDefault();
    if (resposta.recommendsRaise === "") {
      setErro("Indique se recomenda um aumento.");
      return;
    }
    concluir(
      () =>
        responderPedido(
          pedido.id,
          {
            recommendsRaise: resposta.recommendsRaise === "sim",
            ...(resposta.performanceScore ? { performanceScore: Number(resposta.performanceScore) } : {}),
            ...(resposta.comments.trim() ? { comments: resposta.comments.trim() } : {}),
          },
          token,
        ),
      `Avaliação de ${nomeDe(pedido.revieweeId)} submetida.`,
    );
  };

  const botaoFiltro = (valor, rotulo) => (
    <button
      key={valor || "todos"}
      type="button"
      aria-pressed={filtro === valor}
      onClick={() => mudarFiltro(valor)}
      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${filtro === valor ? tema.active : tema.secondaryBtn}`}
    >
      {rotulo}
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">Pedidos de avaliação</h2>
          <p className={`mt-1 text-sm ${tema.muted}`}>
            Avalie os colegas com quem trabalhou. As respostas são anónimas e não podem ser alteradas depois de enviadas.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {botaoFiltro("pending", "Pendentes")}
          {botaoFiltro("", "Todos")}
        </div>
      </div>

      {erro && <Alerta>{erro}</Alerta>}
      {sucesso && <Alerta tipo="sucesso">{sucesso}</Alerta>}

      {carregando || pedidos.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center text-sm ${tema.card} ${tema.muted}`}>
          {carregando ? "A carregar pedidos…" : filtro === "pending" ? "Não tem avaliações por fazer." : "Ainda não recebeu pedidos de avaliação."}
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((pedido) => {
            const estaAberto = aberto?.id === pedido.id;
            return (
              <article key={pedido.id} className={`rounded-2xl border p-4 sm:p-5 ${tema.card}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{nomeDe(pedido.revieweeId)}</p>
                    <p className={`mt-1 text-xs ${tema.muted}`}>
                      {pedido.cycleId ? "Ciclo de avaliação" : "Pedido avulso"}
                      {pedido.dueDate ? ` · Prazo: ${formatarData(pedido.dueDate)}` : " · Sem prazo"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <span className={`rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase ${tema[COR_ESTADO[pedido.status]] || tema.chip}`}>
                      {ESTADOS_PEDIDO[pedido.status] || pedido.status}
                    </span>
                    {pedido.status === "pending" && !estaAberto && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setErro("");
                            setResposta(respostaVazia);
                            setAberto({ id: pedido.id, modo: "responder" });
                          }}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${tema.primaryBtn}`}
                        >
                          Avaliar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setErro("");
                            setAberto({ id: pedido.id, modo: "recusar" });
                          }}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${tema.secondaryBtn}`}
                        >
                          Recusar
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {estaAberto && aberto.modo === "recusar" && (
                  <div className={`mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between ${tema.border}`}>
                    <p className={`text-xs ${tema.muted}`}>Recusar este pedido? Não poderá avaliar esta pessoa neste pedido.</p>
                    <div className="flex shrink-0 justify-end gap-2">
                      <button
                        type="button"
                        disabled={aGuardar}
                        onClick={() => setAberto(null)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${tema.secondaryBtn}`}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        disabled={aGuardar}
                        onClick={() => concluir(() => recusarPedido(pedido.id, token), "Pedido recusado.")}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                      >
                        {aGuardar ? "A recusar…" : "Recusar pedido"}
                      </button>
                    </div>
                  </div>
                )}

                {estaAberto && aberto.modo === "responder" && (
                  <form onSubmit={enviarResposta(pedido)} className={`mt-4 space-y-4 border-t pt-4 ${tema.border}`}>
                    <fieldset>
                      <legend className={`mb-2 text-xs font-semibold ${tema.label}`}>Recomenda um aumento? *</legend>
                      <div className="flex gap-2">
                        {[
                          ["sim", "Sim"],
                          ["nao", "Não"],
                        ].map(([valor, rotulo]) => (
                          <label
                            key={valor}
                            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm ${
                              resposta.recommendsRaise === valor ? tema.active : tema.secondaryBtn
                            }`}
                          >
                            <input
                              type="radio"
                              name={`aumento-${pedido.id}`}
                              value={valor}
                              checked={resposta.recommendsRaise === valor}
                              onChange={(e) => setResposta((r) => ({ ...r, recommendsRaise: e.target.value }))}
                              disabled={aGuardar}
                              className="sr-only"
                            />
                            {rotulo}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <Campo
                      id={`nota-${pedido.id}`}
                      label="Desempenho (opcional)"
                      como="select"
                      className="sm:max-w-xs"
                      value={resposta.performanceScore}
                      onChange={(e) => setResposta((r) => ({ ...r, performanceScore: e.target.value }))}
                      disabled={aGuardar}
                    >
                      <option value="">Sem nota</option>
                      <option value="1">1 – Muito abaixo do esperado</option>
                      <option value="2">2 – Abaixo do esperado</option>
                      <option value="3">3 – Dentro do esperado</option>
                      <option value="4">4 – Acima do esperado</option>
                      <option value="5">5 – Excecional</option>
                    </Campo>
                    <Campo
                      id={`comentarios-${pedido.id}`}
                      label="Comentários (opcional)"
                      como="textarea"
                      rows={4}
                      maxLength={5000}
                      value={resposta.comments}
                      onChange={(e) => setResposta((r) => ({ ...r, comments: e.target.value }))}
                      disabled={aGuardar}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={aGuardar}
                        onClick={() => setAberto(null)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${tema.secondaryBtn}`}
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={aGuardar}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${tema.primaryBtn}`}
                      >
                        {aGuardar ? "A enviar…" : "Enviar avaliação"}
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
