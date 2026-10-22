import { useTheme } from "../../theme/tema";

// Grelha de "rótulo: valor" usada no resumo e no perfil do colaborador.
export default function ListaDados({ titulo, etiqueta, campos }) {
  const tema = useTheme();

  return (
    <section className={`rounded-2xl border p-5 sm:p-6 ${tema.card}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">{titulo}</h2>
        {etiqueta && <span className={`rounded-full border px-2.5 py-1 text-xs ${tema.chip}`}>{etiqueta}</span>}
      </div>
      <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {campos.map(([rotulo, valor]) => (
          <div key={rotulo}>
            <dt className={`text-xs ${tema.muted}`}>{rotulo}</dt>
            <dd className="mt-1 break-words text-sm">{valor}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
