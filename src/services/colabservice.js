const API_URL = "http://localhost:3000";

export const colaboradorService = {
  async registrar({ email, role, companyId }) {
    const token = localStorage.getItem("token");

    const resposta = await fetch(`${API_URL}/auth/account/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        companyId: Number(companyId),
        role: role,
        email: email,
      }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.message || "Erro ao criar conta e enviar convite.");
    }

    return dados;
  },
};
