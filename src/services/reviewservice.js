import { apiRequest, dadosResposta } from "./api";

export const ESTADOS_PEDIDO = {
  pending: "Pendente",
  submitted: "Respondido",
  declined: "Recusado",
  expired: "Expirado",
};

// --- Ciclos (system_admin e company_admin) ---

export const listarCiclos = (token, apenasAbertos = false) =>
  apiRequest(`/review-cycles${apenasAbertos ? "?open=true" : ""}`, { token }).then(dadosResposta);

// Cria um pedido para cada par de colegas que partilharam projeto desde `since` (por omissão, há 6 meses).
export const criarCiclo = (dados, token) =>
  apiRequest("/review-cycles", { method: "POST", token, body: dados }).then(dadosResposta);

// O ciclo e quantos pedidos há em cada estado (progress).
export const obterCiclo = (cycleId, token) =>
  apiRequest(`/review-cycles/${cycleId}`, { token }).then(dadosResposta);

// Quem avalia quem e o estado; nunca o conteúdo.
export const listarPedidosCiclo = (cycleId, token) =>
  apiRequest(`/review-cycles/${cycleId}/requests`, { token }).then(dadosResposta);

// Expira tudo o que ainda estiver pendente.
export const fecharCiclo = (cycleId, token) =>
  apiRequest(`/review-cycles/${cycleId}/close`, { method: "POST", token }).then(dadosResposta);

export const obterResultadosCiclo = (cycleId, token) =>
  apiRequest(`/review-cycles/${cycleId}/results`, { token }).then(dadosResposta);

// Pedido avulso, fora de qualquer ciclo.
export const criarPedidoAvulso = (dados, token) =>
  apiRequest("/review-requests", { method: "POST", token, body: dados }).then(dadosResposta);

// --- Caixa de pedidos de quem avalia (qualquer conta ativa) ---

export const listarMeusPedidos = (token, estado = "") =>
  apiRequest(`/review-requests/mine${estado ? `?status=${estado}` : ""}`, { token }).then(dadosResposta);

// Uma avaliação é definitiva depois de submetida.
export const responderPedido = (requestId, dados, token) =>
  apiRequest(`/review-requests/${requestId}/review`, { method: "POST", token, body: dados }).then(dadosResposta);

export const recusarPedido = (requestId, token) =>
  apiRequest(`/review-requests/${requestId}/decline`, { method: "POST", token }).then(dadosResposta);

// --- Resultados de uma pessoa (quem administra a conta, nunca a própria pessoa) ---

const filtroCiclo = (cycleId) => (cycleId ? `?cycleId=${cycleId}` : "");

export const obterResumoAvaliacoes = (userId, token, cycleId) =>
  apiRequest(`/users/${userId}/review-summary${filtroCiclo(cycleId)}`, { token }).then(dadosResposta);

// Anónimas: sem reviewer, sem pedido, só o dia.
export const listarAvaliacoesUser = (userId, token, cycleId) =>
  apiRequest(`/users/${userId}/reviews${filtroCiclo(cycleId)}`, { token }).then(dadosResposta);
