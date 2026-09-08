import { useState } from "react";

export default function PagRegistro({ onRegistroSucesso, isDark }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cargo, setCargo] = useState("FUNCIONARIO");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

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

    if (onRegistroSucesso) {
      onRegistroSucesso(novoUsuario);
    }

    setSucesso(true);
    setNome("");
    setEmail("");
    setSenha("");
    setConfirmarSenha("");
    setCargo("FUNCIONARIO");
  };

  return (
    <div
      className={`p-8 rounded-3xl shadow-xl w-full max-w-2xl border transition-colors duration-300 ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-gray-800"}`}
    >
      <div className="mb-6">
        <h1 className="font-bold text-xl mb-1">Cadastrar Colaborador</h1>
        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Gestão de Acessos • Grupo Os Silvas
        </p>
      </div>

      {erro && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
          {erro}
        </div>
      )}

      {sucesso && (
        <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium space-y-1">
          <p className="font-bold text-sm">✅ Colaborador cadastrado!</p>
          <p className="text-emerald-300/80">
            As credenciais de acesso já podem ser enviadas ao colaborador.
          </p>
        </div>
      )}

      <form onSubmit={Registro} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label
              className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              Nome do Colaborador
            </label>
            <input
              type="text"
              placeholder="Ex: João Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={`w-full p-3 border rounded-xl text-sm focus:outline-none transition-all ${isDark ? "bg-black/20 border-white/10 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"}`}
            />
          </div>

          <div>
            <label
              className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              E-mail Corporal
            </label>
            <input
              type="email"
              placeholder="colaborador@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 border rounded-xl text-sm focus:outline-none transition-all ${isDark ? "bg-black/20 border-white/10 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"}`}
            />
          </div>
        </div>

        <div>
          <label
            className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Cargo / Nível de Acesso
          </label>
          <select
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            className={`w-full p-3 border rounded-xl text-sm focus:outline-none transition-all ${isDark ? "bg-slate-900 border-white/10 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" : "bg-gray-50 border-gray-300 text-gray-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"}`}
          >
            <option value="FUNCIONARIO">Trabalhador / Funcionário</option>
            <option value="TEAM-LEADER">Líder de Equipa (Team Leader)</option>
            <option value="ADM">Administrador</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label
              className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              Definir Senha Inicial
            </label>
            <input
              type="password"
              placeholder="*********"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={`w-full p-3 border rounded-xl text-sm focus:outline-none transition-all ${isDark ? "bg-black/20 border-white/10 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"}`}
            />
          </div>

          <div>
            <label
              className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              Confirmar Senha
            </label>
            <input
              type="password"
              placeholder="*********"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className={`w-full p-3 border rounded-xl text-sm focus:outline-none transition-all ${isDark ? "bg-black/20 border-white/10 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"}`}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 text-white font-semibold py-3 rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/30 text-sm mt-2"
        >
          Criar Acesso e Guardar
        </button>
      </form>
    </div>
  );
}
