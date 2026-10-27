import { apiRequest, dadosResposta } from "./api";

// Orçamento de um projeto contra o gasto. Para o gestor, includesLabour é false e não há labourCost.
export const obterFinancasProjeto = (projectId, token) =>
  apiRequest(`/projects/${projectId}/finance`, { token }).then(dadosResposta);

// Painel da empresa (só admins). `de`/`ate` em AAAA-MM (máx. 24 meses); filtros separados por vírgula.
export const obterPainelFinancas = (token, { de, ate, projectIds = [], categorias = [] } = {}) => {
  const p = new URLSearchParams();
  if (de) p.set("from", de);
  if (ate) p.set("to", ate);
  if (projectIds.length) p.set("projectIds", projectIds.join(","));
  if (categorias.length) p.set("categories", categorias.join(","));
  return apiRequest(`/finance/overview${p.toString() ? `?${p}` : ""}`, { token }).then(dadosResposta);
};
