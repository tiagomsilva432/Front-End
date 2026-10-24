import { apiRequest, dadosResposta } from "./api";

export const criarProjeto = async (dadosProjeto, token) => {
  const resultado = await apiRequest("/projects", {
    method: "POST",
    token,
    body: dadosProjeto,
  });
  return dadosResposta(resultado);
};

// Quem trabalha (ou trabalhou) num projeto. Com apenasAbertas, só as alocações sem data de fim.
export const listarAlocacoesProjeto = async (projectId, token, apenasAbertas = false) => {
  const filtro = apenasAbertas ? "?open=true" : "";
  const resultado = await apiRequest(`/projects/${projectId}/allocations${filtro}`, { token });
  return dadosResposta(resultado);
};

export const listarProjetos = async (companyId, status = "", token) => {
  const parametros = new URLSearchParams();
  if (companyId) parametros.set("companyId", companyId);
  if (status) parametros.set("status", status);

  const resultado = await apiRequest(`/projects?${parametros.toString()}`, { token });
  return dadosResposta(resultado);
};

// Altera só os campos enviados; um null explícito limpa o campo (exceto name e status).
export const atualizarProjeto = async (projectId, dados, token) => {
  const resultado = await apiRequest(`/projects/${projectId}`, {
    method: "PATCH",
    token,
    body: dados,
  });
  return dadosResposta(resultado);
};
