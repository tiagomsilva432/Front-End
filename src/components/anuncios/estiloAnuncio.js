// Cores de um anúncio conforme o nível (info / warning / critical).
export const corDoNivel = (tema, nivel) => ({ info: tema.active, warning: tema.aviso, critical: tema.erro })[nivel] || tema.chip;

// <input type="datetime-local"> trabalha na hora local, sem fuso; o back quer ISO com fuso.
export const paraInputLocal = (iso) => {
  if (!iso) return "";
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "";
  const local = new Date(data.getTime() - data.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

export const deInputLocal = (valor) => (valor ? new Date(valor).toISOString() : null);
