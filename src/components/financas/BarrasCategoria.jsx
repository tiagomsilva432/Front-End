import { CATEGORIAS_DESPESA } from "../../services/expenseservice";
import { useTheme } from "../../theme/tema";
import { corDaSerie, euros } from "./cores";

// Despesas por categoria: barras horizontais, uma série (o título diz o quê), valor na ponta.
export default function BarrasCategoria({ titulo, porCategoria, descricao }) {
  const tema = useTheme();
  const maximo = Math.max(0, ...porCategoria.map((c) => Number(c.amount)));
  const cor = corDaSerie(tema, 0);

  return (
    <section className={`rounded-2xl border p-5 ${tema.card}`}>
      <h2 className="font-semibold">{titulo}</h2>
      {descricao && <p className={`mt-1 text-xs ${tema.muted}`}>{descricao}</p>}
      {maximo === 0 ? (
        <p className={`mt-4 text-sm ${tema.muted}`}>Sem despesas no período.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {porCategoria.map((c) => {
            const valor = Number(c.amount);
            return (
              <li key={c.category} className="grid grid-cols-[6.5rem_1fr] items-center gap-3 text-xs sm:grid-cols-[8rem_1fr]">
                <span className={`truncate ${tema.muted}`}>{CATEGORIAS_DESPESA[c.category] || c.category}</span>
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-3 shrink-0 rounded-r"
                    style={{ width: `calc(${(valor / maximo) * 100}% - 6rem)`, minWidth: valor > 0 ? 3 : 0, backgroundColor: cor }}
                    aria-hidden="true"
                  />
                  <span className={`shrink-0 tabular-nums ${valor ? tema.strong : tema.muted}`}>{euros(c.amount)}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
