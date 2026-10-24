import { useEffect, useState } from "react";
import {
  ESTADOS_PEDIDO,
  fecharCiclo,
  listarAvaliacoesUser,
  listarPedidosCiclo,
  obterCiclo,
  obterResultadosCiclo,
} from "../../services/reviewservice";
import { useTheme } from "../../theme/tema";
import { formatarData, idDe, nomeCompleto } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import BotaoVoltar from "../ui/BotaoVoltar";
import CartaoMetrica from "../ui/CartaoMetrica";
import AvaliacoesAnonimas from "./AvaliacoesAnonimas";

// Um ciclo: progresso (GET /review-cycles/:id), resultados anónimos por pessoa e quem avalia quem.
export default function DetalheCiclo({ ciclo: cicloInicial, pessoas, token, onVoltar }) {
  const tema = useTheme();
  const [ciclo, setCiclo] = useState(cicloInicial);
  const [resultados, setResultados] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [vista, setVista] = useState("resultados");
  const [carregando, setCarregando] = useState(true);
  const [recarga, setRecarga] = useState(0);
  const [erro, setErro] = useState("");
  const [aConfirmarFecho, setAConfirmarFecho] = useState(false);
  const [aFechar, setAFechar] = useState(false);
  const [avaliacoes, setAvaliacoes] = useState({}); // revieweeId -> { carregando, lista, erro }

  useEffect(() => {
    let ativo = true;
    Promise.all([
      obterCiclo(cicloInicial.id, token),
      obterResultadosCiclo(cicloInicial.id, token),
      listarPedidosCiclo(cicloInicial.id, token),
    ])
      .then(([detalhe, res, lista]) => {
        if (!ativo) return;
        setCiclo(detalhe);
        setResultados(Array.isArray(res) ? res : []);
        setPedidos(Array.isArray(lista) ? lista : []);
        setErro("");
      })
      .catch((err) => {
        if (ativo) setErro(err.message || "Não foi possível carregar o ciclo.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [cicloInicial.id, token, recarga]);

  const pessoaPorId = new Map(pessoas.map((p) => [idDe(p), p]));
  const nomeDe = (userId) => {
    const pessoa = pessoaPorId.get(userId);
    return nomeCompleto(pessoa) || pessoa?.email || "Utilizador";
  };

  const fechar = async () => {
    setAFechar(true);
    setErro("");
    try {
      await fecharCiclo(ciclo.id, token);
      setAConfirmarFecho(false);
      setCarregando(true);
      setRecarga((n) => n + 1);
    } catch (err) {
      setErro(err.message || "Não foi possível fechar o ciclo.");
    } finally {
      setAFechar(false);
    }
  };

  const alternarAvaliacoes = async (revieweeId) => {
    if (avaliacoes[revieweeId]) {
      setAvaliacoes((a) => {
        const resto = { ...a };
        delete resto[revieweeId];
        return resto;
      });
      return;
    }
    setAvaliacoes((a) => ({ ...a, [revieweeId]: { carregando: true, lista: [], erro: "" } }));
    try {
      const lista = await listarAvaliacoesUser(revieweeId, token, ciclo.id);
      setAvaliacoes((a) => ({ ...a, [revieweeId]: { carregando: false, lista: Array.isArray(lista) ? lista : [], erro: "" } }));
    } catch (err) {
      setAvaliacoes((a) => ({ ...a, [revieweeId]: { carregando: false, lista: [], erro: err.message || "Não foi possível carregar." } }));
    }
  };

  const progresso = ciclo.progress || {};
  const total = Object.values(progresso).reduce((soma, n) => soma + n, 0);
  const botaoVista = (valor, rotulo) => (
    <button
      type="button"
      aria-pressed={vista === valor}
      onClick={() => setVista(valor)}
      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${vista === valor ? tema.active : tema.secondaryBtn}`}
    >
      {rotulo}
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <BotaoVoltar onClick={onVoltar}>Voltar aos ciclos</BotaoVoltar>
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${ciclo.closedAt ? tema.muted : tema.accent}`}>
              {ciclo.closedAt ? `Fechado a ${formatarData(ciclo.closedAt)}` : "Ciclo aberto"}
            </p>
            <h1 className="mt-1 text-2xl font-bold">{ciclo.name}</h1>
            <p className={`mt-1 text-xs ${tema.muted}`}>
              Aberto a {formatarData(ciclo.createdAt)}
              {ciclo.deadline ? ` · Prazo ${formatarData(ciclo.deadline)}` : " · Sem prazo"}
            </p>
          </div>
          {!ciclo.closedAt && !aConfirmarFecho && (
            <button
              type="button"
              onClick={() => setAConfirmarFecho(true)}
              className={`rounded-xl border px-4 py-2.5 text-xs font-semibold ${tema.secondaryBtn}`}
            >
              Fechar ciclo
            </button>
          )}
        </div>
      </div>

      {erro && <Alerta>{erro}</Alerta>}

      {aConfirmarFecho && (
        <Alerta tipo="aviso" textoAcao={aFechar ? "A fechar…" : "Fechar ciclo"} onAcao={fechar} acaoDesativada={aFechar}>
          Ao fechar, os {progresso.pending ?? 0} pedidos ainda pendentes passam a expirados.{" "}
          <button type="button" onClick={() => setAConfirmarFecho(false)} className="underline">
            Cancelar
          </button>
        </Alerta>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {["pending", "submitted", "declined", "expired"].map((estado) => (
          <CartaoMetrica
            key={estado}
            titulo={ESTADOS_PEDIDO[estado]}
            valor={carregando ? "…" : (progresso[estado] ?? 0)}
            descricao={estado === "submitted" && total ? `${Math.round(((progresso.submitted ?? 0) / total) * 100)}% do total` : undefined}
          />
        ))}
      </div>

      {!carregando && total === 0 && (
        <Alerta tipo="aviso">
          Este ciclo não gerou pedidos: ao abrir, não havia duas pessoas ativas alocadas ao mesmo projeto em
          simultâneo desde a data indicada. Os pedidos só se criam no momento em que o ciclo é aberto; aloque pelo
          menos duas pessoas ao mesmo projeto e abra um novo ciclo.
        </Alerta>
      )}

      <div className="flex gap-2">
        {botaoVista("resultados", "Resultados")}
        {botaoVista("pedidos", `Pedidos (${pedidos.length})`)}
      </div>

      {carregando ? (
        <div className={`rounded-2xl border p-10 text-center text-xs ${tema.card} ${tema.muted}`}>A carregar…</div>
      ) : vista === "resultados" ? (
        resultados.length === 0 ? (
          <div className={`rounded-2xl border p-10 text-center text-xs ${tema.card} ${tema.muted}`}>
            Ainda não há resultados que possa consultar neste ciclo.
          </div>
        ) : (
          <div className="space-y-3">
            {resultados.map((r) => {
              const detalhe = avaliacoes[r.revieweeId];
              return (
                <article key={r.revieweeId} className={`rounded-2xl border p-4 sm:p-5 ${tema.card}`}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{nomeDe(r.revieweeId)}</p>
                      <p className={`mt-1 text-xs ${tema.muted}`}>
                        {r.reviewsReceived} de {r.requestsReceived} avaliações respondidas
                      </p>
                    </div>
                    <dl className="grid shrink-0 grid-cols-3 gap-4 text-center text-xs">
                      <div>
                        <dt className={tema.muted}>A favor</dt>
                        <dd className={`mt-1 text-lg font-bold ${tema.accent}`}>{r.votesForRaise}</dd>
                      </div>
                      <div>
                        <dt className={tema.muted}>Contra</dt>
                        <dd className="mt-1 text-lg font-bold">{r.votesAgainst}</dd>
                      </div>
                      <div>
                        <dt className={tema.muted}>Nota média</dt>
                        <dd className="mt-1 text-lg font-bold">
                          {r.averageScore === null ? "—" : r.averageScore.toLocaleString("pt-PT", { maximumFractionDigits: 2 })}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  {r.reviewsReceived > 0 && (
                    <button
                      type="button"
                      aria-expanded={Boolean(detalhe)}
                      onClick={() => alternarAvaliacoes(r.revieweeId)}
                      className={`mt-3 text-xs font-semibold hover:underline ${tema.accent}`}
                    >
                      {detalhe ? "Esconder avaliações" : "Ver avaliações (anónimas)"}
                    </button>
                  )}
                  {detalhe && (
                    <div className={`mt-3 space-y-2 border-t pt-3 ${tema.border}`}>
                      <AvaliacoesAnonimas estado={detalhe} />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )
      ) : pedidos.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center text-xs ${tema.card} ${tema.muted}`}>
          Este ciclo não gerou pedidos de avaliação.
        </div>
      ) : (
        <div className={`overflow-x-auto rounded-2xl border ${tema.card}`}>
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className={`border-b text-[11px] font-semibold uppercase tracking-wider ${tema.tableHeader}`}>
              <tr>
                <th className="px-5 py-3">Quem avalia</th>
                <th className="px-5 py-3">Quem é avaliado</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${tema.border}`}>
              {pedidos.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3">{nomeDe(p.reviewerId)}</td>
                  <td className="px-5 py-3">{nomeDe(p.revieweeId)}</td>
                  <td className={`px-5 py-3 text-xs ${tema.muted}`}>{ESTADOS_PEDIDO[p.status] || p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
