import { useTheme } from "../../theme/tema";
import Icone from "../ui/Icone";

const MENU = [
  ["painel", "Visão geral"],
  ["pessoas", "Colaboradores"],
  ["pasta", "Projetos"],
  ["moeda", "Finanças"],
  ["relogio", "Ausências"],
  ["calendario", "Calendário"],
  ["avaliacao", "Avaliações"],
  ["megafone", "Anúncios"],
];

// Moldura de "print" da app na página pública: janela do browser + barra lateral do painel.
// Os ecrãs lá dentro usam dados de demonstração e não falam com o servidor.
// `barraLateral`: a partir de que largura aparece o menu ("md" ou "xl"); `compacta` esconde-o sempre.
export default function JanelaApp({ ativo, endereco, children, compacta = false, barraLateral = "md" }) {
  const tema = useTheme();

  return (
    <div className={`overflow-hidden rounded-2xl border shadow-2xl ${tema.isDark ? "border-slate-700 shadow-black/40" : "border-slate-200 shadow-slate-300/60"}`}>
      <div className={`flex items-center gap-3 border-b px-4 py-2.5 ${tema.isDark ? "border-slate-800 bg-[#0e1321]" : "border-slate-200 bg-slate-50"}`}>
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>
        <span className={`min-w-0 flex-1 truncate rounded-md px-3 py-1 text-center text-[11px] ${tema.isDark ? "bg-slate-900 text-slate-400" : "bg-white text-slate-500"}`}>
          {endereco}
        </span>
      </div>
      <div className={`flex ${tema.page}`}>
        {!compacta && (
          <aside aria-hidden="true" className={`hidden w-44 shrink-0 border-r p-3 ${barraLateral === "xl" ? "xl:block" : "md:block"} ${tema.sidebar}`}>
            <p className="mb-3 px-2 text-xs font-bold">ERP Empresa</p>
            <ul className="space-y-1">
              {MENU.map(([icone, rotulo]) => (
                <li
                  key={rotulo}
                  className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-[11px] ${rotulo === ativo ? tema.active : `border-transparent ${tema.muted}`}`}
                >
                  <Icone nome={icone} className="h-3.5 w-3.5" />
                  {rotulo}
                </li>
              ))}
            </ul>
          </aside>
        )}
        <div className="min-w-0 flex-1 p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}
