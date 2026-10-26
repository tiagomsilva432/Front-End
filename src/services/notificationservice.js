import { API_URL, apiRequest, dadosResposta } from "./api";

// Página de notificações, da mais recente para a mais antiga. `antes` é o nextBefore da página anterior.
export const listarNotificacoes = (token, { apenasPorLer = false, antes, limite = 20 } = {}) => {
  const parametros = new URLSearchParams({ limit: String(limite) });
  if (apenasPorLer) parametros.set("unread", "true");
  if (antes) parametros.set("before", antes);
  return apiRequest(`/notifications/mine?${parametros}`, { token }).then(dadosResposta);
};

export const contarNotificacoesPorLer = (token) =>
  apiRequest("/notifications/mine/unread-count", { token }).then(dadosResposta);

export const marcarNotificacaoLida = (id, token) =>
  apiRequest(`/notifications/${id}/read`, { method: "POST", token }).then(dadosResposta);

export const marcarTodasLidas = (token) =>
  apiRequest("/notifications/mine/read-all", { method: "POST", token }).then(dadosResposta);

// O EventSource não manda headers: troca-se o token por um bilhete de uso único (30 s).
export const pedirBilheteStream = (token) =>
  apiRequest("/notifications/stream-ticket", { method: "POST", token }).then(dadosResposta);

export const urlStream = (bilhete) => `${API_URL}/notifications/stream?ticket=${encodeURIComponent(bilhete)}`;
