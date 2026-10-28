import { apiRequest, dadosResposta, enviarFicheiro } from "./api";

// Recursos de um projeto (links, notas, ficheiros), dos mais antigos para os mais recentes.
// Só para os membros: quem está alocado, o gestor e os admins.
export const listarRecursos = (projectId, token) => apiRequest(`/projects/${projectId}/resources`, { token }).then(dadosResposta);

// Só o title é obrigatório; o ficheiro envia-se depois, com o id do recurso criado.
export const criarRecurso = (projectId, dados, token) =>
  apiRequest(`/projects/${projectId}/resources`, { method: "POST", token, body: dados }).then(dadosResposta);

// Junta; null limpa url ou note. Um colaborador só altera os que adicionou; o gestor e os admins, todos.
export const atualizarRecurso = (projectId, resourceId, dados, token) =>
  apiRequest(`/projects/${projectId}/resources/${resourceId}`, { method: "PATCH", token, body: dados }).then(dadosResposta);

export const apagarRecurso = (projectId, resourceId, token) =>
  apiRequest(`/projects/${projectId}/resources/${resourceId}`, { method: "DELETE", token });

// Um ficheiro por recurso (JPG, PNG, WebP ou PDF, até 10 MB); enviar outro substitui-o.
export const enviarFicheiroRecurso = (projectId, resourceId, ficheiro, token) =>
  enviarFicheiro(`/projects/${projectId}/resources/${resourceId}/file`, ficheiro, { method: "PUT", token });

export const apagarFicheiroRecurso = (projectId, resourceId, token) =>
  apiRequest(`/projects/${projectId}/resources/${resourceId}/file`, { method: "DELETE", token });
