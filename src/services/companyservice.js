// Exemplo de como deve estar o teu service no frontend (companyService.js)
const API_URL = "http://localhost:3000";

export const listarEmpresas = async (token) => {
  const res = await fetch(`${API_URL}/companies`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Erro ao listar empresas");
  const data = await res.json();
  return data.data || data;
};

export const criarEmpresa = async (dadosEmpresa, token) => {
  const res = await fetch(`${API_URL}/companies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    // O objeto enviado tem de ter a chave "name"
    body: JSON.stringify({
      name: dadosEmpresa.name,
      taxId: dadosEmpresa.taxId || null,
      email: dadosEmpresa.email || null,
      country: dadosEmpresa.country || null,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    // Lança o erro detalhado vindo do backend para cair no catch do componente
    throw new Error(data.message || "Erro ao criar a empresa");
  }

  return data;
};
