import { apiRequest, dadosResposta } from "./api";

export const listarEmpresas = async (token) => {
  const result = await apiRequest("/companies", { token });
  return dadosResposta(result);
};

export const criarEmpresa = async (dadosEmpresa, token) => {
  const result = await apiRequest("/companies", {
    method: "POST",
    token,
    // Os opcionais vazios não vão: o back recusa null nestes campos, e sem country põe "PT".
    body: {
      name: dadosEmpresa.name,
      ...(dadosEmpresa.taxId ? { taxId: dadosEmpresa.taxId } : {}),
      ...(dadosEmpresa.email ? { email: dadosEmpresa.email } : {}),
      ...(dadosEmpresa.country ? { country: dadosEmpresa.country } : {}),
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
