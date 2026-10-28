import { useEffect, useState } from "react";
import {
  apagarFicheiroRecurso,
  apagarRecurso,
  atualizarRecurso,
  criarRecurso,
  enviarFicheiroRecurso,
  listarRecursos,
} from "../../services/resourceservice";
import { LIMITES_FICHEIRO, validarFicheiro } from "../../services/api";
import { useTheme } from "../../theme/tema";
import { tempoRelativo } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import Campo from "../ui/Campo";
import Ficheiros from "../ui/Ficheiros";
import Icone from "../ui/Icone";

const vazio = { title: "", url: "", note: "" };
// O back só aceita http/https (um "javascript:" num href correria no browser de quem clicasse).
const linkValido = (url) => /^https?:\/\/\S+$/i.test(url.trim());

// Recursos de um projeto: links (repositório, servidor de testes), notas e um ficheiro, sob um título.
// O gestor e os admins mexem em todos; cada membro só nos que adicionou.
export default function RecursosProjeto({ projectId, token, eu, gere }) {
  const tema = useTheme();
  const [recursos, setRecursos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState(null); // null | { id?, title, url, note, ficheiro }
  const [aGuardar, setAGuardar] = useState(false);
  const [aApagar, setAApagar] = useState(null);

  useEffect(() => {
    let ativo = true;
    listarRecursos(projectId, token)
      .then((lista) => ativo && setRecursos(Array.isArray(lista) ? lista : []))
      .catch((err) => ativo && setErro(err.message || "Não foi possível carregar os recursos."))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [projectId, token]);

  const podeAlterar = (r) => gere || r.createdBy === eu?.id;
  const trocar = (novo) => setRecursos((atuais) => atuais.map((r) => (r.id === novo.id ? novo : r)));

  const guardar = async (e) => {
    e.preventDefault();
    setErro("");
    const url = form.url.trim();
    if (url && !linkValido(url)) {
      setErro("O link tem de começar por http:// ou https://.");
      return;
    }
    // A API só exige o título; o formulário pede pelo menos uma coisa útil.
    if (!form.id && !url && !form.note.trim() && !form.ficheiro) {
      setErro("Junte um link, uma nota ou um ficheiro.");
      return;
    }
    setAGuardar(true);
    try {
      let guardado;
      if (form.id) {
        const original = recursos.find((r) => r.id === form.id);
        const alteracoes = {};
        if (form.title.trim() !== original.title) alteracoes.title = form.title.trim();
        if (url !== (original.url || "")) alteracoes.url = url || null;
        if (form.note.trim() !== (original.note || "")) alteracoes.note = form.note.trim() || null;
        guardado = Object.keys(alteracoes).length ? await atualizarRecurso(projectId, form.id, alteracoes, token) : original;
        trocar(guardado);
      } else {
        guardado = await criarRecurso(
          projectId,
          { title: form.title.trim(), ...(url ? { url } : {}), ...(form.note.trim() ? { note: form.note.trim() } : {}) },
          token,
        );
        if (form.ficheiro) {
          try {
            const file = await enviarFicheiroRecurso(projectId, guardado.id, form.ficheiro, token);
            guardado = { ...guardado, file };
          } catch (err) {
            setErro(`O recurso foi criado, mas o ficheiro não: ${err.message}`);
          }
        }
        setRecursos((atuais) => [...atuais, guardado]);
      }
      setForm(null);
    } catch (err) {
      setErro(err.message || "Não foi possível guardar o recurso.");
    } finally {
      setAGuardar(false);
    }
  };

  const apagar = async (r) => {
    setErro("");
    try {
      await apagarRecurso(projectId, r.id, token);
      setRecursos((atuais) => atuais.filter((x) => x.id !== r.id));
      setAApagar(null);
    } catch (err) {
      setErro(err.message || "Não foi possível apagar o recurso.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className={`text-sm ${tema.muted}`}>Links, notas e ficheiros úteis para quem trabalha no projeto.</p>
        {!form && (
          <button
            type="button"
            onClick={() => setForm({ ...vazio, ficheiro: null })}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-md ${tema.primaryBtn}`}
          >
            <Icone nome="mais" className="h-3.5 w-3.5" />
            Adicionar recurso
          </button>
        )}
      </div>

      {erro && <Alerta>{erro}</Alerta>}

      {form && (
        <form onSubmit={guardar} className={`space-y-3 rounded-2xl border p-5 ${tema.card}`}>
          <h3 className="font-semibold">{form.id ? "Editar recurso" : "Novo recurso"}</h3>
          <Campo
            id="recurso-titulo"
            label="Título"
            obrigatorio
            maxLength={150}
            placeholder="Ex.: Servidor de testes"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            disabled={aGuardar}
          />
          <Campo
            id="recurso-link"
            label="Link (opcional)"
            type="url"
            placeholder="https://"
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            disabled={aGuardar}
          />
          <Campo
            id="recurso-nota"
            label="Nota (opcional)"
            como="textarea"
            rows={3}
            maxLength={2000}
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            disabled={aGuardar}
          />
          {!form.id && (
            <div className="space-y-1">
              <label className={`inline-flex cursor-pointer items-center rounded-lg border px-3 py-1.5 text-xs font-semibold ${tema.secondaryBtn}`}>
                {form.ficheiro ? `Ficheiro: ${form.ficheiro.name}` : "Escolher ficheiro (opcional)"}
                <input
                  type="file"
                  accept={LIMITES_FICHEIRO.documento.tipos}
                  className="sr-only"
                  disabled={aGuardar}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;
                    const invalido = validarFicheiro(f, LIMITES_FICHEIRO.documento);
                    if (invalido) {
                      setErro(invalido);
                      return;
                    }
                    setErro("");
                    setForm((atual) => ({ ...atual, ficheiro: f }));
                  }}
                />
              </label>
              <p className={`text-[11px] ${tema.muted}`}>{LIMITES_FICHEIRO.documento.descricao}. Um por recurso.</p>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" disabled={aGuardar} onClick={() => setForm(null)} className={`rounded-xl border px-4 py-2 text-sm ${tema.secondaryBtn}`}>
              Cancelar
            </button>
            <button type="submit" disabled={aGuardar || !form.title.trim()} className={`rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60 ${tema.primaryBtn}`}>
              {aGuardar ? "A guardar…" : "Guardar"}
            </button>
          </div>
        </form>
      )}

      {carregando ? (
        <p className={`rounded-2xl border p-8 text-center text-sm ${tema.card} ${tema.muted}`}>A carregar recursos…</p>
      ) : recursos.length === 0 ? (
        <p className={`rounded-2xl border p-8 text-center text-sm ${tema.card} ${tema.muted}`}>Ainda não há recursos neste projeto.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {recursos.map((r) => (
            <article key={r.id} className={`space-y-2 rounded-2xl border p-4 ${tema.card}`}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 break-words font-semibold">{r.title}</h3>
                {podeAlterar(r) && aApagar !== r.id && (
                  <span className="flex shrink-0 gap-3 text-xs font-semibold">
                    <button type="button" onClick={() => setForm({ id: r.id, title: r.title, url: r.url || "", note: r.note || "", ficheiro: null })} className={`hover:underline ${tema.accent}`}>
                      Editar
                    </button>
                    <button type="button" onClick={() => setAApagar(r.id)} className="text-red-500 hover:underline">
                      Apagar
                    </button>
                  </span>
                )}
              </div>
              {r.url && linkValido(r.url) && (
                <a href={r.url} target="_blank" rel="noreferrer noopener" className={`block truncate text-sm font-medium hover:underline ${tema.accent}`}>
                  {r.url}
                </a>
              )}
              {r.note && <p className={`whitespace-pre-line break-words text-sm ${tema.muted}`}>{r.note}</p>}
              {(r.file || podeAlterar(r)) && (
                <Ficheiros
                  ficheiros={r.file ? [r.file] : []}
                  maximo={1}
                  podeAlterar={podeAlterar(r)}
                  rotulo={r.file ? "Substituir ficheiro" : "Juntar ficheiro"}
                  onEnviar={async (ficheiro) => {
                    const file = await enviarFicheiroRecurso(projectId, r.id, ficheiro, token);
                    trocar({ ...r, file });
                  }}
                  onApagar={async () => {
                    await apagarFicheiroRecurso(projectId, r.id, token);
                    trocar({ ...r, file: null });
                  }}
                />
              )}
              <p className={`text-[11px] ${tema.muted}`}>Adicionado {tempoRelativo(r.createdAt)}</p>
              {aApagar === r.id && (
                <div className={`flex flex-wrap items-center justify-end gap-2 border-t pt-2 ${tema.border}`}>
                  <span className={`text-xs ${tema.muted}`}>Apagar este recurso{r.file ? " e o ficheiro" : ""}?</span>
                  <button type="button" onClick={() => setAApagar(null)} className={`rounded-lg border px-3 py-1 text-xs font-semibold ${tema.secondaryBtn}`}>
                    Cancelar
                  </button>
                  <button type="button" onClick={() => apagar(r)} className="rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-500">
                    Apagar
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
