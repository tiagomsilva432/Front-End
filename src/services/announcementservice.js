import { apiRequest, dadosResposta } from "./api";

export const AMBITOS_ANUNCIO = { system: "Sistema", company: "Empresa", project: "Projeto" };
export const NIVEIS_ANUNCIO = { info: "Informação", warning: "Aviso", critical: "Crítico" };

// O feed de quem tem a sessão: sistema, a sua empresa e os projetos em que está ou que gere.
export const listarMeusAnuncios = (token, apenasPorLer = false) =>
  apiRequest(`/announcements/mine${apenasPorLer ? "?unread=true" : ""}`, { token }).then(dadosResposta);

// Marca como lido (ou fecha a faixa). Repetir não muda nada.
export const marcarAnuncioLido = (id, token) =>
  apiRequest(`/announcements/${id}/read`, { method: "POST", token }).then(dadosResposta);

// Página de um projeto: qualquer pessoa da empresa. includeInactive só conta para quem o gere.
export const listarAnunciosProjeto = (projectId, token, incluirInativos = false) =>
  apiRequest(`/projects/${projectId}/announcements${incluirInativos ? "?includeInactive=true" : ""}`, { token }).then(
    dadosResposta,
  );

// Os que quem tem a sessão pode gerir.
export const listarAnunciosGeriveis = (token, { ambito, companyId, projectId, incluirInativos = true } = {}) => {
  const parametros = new URLSearchParams();
  if (ambito) parametros.set("scope", ambito);
  if (companyId) parametros.set("companyId", companyId);
  if (projectId) parametros.set("projectId", projectId);
  if (incluirInativos) parametros.set("includeInactive", "true");
  return apiRequest(`/announcements?${parametros}`, { token }).then(dadosResposta);
};

// scope "company" leva companyId (só o system_admin o indica); "project" leva projectId.
export const criarAnuncio = (dados, token) =>
  apiRequest("/announcements", { method: "POST", token, body: dados }).then(dadosResposta);

// Junta: só o que for enviado muda. O âmbito, a empresa e o projeto não se alteram.
export const atualizarAnuncio = (id, dados, token) =>
  apiRequest(`/announcements/${id}`, { method: "PATCH", token, body: dados }).then(dadosResposta);

export const apagarAnuncio = (id, token) => apiRequest(`/announcements/${id}`, { method: "DELETE", token });
