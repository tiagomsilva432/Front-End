import { useState } from "react";
import { apagarAlocacao, atualizarAlocacao } from "../../services/allocationservice";
import { useTheme } from "../../theme/tema";
import { alocacaoEmCurso, formatarData, hojeISO } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import Campo from "../ui/Campo";

// Uma alocação no modal do colaborador, com as ações Editar, Terminar e Reabrir (PATCH /allocations/:id)
// e Apagar (DELETE /allocations/:id), que serve só para corrigir enganos.
export default function LinhaAlocacao({ alocacao, nomeProjeto, token, onAlterada }) {
  const tema = useTheme();
  const [modo, setModo] = useState(null); // null | "editar" | "terminar" | "apagar"
  const [form, setForm] = useState({});
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState("");

  const emCurso = alocacaoEmCurso(alocacao);
  const alterar = (campo) => (e) => setForm((atual) => ({ ...atual, [campo]: e.target.value }));

  const abrir = (novoModo) => {
    setErro("");
    setModo(novoModo);
    setForm(
      novoModo === "editar"
        ? {
            allocationPercent: String(alocacao.allocationPercent),
            roleOnProject: alocacao.roleOnProject || "",
            endDate: alocacao.endDate || "",
          }
        : { endDate: hojeISO() < alocacao.startDate ? alocacao.startDate : hojeISO() },
    );
  };

  const enviar = async (dados, mensagem) => {
    setAGuardar(true);
    setErro("");
    try {
      await atualizarAlocacao(alocacao.id, dados, token);
      setModo(null);
      onAlterada(mensagem);
    } catch (err) {
      setErro(err.message || "Não foi possível atualizar a alocação.");
    } finally {
      setAGuardar(false);
    }
  };

  const apagar = async () => {
    setAGuardar(true);
    setErro("");
    try {
      await apagarAlocacao(alocacao.id, token);
      onAlterada(`Alocação em ${nomeProjeto} apagada.`);
    } catch (err) {
      setErro(err.message || "Não foi possível apagar a alocação.");
      setAGuardar(false);
    }
  };

  const guardar = (e) => {
    e.preventDefault();
    if (modo === "terminar") {
      enviar({ endDate: form.endDate }, `Alocação em ${nomeProjeto} terminada.`);
    } else {
      enviar(
        {
          allocationPercent: Number(form.allocationPercent),
          roleOnProject: form.roleOnProject.trim() || null,
          endDate: form.endDate || null,
        },
        `Alocação em ${nomeProjeto} atualizada.`,
      );
    }
  };

  const periodo = alocacao.endDate
    ? `${formatarData(alocacao.startDate)} – ${formatarData(alocacao.endDate)}`
    : `Desde ${formatarData(alocacao.startDate)}`;
  const botao = `rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${tema.secondaryBtn}`;

  return (
    <div className={`rounded-xl border p-3 ${tema.border} ${tema.cardMuted}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{nomeProjeto}</p>
          <p className={`mt-1 text-xs ${tema.muted}`}>
            {alocacao.roleOnProject || "Função não definida"} · {periodo}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className={`rounded-lg border px-2.5 py-1.5 text-sm font-bold ${emCurso ? tema.active : tema.chip}`}>
            {alocacao.allocationPercent}%
          </span>
          {!modo && (
            <>
              <button type="button" onClick={() => abrir("editar")} className={botao}>
                Editar
              </button>
              {emCurso && !alocacao.endDate && (
                <button type="button" onClick={() => abrir("terminar")} className={botao}>
                  Terminar
                </button>
              )}
              {alocacao.endDate && (
                <button
                  type="button"
                  disabled={aGuardar}
                  onClick={() => enviar({ endDate: null }, `Alocação em ${nomeProjeto} reaberta.`)}
                  className={botao}
                >
                  {aGuardar ? "A reabrir…" : "Reabrir"}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setErro("");
                  setModo("apagar");
                }}
                className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10"
              >
                Apagar
              </button>
            </>
          )}
        </div>
      </div>

      {erro && <Alerta className="mt-3">{erro}</Alerta>}

      {modo === "apagar" && (
        <div className={`mt-3 space-y-3 border-t pt-3 ${tema.border}`}>
          <p className={`text-xs ${tema.muted}`}>
            Apagar remove a alocação e o seu histórico. Use só para corrigir um engano; para terminar trabalho real,
            use “Terminar”.
          </p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModo(null)} disabled={aGuardar} className={botao}>
              Cancelar
            </button>
            <button
              type="button"
              onClick={apagar}
              disabled={aGuardar}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50"
            >
              {aGuardar ? "A apagar…" : "Apagar alocação"}
            </button>
          </div>
        </div>
      )}

      {(modo === "editar" || modo === "terminar") && (
        <form onSubmit={guardar} className={`mt-3 space-y-3 border-t pt-3 ${tema.border}`}>
          {modo === "editar" ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <Campo
                id={`editar-percentagem-${alocacao.id}`}
                label="Percentagem"
                obrigatorio
                type="number"
                min="1"
                max="100"
                step="1"
                value={form.allocationPercent}
                onChange={alterar("allocationPercent")}
                disabled={aGuardar}
              />
              <Campo
                id={`editar-funcao-${alocacao.id}`}
                label="Função no projeto"
                maxLength="100"
                value={form.roleOnProject}
                onChange={alterar("roleOnProject")}
                disabled={aGuardar}
              />
              <Campo
                id={`editar-fim-${alocacao.id}`}
                label="Data de fim"
                type="date"
                min={alocacao.startDate}
                value={form.endDate}
                onChange={alterar("endDate")}
                disabled={aGuardar}
              />
            </div>
          ) : (
            <Campo
              id={`terminar-fim-${alocacao.id}`}
              label="Último dia no projeto"
              obrigatorio
              type="date"
              min={alocacao.startDate}
              value={form.endDate}
              onChange={alterar("endDate")}
              disabled={aGuardar}
              className="sm:max-w-xs"
            />
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModo(null)} disabled={aGuardar} className={botao}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={aGuardar}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${tema.primaryBtn}`}
            >
              {aGuardar ? "A guardar…" : modo === "terminar" ? "Terminar alocação" : "Guardar"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
