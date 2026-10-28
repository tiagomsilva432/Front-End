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

// Etiquetas como o back as guarda: aparadas, em minúsculas, 1-30 caracteres, no máximo 10 e sem repetidas.
export const normalizarEtiquetas = (texto) =>
  [...new Set(texto.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean))].filter((e) => e.length <= 30).slice(0, 10);

export const atrasada = (tarefa, hoje) => tarefa.dueDate && tarefa.status !== "done" && tarefa.dueDate < hoje;
