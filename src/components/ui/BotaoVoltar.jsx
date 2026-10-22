import { useTheme } from "../../theme/tema";
import Icone from "./Icone";

export default function BotaoVoltar({ onClick, children }) {
  const tema = useTheme();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`mb-4 flex items-center gap-2 text-xs hover:underline ${tema.muted}`}
    >
      <Icone nome="voltar" className="h-4 w-4" />
      {children}
    </button>
  );
}
