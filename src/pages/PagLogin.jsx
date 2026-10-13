import { useState } from "react";
import logo from "../assets/logo.png";

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

  const tema = {
    fundo: isDark
      ? "bg-slate-950 text-white"
      : "bg-slate-100 text-slate-900",
    card: isDark
      ? "bg-slate-900/90 border-slate-800 shadow-black/30"
      : "bg-white border-slate-200 shadow-slate-300/60",
    textoSecundario: isDark ? "text-slate-400" : "text-slate-500",
    label: isDark ? "text-slate-300" : "text-slate-700",
    campo: isDark
      ? "bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-blue-400 focus:ring-blue-400/20"
      : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-blue-600/15",
    alternar: isDark
      ? "bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800"
      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm",
    erro: isDark
      ? "bg-red-500/10 border-red-500/30 text-red-300"
      : "bg-red-50 border-red-200 text-red-700",
  };

  return (
    <main
      className={`relative flex min-h-screen items-center justify-center overflow-hidden p-5 font-sans transition-colors duration-300 ${tema.fundo}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${
          isDark
            ? "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/50 via-slate-950 to-slate-950"
            : "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-slate-100 to-slate-100"
        }`}
      />

      <div className="absolute left-5 top-5 z-10 flex items-center gap-3 sm:left-8 sm:top-8">
        <img
          src={logo}
          alt="Grupo Os Silvas"
          className={`h-11 w-11 rounded-full object-cover ring-2 ${
            isDark ? "ring-white/15" : "ring-white shadow-sm"
          }`}
        />
        <span
          className={`text-sm font-semibold tracking-wide ${
            isDark ? "text-slate-200" : "text-slate-700"
          }`}
        >
          Grupo Os Silvas
        </span>
      </div>

      <button
        type="button"
        onClick={() => setIsDark((modoAtual) => !modoAtual)}
        aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
        className={`absolute right-5 top-5 z-10 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-colors sm:right-8 sm:top-8 ${tema.alternar}`}
      >
        {isDark ? "☀️ Modo claro" : "🌙 Modo escuro"}
      </button>

      <section
        className={`relative z-0 mt-12 w-full max-w-md rounded-3xl border p-7 shadow-2xl transition-colors duration-300 sm:p-9 ${tema.card}`}
      >
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl text-white shadow-lg shadow-blue-600/20">
            ↗
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Bem-vindo</h1>
          <p className={`mt-2 text-sm ${tema.textoSecundario}`}>
            Entre na sua conta para continuar.
          </p>
        </div>

        {erro && (
          <div
            role="alert"
            className={`mb-5 rounded-xl border p-3.5 text-sm ${tema.erro}`}
          >
            {erro}
          </div>
        )}

        <form onSubmit={Login} className="space-y-5">
          <div>
            <label
              htmlFor="login-email"
              className={`mb-2 block text-sm font-medium ${tema.label}`}
            >
              E-mail
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-4 disabled:opacity-60 ${tema.campo}`}
              placeholder="nome@empresa.pt"
              disabled={carregando}
            />
          </div>

          <div>
            <label
              htmlFor="login-senha"
              className={`mb-2 block text-sm font-medium ${tema.label}`}
            >
              Senha
            </label>
            <input
              id="login-senha"
              type="password"
              autoComplete="current-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-4 disabled:opacity-60 ${tema.campo}`}
              placeholder="Digite sua senha"
              disabled={carregando}
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {carregando ? "A entrar..." : "Entrar na conta"}
          </button>
        </form>

        <p className={`mt-6 text-center text-xs ${tema.textoSecundario}`}>
          Acesso reservado a utilizadores convidados pela empresa.
        </p>
      </section>
    </main>
  );
}

export default PagLogin;
