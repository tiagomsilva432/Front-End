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

export const idDe = (item) => item?.id || item?._id;
