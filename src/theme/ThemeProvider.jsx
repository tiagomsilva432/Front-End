import { useEffect, useMemo, useState } from "react";
import { ThemeContext, criarTema } from "./tema";

const CHAVE_TEMA = "tema";

function lerTemaGuardado() {
  try {
    return localStorage.getItem(CHAVE_TEMA) !== "light";
  } catch {
    return true;
  }
}

// Guarda a escolha de tema e partilha-a por todas as páginas.
export default function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(lerTemaGuardado);

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_TEMA, isDark ? "dark" : "light");
    } catch {
      // Sem acesso ao armazenamento: o tema funciona apenas nesta sessão.
    }
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }, [isDark]);

  const valor = useMemo(
    () => ({
      ...criarTema(isDark),
      alternarTema: () => setIsDark((atual) => !atual),
    }),
    [isDark],
  );

  return <ThemeContext.Provider value={valor}>{children}</ThemeContext.Provider>;
}
