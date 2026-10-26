import { useEffect } from "react";
import { useTheme } from "../../theme/tema";
import Icone from "./Icone";

// Janela modal reutilizável: fecha no "×", ao clicar fora ou com Escape (exceto se `bloqueado`).
export default function Modal({ id, titulo, subtitulo, onFechar, bloqueado = false, largura = "max-w-xl", children }) {
  const tema = useTheme();

  useEffect(() => {
    const aoPremirTecla = (e) => {
      if (e.key === "Escape" && !bloqueado) onFechar();
    };
    window.addEventListener("keydown", aoPremirTecla);
    return () => window.removeEventListener("keydown", aoPremirTecla);
  }, [onFechar, bloqueado]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !bloqueado) onFechar();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-titulo`}
        className={`my-auto w-full ${largura} rounded-2xl border p-5 shadow-2xl sm:p-7 ${tema.card} ${tema.text}`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id={`${id}-titulo`} className="text-lg font-bold">
              {titulo}
            </h2>
            {subtitulo && <div className={`mt-1 text-xs ${tema.muted}`}>{subtitulo}</div>}
          </div>
          <button
            type="button"
            aria-label="Fechar"
            disabled={bloqueado}
            onClick={onFechar}
            className={`rounded-lg p-1.5 transition-colors ${tema.muted} ${tema.hover}`}
          >
            <Icone nome="fechar" className="h-5 w-5" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
