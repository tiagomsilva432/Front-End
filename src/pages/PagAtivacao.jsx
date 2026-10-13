import { useState } from "react";
import { authService } from "../services/authService";
import logo from "../assets/logo.png";

export default function PagAtivacao({ onConcluido }) {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleAtivacao = async (e) => {
    e.preventDefault();
    setErro("");

    if (!token) {
      setErro("Token de ativação inválido ou ausente no link.");
      return;
    }

    if (
      senha.length < 8 ||
      !/[a-z]/.test(senha) ||
      !/[A-Z]/.test(senha) ||
      !/[0-9]/.test(senha) ||
      !/[@$!%*?&#]/.test(senha)
    ) {
      setErro("Use pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e um símbolo (@$!%*?&#).");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem!");
      return;
    }

    try {
      setCarregando(true);
      await authService.ativarConta({ token, password: senha });
      setSucesso(true);
    } catch (err) {
      setErro(err.message || "Não foi possível ativar a conta.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-y-auto bg-slate-100 p-4 text-slate-800">
      {/* Logótipo redondo no canto superior esquerdo */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <img
          src={logo}
          alt="Grupo Os Silvas"
          className="h-12 w-12 rounded-full object-cover border border-gray-200 shadow-sm"
        />
      </div>

      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <div>
          <h1 className="text-2xl font-bold text-center text-gray-900">
            Ativar Conta
          </h1>
          <p className="text-xs text-center text-gray-500 mt-1">
            Defina a sua senha para concluir o acesso ao sistema
          </p>
        </div>

        {erro && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium">
            {erro}
          </div>
        )}

        {sucesso ? (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-medium">
              ✅ Conta ativada com sucesso! A sua senha foi definida.
            </div>
            <button
              onClick={() => {
                if (onConcluido) {
                  onConcluido();
                } else {
                  window.location.href = "/login";
                }
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              Ir para o Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleAtivacao} className="space-y-4">
            {/* Campo Nova Senha */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  disabled={carregando}
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Crie uma senha segura"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full p-3 pr-10 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                />
                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Mínimo de 8 caracteres, com maiúscula, minúscula, número e símbolo.
                </p>
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  title={mostrarSenha ? "Ocultar senha" : "Ver senha"}
                >
                  {mostrarSenha ? (
                    /* Ícone de Olho Riscado (Ocultar) */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    /* Ícone de Olho Normal (Ver) */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Campo Confirmar Nova Senha */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <input
                  type={mostrarConfirmarSenha ? "text" : "password"}
                  disabled={carregando}
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Repita a senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full p-3 pr-10 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() =>
                    setMostrarConfirmarSenha(!mostrarConfirmarSenha)
                  }
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  title={mostrarConfirmarSenha ? "Ocultar senha" : "Ver senha"}
                >
                  {mostrarConfirmarSenha ? (
                    /* Ícone de Olho Riscado (Ocultar) */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    /* Ícone de Olho Normal (Ver) */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
            >
              {carregando ? "A ativar..." : "Concluir Ativação"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
