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
