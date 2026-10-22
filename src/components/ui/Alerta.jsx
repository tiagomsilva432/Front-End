import { useTheme } from "../../theme/tema";

// Caixa de mensagem (erro, sucesso ou aviso), com uma ação opcional como "Tentar novamente".
export default function Alerta({ tipo = "erro", children, textoAcao, onAcao, acaoDesativada = false, className = "" }) {
  const tema = useTheme();

  return (
    <div
      role={tipo === "erro" ? "alert" : "status"}
      className={`flex flex-col gap-2 rounded-xl border p-3.5 text-sm sm:flex-row sm:items-center sm:justify-between ${tema[tipo]} ${className}`}
    >
      <span>{children}</span>
      {onAcao && (
        <button
          type="button"
          onClick={onAcao}
          disabled={acaoDesativada}
          className="font-semibold underline disabled:opacity-50 sm:shrink-0"
        >
          {textoAcao}
        </button>
      )}
    </div>
  );
}
