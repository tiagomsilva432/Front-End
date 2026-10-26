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

  // Envia o e-mail com o link de recuperação (responde sempre 200, mesmo que o e-mail não exista).
  async pedirRedefinicaoSenha(email) {
    return apiRequest("/auth/password/reset", {
      method: "POST",
      body: { email },
    });
  },

  // Volta a enviar o e-mail de ativação a uma conta com o convite pendente.
  async reenviarConvite(userId) {
    return apiRequest(`/auth/account/${userId}/resend-activation`, {
      method: "POST",
      token: this.obterToken(),
    });
  },

  // Troca a senha da própria conta (pede a senha atual).
  async alterarSenha({ currentPassword, newPassword }) {
    return apiRequest("/auth/password/change", {
      method: "POST",
      token: this.obterToken(),
      body: { currentPassword, newPassword },
    });
  },

  // Confirma no servidor que a sessão guardada continua válida e a conta ativa.
  async validarSessao() {
    const resultado = await apiRequest("/auth/me", { token: this.obterToken() });
    return resultado?.data ?? resultado;
  },

  // Define a nova senha com o token que veio no link do e-mail.
  async confirmarRedefinicaoSenha({ token, password }) {
    return apiRequest("/auth/password/reset/confirm", {
      method: "POST",
      body: { token, password },
    });
  },
};
