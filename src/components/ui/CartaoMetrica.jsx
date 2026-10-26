import { useTheme } from "../../theme/tema";

// Cartão de indicador (KPI) usado nas visões gerais.
export default function CartaoMetrica({ titulo, valor = "—", descricao }) {
  const tema = useTheme();

  return (
    <div className={`rounded-2xl border p-5 sm:p-6 ${tema.card}`}>
      <p className={`text-xs font-semibold uppercase tracking-wider ${tema.muted}`}>{titulo}</p>
      <p className="mt-3 text-3xl font-extrabold">{valor}</p>
      {descricao && <p className={`mt-2 text-xs leading-5 ${tema.muted}`}>{descricao}</p>}
    </div>
  );
}
