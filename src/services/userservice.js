import { apiRequest, dadosResposta } from "./api";

export const listarUsers = async ({ companyId, role, status } = {}, token) => {
  const parametros = new URLSearchParams();
  if (companyId) parametros.set("companyId", companyId);
  if (role) parametros.set("role", role);
  if (status) parametros.set("status", status);

  const resultado = await apiRequest(`/users?${parametros.toString()}`, { token });
  return dadosResposta(resultado);
};

export const listarAdminsEmpresa = (companyId, token) =>
  listarUsers({ companyId, role: "company_admin" }, token);

export const obterUser = async (userId, token) => {
  const resultado = await apiRequest(`/users/${userId}`, { token });
  return dadosResposta(resultado);
};

export const atualizarPerfilUser = async (userId, perfil, token) => {
  const resultado = await apiRequest(`/users/${userId}/profile`, {
    method: "PUT",
    token,
    body: perfil,
  });
  return dadosResposta(resultado);
};
