const API_URL = "http://localhost:3000";

export const criarProjeto = async (dadosProjeto, token) => {
  const resposta = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dadosProjeto),
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(resultado.message || "Erro ao criar o projeto.");
  }

  return resultado.data || resultado;
};

export const listarProjetos = async (companyId, status = "", token) => {
  const parametros = new URLSearchParams();
  if (companyId) parametros.set("companyId", companyId);
  if (status) parametros.set("status", status);

  const resposta = await fetch(`${API_URL}/projects?${parametros.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    throw new Error(resultado.message || "Erro ao carregar os projetos.");
  }

  return resultado.data || resultado;
};
