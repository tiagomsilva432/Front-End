const API_URL = "http://localhost:3000";

export const authService = {
  async login(email, password) {
    const resposta = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const resultado = await resposta.json();
    if (!resposta.ok)
      throw new Error(resultado.message || "Erro ao efetuar login.");

    const { token, user } = resultado.data;
    localStorage.setItem("token", token);
    localStorage.setItem("usuario_sessao", JSON.stringify(user));
    return user;
  },

  async registrar({ email, role, companyId }) {
    const token = localStorage.getItem("token");

    const payload = {
      companyId: String(companyId), // Força a ser string (UUID)
      email: String(email).trim(),
      role: String(role), // Envia a role exata selecionada
    };
    console.log(
      "🚀 PAYLOAD ENVIADO PARA O BACK-END:",
      JSON.stringify(payload, null, 2),
    );
    const resposta = await fetch(`${API_URL}/auth/account/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.message || "Erro ao criar conta e enviar convite.");
    }

    return dados;
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
    const resposta = await fetch(`${API_URL}/auth/account/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signupToken: token, password: password }),
    });

    const resultado = await resposta.json();
    if (!resposta.ok) {
      throw new Error(resultado.message || "Erro ao ativar a conta.");
    }

    return resultado;
  },
};
