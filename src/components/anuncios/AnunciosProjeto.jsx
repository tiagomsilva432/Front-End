import { useEffect, useState } from "react";
import { NIVEIS_ANUNCIO, listarAnunciosProjeto } from "../../services/announcementservice";
import { useNotificacoes } from "../../notificacoes/notificacoes";
import { useTheme } from "../../theme/tema";
import { formatarDataHora } from "../../utils/formatar";
import { corDoNivel } from "./estiloAnuncio";

// Anúncios ativos de um projeto (GET /projects/:id/announcements), para quem é da empresa do projeto.
export default function AnunciosProjeto({ projectId, token, compacto = false }) {
  const tema = useTheme();
  const { versaoAnuncios } = useNotificacoes();
  const [anuncios, setAnuncios] = useState(null);

  useEffect(() => {
    let ativo = true;
    listarAnunciosProjeto(projectId, token)
      .then((lista) => ativo && setAnuncios(Array.isArray(lista) ? lista : []))
      .catch((err) => {
        console.error("Erro ao carregar os anúncios do projeto:", err);
        if (ativo) setAnuncios([]);
      });
    return () => {
      ativo = false;
    };
  }, [projectId, token, versaoAnuncios]);

  if (anuncios === null) return compacto ? null : <p className={`text-xs ${tema.muted}`}>A carregar anúncios…</p>;
  if (anuncios.length === 0) return compacto ? null : <p className={`text-xs ${tema.muted}`}>Sem anúncios neste projeto.</p>;

  return (
    <ul className="space-y-2">
      {anuncios.map((a) => (
        <li key={a.id} className={`rounded-xl border p-3 text-sm ${corDoNivel(tema, a.severity)}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">{a.title}</p>
            <span className="text-[10px] font-semibold uppercase opacity-70">{NIVEIS_ANUNCIO[a.severity]}</span>
          </div>
          <p className="mt-1 whitespace-pre-line break-words opacity-90">{a.body}</p>
          <p className="mt-1 text-[11px] opacity-70">{formatarDataHora(a.startsAt)}</p>
        </li>
      ))}
    </ul>
  );
}
