import { apiRequest, dadosResposta, enviarFicheiro } from "./api";

export const COLUNAS_TAREFA = [
  ["todo", "A fazer"],
  ["in_progress", "Em curso"],
  ["review", "Em revisão"],
  ["done", "Concluído"],
];
export const PRIORIDADES_TAREFA = { low: "Baixa", medium: "Média", high: "Alta", critical: "Crítica" };

const filtro = (parametros) => {
  const p = new URLSearchParams(Object.entries(parametros).filter(([, v]) => v));
  return p.toString() ? `?${p}` : "";
};

// O quadro: { todo, in_progress, review, done }, cada coluna de cima para baixo.
export const obterQuadro = (projectId, token, { assigneeId, label, priority } = {}) =>
  apiRequest(`/projects/${projectId}/tasks${filtro({ assigneeId, label, priority })}`, { token }).then(dadosResposta);

export const listarEtiquetas = (projectId, token) => apiRequest(`/projects/${projectId}/tasks/labels`, { token }).then(dadosResposta);

// Uma tarefa nova fica no fundo de todo ou in_progress (nunca direto em review ou done).
export const criarTarefa = (projectId, dados, token) =>
  apiRequest(`/projects/${projectId}/tasks`, { method: "POST", token, body: dados }).then(dadosResposta);

export const obterTarefa = (projectId, taskId, token) => apiRequest(`/projects/${projectId}/tasks/${taskId}`, { token }).then(dadosResposta);

// O conteúdo (junta; labels substitui a lista). Nunca a coluna nem a posição: isso é o mover.
export const atualizarTarefa = (projectId, taskId, dados, token) =>
  apiRequest(`/projects/${projectId}/tasks/${taskId}`, { method: "PATCH", token, body: dados }).then(dadosResposta);

export const apagarTarefa = (projectId, taskId, token) => apiRequest(`/projects/${projectId}/tasks/${taskId}`, { method: "DELETE", token });

// { status, position } -> { task, order }: `order` traz as colunas afetadas, de cima para baixo.
export const moverTarefa = (projectId, taskId, status, position, token) =>
  apiRequest(`/projects/${projectId}/tasks/${taskId}/move`, { method: "POST", token, body: { status, position } }).then(dadosResposta);

export const anexarFicheiroTarefa = (projectId, taskId, ficheiro, token) =>
  enviarFicheiro(`/projects/${projectId}/tasks/${taskId}/attachments`, ficheiro, { token });

export const tirarAnexoTarefa = (projectId, taskId, fileId, token) =>
  apiRequest(`/projects/${projectId}/tasks/${taskId}/attachments/${fileId}`, { method: "DELETE", token });

export const listarComentarios = (projectId, taskId, token) =>
  apiRequest(`/projects/${projectId}/tasks/${taskId}/comments`, { token }).then(dadosResposta);

export const comentarTarefa = (projectId, taskId, texto, token) =>
  apiRequest(`/projects/${projectId}/tasks/${taskId}/comments`, { method: "POST", token, body: { body: texto } }).then(dadosResposta);

export const corrigirComentario = (projectId, taskId, commentId, texto, token) =>
  apiRequest(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, { method: "PATCH", token, body: { body: texto } }).then(dadosResposta);

export const apagarComentario = (projectId, taskId, commentId, token) =>
  apiRequest(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`, { method: "DELETE", token });
