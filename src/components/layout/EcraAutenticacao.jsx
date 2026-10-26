import { useTheme } from "../../theme/tema";
import logo from "../../assets/logo.png";
import BotaoTema from "../ui/BotaoTema";

// Moldura comum ao login e à ativação de conta: logótipo, botão de tema e cartão central.
export default function EcraAutenticacao({ titulo, subtitulo, children }) {
  const tema = useTheme();

  return (
    <main className={`relative flex min-h-screen items-center justify-center overflow-x-hidden p-4 font-sans transition-colors duration-300 sm:p-5 ${tema.page}`}>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${
          tema.isDark ? "from-emerald-950/40 via-[#070b14] to-[#070b14]" : "from-emerald-100 via-slate-100 to-slate-100"
        }`}
      />

      <div className="absolute left-5 top-5 z-10 flex items-center gap-3 sm:left-8 sm:top-8">
        <img src={logo} alt="" className="h-11 w-11 rounded-full object-cover shadow-sm" />
        <span className={`text-sm font-semibold tracking-wide ${tema.strong}`}>Grupo Os Silvas</span>
      </div>

      <BotaoTema className="absolute right-5 top-5 z-10 sm:right-8 sm:top-8" />

      <section className={`relative z-0 mt-12 w-full max-w-md rounded-3xl border p-7 shadow-2xl sm:p-9 ${tema.card}`}>
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold tracking-tight">{titulo}</h1>
          <p className={`mt-2 text-sm ${tema.muted}`}>{subtitulo}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
