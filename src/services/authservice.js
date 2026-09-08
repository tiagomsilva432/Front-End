const API_URL = "http://localhost:3000";

export const authService = {
  async login(email, password) {
    const resposta = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      throw new Error(resultado.message || "Erro ao efetuar login.");
    }

    const { token, user } = resultado.data;

    localStorage.setItem("token", token);
    localStorage.setItem("usuario_sessao", JSON.stringify(user));

    return user;
  },

  obterSessao() {
    const sessao = localStorage.getItem("usuario_sessao");
    return sessao ? JSON.parse(sessao) : null;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario_sessao");
  },
};
