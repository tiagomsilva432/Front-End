import { apiRequest, dadosResposta } from "./api";

export const listarEmpresas = async (token) => {
  const result = await apiRequest("/companies", { token });
  return dadosResposta(result);
};

export const criarEmpresa = async (dadosEmpresa, token) => {
  const result = await apiRequest("/companies", {
    method: "POST",
    token,
    body: {
      name: dadosEmpresa.name,
      taxId: dadosEmpresa.taxId || null,
      email: dadosEmpresa.email || null,
      country: dadosEmpresa.country || null,
    },
  });
  return result;
};

export const obterEmpresa = async (companyId, token) => {
  const result = await apiRequest(`/companies/${companyId}`, { token });
  return dadosResposta(result);
};

// Altera só os campos enviados. O taxId (NIF) só o system_admin o pode mudar.
export const atualizarEmpresa = async (companyId, dados, token) => {
  const result = await apiRequest(`/companies/${companyId}`, {
    method: "PATCH",
    token,
    body: dados,
  });
  return dadosResposta(result);
};
