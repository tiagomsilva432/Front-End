import { useTheme } from "../../theme/tema";
import Icone from "./Icone";

// Botão para alternar entre modo claro e escuro. "compacto" mostra apenas o ícone.
export default function BotaoTema({ compacto = false, className = "" }) {
  const { isDark, alternarTema, secondaryBtn } = useTheme();
  const texto = isDark ? "Modo claro" : "Modo escuro";

  return (
    <button
      type="button"
      onClick={alternarTema}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${secondaryBtn} ${className}`}
    >
      <Icone nome={isDark ? "sol" : "lua"} className="h-4 w-4" />
      {!compacto && <span>{texto}</span>}
    </button>
  );
}
