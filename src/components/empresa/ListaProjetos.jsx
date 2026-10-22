import { useTheme } from "../../theme/tema";
import { ESTADOS_PROJETO, formatarData, formatarEuros, idDe } from "../../utils/formatar";
import Icone from "../ui/Icone";

export default function ListaProjetos({ projetos, carregando, onNovo }) {
  const tema = useTheme();

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Projetos</h1>
          <p className={`mt-1 text-xs ${tema.muted}`}>As alocações gerem-se a partir do diretório de colaboradores.</p>
        </div>
        <button
          type="button"
          onClick={onNovo}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-md transition ${tema.primaryBtn}`}
        >
          <Icone nome="mais" className="h-4 w-4" />
          Novo projeto
        </button>
      </div>

      {carregando || projetos.length === 0 ? (
        <div className={`rounded-2xl border p-12 text-center text-xs ${tema.card} ${tema.muted}`}>
          {carregando ? "A carregar projetos…" : "Ainda não há projetos registados."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {projetos.map((proj) => (
            <article key={idDe(proj)} className={`space-y-4 rounded-2xl border p-6 ${tema.card}`}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 break-words text-base font-bold">{proj.name}</h3>
                <span className={`shrink-0 rounded border px-2.5 py-1 text-[10px] font-bold ${tema.active}`}>
                  {ESTADOS_PROJETO[proj.status] || proj.status || "—"}
                </span>
              </div>
              <dl className={`space-y-1 text-xs ${tema.muted}`}>
                <div className="flex gap-1">
                  <dt>Cliente:</dt>
                  <dd className={tema.strong}>{proj.clientName || "—"}</dd>
                </div>
                <div className="flex gap-1">
                  <dt>Início:</dt>
                  <dd className={tema.strong}>{formatarData(proj.startDate, "—")}</dd>
                </div>
                <div className="flex gap-1">
                  <dt>Orçamento:</dt>
                  <dd className={`font-semibold ${tema.accent}`}>{formatarEuros(proj.budget)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
