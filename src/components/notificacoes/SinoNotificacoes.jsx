import { useEffect, useRef, useState } from "react";
import { useNotificacoes } from "../../notificacoes/notificacoes";
import { useTheme } from "../../theme/tema";
import { tempoRelativo } from "../../utils/formatar";
import Icone from "../ui/Icone";

// Sino com o contador de por ler e o painel das notificações pessoais.
// `alinhamento` escolhe para que lado o painel abre (a barra lateral está à esquerda; o cabeçalho móvel, à direita).
// `onAbrir(notificacao)` é chamado ao clicar numa notificação, depois de a marcar como lida.
export default function SinoNotificacoes({ alinhamento = "direita", className = "", onAbrir }) {
  const tema = useTheme();
  const { porLer, notificacoes, temMais, carregando, carregada, ligado, carregarMais, marcarLida, marcarTodas } =
    useNotificacoes();
  const [aberto, setAberto] = useState(false);
  const [posicao, setPosicao] = useState(null);
  const raiz = useRef(null);
  const botao = useRef(null);

  // O painel é "fixed" (a barra lateral corta o que sai dela), colado ao botão.
  // Abre para baixo; se não houver espaço por baixo (sino no fundo da barra lateral), abre para cima.
  const abrir = () => {
    if (aberto) {
      setAberto(false);
      return;
    }
    const r = botao.current.getBoundingClientRect();
    const largura = Math.min(352, window.innerWidth - 32);
    const esquerda =
      alinhamento === "esquerda" ? Math.min(r.left, window.innerWidth - largura - 16) : Math.max(16, r.right - largura);
    const vertical =
      window.innerHeight - r.bottom >= 420 ? { top: r.bottom + 8 } : { bottom: window.innerHeight - r.top + 8 };
    setPosicao({ ...vertical, left: esquerda, width: largura });
    setAberto(true);
  };

  // Fecha ao clicar fora ou com Escape.
  useEffect(() => {
    if (!aberto) return;
    const fora = (e) => {
      if (raiz.current && !raiz.current.contains(e.target)) setAberto(false);
    };
    const tecla = (e) => {
      if (e.key === "Escape") setAberto(false);
    };
    document.addEventListener("mousedown", fora);
    window.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fora);
      window.removeEventListener("keydown", tecla);
    };
  }, [aberto]);

  const rotulo = porLer ? `Notificações (${porLer} por ler)` : "Notificações";

  return (
    <div ref={raiz} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={rotulo}
        title={rotulo}
        aria-expanded={aberto}
        aria-haspopup="dialog"
        ref={botao}
        onClick={abrir}
        className={`relative rounded-xl border px-3 py-2.5 ${tema.secondaryBtn}`}
      >
        <Icone nome="sino" className="h-4 w-4" />
        {porLer > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {porLer > 99 ? "99+" : porLer}
          </span>
        )}
      </button>

      {aberto && posicao && (
        <div
          role="dialog"
          aria-label="Notificações"
          style={posicao}
          className={`fixed z-50 overflow-hidden rounded-2xl border shadow-2xl ${tema.card} ${tema.text}`}
        >
          <div className={`flex items-center justify-between gap-2 border-b px-4 py-3 ${tema.border}`}>
            <div>
              <p className="text-sm font-semibold">Notificações</p>
              <p className={`flex items-center gap-1.5 text-[11px] ${tema.muted}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${ligado ? "bg-emerald-500" : "bg-slate-400"}`} aria-hidden="true" />
                {ligado ? "Em tempo real" : "A ligar…"}
              </p>
            </div>
            {porLer > 0 && (
              <button type="button" onClick={marcarTodas} className={`text-xs font-semibold hover:underline ${tema.accent}`}>
                Marcar todas como lidas
              </button>
            )}
          </div>

          <ul className={`max-h-96 divide-y overflow-y-auto ${tema.border}`}>
            {!carregada && carregando ? (
              <li className={`px-4 py-8 text-center text-xs ${tema.muted}`}>A carregar…</li>
            ) : notificacoes.length === 0 ? (
              <li className={`px-4 py-8 text-center text-xs ${tema.muted}`}>Não tem notificações.</li>
            ) : (
              notificacoes.map((n) => (
                <li key={n.id} className={tema.border}>
                  <button
                    type="button"
                    onClick={() => {
                      marcarLida(n.id);
                      if (onAbrir?.(n)) setAberto(false);
                    }}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${tema.hover} ${
                      n.readAt ? "" : tema.cardMuted
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.readAt ? "bg-transparent" : "bg-emerald-500"}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm ${n.readAt ? tema.muted : "font-medium"}`}>{n.message}</span>
                      <span className={`mt-0.5 block text-[11px] ${tema.muted}`}>
                        {tempoRelativo(n.createdAt)}
                        {!n.readAt && <span className="sr-only"> · por ler</span>}
                      </span>
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>

          {temMais && (
            <div className={`border-t p-2 ${tema.border}`}>
              <button
                type="button"
                disabled={carregando}
                onClick={carregarMais}
                className={`w-full rounded-lg py-2 text-xs font-semibold disabled:opacity-50 ${tema.hover} ${tema.accent}`}
              >
                {carregando ? "A carregar…" : "Ver mais antigas"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
