import { useState } from "react";
import AdmHome from "../pages/PagAdm";
import AdmCompHome from "../pages/PagCompAdm";
import FuncHome from "../pages/PagTrab";
import { authService } from "../services/authService";
import PagLogin from "../pages/PagLogin";
import PagAtivacao from "../pages/PagAtivacao";

export default function AppRoutes() {
  // 1. O Hook fica no topo absoluto (respeita a regra do React e evita erros do ESLint)
  const [usuario, setUsuario] = useState(() => {
    try {
      return authService?.obterSessao ? authService.obterSessao() : null;
    } catch (error) {
      console.error("Erro ao obter sessão:", error);
      return null;
    }
  });

  // 2. Interceção prioritária da rota de ativação via e-mail
  if (window.location.pathname === "/ativar-conta") {
    return <PagAtivacao />;
  }

  const handleLogin = (dadosUsuario) => {
    localStorage.setItem("usuario_sessao", JSON.stringify(dadosUsuario));
    setUsuario(dadosUsuario);
  };

  const handleLogout = () => {
    authService.logout();
    setUsuario(null);
  };

  // 3. Se não houver sessão, apresenta o ecrã de login
  if (!usuario) {
    return <PagLogin onLogin={handleLogin} />;
  }

  // 4. Redirecionamento por cargo (Multi-tenant)
  switch (usuario.role) {
    case "system_admin":
      return <AdmHome Usuario={usuario} onLogout={handleLogout} />;

    case "company_admin":
      return <AdmCompHome Usuario={usuario} onLogout={handleLogout} />;

    case "employee":
      return <FuncHome Usuario={usuario} onLogout={handleLogout} />;

    default:
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
          <div className="bg-white/10 border border-white/20 p-6 rounded-2xl max-w-md text-center space-y-3">
            <p className="text-amber-400 font-bold">
              Cargo desconhecido: {usuario.role}
            </p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-semibold text-white"
            >
              Voltar ao Login
            </button>
          </div>
        </div>
      );
  }
}
