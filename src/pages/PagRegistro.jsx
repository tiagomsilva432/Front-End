import { useState } from "react";

function PagRegistro({ onRegistroSucesso }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cargo, setCargo] = useState("WORKER");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const Registro = (e) => {
    e.preventDefault();
    setErro("");
    setSucesso(false);

    if (!nome || !email || !senha || !confirmarSenha) {
      setErro("Por favor, preencha todos os campos.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem!");
      return;
    }

    const novoUsuario = {
      id: Date.now(),
      nome,
      email,
      cargo,
      senha,
      criadoEm: new Date().toLocaleDateString("pt-PT"),
    };

    console.log("Novo Colaborador Registrado pelo Admin:", novoUsuario);

    if (onRegistroSucesso) {
      onRegistroSucesso(novoUsuario);
    }

    setSucesso(true);
    setNome("");
    setEmail("");
    setSenha("");
    setConfirmarSenha("");
    setCargo("WORKER");
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center font-sans overflow-hidden p-4 relative transition-colors duration-300 ${
        isDark ? "bg-slate-950" : "bg-slate-100"
      }`}
    >
      <div
        className={`absolute w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none transition-colors duration-300 ${
          isDark ? "bg-blue-600/10" : "bg-blue-400/20"
        }`}
      ></div>

      <img
        className={`absolute top-6 left-6 w-14 h-14 object-cover rounded-full shadow-md border transition-colors duration-300 ${
          isDark ? "border-white/20" : "border-gray-200"
        }`}
        src="/src/assets/logo.png"
        alt="Logo Grupo Os Silvas"
      />

      <button
        type="button"
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
        className={`backdrop-blur-xl border p-8 rounded-3xl shadow-2xl w-full max-w-md relative z-10 transition-colors duration-300 my-8 ${
          isDark
            ? "bg-white/10 border-white/20 text-white"
            : "bg-white/80 border-gray-200 text-gray-800"
        }`}
      >
        <div className="text-center mb-6">
          <h1
            className={`font-bold text-xl mb-1 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Cadastrar Colaborador
          </h1>
          <p
            className={`text-sm ${isDark ? "text-gray-300" : "text-gray-500"}`}
          >
            Gestão de Acessos • Grupo Os Silvas
          </p>
        </div>

        {erro && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-medium">
            {erro}
          </div>
        )}

        {sucesso && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-medium space-y-1">
            <p className="font-bold text-sm">✅ Colaborador cadastrado!</p>
            <p className="text-emerald-300/80">
              As credenciais de acesso já podem ser enviadas ao colaborador.
            </p>
          </div>
        )}

        <form onSubmit={Registro} className="space-y-4">
          <div>
            <label
              className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Nome do Colaborador
            </label>
            <input
              type="text"
              placeholder="Ex: João Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={`w-full p-3 border rounded-xl text-sm focus:outline-none transition-all ${
                isDark
                  ? "bg-black/20 border-white/20 text-white placeholder-gray-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              }`}
            />
          </div>

          <div>
            <label
              className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              E-mail Corporal / Pessoal
            </label>
            <input
              type="email"
              placeholder="colaborador@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 border rounded-xl text-sm focus:outline-none transition-all ${
                isDark
                  ? "bg-black/20 border-white/20 text-white placeholder-gray-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              }`}
            />
          </div>

          <div>
            <label
              className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Cargo / Nível de Acesso
            </label>
            <select
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              className={`w-full p-3 border rounded-xl text-sm focus:outline-none transition-all ${
                isDark
                  ? "bg-slate-900 border-white/20 text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              }`}
            >
              <option value="WORKER">Trabalhador / Funcionário</option>
              <option value="TEAM_LEADER">Líder de Equipa (Team Leader)</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <div>
            <label
              className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Definir Senha Inicial
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

          <div>
            <label
              className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Confirmar Senha
            </label>
            <input
              type="password"
              placeholder="*********"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className={`w-full p-3 border rounded-xl text-sm focus:outline-none transition-all ${
                isDark
                  ? "bg-black/20 border-white/20 text-white placeholder-gray-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              }`}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 text-sm mt-2"
          >
            Criar Acesso e Guardar
          </button>
        </form>
      </div>
    </div>
  );
}

export default PagRegistro;
