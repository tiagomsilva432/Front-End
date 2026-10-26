import { useEffect, useState } from "react";
import { AMBITOS_ANUNCIO, listarMeusAnuncios, marcarAnuncioLido } from "../../services/announcementservice";
import { useNotificacoes } from "../../notificacoes/notificacoes";
import { useTheme } from "../../theme/tema";
import Icone from "../ui/Icone";
import { corDoNivel } from "./estiloAnuncio";

const MAXIMO = 3;

// Faixas no topo do painel com os anúncios ativos ainda por ler. Fechar uma marca-a como lida.
// Volta a carregar quando o stream avisa que um anúncio foi publicado, alterado ou apagado.
export default function FaixaAnuncios({ token, onVerTodos }) {
  const tema = useTheme();
  const { versaoAnuncios } = useNotificacoes();
  const [anuncios, setAnuncios] = useState([]);
  const [abertos, setAbertos] = useState({});

  useEffect(() => {
    if (!token) return;
    let ativo = true;
    listarMeusAnuncios(token, true)
      .then((lista) => ativo && setAnuncios(Array.isArray(lista) ? lista : []))
      .catch((err) => console.error("Erro ao carregar os anúncios:", err));
    return () => {
      ativo = false;
    };
  }, [token, versaoAnuncios]);

  const fechar = (id) => {
    setAnuncios((atuais) => atuais.filter((a) => a.id !== id));
    marcarAnuncioLido(id, token).catch((err) => console.error("Erro ao marcar o anúncio como lido:", err));
  };

  if (anuncios.length === 0) return null;

  return (
    <div className="space-y-2" aria-label="Anúncios por ler">
      {anuncios.slice(0, MAXIMO).map((a) => {
        const longo = a.body.length > 160;
        const aberto = abertos[a.id];
        return (
          <div key={a.id} role={a.severity === "critical" ? "alert" : "status"} className={`rounded-xl border p-3.5 text-sm ${corDoNivel(tema, a.severity)}`}>
            <div className="flex items-start gap-3">
              <Icone nome="megafone" className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {a.title}
                  <span className="ml-2 text-[10px] font-semibold uppercase opacity-70">{AMBITOS_ANUNCIO[a.scope]}</span>
                </p>
                <p className="mt-1 whitespace-pre-line break-words opacity-90">
                  {longo && !aberto ? `${a.body.slice(0, 160)}…` : a.body}
                </p>
                {longo && (
                  <button
                    type="button"
                    onClick={() => setAbertos((x) => ({ ...x, [a.id]: !aberto }))}
                    className="mt-1 text-xs font-semibold underline"
                  >
                    {aberto ? "Ver menos" : "Ler tudo"}
                  </button>
                )}
              </div>
              <button
                type="button"
                aria-label={`Marcar "${a.title}" como lido`}
                title="Marcar como lido"
                onClick={() => fechar(a.id)}
                className="shrink-0 rounded-lg p-1 opacity-70 hover:opacity-100"
              >
                <Icone nome="fechar" className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
      {anuncios.length > MAXIMO && onVerTodos && (
        <button type="button" onClick={onVerTodos} className={`text-xs font-semibold hover:underline ${tema.accent}`}>
          Ver os outros {anuncios.length - MAXIMO} anúncios por ler
        </button>
      )}
    </div>
  );
}
