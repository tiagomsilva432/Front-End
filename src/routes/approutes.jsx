import { useState } from "react";
import AdmHome from "../pages/PagAdm";
import TeamLHome from "../pages/PagTeamLeader";
import FuncHome from "../pages/PagTrab";
import { authService } from "../services/authService";
import PagLogin from "../pages/PagLogin";

export default function AppRoutes() {
  // Lê a sessão diretamente na inicialização do estado (sem causar re-render extra)
  const [usuario, setUsuario] = useState(() => authService.obterSessao());

  const handleLogin = (dadosUsuario) => {
    setUsuario(dadosUsuario);
  };

  const handleLogout = () => {
    authService.logout();
    setUsuario(null);
  };

  if (!usuario) {
    return <PagLogin onLogin={handleLogin} />;
  }

  switch (usuario.role) {
    case "admin":
      return <AdmHome Usuario={usuario} onLogout={handleLogout} />;

    case "TEAM-LEADER":
      return <TeamLHome Usuario={usuario} onLogout={handleLogout} />;

    case "FUNCIONARIO":
      return <FuncHome Usuario={usuario} onLogout={handleLogout} />;

    default:
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
          <div className="bg-white/10 border border-white/20 p-6 rounded-2xl max-w-md text-center space-y-3">
            <p className="text-amber-400 font-bold">
              Cargo desconhecido: {usuario.cargo}
            </p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-semibold"
            >
              Voltar ao Login
            </button>
          </div>
        </div>
      );
  }
}
