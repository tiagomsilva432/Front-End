import { apiRequest, dadosResposta } from "./api";

export const TIPOS_AUSENCIA = { vacation: "Férias", sick: "Baixa médica", leave: "Outra ausência", absent: "Ausente" };
export const ESTADOS_AUSENCIA = { pending: "Pendente", approved: "Aprovada", rejected: "Recusada", cancelled: "Cancelada" };

const filtro = (parametros) => {
  const p = new URLSearchParams(Object.entries(parametros).filter(([, v]) => v));
  return p.toString() ? `?${p}` : "";
};

// Pedir uma ausência para si próprio. endDate é inclusivo; as férias não podem começar no passado.
export const pedirAusencia = (dados, token) =>
  apiRequest("/absences", { method: "POST", token, body: dados }).then(dadosResposta);

// Os pedidos de quem tem a sessão, em qualquer estado.
export const listarMinhasAusencias = (token, estado = "") =>
  apiRequest(`/absences/mine${filtro({ status: estado })}`, { token }).then(dadosResposta);

// Os pedidos para decidir (system_admin e company_admin).
export const listarAusencias = (token, { estado, userId, companyId } = {}) =>
  apiRequest(`/absences${filtro({ status: estado, userId, companyId })}`, { token }).then(dadosResposta);

export const aprovarAusencia = (id, token) =>
  apiRequest(`/absences/${id}/approve`, { method: "POST", token }).then(dadosResposta);

export const recusarAusencia = (id, motivo, token) =>
  apiRequest(`/absences/${id}/reject`, { method: "POST", token, body: motivo ? { reason: motivo } : {} }).then(
    dadosResposta,
  );

// A pessoa cancela um pendente ou um aprovado que ainda não começou; quem decide cancela a qualquer momento.
export const cancelarAusencia = (id, motivo, token) =>
  apiRequest(`/absences/${id}/cancel`, { method: "POST", token, body: motivo ? { reason: motivo } : {} }).then(
    dadosResposta,
  );

// Dias úteis de ausências aprovadas num ano, por tipo.
export const obterResumoAusencias = (userId, ano, token) =>
  apiRequest(`/users/${userId}/absence-summary${filtro({ year: ano })}`, { token }).then(dadosResposta);
