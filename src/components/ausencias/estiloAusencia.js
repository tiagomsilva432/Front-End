// Cores partilhadas pelas ausências (lista e calendário).
export const corDoEstado = (tema, estado) =>
  ({ pending: tema.aviso, approved: tema.sucesso, rejected: tema.erro, cancelled: tema.chip })[estado] || tema.chip;

// Pontos/etiquetas no calendário: férias a verde, baixa e outras (ou "ausente", para colegas) a âmbar.
export const corDoTipo = (tema, tipo) => (tipo === "vacation" ? tema.sucesso : tema.aviso);
