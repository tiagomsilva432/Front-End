import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  contarNotificacoesPorLer,
  listarNotificacoes,
  marcarNotificacaoLida,
  marcarTodasLidas,
  pedirBilheteStream,
  urlStream,
} from "../services/notificationservice";
import { contarMensagensPorLer } from "../services/messageservice";
import { NotificacoesContext } from "./notificacoes";

const ESPERA_RECONEXAO_MS = 3000;
const ESPERA_MAXIMA_MS = 30000;

// Guarda o sino (contador + lista) e mantém o stream em tempo real aberto:
// pede um bilhete de uso único, liga o EventSource e volta a ligar sozinho quando cai.
// `onSessaoTerminada` é chamado quando o servidor fecha o stream por token expirado ou conta inativa.
export default function NotificacoesProvider({ token, onSessaoTerminada, children }) {
  const [porLer, setPorLer] = useState(0);
  const [notificacoes, setNotificacoes] = useState([]);
  const [proxima, setProxima] = useState(null); // nextBefore da última página
  const [carregando, setCarregando] = useState(false);
  const [carregada, setCarregada] = useState(false);
  const [ligado, setLigado] = useState(false);
  const [versaoAnuncios, setVersaoAnuncios] = useState(0);
  // Sobe quando chega uma notificação que muda alocações, projetos ou ausências de quem tem a sessão.
  const [versaoDados, setVersaoDados] = useState(0);
  const sessaoTerminada = useRef(onSessaoTerminada);
  // Mensagens por ler nos chats dos projetos: { total, porProjeto: { [projectId]: n } }.
  const [chatPorLer, setChatPorLer] = useState({ total: 0, porProjeto: {} });
  // Quem quer saber de um evento do stream (project_message, project_task, project_task_comment) regista-se aqui.
  const ouvintes = useRef(new Map());

  const emitir = useCallback((evento, dados) => {
    for (const fn of ouvintes.current.get(evento) || []) fn(dados);
  }, []);

  // ouvir("project_task", fn) -> devolve a função para deixar de ouvir (para usar no cleanup de um useEffect).
  const ouvir = useCallback((evento, fn) => {
    if (!ouvintes.current.has(evento)) ouvintes.current.set(evento, new Set());
    ouvintes.current.get(evento).add(fn);
    return () => ouvintes.current.get(evento)?.delete(fn);
  }, []);

  const atualizarChatPorLer = useCallback(async () => {
    if (!token) return;
    try {
      const r = await contarMensagensPorLer(token);
      setChatPorLer({ total: r?.total ?? 0, porProjeto: Object.fromEntries((r?.projects || []).map((x) => [x.projectId, x.unread])) });
    } catch (err) {
      console.error("Erro ao contar as mensagens por ler:", err);
    }
  }, [token]);

  useEffect(() => {
    sessaoTerminada.current = onSessaoTerminada;
  }, [onSessaoTerminada]);

  const sincronizar = useCallback(async () => {
    if (!token) return;
    setCarregando(true);
    try {
      const [pagina, contagem] = await Promise.all([listarNotificacoes(token), contarNotificacoesPorLer(token)]);
      setNotificacoes(pagina?.items || []);
      setProxima(pagina?.nextBefore || null);
      setPorLer(contagem?.unread ?? 0);
      setCarregada(true);
    } catch (err) {
      console.error("Erro ao carregar as notificações:", err);
    } finally {
      setCarregando(false);
    }
  }, [token]);

  // Primeira carga por REST: o sino funciona mesmo que o stream não consiga ligar.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial a partir do servidor
    sincronizar();
    atualizarChatPorLer();
  }, [sincronizar, atualizarChatPorLer]);

  // Stream em tempo real (Server-Sent Events).
  useEffect(() => {
    if (!token || typeof EventSource === "undefined") return;
    let ativo = true;
    let fonte = null;
    let temporizador = null;
    let espera = ESPERA_RECONEXAO_MS;

    const religar = (ms = espera) => {
      if (!ativo) return;
      clearTimeout(temporizador);
      temporizador = setTimeout(ligar, ms);
      espera = Math.min(espera * 2, ESPERA_MAXIMA_MS);
    };

    async function ligar() {
      if (!ativo) return;
      try {
        const { ticket } = await pedirBilheteStream(token);
        if (!ativo) return;
        fonte = new EventSource(urlStream(ticket));

        fonte.addEventListener("ready", (e) => {
          espera = ESPERA_RECONEXAO_MS;
          setLigado(true);
          try {
            setPorLer(JSON.parse(e.data).unread ?? 0);
          } catch {
            /* sem contagem no evento */
          }
          // Pode ter chegado algo enquanto estava desligado.
          sincronizar();
          atualizarChatPorLer();
          setVersaoAnuncios((n) => n + 1);
        });

        fonte.addEventListener("notification", (e) => {
          const nova = JSON.parse(e.data);
          setNotificacoes((atuais) => [nova, ...atuais.filter((n) => n.id !== nova.id)]);
          if (!nova.readAt) setPorLer((n) => n + 1);
          if (/^(allocation|project|absence)\./.test(nova.type)) setVersaoDados((n) => n + 1);
        });

        fonte.addEventListener("announcement", () => setVersaoAnuncios((n) => n + 1));

        // Chat e quadro dos projetos: não são notificações, só se avisa quem está a ver.
        for (const evento of ["project_message", "project_task", "project_task_comment"]) {
          fonte.addEventListener(evento, (e) => {
            try {
              emitir(evento, JSON.parse(e.data));
            } catch (err) {
              console.error(`Evento ${evento} inválido:`, err);
            }
            if (evento === "project_message") atualizarChatPorLer();
          });
        }

        fonte.addEventListener("close", (e) => {
          fonte.close();
          setLigado(false);
          let motivo = "";
          try {
            motivo = JSON.parse(e.data).reason;
          } catch {
            /* sem motivo */
          }
          if (motivo === "token_expired" || motivo === "account_inactive") {
            ativo = false;
            sessaoTerminada.current?.(motivo);
          } else if (motivo !== "too_many_connections") {
            // server_shutdown e outros: volta a tentar daqui a pouco.
            religar(ESPERA_RECONEXAO_MS);
          }
        });

        // O bilhete só serve uma vez: o auto-reconnect do browser falharia, por isso fecha-se e pede-se outro.
        fonte.onerror = () => {
          fonte.close();
          setLigado(false);
          religar();
        };
      } catch (err) {
        setLigado(false);
        // 401/403 já terminaram a sessão no apiRequest; outros erros (servidor em baixo) tentam de novo.
        if (err?.status !== 401 && err?.status !== 403) religar();
      }
    }

    ligar();
    return () => {
      ativo = false;
      clearTimeout(temporizador);
      fonte?.close();
    };
  }, [token, sincronizar, emitir, atualizarChatPorLer]);

  const carregarMais = useCallback(async () => {
    if (!proxima || carregando) return;
    setCarregando(true);
    try {
      const pagina = await listarNotificacoes(token, { antes: proxima });
      setNotificacoes((atuais) => [...atuais, ...(pagina?.items || []).filter((n) => !atuais.some((a) => a.id === n.id))]);
      setProxima(pagina?.nextBefore || null);
    } catch (err) {
      console.error("Erro ao carregar mais notificações:", err);
    } finally {
      setCarregando(false);
    }
  }, [token, proxima, carregando]);

  const marcarLida = useCallback(
    async (id) => {
      const alvo = notificacoes.find((n) => n.id === id);
      if (!alvo || alvo.readAt) return;
      setNotificacoes((atuais) => atuais.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
      setPorLer((n) => Math.max(0, n - 1));
      try {
        await marcarNotificacaoLida(id, token);
      } catch (err) {
        console.error("Erro ao marcar a notificação como lida:", err);
        sincronizar();
      }
    },
    [notificacoes, token, sincronizar],
  );

  const marcarTodas = useCallback(async () => {
    const agora = new Date().toISOString();
    setNotificacoes((atuais) => atuais.map((n) => (n.readAt ? n : { ...n, readAt: agora })));
    setPorLer(0);
    try {
      await marcarTodasLidas(token);
    } catch (err) {
      console.error("Erro ao marcar todas como lidas:", err);
      sincronizar();
    }
  }, [token, sincronizar]);

  const valor = useMemo(
    () => ({
      porLer,
      notificacoes,
      temMais: Boolean(proxima),
      carregando,
      carregada,
      ligado,
      versaoAnuncios,
      versaoDados,
      sincronizar,
      carregarMais,
      marcarLida,
      marcarTodas,
      anunciosAlterados: () => setVersaoAnuncios((n) => n + 1),
      chatPorLer,
      atualizarChatPorLer,
      ouvir,
    }),
    [porLer, notificacoes, proxima, carregando, carregada, ligado, versaoAnuncios, versaoDados, sincronizar, carregarMais, marcarLida, marcarTodas, chatPorLer, atualizarChatPorLer, ouvir],
  );

  return <NotificacoesContext.Provider value={valor}>{children}</NotificacoesContext.Provider>;
}
