// Funções de apresentação partilhadas pelas páginas.

export const ESTADOS_PROJETO = {
  planned: "Planeado",
  active: "Ativo",
  on_hold: "Em pausa",
  completed: "Concluído",
  cancelled: "Cancelado",
};

export const hojeISO = () => new Date().toISOString().slice(0, 10);

export function nomeCompleto(utilizador) {
  return [utilizador?.profile?.firstName, utilizador?.profile?.lastName].filter(Boolean).join(" ");
}

export function formatarData(valor, vazio = "Não informado") {
  if (!valor) return vazio;
  const data = new Date(`${String(valor).slice(0, 10)}T00:00:00`);
  return Number.isNaN(data.getTime()) ? valor : data.toLocaleDateString("pt-PT");
}

export function formatarEuros(valor) {
  if (valor === null || valor === undefined || valor === "") return "—";
  return Number(valor).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });
}

// Montante numa moeda ISO qualquer (os salários podem não ser em euros).
export function formatarMontante(valor, moeda = "EUR") {
  try {
    return Number(valor).toLocaleString("pt-PT", { style: "currency", currency: moeda });
  } catch {
    return `${valor} ${moeda}`;
  }
}

export const idDe = (item) => item?.id || item?._id;

// Uma alocação está em curso se não tem data de fim ou se a data de fim ainda não passou.
export const alocacaoEmCurso = (alocacao) => !alocacao.endDate || alocacao.endDate >= hojeISO();
