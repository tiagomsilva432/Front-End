import { useState } from "react";
import { useTheme } from "../../theme/tema";

// Campo de senha com botão para mostrar/ocultar o texto.
export default function CampoSenha({ id, label, ajuda, ...props }) {
  const tema = useTheme();
  const [visivel, setVisivel] = useState(false);

  return (
    <div>
      <label htmlFor={id} className={`mb-1.5 block text-xs font-semibold ${tema.label}`}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visivel ? "text" : "password"}
          className={`w-full rounded-xl border px-3.5 py-2.5 pr-12 text-sm outline-none transition focus:ring-4 disabled:opacity-60 ${tema.input}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisivel((atual) => !atual)}
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visivel}
          className={`absolute inset-y-0 right-1 flex w-10 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${tema.muted} ${tema.hover}`}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            {visivel ? (
              <>
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                <path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.7 3.1 10 7a10.6 10.6 0 01-3.1 4.5" />
                <path d="M6.2 6.2A10.8 10.8 0 002 12c.6 1.8 1.7 3.3 3.2 4.4A10.6 10.6 0 0012 19c1.1 0 2.1-.2 3-.5" />
              </>
            ) : (
              <>
                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </>
            )}
          </svg>
        </button>
      </div>
      {ajuda && <p className={`mt-2 text-xs leading-5 ${tema.muted}`}>{ajuda}</p>}
    </div>
  );
}
