import { apiRequest, dadosResposta } from "./api";

export const listarAlocacoesUser = (userId, token, apenasAbertas = true) => {
  const filtro = apenasAbertas ? "?open=true" : "";
  return apiRequest(`/users/${userId}/allocations${filtro}`, { token }).then(dadosResposta);
};

export const obterCargaAlocacao = (userId, token) =>
  apiRequest(`/users/${userId}/allocation-load`, { token }).then(dadosResposta);

export const criarAlocacao = (dados, token) =>
  apiRequest("/allocations", {
    method: "POST",
    token,
    body: dados,
  });

// Altera só os campos enviados. endDate = data termina a alocação; endDate = null reabre-a.
export const atualizarAlocacao = (id, dados, token) =>
  apiRequest(`/allocations/${id}`, {
    method: "PATCH",
    token,
    body: dados,
  }).then(dadosResposta);

// Só para corrigir um engano: terminar trabalho real faz-se com endDate, que guarda o histórico.
export const apagarAlocacao = (id, token) =>
  apiRequest(`/allocations/${id}`, { method: "DELETE", token });
