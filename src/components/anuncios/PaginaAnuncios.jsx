import { useEffect, useState } from "react";
import {
  AMBITOS_ANUNCIO,
  NIVEIS_ANUNCIO,
  apagarAnuncio,
  listarAnunciosGeriveis,
  listarMeusAnuncios,
  marcarAnuncioLido,
} from "../../services/announcementservice";
import { useNotificacoes } from "../../notificacoes/notificacoes";
import { useTheme } from "../../theme/tema";
import { formatarDataHora, idDe } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import Icone from "../ui/Icone";
import { corDoNivel } from "./estiloAnuncio";
import ModalAnuncio from "./ModalAnuncio";

// Estado da janela de um anúncio, para quem o gere.
const estadoJanela = (a) => {
  if (a.active) return ["Ativo", "sucesso"];
  return new Date(a.startsAt) > new Date() ? ["Agendado", "aviso"] : ["Terminado", "chip"];
};

// Página de anúncios: o feed de quem tem a sessão e, para quem pode publicar, a gestão.
// `ambitos` diz o que este papel pode publicar (vazio = só lê); `empresas` e `projetos` alimentam o formulário.
export default function PaginaAnuncios({ token, ambitos = [], empresas = [], projetos = [] }) {
  const tema = useTheme();
  const { versaoAnuncios, anunciosAlterados } = useNotificacoes();
  const podeGerir = ambitos.length > 0;
  const [vista, setVista] = useState("feed");
  const [feed, setFeed] = useState([]);
  const [geriveis, setGeriveis] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [recarga, setRecarga] = useState(0);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [emEdicao, setEmEdicao] = useState(null); // null | "novo" | anúncio
  const [aApagar, setAApagar] = useState(null);

  useEffect(() => {
    let ativo = true;
    Promise.all([listarMeusAnuncios(token), podeGerir ? listarAnunciosGeriveis(token) : Promise.resolve([])])
      .then(([meus, meusGeriveis]) => {
        if (!ativo) return;
        setFeed(Array.isArray(meus) ? meus : []);
        setGeriveis(Array.isArray(meusGeriveis) ? meusGeriveis : []);
        setErro("");
      })
      .catch((err) => ativo && setErro(err.message || "Não foi possível carregar os anúncios."))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [token, podeGerir, versaoAnuncios, recarga]);

  const recarregar = () => {
    setCarregando(true);
    setRecarga((n) => n + 1);
    anunciosAlterados();
  };

  const lido = async (id) => {
    setFeed((atuais) => atuais.map((a) => (a.id === id ? { ...a, read: true } : a)));
    try {
      await marcarAnuncioLido(id, token);
      anunciosAlterados();
    } catch (err) {
      setErro(err.message || "Não foi possível marcar como lido.");
    }
  };

  const apagar = async (anuncio) => {
    setErro("");
    setSucesso("");
    try {
      await apagarAnuncio(anuncio.id, token);
      setAApagar(null);
      setSucesso("Anúncio apagado.");
      recarregar();
    } catch (err) {
      setErro(err.message || "Não foi possível apagar o anúncio.");
    }
  };

  const nomeEmpresa = (id) => empresas.find((e) => e.id === id)?.name;
  const nomeProjeto = (id) => projetos.find((p) => idDe(p) === id)?.name;
  const destino = (a) =>
    a.scope === "system"
      ? "Todos"
      : a.scope === "company"
        ? nomeEmpresa(a.companyId) || "Toda a empresa"
        : nomeProjeto(a.projectId) || "Projeto";

  const porLer = feed.filter((a) => !a.read).length;
  const botaoVista = (valor, rotulo) => (
    <button
      type="button"
      aria-pressed={vista === valor}
      onClick={() => setVista(valor)}
      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${vista === valor ? tema.active : tema.secondaryBtn}`}
    >
      {rotulo}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Anúncios</h1>
          <p className={`mt-1 text-xs ${tema.muted}`}>Mensagens do sistema, da empresa e dos projetos em que participa.</p>
        </div>
        {podeGerir && (
          <button
            type="button"
            onClick={() => setEmEdicao("novo")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-md transition ${tema.primaryBtn}`}
          >
            <Icone nome="mais" className="h-4 w-4" />
            Novo anúncio
          </button>
        )}
      </div>

      {podeGerir && (
        <div className="flex flex-wrap gap-2">
          {botaoVista("feed", porLer ? `Para si (${porLer} por ler)` : "Para si")}
          {botaoVista("gerir", `Que pode gerir (${geriveis.length})`)}
        </div>
      )}

      {erro && <Alerta>{erro}</Alerta>}
      {sucesso && <Alerta tipo="sucesso">{sucesso}</Alerta>}

      {carregando ? (
        <div className={`rounded-2xl border p-10 text-center text-xs ${tema.card} ${tema.muted}`}>A carregar anúncios…</div>
      ) : vista === "feed" || !podeGerir ? (
        feed.length === 0 ? (
          <div className={`rounded-2xl border p-10 text-center text-xs ${tema.card} ${tema.muted}`}>Não há anúncios para si.</div>
        ) : (
          <div className="space-y-3">
            {feed.map((a) => (
              <article key={a.id} className={`rounded-2xl border p-4 sm:p-5 ${tema.card} ${a.read ? "" : "ring-1 ring-emerald-500/40"}`}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {a.pinned && <span className={`text-[10px] font-semibold uppercase ${tema.accent}`}>Fixado</span>}
                      <h3 className="break-words font-semibold">{a.title}</h3>
                    </div>
                    <p className={`mt-1 text-xs ${tema.muted}`}>
                      {AMBITOS_ANUNCIO[a.scope]} · {formatarDataHora(a.startsAt)}
                      {a.endsAt ? ` até ${formatarDataHora(a.endsAt)}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase ${corDoNivel(tema, a.severity)}`}>
                      {NIVEIS_ANUNCIO[a.severity]}
                    </span>
                    {!a.read && (
                      <button type="button" onClick={() => lido(a.id)} className={`text-xs font-semibold hover:underline ${tema.accent}`}>
                        Marcar como lido
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-line break-words text-sm">{a.body}</p>
              </article>
            ))}
          </div>
        )
      ) : geriveis.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center text-xs ${tema.card} ${tema.muted}`}>
          Ainda não há anúncios que possa gerir.
        </div>
      ) : (
        <div className="space-y-3">
          {geriveis.map((a) => {
            const [estado, cor] = estadoJanela(a);
            return (
              <article key={a.id} className={`rounded-2xl border p-4 sm:p-5 ${tema.card}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="break-words font-semibold">{a.title}</h3>
                    <p className={`mt-1 text-xs ${tema.muted}`}>
                      {a.scope === "company" ? destino(a) : `${AMBITOS_ANUNCIO[a.scope]}: ${destino(a)}`} · {formatarDataHora(a.startsAt)}
                      {a.endsAt ? ` até ${formatarDataHora(a.endsAt)}` : " · sem fim"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase ${tema[cor]}`}>{estado}</span>
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase ${corDoNivel(tema, a.severity)}`}>
                      {NIVEIS_ANUNCIO[a.severity]}
                    </span>
                    {a.pinned && <span className={`text-[10px] font-semibold uppercase ${tema.accent}`}>Fixado</span>}
                  </div>
                </div>
                <p className={`mt-3 line-clamp-3 whitespace-pre-line break-words text-sm ${tema.muted}`}>{a.body}</p>
                {aApagar === a.id ? (
                  <div className={`mt-3 flex flex-col gap-2 border-t pt-3 sm:flex-row sm:items-center sm:justify-between ${tema.border}`}>
                    <span className={`text-xs ${tema.muted}`}>Apagar este anúncio para todos? Não pode ser desfeito.</span>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setAApagar(null)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${tema.secondaryBtn}`}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => apagar(a)}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
                      >
                        Apagar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`mt-3 flex justify-end gap-4 border-t pt-3 text-xs font-semibold ${tema.border}`}>
                    <button type="button" onClick={() => setEmEdicao(a)} className={`hover:underline ${tema.accent}`}>
                      Editar
                    </button>
                    <button type="button" onClick={() => setAApagar(a.id)} className="text-red-500 hover:underline">
                      Apagar
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {emEdicao && (
        <ModalAnuncio
          anuncio={emEdicao === "novo" ? null : emEdicao}
          ambitos={ambitos}
          empresas={empresas}
          projetos={projetos}
          token={token}
          onFechar={() => setEmEdicao(null)}
          onGuardado={(mensagem) => {
            setEmEdicao(null);
            setSucesso(mensagem);
            setErro("");
            setVista("gerir");
            recarregar();
          }}
        />
      )}
    </div>
  );
}
