// Cores dos gráficos de finanças. Paleta categórica validada (skill dataviz) contra as superfícies
// da app: cartão branco no claro e #0b0f19 no escuro. A ordem das séries é fixa e nunca se recicla.
const SERIES = {
  claro: ["#2a78d6", "#eb6834", "#1baf7a"],
  escuro: ["#3987e5", "#d95926", "#199e70"],
};

export const corDaSerie = (tema, indice) => SERIES[tema.isDark ? "escuro" : "claro"][indice];

// Estado do orçamento (reservado: nunca usado como série). Vai sempre com ícone + texto.
export const ESTADO_ORCAMENTO = {
  ok: { cor: "#0ca30c", rotulo: "Dentro do orçamento", icone: "●" },
  aviso: { cor: "#fab219", rotulo: "Acima de 80%", icone: "▲" },
  critico: { cor: "#d03b3b", rotulo: "Orçamento ultrapassado", icone: "■" },
};

export const estadoDoOrcamento = (percentagem) =>
  percentagem === null || percentagem === undefined ? null : percentagem >= 100 ? "critico" : percentagem >= 80 ? "aviso" : "ok";

// Os montantes vêm como string com 2 casas ("1249.90").
export const euros = (valor) =>
  valor === null || valor === undefined
    ? "—"
    : Number(valor).toLocaleString("pt-PT", { style: "currency", currency: "EUR" });

// Eixos: 0 / 1 mil / 2,5 mil / 1,2 M.
export const eurosCompacto = (valor) =>
  Number(valor).toLocaleString("pt-PT", { notation: "compact", maximumFractionDigits: 1, style: "currency", currency: "EUR" });

// Nomes fixos: o toLocaleDateString com "mês curto + ano" devolve "03/2026" em alguns browsers.
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

// "2026-03" -> "mar 2026" (ou só "mar" com curto).
export const nomeDoMes = (mes, curto = false) => {
  const [ano, m] = mes.split("-").map(Number);
  return curto ? MESES[m - 1] : `${MESES[m - 1]} ${ano}`;
};
