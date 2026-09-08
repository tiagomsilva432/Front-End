import { useState } from "react";

function PagLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const Login = async (e) => {
    e.preventDefault();
    setErro("");

    if (!email || !senha) {
      setErro("Por favor, preencha o e-mail e a senha.");
      return;
    }

    try {
      setCarregando(true);

      const resposta = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: senha, // O back-end aguarda a propriedade 'password'
        }),
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        // Captura as mensagens de erro enviadas pelo HttpError ou HttpResponse do Express
        throw new Error(resultado.message || "Erro ao efetuar login.");
      }

      // Extrai token e user do wrapper HttpResponse
      const { token, user } = resultado.data;

      // Armazena o Token JWT para futuras requisições autenticadas
      localStorage.setItem("token", token);

      // Envia os dados do utilizador para o App.jsx
      onLogin(user);
    } catch (err) {
      setErro(err.message || "Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center font-sans p-4 relative ${
        isDark ? "bg-slate-950" : "bg-slate-100"
      }`}
    >
      <button
        type="button"
        onClick={() => setIsDark(!isDark)}
        className="absolute top-6 right-6 px-4 py-2 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all"
      >
        {isDark ? "☀️ Modo Claro" : "🌙 Modo Escuro"}
      </button>

      <div
        className={`backdrop-blur-xl border p-8 rounded-3xl shadow-2xl w-full max-w-md ${
          isDark
            ? "bg-white/10 border-white/20 text-white"
            : "bg-white/80 border-gray-200 text-gray-800"
        }`}
      >
        <h1 className="font-bold text-xl mb-4 text-center">Acesse sua conta</h1>

        {erro && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">
            {erro}
          </div>
        )}

        <form onSubmit={Login} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-xl text-sm bg-black/20 text-white focus:outline-none"
              placeholder="exemplo@email.com"
              disabled={carregando}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase mb-1">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full p-3 border rounded-xl text-sm bg-black/20 text-white focus:outline-none"
              placeholder="*********"
              disabled={carregando}
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 text-sm disabled:opacity-50"
          >
            {carregando ? "A carregar..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PagLogin;
