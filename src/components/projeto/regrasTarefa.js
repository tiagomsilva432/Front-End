// As regras do back para mover um cartão (src/services/task-workflow.ts), para o front só oferecer o que pode passar.
// O servidor decide sempre; isto só evita botões e destinos que iam dar 400/403.
//   - entre todo, in_progress e review: o responsável, o gestor ou um admin (sem responsável, qualquer membro);
//   - review -> done (a aprovação): o gestor ou um admin;
//   - todo/in_progress -> done: ninguém (tem de passar pela revisão);
//   - sair de done, ou mexer dentro de done: o gestor ou um admin.
export function podeMover(tarefa, destino, { eu, gere }) {
  const origem = tarefa.status;
  if (origem === "done" || destino === "done") {
    if (destino === "done" && origem !== "done" && origem !== "review") return false;
    return gere;
  }
  return gere || !tarefa.assigneeId || tarefa.assigneeId === eu?.id;
}

// Quem apaga: quem criou, o gestor ou um admin.
export const podeApagar = (tarefa, { eu, gere }) => gere || tarefa.createdBy === eu?.id;

// As regras do back para alterar um cartão (checkTaskEdit e checkAssignee, no mesmo task-workflow.ts).
// `tarefa` é null numa tarefa nova.
//   - uma tarefa concluída: só o gestor ou um admin;
//   - o título e a descrição: quem a criou, o gestor ou um admin;
//   - o prazo, a prioridade, as etiquetas e os anexos: quem a criou, o responsável, o gestor ou um admin.
// Os outros membros só veem e comentam.
export const podeEditarTarefa = (tarefa, { gere }) => gere || tarefa?.status !== "done";

export const podeEditarTexto = (tarefa, { eu, gere }) =>
  podeEditarTarefa(tarefa, { gere }) && (!tarefa || gere || tarefa.createdBy === eu?.id);

// `responsavel` é o do formulário: quem pega na tarefa pode logo mexer no resto, no mesmo gravar.
export const podeEditarDetalhes = (tarefa, { eu, gere }, responsavel = tarefa?.assigneeId) =>
  podeEditarTarefa(tarefa, { gere }) && (!tarefa || gere || tarefa.createdBy === eu?.id || (!!responsavel && responsavel === eu?.id));

// O responsável (`id` null é "Sem responsável"): o gestor ou um admin põem qualquer membro. Os outros só
// ficam com uma tarefa sem responsável para si, e só passam a outra pessoa (ou largam) a que já é sua.
export function podeAtribuir(tarefa, id, { eu, gere }) {
  const atual = tarefa?.assigneeId || null;
  if (id === atual || gere || (atual !== null && atual === eu?.id)) return true;
  return atual === null && id === eu?.id;
}

// Etiquetas como o back as guarda: aparadas, em minúsculas, 1-30 caracteres, no máximo 10 e sem repetidas.
export const normalizarEtiquetas = (texto) =>
  [...new Set(texto.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean))].filter((e) => e.length <= 30).slice(0, 10);

export const atrasada = (tarefa, hoje) => tarefa.dueDate && tarefa.status !== "done" && tarefa.dueDate < hoje;
