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

// "agora", "há 5 min", "há 3 h", "ontem", ou a data para o que é mais antigo.
export function tempoRelativo(valor) {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "";
  const segundos = Math.round((Date.now() - data.getTime()) / 1000);
  if (segundos < 60) return "agora";
  if (segundos < 3600) return `há ${Math.floor(segundos / 60)} min`;
  if (segundos < 86400) return `há ${Math.floor(segundos / 3600)} h`;
  if (segundos < 172800) return "ontem";
  if (segundos < 604800) return `há ${Math.floor(segundos / 86400)} dias`;
  return data.toLocaleDateString("pt-PT");
}

// Data e hora, para os anúncios (que têm janela com hora).
export function formatarDataHora(valor) {
  if (!valor) return "";
  const data = new Date(valor);
  return Number.isNaN(data.getTime())
    ? valor
    : data.toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// AAAA-MM-DD na hora local (o toISOString passa para UTC e pode mudar o dia).
export function isoLocal(data) {
  const d = new Date(data);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Intervalo de datas curto: "21/12/2026" ou "21/12/2026 – 31/12/2026".
export function formatarIntervalo(inicio, fim) {
  return inicio === fim ? formatarData(inicio) : `${formatarData(inicio)} – ${formatarData(fim)}`;
}

export const idDe = (item) => item?.id || item?._id;

// Uma alocação está em curso se não tem data de fim ou se a data de fim ainda não passou.
export const alocacaoEmCurso = (alocacao) => !alocacao.endDate || alocacao.endDate >= hojeISO();
