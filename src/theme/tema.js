import { createContext, useContext } from "react";

export const ThemeContext = createContext(null);

// Classes Tailwind partilhadas por todas as páginas (uma única fonte de verdade para as cores).
export function criarTema(isDark) {
  return {
    isDark,
    page: isDark ? "bg-[#070b14] text-slate-100" : "bg-slate-100 text-slate-900",
    text: isDark ? "text-slate-100" : "text-slate-900",
    sidebar: isDark ? "bg-[#0b0f19] border-slate-800" : "bg-white border-slate-200",
    card: isDark
      ? "bg-[#0b0f19] border-slate-800 shadow-xl shadow-black/10"
      : "bg-white border-slate-200 shadow-sm",
    cardMuted: isDark ? "bg-black/20" : "bg-slate-50",
    muted: isDark ? "text-slate-400" : "text-slate-500",
    strong: isDark ? "text-slate-200" : "text-slate-800",
    label: isDark ? "text-slate-300" : "text-slate-700",
    border: isDark ? "border-slate-800" : "border-slate-200",
    input: isDark
      ? "bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
      : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:ring-emerald-600/15",
    primaryBtn: isDark
      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20",
    secondaryBtn: isDark
      ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    active: isDark
      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
      : "bg-emerald-50 border-emerald-200 text-emerald-800",
    hover: isDark ? "hover:bg-slate-800/70" : "hover:bg-slate-100",
    accent: isDark ? "text-emerald-400" : "text-emerald-700",
    iconBox: isDark
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
      : "border-emerald-200 bg-emerald-50 text-emerald-700",
    chip: isDark
      ? "border-slate-700 bg-slate-900 text-slate-300"
      : "border-slate-200 bg-slate-50 text-slate-600",
    tableHeader: isDark
      ? "bg-[#0e1321] text-slate-400 border-slate-800"
      : "bg-slate-50 text-slate-600 border-slate-200",
    tableRowHover: isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-50",
    erro: isDark
      ? "border-red-500/30 bg-red-500/10 text-red-300"
      : "border-red-200 bg-red-50 text-red-700",
    sucesso: isDark
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : "border-emerald-200 bg-emerald-50 text-emerald-800",
    aviso: isDark
      ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
      : "border-amber-200 bg-amber-50 text-amber-800",
  };
}

export function useTheme() {
  const contexto = useContext(ThemeContext);
  if (!contexto) {
    throw new Error("useTheme tem de ser usado dentro de <ThemeProvider>.");
  }
  return contexto;
}
