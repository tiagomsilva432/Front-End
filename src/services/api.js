const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest(path, { method = "GET", token, body, headers = {} } = {}) {
  const requestHeaders = { ...headers };
  if (body !== undefined) requestHeaders["Content-Type"] = "application/json";
  if (token) requestHeaders.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: requestHeaders,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  let result = null;
  try {
    result = await response.json();
  } catch {
    // Algumas respostas podem não ter corpo JSON.
  }

  if (!response.ok) {
    const endpoint = path.split("?")[0];
    const endpointsPublicos = ["/auth/login", "/auth/account/activate"];
    if (response.status === 401 && !endpointsPublicos.includes(endpoint)) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario_sessao");
      window.location.assign("/");
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
