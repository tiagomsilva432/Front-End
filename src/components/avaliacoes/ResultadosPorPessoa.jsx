import { useEffect, useState } from "react";
import { listarAvaliacoesUser, listarCiclos, obterResumoAvaliacoes } from "../../services/reviewservice";
import { useTheme } from "../../theme/tema";
import { idDe, nomeCompleto } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import EstadoConta from "../ui/EstadoConta";
import AvaliacoesAnonimas from "./AvaliacoesAnonimas";

// Resultados de cada colaborador, de todos os ciclos e dos pedidos avulsos
// (GET /users/:id/review-summary e /users/:id/reviews sem filtro de ciclo).
// Um company_admin só lê os resultados dos employees: nem os seus, nem os de outro admin.
export default function ResultadosPorPessoa({ token, pessoas }) {
  const tema = useTheme();
  const [resumos, setResumos] = useState({}); // userId -> resumo
  const [nomesCiclos, setNomesCiclos] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [recarga, setRecarga] = useState(0);
  const [erro, setErro] = useState("");
  const [abertas, setAbertas] = useState({}); // userId -> { carregando, lista, erro }

  const colaboradores = pessoas.filter((p) => p.role === "employee");
  const chave = colaboradores.map(idDe).join(",");

  useEffect(() => {
    let ativo = true;
    const ids = chave ? chave.split(",") : [];
    Promise.all([
      Promise.allSettled(ids.map((id) => obterResumoAvaliacoes(id, token))),
      listarCiclos(token).catch(() => []),
    ]).then(([resultados, ciclos]) => {
      if (!ativo) return;
      const porId = {};
      resultados.forEach((r, i) => {
        if (r.status === "fulfilled") porId[ids[i]] = r.value;
      });
      setResumos(porId);
      setNomesCiclos(Object.fromEntries((Array.isArray(ciclos) ? ciclos : []).map((c) => [c.id, c.name])));
      setErro(resultados.some((r) => r.status === "rejected") ? "Não foi possível carregar os resultados de alguns colaboradores." : "");
      setCarregando(false);
    });
    return () => {
      ativo = false;
    };
  }, [chave, token, recarga]);

  const alternar = async (userId) => {
    if (abertas[userId]) {
      setAbertas((a) => {
        const resto = { ...a };
        delete resto[userId];
        return resto;
      });
      return;
    }
    setAbertas((a) => ({ ...a, [userId]: { carregando: true, lista: [], erro: "" } }));
    try {
      const lista = await listarAvaliacoesUser(userId, token);
      setAbertas((a) => ({ ...a, [userId]: { carregando: false, lista: Array.isArray(lista) ? lista : [], erro: "" } }));
    } catch (err) {
      setAbertas((a) => ({ ...a, [userId]: { carregando: false, lista: [], erro: err.message || "Não foi possível carregar." } }));
    }
  };

  // Primeiro quem já tem avaliações respondidas.
  const ordenados = [...colaboradores].sort(
    (a, b) => (resumos[idDe(b)]?.reviewsReceived ?? 0) - (resumos[idDe(a)]?.reviewsReceived ?? 0),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Resultados por pessoa</h1>
          <p className={`mt-1 text-xs ${tema.muted}`}>
            Todas as avaliações recebidas por cada colaborador, de ciclos e de pedidos avulsos. As respostas são anónimas.
          </p>
        </div>
        <button
          type="button"
          disabled={carregando}
          onClick={() => {
            setCarregando(true);
            setAbertas({});
            setRecarga((n) => n + 1);
          }}
          className={`rounded-xl border px-4 py-2.5 text-xs font-semibold disabled:opacity-50 ${tema.secondaryBtn}`}
        >
          {carregando ? "A atualizar…" : "Atualizar"}
        </button>
      </div>

      {erro && <Alerta>{erro}</Alerta>}

      {carregando || ordenados.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center text-xs ${tema.card} ${tema.muted}`}>
          {carregando ? "A carregar resultados…" : "Ainda não há colaboradores na empresa."}
        </div>
      ) : (
        <div className="space-y-3">
          {ordenados.map((pessoa) => {
            const id = idDe(pessoa);
            const r = resumos[id];
            const aberta = abertas[id];
            return (
              <article key={id} className={`rounded-2xl border p-4 sm:p-5 ${tema.card}`}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold">{nomeCompleto(pessoa) || pessoa.email}</p>
                      {pessoa.status !== "active" && <EstadoConta estado={pessoa.status} />}
                    </div>
                    <p className={`mt-1 text-xs ${tema.muted}`}>
                      {r ? `${r.reviewsReceived} de ${r.requestsReceived} avaliações respondidas` : "Resultados indisponíveis"}
                    </p>
                  </div>
                  {r && (
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
                  )}
                </div>
                {r?.reviewsReceived > 0 && (
                  <button
                    type="button"
                    aria-expanded={Boolean(aberta)}
                    onClick={() => alternar(id)}
                    className={`mt-3 text-xs font-semibold hover:underline ${tema.accent}`}
                  >
                    {aberta ? "Esconder avaliações" : "Ver avaliações (anónimas)"}
                  </button>
                )}
                {aberta && (
                  <div className={`mt-3 space-y-2 border-t pt-3 ${tema.border}`}>
                    <AvaliacoesAnonimas estado={aberta} nomeCiclo={(cycleId) => nomesCiclos[cycleId] || "Ciclo"} />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
