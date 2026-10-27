import { useState } from "react";
import { useTheme } from "../../theme/tema";
import { euros, eurosCompacto, nomeDoMes } from "./cores";

const ALTURA = 220;

// Um máximo "redondo" para o eixo (1, 1,5, 2, 2,5, 3, 4, 5, 6, 8 × 10^n), com 4 divisões e pouco espaço vazio.
function eixo(maximo) {
  if (maximo <= 0) return { topo: 100, passos: [0, 25, 50, 75, 100] };
  const bruto = maximo / 4;
  const potencia = 10 ** Math.floor(Math.log10(bruto));
  const passo = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].map((f) => f * potencia).find((p) => p >= bruto);
  return { topo: passo * 4, passos: [0, 1, 2, 3, 4].map((i) => i * passo) };
}

// Colunas empilhadas por mês. `series`: [{ chave, rotulo, cor }] por ordem de baixo para cima.
// `meses`: [{ month, [chave]: "123.45" }]. A legenda liga e desliga séries sem novo pedido.
export default function BarrasMensais({ titulo, meses, series, visiveis, onAlternar }) {
  const tema = useTheme();
  const [ativo, setAtivo] = useState(null);
  const [verTabela, setVerTabela] = useState(false);

  const mostradas = series.filter((s) => visiveis[s.chave]);
  const totalDe = (m) => mostradas.reduce((soma, s) => soma + Number(m[s.chave] || 0), 0);
  const { topo, passos } = eixo(Math.max(0, ...meses.map(totalDe)));
  const muitos = meses.length > 12;

  return (
    <section className={`rounded-2xl border p-5 ${tema.card}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="font-semibold">{titulo}</h2>
        <div className="flex flex-wrap items-center gap-2">
          {series.map((s) => (
            <button
              key={s.chave}
              type="button"
              aria-pressed={visiveis[s.chave]}
              onClick={() => onAlternar(s.chave)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                visiveis[s.chave] ? tema.secondaryBtn : `${tema.border} ${tema.muted} line-through opacity-60`
              }`}
            >
              <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.cor }} />
              {s.rotulo}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={verTabela}
            onClick={() => setVerTabela((v) => !v)}
            className={`text-xs font-semibold hover:underline ${tema.accent}`}
          >
            {verTabela ? "Ver gráfico" : "Ver tabela"}
          </button>
        </div>
      </div>

      {verTabela ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-right text-sm tabular-nums">
            <thead className={`border-b text-[11px] uppercase tracking-wider ${tema.tableHeader}`}>
              <tr>
                <th className="px-3 py-2 text-left">Mês</th>
                {mostradas.map((s) => (
                  <th key={s.chave} className="px-3 py-2">
                    {s.rotulo}
                  </th>
                ))}
                <th className="px-3 py-2">Total</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${tema.border}`}>
              {meses.map((m) => (
                <tr key={m.month}>
                  <td className="px-3 py-2 text-left capitalize">{nomeDoMes(m.month)}</td>
                  {mostradas.map((s) => (
                    <td key={s.chave} className="px-3 py-2">
                      {euros(m[s.chave])}
                    </td>
                  ))}
                  <td className="px-3 py-2 font-semibold">{euros(totalDe(m))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-5 flex gap-2">
          {/* Eixo Y: arredondado e compacto. */}
          <div className={`relative w-14 shrink-0 text-right text-[10px] tabular-nums ${tema.muted}`} style={{ height: ALTURA }}>
            {passos.map((p) => (
              <span key={p} className="absolute right-0 -translate-y-1/2" style={{ bottom: `${(p / topo) * 100}%` }}>
                {eurosCompacto(p)}
              </span>
            ))}
          </div>
          <div className="relative min-w-0 flex-1">
            <div className="relative" style={{ height: ALTURA }}>
              {passos.map((p) => (
                <div
                  key={p}
                  aria-hidden="true"
                  className={`absolute inset-x-0 border-t ${tema.isDark ? "border-slate-800" : "border-slate-200"}`}
                  style={{ bottom: `${(p / topo) * 100}%` }}
                />
              ))}
              <div className="absolute inset-0 flex items-end">
                {meses.map((m, i) => {
                  const total = totalDe(m);
                  const ultima = [...mostradas].reverse().find((s) => Number(m[s.chave]) > 0);
                  return (
                    <button
                      key={m.month}
                      type="button"
                      aria-label={`${nomeDoMes(m.month)}: ${mostradas.map((s) => `${s.rotulo} ${euros(m[s.chave])}`).join(", ")}; total ${euros(total)}`}
                      onMouseEnter={() => setAtivo(i)}
                      onMouseLeave={() => setAtivo(null)}
                      onFocus={() => setAtivo(i)}
                      onBlur={() => setAtivo(null)}
                      className={`relative flex h-full flex-1 flex-col items-center justify-end outline-none ${
                        ativo === i ? (tema.isDark ? "bg-slate-800/40" : "bg-slate-100") : ""
                      }`}
                    >
                      {/* Segmentos de baixo para cima, com 2px de folga na cor da superfície. */}
                      <span className="flex w-3/5 max-w-6 flex-col-reverse items-stretch gap-[2px]">
                        {mostradas.map((s) => {
                          const valor = Number(m[s.chave] || 0);
                          if (valor <= 0) return null;
                          return (
                            <span
                              key={s.chave}
                              style={{ height: `${(valor / topo) * ALTURA}px`, backgroundColor: s.cor }}
                              className={s === ultima ? "rounded-t" : ""}
                            />
                          );
                        })}
                      </span>
                      {ativo === i && (
                        <span
                          role="tooltip"
                          className={`pointer-events-none absolute top-0 z-10 w-max min-w-40 rounded-xl border p-3 text-left text-xs shadow-xl ${tema.card} ${tema.text} ${
                            i > meses.length / 2 ? "right-0" : "left-0"
                          }`}
                        >
                          <span className="mb-1.5 block font-semibold capitalize">{nomeDoMes(m.month)}</span>
                          {mostradas.map((s) => (
                            <span key={s.chave} className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: s.cor }} />
                                <span className={tema.muted}>{s.rotulo}</span>
                              </span>
                              <span className="tabular-nums">{euros(m[s.chave])}</span>
                            </span>
                          ))}
                          <span className={`mt-1.5 flex justify-between gap-4 border-t pt-1.5 font-semibold ${tema.border}`}>
                            <span>Total</span>
                            <span className="tabular-nums">{euros(total)}</span>
                          </span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className={`mt-1.5 flex text-[10px] ${tema.muted}`}>
              {meses.map((m, i) => (
                <span key={m.month} className="flex-1 text-center capitalize">
                  {!muitos || i % 3 === 0 ? nomeDoMes(m.month, true) : ""}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
