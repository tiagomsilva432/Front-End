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
