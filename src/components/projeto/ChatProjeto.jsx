import { useCallback, useEffect, useRef, useState } from "react";
import { apagarMensagem, corrigirMensagem, enviarMensagem, listarMensagens, marcarChatLido } from "../../services/messageservice";
import { useNotificacoes } from "../../notificacoes/notificacoes";
import { useTheme } from "../../theme/tema";
import { idDe, nomeCompleto, tempoRelativo } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import Avatar from "../ui/Avatar";

const MAX = 2000;

// Ids uuidv7: ordenar como texto é ordenar no tempo.
const juntar = (atuais, novas) => {
  const porId = new Map(atuais.map((m) => [m.id, m]));
  for (const m of novas) porId.set(m.id, m);
  return [...porId.values()].sort((a, b) => (a.id < b.id ? -1 : 1));
};

// Chat de um projeto (para os membros). As mensagens chegam em tempo real pelo stream (project_message);
// com o chat no ecrã, marca-se como lido. O separador "Mensagens novas" fica onde a pessoa tinha parado.
export default function ChatProjeto({ projectId, token, eu, gere, pessoas }) {
  const tema = useTheme();
  const { ouvir, atualizarChatPorLer } = useNotificacoes();
  const [mensagens, setMensagens] = useState([]); // da mais antiga para a mais recente
  const [proxima, setProxima] = useState(null);
  const [ultimaLida, setUltimaLida] = useState(undefined); // undefined = ainda a carregar
  const [carregando, setCarregando] = useState(true);
  const [aCarregarMais, setACarregarMais] = useState(false);
  const [texto, setTexto] = useState("");
  const [aEnviar, setAEnviar] = useState(false);
  const [emEdicao, setEmEdicao] = useState(null); // { id, texto }
  const [erro, setErro] = useState("");
  const fundo = useRef(null);
  const lista = useRef(null);

  const pessoaPorId = new Map(pessoas.map((p) => [idDe(p), p]));
  const nomeDe = (id) => (id === eu?.id ? "Eu" : nomeCompleto(pessoaPorId.get(id)) || pessoaPorId.get(id)?.email || "Membro");

  const marcarLido = useCallback(async () => {
    try {
      await marcarChatLido(projectId, token);
      atualizarChatPorLer();
    } catch (err) {
      console.error("Erro ao marcar o chat como lido:", err);
    }
  }, [projectId, token, atualizarChatPorLer]);

  const descer = () => requestAnimationFrame(() => fundo.current?.scrollIntoView({ block: "end" }));

  useEffect(() => {
    let ativo = true;
    listarMensagens(projectId, token)
      .then((pagina) => {
        if (!ativo) return;
        setMensagens(juntar([], pagina?.items || []));
        setProxima(pagina?.nextBefore || null);
        setUltimaLida(pagina?.lastReadMessageId ?? null);
        descer();
        marcarLido();
      })
      .catch((err) => ativo && setErro(err.message || "Não foi possível abrir o chat."))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [projectId, token, marcarLido]);

  // Tempo real: criar, corrigir e apagar, de qualquer membro (e das outras abas da própria pessoa).
  useEffect(
    () =>
      ouvir("project_message", (evento) => {
        if (evento.action === "deleted") {
          if (evento.projectId !== projectId) return;
          setMensagens((atuais) => atuais.filter((m) => m.id !== evento.id));
          return;
        }
        if (evento.message?.projectId !== projectId) return;
        const perto = lista.current && lista.current.scrollHeight - lista.current.scrollTop - lista.current.clientHeight < 120;
        setMensagens((atuais) => juntar(atuais, [evento.message]));
        if (evento.action === "created") {
          if (perto || evento.message.authorId === eu?.id) descer();
          if (evento.message.authorId !== eu?.id) marcarLido();
        }
      }),
    [ouvir, projectId, eu?.id, marcarLido],
  );

  const carregarMais = async () => {
    if (!proxima) return;
    setACarregarMais(true);
    const alturaAntes = lista.current?.scrollHeight || 0;
    try {
      const pagina = await listarMensagens(projectId, token, { antes: proxima });
      setMensagens((atuais) => juntar(atuais, pagina?.items || []));
      setProxima(pagina?.nextBefore || null);
      // Mantém a vista no mesmo sítio depois de acrescentar por cima.
      requestAnimationFrame(() => {
        if (lista.current) lista.current.scrollTop += lista.current.scrollHeight - alturaAntes;
      });
    } catch (err) {
      setErro(err.message || "Não foi possível carregar as mensagens antigas.");
    } finally {
      setACarregarMais(false);
    }
  };

  const enviar = async (e) => {
    e?.preventDefault();
    const corpo = texto.trim();
    if (!corpo) return;
    setAEnviar(true);
    setErro("");
    try {
      const nova = await enviarMensagem(projectId, corpo, token);
      setMensagens((atuais) => juntar(atuais, [nova]));
      setUltimaLida(nova.id);
      setTexto("");
      descer();
    } catch (err) {
      setErro(err.message || "Não foi possível enviar a mensagem.");
    } finally {
      setAEnviar(false);
    }
  };

  const guardarEdicao = async () => {
    const corpo = emEdicao.texto.trim();
    if (!corpo) return;
    try {
      const nova = await corrigirMensagem(projectId, emEdicao.id, corpo, token);
      setMensagens((atuais) => juntar(atuais, [nova]));
      setEmEdicao(null);
    } catch (err) {
      setErro(err.message || "Não foi possível corrigir a mensagem.");
    }
  };

  const apagar = async (m) => {
    try {
      await apagarMensagem(projectId, m.id, token);
      setMensagens((atuais) => atuais.filter((x) => x.id !== m.id));
    } catch (err) {
      setErro(err.message || "Não foi possível apagar a mensagem.");
    }
  };

  // Onde começa o que estava por ler (só mensagens dos outros contam).
  const primeiraNova = ultimaLida === undefined ? null : mensagens.find((m) => m.authorId !== eu?.id && (ultimaLida === null || m.id > ultimaLida));

  return (
    <section className={`flex h-[min(70vh,640px)] flex-col overflow-hidden rounded-2xl border ${tema.card}`}>
      <div ref={lista} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite" aria-label="Mensagens do projeto">
        {proxima && (
          <div className="text-center">
            <button
              type="button"
              disabled={aCarregarMais}
              onClick={carregarMais}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${tema.secondaryBtn}`}
            >
              {aCarregarMais ? "A carregar…" : "Carregar mensagens mais antigas"}
            </button>
          </div>
        )}
        {carregando ? (
          <p className={`py-10 text-center text-sm ${tema.muted}`}>A abrir o chat…</p>
        ) : mensagens.length === 0 ? (
          <p className={`py-10 text-center text-sm ${tema.muted}`}>Ainda não há mensagens. Diga olá à equipa.</p>
        ) : (
          mensagens.map((m) => {
            const minha = m.authorId === eu?.id;
            const pessoa = pessoaPorId.get(m.authorId);
            return (
              <div key={m.id}>
                {primeiraNova?.id === m.id && (
                  <div className="my-2 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-red-500" role="separator">
                    <span className="h-px flex-1 bg-red-500/40" />
                    Mensagens novas
                    <span className="h-px flex-1 bg-red-500/40" />
                  </div>
                )}
                <div className={`group flex items-end gap-2 ${minha ? "flex-row-reverse" : ""}`}>
                  {!minha && <Avatar url={pessoa?.profile?.avatarUrl} nome={pessoa?.profile?.firstName || pessoa?.email} tamanho="sm" />}
                  <div className={`max-w-[80%] ${minha ? "items-end text-right" : ""} flex flex-col`}>
                    <p className={`mb-0.5 text-[11px] ${tema.muted}`}>
                      {nomeDe(m.authorId)} · {tempoRelativo(m.createdAt)}
                      {m.editedAt && " · editada"}
                    </p>
                    {emEdicao?.id === m.id ? (
                      <div className="w-72 max-w-full space-y-1.5">
                        <textarea
                          value={emEdicao.texto}
                          maxLength={MAX}
                          rows={3}
                          onChange={(e) => setEmEdicao((x) => ({ ...x, texto: e.target.value }))}
                          className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${tema.input}`}
                        />
                        <div className="flex justify-end gap-2 text-xs font-semibold">
                          <button type="button" onClick={() => setEmEdicao(null)} className={tema.muted}>
                            Cancelar
                          </button>
                          <button type="button" onClick={guardarEdicao} className={tema.accent}>
                            Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p
                        className={`whitespace-pre-line break-words rounded-2xl px-3.5 py-2 text-left text-sm ${
                          minha ? (tema.isDark ? "bg-emerald-600 text-white" : "bg-emerald-600 text-white") : tema.isDark ? "bg-slate-800" : "bg-slate-100"
                        }`}
                      >
                        {m.body}
                      </p>
                    )}
                    {emEdicao?.id !== m.id && (minha || gere) && (
                      <span className="mt-0.5 flex gap-3 text-[11px] font-semibold opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
                        {minha && (
                          <button type="button" onClick={() => setEmEdicao({ id: m.id, texto: m.body })} className={tema.muted}>
                            Corrigir
                          </button>
                        )}
                        <button type="button" onClick={() => apagar(m)} className="text-red-500">
                          Apagar
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={fundo} />
      </div>

      {erro && <Alerta className="mx-4 mb-2">{erro}</Alerta>}

      <form onSubmit={enviar} className={`flex items-end gap-2 border-t p-3 ${tema.border}`}>
        <label htmlFor="chat-mensagem" className="sr-only">
          Escrever mensagem
        </label>
        <textarea
          id="chat-mensagem"
          rows={1}
          maxLength={MAX}
          value={texto}
          placeholder="Escreva uma mensagem…  (Enter envia, Shift+Enter muda de linha)"
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              enviar();
            }
          }}
          disabled={aEnviar}
          className={`max-h-32 min-h-10 flex-1 resize-y rounded-xl border px-3.5 py-2.5 text-sm outline-none focus:ring-4 ${tema.input}`}
        />
        <button type="submit" disabled={aEnviar || !texto.trim()} className={`rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50 ${tema.primaryBtn}`}>
          {aEnviar ? "…" : "Enviar"}
        </button>
      </form>
    </section>
  );
}
