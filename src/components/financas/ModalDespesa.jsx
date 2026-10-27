import { useState } from "react";
import { LIMITES_FICHEIRO, validarFicheiro } from "../../services/api";
import { CATEGORIAS_DESPESA, apagarRecibo, atualizarDespesa, criarDespesa, enviarRecibo } from "../../services/expenseservice";
import { useTheme } from "../../theme/tema";
import { idDe, isoLocal } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import Campo from "../ui/Campo";
import Ficheiros from "../ui/Ficheiros";
import Modal from "../ui/Modal";

const formDe = (despesa, projectId) => ({
  projectId: despesa ? despesa.projectId || "" : projectId || "",
  title: despesa?.title || "",
  description: despesa?.description || "",
  amount: despesa?.amount || "",
  category: despesa?.category || "software",
  incurredOn: despesa?.incurredOn || isoLocal(new Date()),
});

// Ids das outras despesas da empresa que têm um dos mesmos recibos.
const duplicadosDe = (recibos) => [...new Set(recibos.flatMap((r) => r.duplicateOwnerIds || []))];

// Registar (POST /expenses) ou alterar (PATCH /expenses/:id) uma despesa, com os recibos.
// Ao registar, os recibos escolhidos enviam-se a seguir, um a um, com o id da despesa criada.
// Com `projectId` fixo é sempre desse projeto; com `projetos` (admins) escolhe-se o projeto ou "da empresa".
// `outras` (as despesas da lista) e `onAbrirOutra(id)` servem o aviso de recibo repetido.
export default function ModalDespesa({ despesa, projectId, projetos = [], outras = [], token, onFechar, onGuardada, onAbrirOutra }) {
  const tema = useTheme();
  const editar = Boolean(despesa);
  const [original] = useState(() => formDe(despesa, projectId));
  const [form, setForm] = useState(original);
  const [erros, setErros] = useState({});
  const [erro, setErro] = useState("");
  const [aGuardar, setAGuardar] = useState(false);
  const [recibos, setRecibos] = useState(() => despesa?.receipts || []);
  const [recibosAlterados, setRecibosAlterados] = useState(false);
  const [porEnviar, setPorEnviar] = useState([]); // ao registar: ficheiros escolhidos, enviados depois de criar
  const hoje = isoLocal(new Date());

  const escolherPorEnviar = (e) => {
    const escolhidos = [...(e.target.files || [])];
    e.target.value = "";
    const invalido = escolhidos.map((f) => validarFicheiro(f, LIMITES_FICHEIRO.documento)).find(Boolean);
    if (invalido) {
      setErro(invalido);
      return;
    }
    setErro("");
    setPorEnviar((atuais) => [...atuais, ...escolhidos].slice(0, 5));
  };

  const alterar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const guardar = async (e) => {
    e.preventDefault();
    setErro("");
    setErros({});

    let pedido;
    if (editar) {
      const alteracoes = {};
      for (const campo of ["title", "amount", "category", "incurredOn"]) {
        const valor = String(form[campo]).trim();
        if (valor !== String(original[campo])) alteracoes[campo] = valor;
      }
      if (form.description.trim() !== original.description) alteracoes.description = form.description.trim() || null;
      if (Object.keys(alteracoes).length === 0) {
        if (recibosAlterados) await onGuardada("Recibos atualizados.");
        else onFechar();
        return;
      }
      pedido = () => atualizarDespesa(despesa.id, alteracoes, token);
    } else {
      pedido = () =>
        criarDespesa(
          {
            ...(form.projectId ? { projectId: form.projectId } : {}),
            title: form.title.trim(),
            amount: String(form.amount).trim(),
            category: form.category,
            incurredOn: form.incurredOn,
            ...(form.description.trim() ? { description: form.description.trim() } : {}),
          },
          token,
        );
    }

    setAGuardar(true);
    try {
      const guardada = await pedido();
      if (!editar && porEnviar.length) {
        // A despesa já existe: um recibo que falhe não a desfaz, só se avisa.
        const falhas = [];
        const enviados = [];
        for (const ficheiro of porEnviar) {
          try {
            enviados.push(await enviarRecibo(guardada.id, ficheiro, token));
          } catch (err) {
            falhas.push(`${ficheiro.name}: ${err.message}`);
          }
        }
        const repetidos = duplicadosDe(enviados).length;
        await onGuardada(
          [
            `Despesa registada com ${enviados.length} ${enviados.length === 1 ? "recibo" : "recibos"}.`,
            repetidos ? "Atenção: um dos recibos também está anexado a outra despesa." : "",
            falhas.length ? `Não foi possível enviar: ${falhas.join("; ")}` : "",
          ]
            .filter(Boolean)
            .join(" "),
        );
        return;
      }
      await onGuardada(editar ? "Despesa atualizada." : "Despesa registada.");
    } catch (err) {
      // Num 400, data traz [{ field, message }] para marcar os campos.
      if (Array.isArray(err.data?.data)) {
        setErros(Object.fromEntries(err.data.data.map((d) => [d.field, d.message])));
      }
      setErro(err.message || "Não foi possível guardar a despesa.");
      setAGuardar(false);
    }
  };

  const erroDe = (campo) => erros[campo] && <p className="mt-1 text-xs text-red-500">{erros[campo]}</p>;

  return (
    <Modal
      id="modal-despesa"
      titulo={editar ? "Editar despesa" : "Registar despesa"}
      subtitulo="Montantes em euros. O dia do gasto não pode ser no futuro."
      onFechar={onFechar}
      bloqueado={aGuardar}
    >
      {erro && <Alerta className="mb-4">{erro}</Alerta>}

      <form onSubmit={guardar} className="space-y-4">
        {!editar && !projectId && (
          <Campo id="despesa-projeto" label="De que é a despesa" como="select" value={form.projectId} onChange={alterar("projectId")} disabled={aGuardar}>
            <option value="">Da empresa (renda, licenças, equipamento…)</option>
            {projetos.map((p) => (
              <option key={idDe(p)} value={idDe(p)}>
                Projeto: {p.name}
              </option>
            ))}
          </Campo>
        )}
        <div>
          <Campo id="despesa-titulo" label="Descrição curta" obrigatorio maxLength={150} placeholder="Ex.: Licenças Figma" value={form.title} onChange={alterar("title")} disabled={aGuardar} />
          {erroDe("title")}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Campo
              id="despesa-montante"
              label="Montante (€)"
              obrigatorio
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={alterar("amount")}
              disabled={aGuardar}
            />
            {erroDe("amount")}
          </div>
          <div>
            <Campo id="despesa-categoria" label="Categoria" como="select" value={form.category} onChange={alterar("category")} disabled={aGuardar}>
              {Object.entries(CATEGORIAS_DESPESA).map(([valor, rotulo]) => (
                <option key={valor} value={valor}>
                  {rotulo}
                </option>
              ))}
            </Campo>
            {erroDe("category")}
          </div>
          <div>
            <Campo id="despesa-dia" label="Dia do gasto" obrigatorio type="date" max={hoje} value={form.incurredOn} onChange={alterar("incurredOn")} disabled={aGuardar} />
            {erroDe("incurredOn")}
          </div>
        </div>
        <div>
          <Campo id="despesa-notas" label="Notas (opcional)" como="textarea" rows={3} maxLength={2000} value={form.description} onChange={alterar("description")} disabled={aGuardar} />
          {erroDe("description")}
        </div>

        <div>
          <p className={`mb-1.5 text-xs font-semibold ${tema.label}`}>Recibos</p>
          {editar ? (
            <Ficheiros
              ficheiros={recibos}
              rotulo="Anexar recibo"
              onEnviar={async (ficheiro) => {
                const novo = await enviarRecibo(despesa.id, ficheiro, token);
                setRecibos((atuais) => [...atuais, novo]);
                setRecibosAlterados(true);
              }}
              onApagar={async (ficheiro) => {
                await apagarRecibo(despesa.id, ficheiro.id, token);
                setRecibos((atuais) => atuais.filter((r) => r.id !== ficheiro.id));
                setRecibosAlterados(true);
              }}
              avisoDuplicado={
                duplicadosDe(recibos).length > 0 && (
                  <Alerta tipo="aviso">
                    Este recibo também está anexado a{" "}
                    {duplicadosDe(recibos).map((id, i) => {
                      const outra = outras.find((d) => d.id === id);
                      return (
                        <span key={id}>
                          {i > 0 && ", "}
                          {outra && onAbrirOutra ? (
                            <button type="button" onClick={() => onAbrirOutra(outra)} className="font-semibold underline">
                              {outra.title}
                            </button>
                          ) : (
                            "outra despesa"
                          )}
                        </span>
                      );
                    })}
                    .
                  </Alerta>
                )
              }
            />
          ) : (
            <div className="space-y-2">
              {porEnviar.length > 0 && (
                <ul className={`divide-y rounded-xl border text-xs ${tema.border}`}>
                  {porEnviar.map((f, i) => (
                    <li key={`${f.name}-${i}`} className={`flex items-center justify-between gap-2 px-3 py-2 ${tema.border}`}>
                      <span className="truncate">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => setPorEnviar((atuais) => atuais.filter((_, j) => j !== i))}
                        className="shrink-0 font-semibold text-red-500 hover:underline"
                      >
                        Tirar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <label className={`inline-flex cursor-pointer items-center rounded-lg border px-3 py-1.5 text-xs font-semibold ${tema.secondaryBtn} ${porEnviar.length >= 5 ? "pointer-events-none opacity-50" : ""}`}>
                Escolher recibos
                <input type="file" multiple accept={LIMITES_FICHEIRO.documento.tipos} onChange={escolherPorEnviar} className="sr-only" disabled={aGuardar} />
              </label>
              <p className={`text-[11px] ${tema.muted}`}>{LIMITES_FICHEIRO.documento.descricao}, até 5. São enviados depois de registar a despesa.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button type="button" disabled={aGuardar} onClick={onFechar} className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${tema.secondaryBtn}`}>
            Cancelar
          </button>
          <button type="submit" disabled={aGuardar} className={`rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60 ${tema.primaryBtn}`}>
            {aGuardar ? "A guardar..." : editar ? "Guardar alterações" : "Registar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
