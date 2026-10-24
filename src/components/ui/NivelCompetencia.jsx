import { useTheme } from "../../theme/tema";

// Proficiência de 1 a 5 em pontos; sem nível mostra só a etiqueta.
export default function NivelCompetencia({ nivel }) {
  const tema = useTheme();

  if (!nivel) {
    return <span className={`rounded-md border px-2 py-1 text-[10px] font-semibold ${tema.chip}`}>Sem nível</span>;
  }

  return (
    <span className="inline-flex items-center gap-1" title={`Proficiência ${nivel} de 5`} aria-label={`Proficiência ${nivel} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          aria-hidden="true"
          className={`h-2 w-2 rounded-full ${n <= nivel ? (tema.isDark ? "bg-emerald-400" : "bg-emerald-600") : tema.isDark ? "bg-slate-700" : "bg-slate-200"}`}
        />
      ))}
    </span>
  );
}
