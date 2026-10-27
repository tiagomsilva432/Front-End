import { useRef, useState } from "react";
import { LIMITES_FICHEIRO, validarFicheiro } from "../../services/api";
import { useTheme } from "../../theme/tema";
import Alerta from "./Alerta";

const tamanho = (bytes) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toLocaleString("pt-PT", { maximumFractionDigits: 1 })} MB`);

// Lista de ficheiros de um recurso (recibos de uma despesa, documentos de uma ausência), com anexar e remover.
// Os links (`url`) vêm do servidor e expiram em 1-2 horas: usam-se tal como vêm, nunca se guardam.
// `onEnviar(ficheiro)` e `onApagar(ficheiro)` devolvem promessas; `podeAlterar` esconde os botões.
// `maximo` = 1 quer dizer "um só, que o próximo substitui" (ex.: o ficheiro de um recurso).
export default function Ficheiros({ ficheiros = [], onEnviar, onApagar, podeAlterar = true, rotulo = "Anexar ficheiro", avisoDuplicado, maximo = 5 }) {
  const tema = useTheme();
  const entrada = useRef(null);
  const [aEnviar, setAEnviar] = useState(false);
  const [aApagar, setAApagar] = useState(null);
  const [erro, setErro] = useState("");

  const escolher = async (e) => {
    const ficheiro = e.target.files?.[0];
    e.target.value = "";
    if (!ficheiro) return;
    const invalido = validarFicheiro(ficheiro, LIMITES_FICHEIRO.documento);
    if (invalido) {
      setErro(invalido);
      return;
    }
    setErro("");
    setAEnviar(true);
    try {
      await onEnviar(ficheiro);
    } catch (err) {
      setErro(err.message || "Não foi possível enviar o ficheiro.");
    } finally {
      setAEnviar(false);
    }
  };

  const apagar = async (ficheiro) => {
    setErro("");
    setAApagar(ficheiro.id);
    try {
      await onApagar(ficheiro);
    } catch (err) {
      setErro(err.message || "Não foi possível remover o ficheiro.");
    } finally {
      setAApagar(null);
    }
  };

  const cheio = maximo > 1 && ficheiros.length >= maximo;

  return (
    <div className="space-y-2">
      {ficheiros.length > 0 && (
        <ul className={`divide-y rounded-xl border ${tema.border}`}>
          {ficheiros.map((f) => (
            <li key={f.id} className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs ${tema.border}`}>
              <span className="flex min-w-0 items-center gap-2">
                <span aria-hidden="true" className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase ${tema.chip}`}>
                  {f.mimeType === "application/pdf" ? "PDF" : "IMG"}
                </span>
                <a href={f.url} target="_blank" rel="noreferrer" className={`truncate font-medium hover:underline ${tema.accent}`}>
                  {f.name}
                </a>
                <span className={`shrink-0 ${tema.muted}`}>{tamanho(f.size)}</span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <a href={`${f.url}&download=1`} className={`font-semibold hover:underline ${tema.muted}`}>
                  Descarregar
                </a>
                {podeAlterar && onApagar && (
                  <button
                    type="button"
                    disabled={aApagar === f.id}
                    onClick={() => apagar(f)}
                    className="font-semibold text-red-500 hover:underline disabled:opacity-50"
                  >
                    {aApagar === f.id ? "A remover…" : "Remover"}
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}

      {avisoDuplicado}
      {erro && <Alerta>{erro}</Alerta>}

      {podeAlterar && onEnviar && (
        <div className="flex flex-wrap items-center gap-2">
          <input ref={entrada} type="file" accept={LIMITES_FICHEIRO.documento.tipos} onChange={escolher} className="hidden" />
          <button
            type="button"
            disabled={aEnviar || cheio}
            onClick={() => entrada.current?.click()}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${tema.secondaryBtn}`}
          >
            {aEnviar ? "A enviar…" : rotulo}
          </button>
          <span className={`text-[11px] ${tema.muted}`}>
            {cheio
              ? `Já tem o máximo de ${maximo}.`
              : maximo === 1
                ? `${LIMITES_FICHEIRO.documento.descricao}. Um só: enviar outro substitui-o.`
                : `${LIMITES_FICHEIRO.documento.descricao}, até ${maximo}.`}
          </span>
        </div>
      )}
    </div>
  );
}
