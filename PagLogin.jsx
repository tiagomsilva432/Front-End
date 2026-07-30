import { useState } from "react";

function pagLogin() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [isDark, setIsDark] = useState(true);

  const Login = (e) => {
    e.preventDefault();
    console.log({ usuario, senha });
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center font-sans overflow-hidden p-4 relative transition-colors duration-300 ${isDark ? "bg-slate-950" : "bg-slate-100"}`}
    >
      <div
        className={`absolute w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none transition-colors duration-300 ${isDark ? "bg-blue-600/10" : "bg-blue-400/20"}`}
      ></div>

      <img
        className={`absolute top-6 left-6 w-14 h-14 object-cover rounded-full shadow-md border transition-colors duration-300 ${isDark ? "border-white/20" : "border-gray-200"}`}
        src="/src/assets/logo.png"
        alt="Logo Grupo Os Silvas"
      />

      <button
        onClick={() => setIsDark(!isDark)}
        className={`absolute top-6 right-6 px-4 py-2 rounded-full text-xs font-semibold shadow-md border transition-all flex items-center gap-2 ${
          isDark
            ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
            : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50"
        }`}
      >
        {isDark ? "☀️ Modo Claro" : "🌙 Modo Escuro"}
      </button>

      <div
        className={`backdrop-blur-xl border p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10 transition-colors duration-300 ${
          isDark
            ? "bg-white/10 border-white/20 text-white"
            : "bg-white/80 border-gray-200 text-gray-800"
        }`}
      >
        <div className="text-center mb-6">
          <h1
            className={`font-bold text-xl mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Bem-vindo ao Grupo Os Silvas
          </h1>
          <p
            className={`text-sm ${isDark ? "text-gray-300" : "text-gray-500"}`}
          >
            Acesse sua conta
          </p>
        </div>

        <form onSubmit={Login}>
          <div className="mb-4">
            <label
              className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}
            >
              E-mail
            </label>
            <input
              type="text"
              placeholder="exemplo@email.com"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className={`w-full p-3 border rounded-xl text-sm focus:outline-none transition-all ${
                isDark
                  ? "bg-black/20 border-white/20 text-white placeholder-gray-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              }`}
            />
          </div>

          <div className="mb-6">
            <label
              className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-gray-300" : "text-gray-600"}`}
            >
              Senha
            </label>
            <input
              type="password"
              placeholder="*********"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={`w-full p-3 border rounded-xl text-sm focus:outline-none transition-all ${
                isDark
                  ? "bg-black/20 border-white/20 text-white placeholder-gray-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              }`}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 text-sm"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default pagLogin;
