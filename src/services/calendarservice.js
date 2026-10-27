import { apiRequest, dadosResposta } from "./api";

// Feriados e ausências da empresa entre `de` e `ate` (ambos inclusivos, até 366 dias).
export const obterCalendario = (de, ate, token) =>
  apiRequest(`/calendar?from=${de}&to=${ate}`, { token }).then(dadosResposta);

// O mesmo, só com quem está alocado ao projeto nesse intervalo (e o gestor).
export const obterCalendarioProjeto = (projectId, de, ate, token) =>
  apiRequest(`/projects/${projectId}/calendar?from=${de}&to=${ate}`, { token }).then(dadosResposta);

// Nacionais (calculados do país da empresa; só PT) e os da empresa.
export const listarFeriados = (ano, token) => apiRequest(`/holidays?year=${ano}`, { token }).then(dadosResposta);

// Feriado da empresa (municipal, Carnaval, fecho...). Um company_admin junta sempre à sua empresa.
export const criarFeriado = (dados, token) =>
  apiRequest("/holidays", { method: "POST", token, body: dados }).then(dadosResposta);

export const apagarFeriado = (id, token) => apiRequest(`/holidays/${id}`, { method: "DELETE", token });
