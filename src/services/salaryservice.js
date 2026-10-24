import { apiRequest, dadosResposta } from "./api";

// Histórico, do mais recente para o mais antigo. Só a própria pessoa ou quem administra a conta.
export const listarSalarios = (userId, token) =>
  apiRequest(`/users/${userId}/salaries`, { token }).then(dadosResposta);

// O salário pago hoje. Responde 404 se ainda não houver nenhum em vigor; aí devolve-se null.
export const obterSalarioAtual = (userId, token) =>
  apiRequest(`/users/${userId}/salaries/current`, { token })
    .then(dadosResposta)
    .catch((err) => {
      if (err.status === 404) return null;
      throw err;
    });

// Define o salário seguinte (um effectiveFrom futuro agenda um aumento). Nunca na própria conta.
export const criarSalario = (userId, dados, token) =>
  apiRequest(`/users/${userId}/salaries`, { method: "POST", token, body: dados }).then(dadosResposta);

// Só o mais recente se pode apagar; o anterior volta a ficar em vigor.
export const apagarSalario = (userId, salaryId, token) =>
  apiRequest(`/users/${userId}/salaries/${salaryId}`, { method: "DELETE", token });
