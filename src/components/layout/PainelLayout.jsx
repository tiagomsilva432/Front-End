import { useState } from "react";
import { useTheme } from "../../theme/tema";
import logo from "../../assets/logo.png";
import Icone from "../ui/Icone";
import BotaoTema from "../ui/BotaoTema";
import ModalAlterarSenha from "../conta/ModalAlterarSenha";
import SinoNotificacoes from "../notificacoes/SinoNotificacoes";
import FaixaAnuncios from "../anuncios/FaixaAnuncios";
import { authService } from "../../services/authservice";

// Estrutura comum dos painéis: barra lateral (desktop), cabeçalho com menu (telemóvel) e conteúdo.
// Também mantém o sino de notificações (com o stream em tempo real) e as faixas de anúncios por ler.
export default function PainelLayout({
  titulo,
  menuItems,
  abaSelecionada,
  onMudarAba,
  email,
  papel,
  onLogout,
  children,
}) {
  const tema = useTheme();
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [alterarSenhaAberto, setAlterarSenhaAberto] = useState(false);
  const itemAtual = menuItems.find((item) => item.id === abaSelecionada) || menuItems[0];
  const token = authService.obterToken();
  const temAbaAnuncios = menuItems.some((item) => item.id === "anuncios");

  const botaoMenu = (item, mobile) => {
    const selecionado = item.id === abaSelecionada;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => {
          onMudarAba(item.id);
          if (mobile) setMenuMobileAberto(false);
        }}
        aria-current={selecionado ? "page" : undefined}
        className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm font-medium transition-colors ${
          selecionado ? tema.active : `border-transparent ${tema.muted} ${tema.hover}`
        }`}
      >
        <Icone nome={item.icone} className="h-5 w-5 shrink-0" />
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <div className={`flex min-h-screen flex-col font-sans transition-colors duration-300 md:flex-row ${tema.page}`}>
      {/* Cabeçalho e menu para telemóveis e tablets */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur md:hidden ${tema.sidebar}`}>
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${tema.iconBox}`}>
              <Icone nome={itemAtual.icone} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{itemAtual.label}</p>
              <p className={`truncate text-xs ${tema.muted}`}>{email}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <SinoNotificacoes />
            <BotaoTema compacto />
            <button
              type="button"
              aria-expanded={menuMobileAberto}
              aria-controls="menu-mobile"
              aria-label={menuMobileAberto ? "Fechar menu" : "Abrir menu"}
              onClick={() => setMenuMobileAberto((aberto) => !aberto)}
              className={`rounded-xl border px-3 py-2.5 ${tema.secondaryBtn}`}
            >
              <Icone nome={menuMobileAberto ? "fechar" : "menu"} className="h-4 w-4" />
            </button>
          </div>
        </div>

        {menuMobileAberto && (
          <nav id="menu-mobile" aria-label="Navegação principal" className={`space-y-1 border-t px-3 py-3 ${tema.border}`}>
            {menuItems.map((item) => botaoMenu(item, true))}
            <button
              type="button"
              onClick={() => {
                setAlterarSenhaAberto(true);
                setMenuMobileAberto(false);
              }}
              className={`mt-2 flex w-full items-center gap-3 rounded-xl border border-transparent px-3.5 py-3 text-left text-sm font-medium ${tema.muted} ${tema.hover}`}
            >
              <Icone nome="chave" className="h-5 w-5" />
              Alterar senha
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="mt-2 flex w-full items-center gap-3 rounded-xl border border-red-500/20 px-3.5 py-3 text-left text-sm font-semibold text-red-500 hover:bg-red-500/10"
            >
              <Icone nome="sair" className="h-5 w-5" />
              Terminar sessão
            </button>
          </nav>
        )}
      </header>

      {/* Barra lateral em ecrãs largos */}
      <aside className={`sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between overflow-y-auto border-r p-4 md:flex ${tema.sidebar}`}>
        <div>
          <div className="mb-8 flex items-center gap-3 px-2 py-2">
            <img src={logo} alt="" className="h-10 w-10 rounded-full object-cover" />
            <div className="min-w-0">
              <p className="truncate font-bold">{titulo}</p>
              <p className={`text-xs ${tema.muted}`}>Grupo Os Silvas</p>
            </div>
          </div>
          <nav aria-label="Navegação principal" className="space-y-1.5">
            {menuItems.map((item) => botaoMenu(item, false))}
          </nav>
        </div>

        <div className={`space-y-3 border-t pt-4 ${tema.border}`}>
          <div className="flex min-w-0 items-center gap-3 px-2">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${tema.iconBox}`}>
              {email?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{email || "Sessão ativa"}</p>
              <p className={`truncate text-xs ${tema.muted}`}>{papel}</p>
            </div>
            <SinoNotificacoes alinhamento="esquerda" className="shrink-0" />
          </div>
          <button
            type="button"
            onClick={() => setAlterarSenhaAberto(true)}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${tema.secondaryBtn}`}
          >
            <Icone nome="chave" className="h-4 w-4" />
            Alterar senha
          </button>
          <div className="flex gap-2">
            <BotaoTema className="flex-1" />
            <button
              type="button"
              onClick={onLogout}
              aria-label="Terminar sessão"
              className="flex items-center gap-1.5 rounded-xl border border-red-500/20 px-3 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-500/10"
            >
              <Icone nome="sair" className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <FaixaAnuncios token={token} onVerTodos={temAbaAnuncios ? () => onMudarAba("anuncios") : undefined} />
          {children}
        </div>
      </main>

      {alterarSenhaAberto && <ModalAlterarSenha onFechar={() => setAlterarSenhaAberto(false)} />}
    </div>
  );
}
