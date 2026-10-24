// Regras de senha iguais às do Back-End (passwordSchema): 8+ caracteres, maiúscula, minúscula, número e símbolo.
export const REGRAS_SENHA = "Mínimo de 8 caracteres, com maiúscula, minúscula, número e símbolo.";
export const ERRO_SENHA_FRACA =
  "Use pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e um símbolo (@$!%*?&#).";

export function senhaValida(senha) {
  return (
    senha.length >= 8 &&
    /[a-z]/.test(senha) &&
    /[A-Z]/.test(senha) &&
    /[0-9]/.test(senha) &&
    /[@$!%*?&#]/.test(senha)
  );
}
