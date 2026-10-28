import { useTheme } from "../../theme/tema";
import { ESTADOS_PROJETO, formatarData } from "../../utils/formatar";
import AnunciosProjeto from "../anuncios/AnunciosProjeto";

// Lista das alocações do colaborador. `resumida` mostra linhas compactas (visão geral); caso contrário, cartões completos
// (com os anúncios ativos de cada projeto, se houver `token`).
export default function ListaAlocacoes({ alocacoes, carregando, resumida = false, token, onAbrir, porLer = {} }) {
  const tema = useTheme();

  if (carregando || alocacoes.length === 0) {
    const texto = carregando ? "A carregar as suas alocações…" : "Não tem alocações abertas neste momento.";
    return resumida ? (
      <p className={`text-sm ${tema.muted}`}>{texto}</p>
    ) : (
      <div className={`rounded-2xl border p-8 text-center text-sm ${tema.card} ${tema.muted}`}>{texto}</div>
    );
  }

  if (resumida) {
    return (
      <div className="space-y-3">
        {alocacoes.map((alocacao) => (
          <div
            key={alocacao.id}
            className={`flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${tema.chip}`}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{alocacao.projeto?.name || "Projeto"}</p>
              <p className={`mt-1 text-xs ${tema.muted}`}>
                {alocacao.roleOnProject || "Função não definida"} · Desde {formatarData(alocacao.startDate)}
              </p>
            </div>
            <span className={`shrink-0 text-sm font-bold ${tema.accent}`}>{alocacao.allocationPercent}%</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {alocacoes.map((alocacao) => (
        <article key={alocacao.id} className={`rounded-2xl border p-5 sm:p-6 ${tema.card}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="break-words text-base font-bold">{alocacao.projeto?.name || "Projeto"}</h3>
              <p className={`mt-1 text-sm ${tema.muted}`}>{alocacao.projeto?.clientName || "Cliente não indicado"}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {onAbrir && alocacao.projeto && (
                <button
                  type="button"
                  onClick={() => onAbrir(alocacao.projeto)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold ${tema.primaryBtn}`}
                >
                  Abrir projeto
                  {porLer[alocacao.projectId] > 0 && (
                    <span className="rounded-full bg-red-600 px-1.5 text-[10px] text-white">{porLer[alocacao.projectId]}</span>
                  )}
                </button>
              )}
              <span className={`rounded-lg border px-2.5 py-1.5 text-sm font-bold ${tema.active}`}>
                {alocacao.allocationPercent}%
              </span>
            </div>
          </div>
          <dl className={`mt-5 grid grid-cols-1 gap-3 border-t pt-4 text-sm sm:grid-cols-2 ${tema.border}`}>
            <div>
              <dt className={`text-xs ${tema.muted}`}>Função</dt>
              <dd className="mt-1">{alocacao.roleOnProject || "Não definida"}</dd>
            </div>
            <div>
              <dt className={`text-xs ${tema.muted}`}>Início da alocação</dt>
              <dd className="mt-1">{formatarData(alocacao.startDate)}</dd>
            </div>
            <div>
              <dt className={`text-xs ${tema.muted}`}>Estado do projeto</dt>
              <dd className="mt-1">{ESTADOS_PROJETO[alocacao.projeto?.status] || alocacao.projeto?.status || "Não disponível"}</dd>
            </div>
            <div>
              <dt className={`text-xs ${tema.muted}`}>Fim da alocação</dt>
              <dd className="mt-1">{formatarData(alocacao.endDate, "Sem data prevista")}</dd>
            </div>
          </dl>
          {token && (
            <div className="mt-4">
              <AnunciosProjeto projectId={alocacao.projectId} token={token} compacto />
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
