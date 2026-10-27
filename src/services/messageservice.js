import { apiRequest, dadosResposta } from "./api";

// Página do chat, da mais recente para a mais antiga. `antes` = nextBefore da página anterior.
// Traz lastReadMessageId: onde desenhar o separador "mensagens novas".
export const listarMensagens = (projectId, token, { antes, limite = 30 } = {}) => {
  const p = new URLSearchParams({ limit: String(limite) });
  if (antes) p.set("before", antes);
  return apiRequest(`/projects/${projectId}/messages?${p}`, { token }).then(dadosResposta);
};

export const enviarMensagem = (projectId, texto, token) =>
  apiRequest(`/projects/${projectId}/messages`, { method: "POST", token, body: { body: texto } }).then(dadosResposta);

// Só o autor corrige (marca editedAt). Apagar: o autor, o gestor ou um admin.
export const corrigirMensagem = (projectId, messageId, texto, token) =>
  apiRequest(`/projects/${projectId}/messages/${messageId}`, { method: "PATCH", token, body: { body: texto } }).then(dadosResposta);

export const apagarMensagem = (projectId, messageId, token) =>
  apiRequest(`/projects/${projectId}/messages/${messageId}`, { method: "DELETE", token });

// Marca o chat como lido até à mais recente. Ler uma página não mexe no marcador: chama-se isto com o chat no ecrã.
export const marcarChatLido = (projectId, token) =>
  apiRequest(`/projects/${projectId}/messages/read`, { method: "POST", token }).then(dadosResposta);

// { total, projects: [{ projectId, unread }] } dos projetos em que a pessoa está ou que gere.
export const contarMensagensPorLer = (token) => apiRequest("/projects/messages/unread", { token }).then(dadosResposta);
