import { useTheme } from "../../theme/tema";
import { formatarData, formatarMontante, hojeISO } from "../../utils/formatar";

// Salário em vigor + histórico (o effectiveTo é exclusivo: é o dia em que o seguinte começa).
export default function HistoricoSalarios({ historico, atual, carregando }) {
  const tema = useTheme();

  return (
    <div className="space-y-4">
      <div className={`rounded-xl border p-4 ${tema.border} ${tema.cardMuted}`}>
        <p className={`text-xs ${tema.muted}`}>Salário em vigor hoje</p>
        <p className="mt-1 text-2xl font-bold">
          {carregando ? "…" : atual ? formatarMontante(atual.amount, atual.currency) : "Sem salário definido"}
        </p>
        {atual && !carregando && (
          <p className={`mt-1 text-xs ${tema.muted}`}>
            Desde {formatarData(atual.effectiveFrom)}
            {atual.reason ? ` · ${atual.reason}` : ""}
          </p>
        )}
      </div>

      {!carregando && historico.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold">Histórico</h3>
          <ul className={`divide-y rounded-xl border ${tema.border}`}>
            {historico.map((s) => {
              const agendado = s.effectiveFrom > hojeISO();
              const emVigor = atual?.id === s.id;
              return (
                <li key={s.id} className={`flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between ${tema.border}`}>
                  <div className="min-w-0">
                    <p className="font-semibold">{formatarMontante(s.amount, s.currency)}</p>
                    <p className={`text-xs ${tema.muted}`}>
                      {formatarData(s.effectiveFrom)}
                      {s.effectiveTo ? ` até ${formatarData(s.effectiveTo)}` : agendado ? " em diante" : " – atual"}
                      {s.reason ? ` · ${s.reason}` : ""}
                    </p>
                  </div>
                  {(agendado || emVigor) && (
                    <span
                      className={`shrink-0 self-start rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase sm:self-auto ${
                        agendado ? tema.aviso : tema.sucesso
                      }`}
                    >
                      {agendado ? "Agendado" : "Em vigor"}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
