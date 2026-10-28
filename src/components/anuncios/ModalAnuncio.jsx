import { useState } from "react";
import {
  AMBITOS_ANUNCIO,
  NIVEIS_ANUNCIO,
  atualizarAnuncio,
  criarAnuncio,
  marcarAnuncioLido,
} from "../../services/announcementservice";
import { useTheme } from "../../theme/tema";
import { idDe } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import Campo from "../ui/Campo";
import Modal from "../ui/Modal";
import { deInputLocal, paraInputLocal } from "./estiloAnuncio";

const formDe = (anuncio, ambitos) => ({
  scope: anuncio?.scope || ambitos[0] || "",
  companyId: anuncio?.companyId || "",
  projectId: anuncio?.projectId || "",
  title: anuncio?.title || "",
  body: anuncio?.body || "",
  severity: anuncio?.severity || "info",
  pinned: Boolean(anuncio?.pinned),
  startsAt: paraInputLocal(anuncio?.startsAt),
  endsAt: paraInputLocal(anuncio?.endsAt),
});

// Publicar (POST /announcements) ou alterar (PATCH /announcements/:id) um anúncio.
// O âmbito, a empresa e o projeto só se escolhem ao publicar: o back não os deixa mudar.
export default function ModalAnuncio({ anuncio, ambitos, empresas = [], projetos = [], token, onFechar, onGuardado }) {
  const tema = useTheme();
  const editar = Boolean(anuncio);
  const [original] = useState(() => formDe(anuncio, ambitos));
  const [form, setForm] = useState(original);
  const [erro, setErro] = useState("");
  const [aGuardar, setAGuardar] = useState(false);

  const alterar = (campo) => (e) =>
    setForm((f) => ({ ...f, [campo]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const guardar = async (e) => {
    e.preventDefault();
    setErro("");
    if (form.startsAt && form.endsAt && form.endsAt <= form.startsAt) {
      setErro("O fim tem de ser depois do início.");
      return;
    }

    let pedido;
    if (editar) {
      const alteracoes = {};
      for (const campo of ["title", "body", "severity", "pinned"]) {
        const valor = typeof form[campo] === "string" ? form[campo].trim() : form[campo];
        if (valor !== original[campo]) alteracoes[campo] = valor;
      }
      if (form.startsAt !== original.startsAt && form.startsAt) alteracoes.startsAt = deInputLocal(form.startsAt);
      if (form.endsAt !== original.endsAt) alteracoes.endsAt = deInputLocal(form.endsAt);
      if (Object.keys(alteracoes).length === 0) {
        onFechar();
        return;
      }
      pedido = () => atualizarAnuncio(anuncio.id, alteracoes, token);
    } else {
      const dados = {
        scope: form.scope,
        title: form.title.trim(),
        body: form.body.trim(),
        severity: form.severity,
        pinned: form.pinned,
        ...(form.scope === "company" && form.companyId ? { companyId: form.companyId } : {}),
        ...(form.scope === "project" ? { projectId: form.projectId } : {}),
        ...(form.startsAt ? { startsAt: deInputLocal(form.startsAt) } : {}),
        ...(form.endsAt ? { endsAt: deInputLocal(form.endsAt) } : {}),
      };
      // Quem publica já o leu: não lhe aparece como faixa por ler.
      pedido = async () => {
        const criado = await criarAnuncio(dados, token);
        if (criado?.id) await marcarAnuncioLido(criado.id, token).catch(() => {});
        return criado;
      };
    }

    setAGuardar(true);
    try {
      await pedido();
      await onGuardado(editar ? "Anúncio atualizado." : "Anúncio publicado.");
    } catch (err) {
      setErro(err.message || "Não foi possível guardar o anúncio.");
      setAGuardar(false);
    }
  };

  const precisaEmpresa = !editar && form.scope === "company" && empresas.length > 0;
  const precisaProjeto = !editar && form.scope === "project";

  return (
    <Modal
      id="modal-anuncio"
      titulo={editar ? "Editar anúncio" : "Novo anúncio"}
      subtitulo={editar ? `Âmbito: ${AMBITOS_ANUNCIO[anuncio.scope]}` : "O anúncio aparece a todas as pessoas do âmbito escolhido."}
      onFechar={onFechar}
      bloqueado={aGuardar}
    >
      {erro && <Alerta className="mb-4">{erro}</Alerta>}

      <form onSubmit={guardar} className="space-y-4">
        {!editar && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo id="anuncio-ambito" label="Quem vê" obrigatorio como="select" value={form.scope} onChange={alterar("scope")} disabled={aGuardar}>
              {ambitos.map((a) => (
                <option key={a} value={a}>
                  {a === "system" ? "Todos (sistema)" : a === "company" ? "Toda a empresa" : "Pessoas de um projeto"}
                </option>
              ))}
            </Campo>
            {precisaEmpresa && (
              <Campo id="anuncio-empresa" label="Empresa" obrigatorio como="select" value={form.companyId} onChange={alterar("companyId")} disabled={aGuardar}>
                <option value="">Selecione</option>
                {empresas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </Campo>
            )}
            {precisaProjeto && (
              <Campo id="anuncio-projeto" label="Projeto" obrigatorio como="select" value={form.projectId} onChange={alterar("projectId")} disabled={aGuardar}>
                <option value="">{projetos.length ? "Selecione" : "Não há projetos disponíveis"}</option>
                {projetos.map((p) => (
                  <option key={idDe(p)} value={idDe(p)}>
                    {p.name}
                  </option>
                ))}
              </Campo>
            )}
          </div>
        )}

        <Campo id="anuncio-titulo" label="Título" obrigatorio maxLength={150} value={form.title} onChange={alterar("title")} disabled={aGuardar} />
        <Campo
          id="anuncio-texto"
          label="Mensagem"
          obrigatorio
          como="textarea"
          rows={5}
          maxLength={5000}
          value={form.body}
          onChange={alterar("body")}
          disabled={aGuardar}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo id="anuncio-nivel" label="Nível" como="select" value={form.severity} onChange={alterar("severity")} disabled={aGuardar}>
            {Object.entries(NIVEIS_ANUNCIO).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </Campo>
          <label className={`flex items-center gap-2 self-end rounded-xl border px-3.5 py-2.5 text-sm ${tema.border}`}>
            <input type="checkbox" checked={form.pinned} onChange={alterar("pinned")} disabled={aGuardar} />
            Fixar no topo
          </label>
          <Campo
            id="anuncio-inicio"
            label="Começa a aparecer (opcional)"
            type="datetime-local"
            value={form.startsAt}
            onChange={alterar("startsAt")}
            disabled={aGuardar}
          />
          <Campo
            id="anuncio-fim"
            label="Deixa de aparecer (opcional)"
            type="datetime-local"
            min={form.startsAt || undefined}
            value={form.endsAt}
            onChange={alterar("endsAt")}
            disabled={aGuardar}
          />
        </div>
        <p className={`text-xs ${tema.muted}`}>Sem início, aparece já. Sem fim, fica até ser apagado.</p>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={aGuardar}
            onClick={onFechar}
            className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${tema.secondaryBtn}`}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={aGuardar || (precisaProjeto && !form.projectId) || (precisaEmpresa && !form.companyId)}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60 ${tema.primaryBtn}`}
          >
            {aGuardar ? "A guardar..." : editar ? "Guardar alterações" : "Publicar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
