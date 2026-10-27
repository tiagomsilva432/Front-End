import { useEffect, useState } from "react";
import AdmHome from "../pages/PagAdm";
import AdmCompHome from "../pages/PagCompAdm";
import FuncHome from "../pages/PagTrab";
import { authService } from "../services/authservice";
import PagLogin from "../pages/PagLogin";
import PagAtivacao from "../pages/PagAtivacao";
import PagRedefinirSenha from "../pages/PagRedefinirSenha";
import PagInicio from "../pages/PagInicio";
import { useTheme } from "../theme/tema";
import NotificacoesProvider from "../notificacoes/NotificacoesProvider";

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

  // Se havia uma sessão guardada, confirma no servidor (GET /auth/me) antes de mostrar o painel:
  // a conta pode ter sido suspensa ou o token pode ter expirado desde o último acesso.
  const [sessaoValidada, setSessaoValidada] = useState(() => !usuario);
  // Sem sessão: "/" mostra a página pública e "/entrar" o login.
  const [caminho, setCaminho] = useState(() => window.location.pathname);

  useEffect(() => {
    const aoNavegar = () => setCaminho(window.location.pathname);
    window.addEventListener("popstate", aoNavegar);
    return () => window.removeEventListener("popstate", aoNavegar);
  }, []);

  const irPara = (destino) => {
    if (window.location.pathname !== destino) window.history.pushState(null, "", destino);
    setCaminho(destino);
  };
  const tema = useTheme();

  useEffect(() => {
    if (sessaoValidada) return;
    let ativo = true;
    authService
      .validarSessao()
      .then((dadosServidor) => {
        if (!ativo) return;
        setUsuario((atual) => {
          const atualizado = { ...atual, ...dadosServidor };
          localStorage.setItem("usuario_sessao", JSON.stringify(atualizado));
          return atualizado;
        });
      })
      .catch((err) => {
        if (!ativo) return;
        // 401/403: sessão inválida ou conta inativa. Sem resposta do servidor, mantém-se a sessão.
        if (err.status === 401 || err.status === 403) {
          authService.logout();
          setUsuario(null);
        }
      })
      .finally(() => {
        if (ativo) setSessaoValidada(true);
      });
    return () => {
      ativo = false;
    };
  }, [sessaoValidada]);

  // 2. Interceção prioritária da rota de ativação via e-mail
  if (
    window.location.pathname === "/ativar-conta" ||
    window.location.pathname === "/auth/account/activate"
  ) {
    return <PagAtivacao />;
  }

  // Recuperação de senha: sem token pede o e-mail; com ?token= (link do e-mail) pede a nova senha.
  // "/auth/password/reset" fica só para os links antigos que já tenham sido enviados.
  if (
    window.location.pathname === "/redefinir-senha" ||
    window.location.pathname === "/auth/password/reset"
  ) {
    return <PagRedefinirSenha />;
  }

  // O authService.login já guarda o token e a sessão no localStorage.
  const handleLogin = (dadosUsuario) => {
    // Os painéis vivem em "/": o /entrar deixa de fazer sentido depois do login.
    window.history.replaceState(null, "", "/");
    setCaminho("/");
    setUsuario(dadosUsuario);
  };

  const handleLogout = () => {
    authService.logout();
    window.history.replaceState(null, "", "/entrar");
    setCaminho("/entrar");
    setUsuario(null);
  };

  // 3. Se não houver sessão, apresenta o ecrã de login
  if (usuario && !sessaoValidada) {
    return (
      <div className={`flex min-h-screen items-center justify-center text-sm ${tema.page}`}>
        A validar a sessão…
      </div>
    );
  }

  if (!usuario) {
    return caminho === "/entrar" ? <PagLogin onLogin={handleLogin} /> : <PagInicio onEntrar={() => irPara("/entrar")} />;
  }

  // 4. Redirecionamento por cargo (Multi-tenant). O NotificacoesProvider mantém o sino e o stream em tempo real.
  const painel = (Painel) => (
    <NotificacoesProvider token={authService.obterToken()} onSessaoTerminada={handleLogout}>
      <Painel Usuario={usuario} onLogout={handleLogout} />
    </NotificacoesProvider>
  );

  switch (usuario.role) {
    case "system_admin":
      return painel(AdmHome);

    case "company_admin":
      return painel(AdmCompHome);

    case "employee":
      return painel(FuncHome);

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
