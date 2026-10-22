import { apiRequest, dadosResposta } from "./api";

export const criarProjeto = async (dadosProjeto, token) => {
  const resultado = await apiRequest("/projects", {
    method: "POST",
    token,
    body: dadosProjeto,
  });
  return dadosResposta(resultado);
};

export const listarProjetos = async (companyId, status = "", token) => {
  const parametros = new URLSearchParams();
  if (companyId) parametros.set("companyId", companyId);
  if (status) parametros.set("status", status);

  const resultado = await apiRequest(`/projects?${parametros.toString()}`, { token });
  return dadosResposta(resultado);
};
