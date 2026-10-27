import { createContext, useContext } from "react";

export const NotificacoesContext = createContext(null);

// Notificações pessoais (sino) e o sinal de "os anúncios mudaram", partilhados pelo painel.
export function useNotificacoes() {
  const contexto = useContext(NotificacoesContext);
  if (!contexto) {
    throw new Error("useNotificacoes tem de ser usado dentro de <NotificacoesProvider>.");
  }
  return contexto;
}
