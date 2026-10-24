import { apiRequest, dadosResposta } from "./api";

export const CATEGORIAS_COMPETENCIA = {
  language: "Linguagem",
  framework: "Framework",
  role: "Função",
  tool: "Ferramenta",
  soft_skill: "Soft skill",
  other: "Outra",
};

// Catálogo partilhado por todas as empresas.
export const listarCompetencias = (token, categoria = "") => {
  const filtro = categoria ? `?category=${encodeURIComponent(categoria)}` : "";
  return apiRequest(`/skills${filtro}`, { token }).then(dadosResposta);
};

// Só o system_admin cria e altera o catálogo.
export const criarCompetencia = (dados, token) =>
  apiRequest("/skills", { method: "POST", token, body: dados }).then(dadosResposta);

export const atualizarCompetencia = (skillId, dados, token) =>
  apiRequest(`/skills/${skillId}`, { method: "PATCH", token, body: dados }).then(dadosResposta);

// Quem tem a competência, da mais proficiente para a menos (só da própria empresa).
export const listarPessoasComCompetencia = (skillId, token) =>
  apiRequest(`/skills/${skillId}/users`, { token }).then(dadosResposta);

export const listarCompetenciasUser = (userId, token) =>
  apiRequest(`/users/${userId}/skills`, { token }).then(dadosResposta);

// Substitui: proficiency ou yearsExperience omitidos ficam a null. Ninguém define as próprias.
export const definirCompetenciaUser = (userId, skillId, dados, token) =>
  apiRequest(`/users/${userId}/skills/${skillId}`, { method: "PUT", token, body: dados }).then(dadosResposta);

export const removerCompetenciaUser = (userId, skillId, token) =>
  apiRequest(`/users/${userId}/skills/${skillId}`, { method: "DELETE", token });
