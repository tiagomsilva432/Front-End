import { apiRequest } from "./api";

export const authService = {
  async login(email, password, companyId) {
    const resultado = await apiRequest("/auth/login", {
      method: "POST",
      body: { email, password, ...(companyId ? { companyId } : {}) },
    });

    const { token, user } = resultado.data;
    localStorage.setItem("token", token);
    localStorage.setItem("usuario_sessao", JSON.stringify(user));
    return user;
  },

  async registrar({ email, role, companyId, profile }) {
    const token = this.obterToken();

    const payload = {
      companyId: String(companyId),
      email: String(email).trim(),
      role: String(role),
      ...(profile ? { profile } : {}),
    };
    return apiRequest("/auth/account/create", {
      method: "POST",
      token,
      body: payload,
    });
  },

  obterToken() {
    return localStorage.getItem("token") || "";
  },

  obterSessao() {
    const sessao = localStorage.getItem("usuario_sessao");
    return sessao ? JSON.parse(sessao) : null;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario_sessao");
  },

  async ativarConta({ token, password }) {
    return apiRequest("/auth/account/activate", {
      method: "POST",
      body: { signupToken: token, password },
    });
  },
};
