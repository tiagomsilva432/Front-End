import { apiRequest, dadosResposta, enviarFicheiro } from "./api";

export const CATEGORIAS_DESPESA = {
  software: "Software",
  hardware: "Equipamento",
  travel: "Viagens",
  services: "Serviços",
  office: "Escritório",
  other: "Outros",
};

const filtro = (parametros) => {
  const p = new URLSearchParams(Object.entries(parametros).filter(([, v]) => v !== undefined && v !== "" && v !== false));
  return p.toString() ? `?${p}` : "";
};

// Admins: a empresa toda. Gestor: tem de passar o projectId de um projeto que gere.
// `soEmpresa` = só as despesas da empresa (sem projeto: renda, licenças...).
export const listarDespesas = (token, { projectId, categoria, de, ate, soEmpresa } = {}) =>
  apiRequest(
    `/expenses${filtro({ projectId, category: categoria, from: de, to: ate, overhead: soEmpresa ? "true" : undefined })}`,
    { token },
  ).then(dadosResposta);

// Sem projectId é da empresa (só admins). incurredOn nunca no futuro; por omissão, hoje.
export const criarDespesa = (dados, token) =>
  apiRequest("/expenses", { method: "POST", token, body: dados }).then(dadosResposta);

// Junta: só o que muda; description: null limpa-a. O projeto não muda.
export const atualizarDespesa = (id, dados, token) =>
  apiRequest(`/expenses/${id}`, { method: "PATCH", token, body: dados }).then(dadosResposta);

export const apagarDespesa = (id, token) => apiRequest(`/expenses/${id}`, { method: "DELETE", token });

// Recibos (JPG, PNG, WebP ou PDF, até 10 MB, até 5 por despesa). A despesa cria-se primeiro.
// A resposta traz duplicateOwnerIds quando o mesmo ficheiro já está noutra despesa da empresa.
export const enviarRecibo = (expenseId, ficheiro, token) => enviarFicheiro(`/expenses/${expenseId}/receipts`, ficheiro, { token });

export const apagarRecibo = (expenseId, fileId, token) =>
  apiRequest(`/expenses/${expenseId}/receipts/${fileId}`, { method: "DELETE", token });
