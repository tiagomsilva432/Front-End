export const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest(
  path,
  { method = "GET", token, body, headers = {} } = {},
) {
  // Um FormData (uploads) vai como está: é o browser que põe o Content-Type multipart, com o boundary.
  const ficheiro = body instanceof FormData;
  const requestHeaders = { ...headers };
  if (body !== undefined && !ficheiro) requestHeaders["Content-Type"] = "application/json";
  if (token) requestHeaders.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: requestHeaders,
    ...(body !== undefined ? { body: ficheiro ? body : JSON.stringify(body) } : {}),
  });

  let result = null;
  try {
    result = await response.json();
  } catch {
    // Algumas respostas podem não ter corpo JSON.
  }

  if (!response.ok) {
    const endpoint = path.split("?")[0];
    // Nestes pedidos um 401 não quer dizer "sessão expirada" (ex.: senha atual errada),
    // por isso não se termina a sessão automaticamente.
    const semLogoutAutomatico = [
      "/auth/login",
      "/auth/account/activate",
      "/auth/password/reset",
      "/auth/password/reset/confirm",
      "/auth/password/change",
    ];
    // Uma conta suspensa ou terminada é recusada com 403 "Conta não está ativa" logo no pedido seguinte.
    const contaInativa = response.status === 403 && result?.message === "Conta não está ativa";
    if ((response.status === 401 || contaInativa) && !semLogoutAutomatico.includes(endpoint)) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario_sessao");
      window.location.assign("/entrar");
    }

    throw new ApiError(
      result?.message || `Pedido falhou (${response.status}).`,
      response.status,
      result,
    );
  }

  return result;
}

export const dadosResposta = (result) => result?.data ?? result;

// Envia um ficheiro em multipart/form-data, no campo "file" (um por pedido).
export const enviarFicheiro = (path, ficheiro, { method = "POST", token } = {}) => {
  const form = new FormData();
  form.append("file", ficheiro);
  return apiRequest(path, { method, token, body: form }).then(dadosResposta);
};

export const LIMITES_FICHEIRO = {
  avatar: { tipos: "image/jpeg,image/png,image/webp", maxMB: 5, descricao: "JPG, PNG ou WebP, até 5 MB" },
  documento: { tipos: "image/jpeg,image/png,image/webp,application/pdf", maxMB: 10, descricao: "JPG, PNG, WebP ou PDF, até 10 MB" },
};

// Validação local, só para poupar o upload: quem decide é o servidor (que verifica o conteúdo).
export function validarFicheiro(ficheiro, limite) {
  if (!limite.tipos.split(",").includes(ficheiro.type)) return `Tipo não aceite: ${limite.descricao}.`;
  if (ficheiro.size > limite.maxMB * 1024 * 1024) return `O ficheiro tem mais de ${limite.maxMB} MB.`;
  return "";
}
