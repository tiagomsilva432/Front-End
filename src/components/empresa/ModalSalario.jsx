import { useEffect, useState } from "react";
import { apagarSalario, criarSalario, listarSalarios, obterSalarioAtual } from "../../services/salaryservice";
import { useTheme } from "../../theme/tema";
import { hojeISO, nomeCompleto } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import Campo from "../ui/Campo";
import Modal from "../ui/Modal";
import HistoricoSalarios from "../salarios/HistoricoSalarios";

const novoSalario = () => ({ amount: "", currency: "EUR", effectiveFrom: hojeISO(), reason: "" });

// Salário de um colaborador. Um salário nunca se edita: o seguinte fecha o anterior.
// Só o mais recente se pode apagar (para corrigir um engano).
export default function ModalSalario({ colaborador, token, onFechar }) {
  const tema = useTheme();
  const [historico, setHistorico] = useState([]);
  const [atual, setAtual] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [recarga, setRecarga] = useState(0);
  const [form, setForm] = useState(novoSalario);
  const [aGuardar, setAGuardar] = useState(false);
  const [aConfirmarApagar, setAConfirmarApagar] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    let ativo = true;
    Promise.all([listarSalarios(colaborador.id, token), obterSalarioAtual(colaborador.id, token)])
      .then(([lista, emVigor]) => {
        if (!ativo) return;
        setHistorico(Array.isArray(lista) ? lista : []);
        setAtual(emVigor);
      })
      .catch((err) => {
        if (ativo) setErro(err.message || "Não foi possível carregar o salário.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [colaborador.id, token, recarga]);

  const recarregar = () => {
    setCarregando(true);
    setRecarga((n) => n + 1);
  };

  const alterar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  const maisRecente = historico[0];

  const guardar = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    if (maisRecente && form.effectiveFrom <= maisRecente.effectiveFrom) {
      setErro("O novo salário tem de começar depois do mais recente.");
      return;
    }
    setAGuardar(true);
    try {
      await criarSalario(
        colaborador.id,
        {
          amount: form.amount,
          currency: form.currency.trim().toUpperCase(),
          effectiveFrom: form.effectiveFrom,
          ...(form.reason.trim() ? { reason: form.reason.trim() } : {}),
        },
        token,
      );
      setSucesso(form.effectiveFrom > hojeISO() ? "Aumento agendado." : "Salário definido.");
      setForm(novoSalario());
      recarregar();
    } catch (err) {
      setErro(err.message || "Não foi possível definir o salário.");
    } finally {
      setAGuardar(false);
    }
  };

  const apagar = async () => {
    setAGuardar(true);
    setErro("");
    setSucesso("");
    try {
      await apagarSalario(colaborador.id, maisRecente.id, token);
      setSucesso("Salário mais recente apagado. O anterior voltou a ficar em vigor.");
      setAConfirmarApagar(false);
      recarregar();
    } catch (err) {
      setErro(err.message || "Não foi possível apagar o salário.");
    } finally {
      setAGuardar(false);
    }
  };

  const nome = nomeCompleto(colaborador);

  return (
    <Modal
      id="salario-colaborador"
      titulo="Salário do colaborador"
      subtitulo={nome ? `${nome} · ${colaborador.email}` : colaborador.email}
      onFechar={onFechar}
      bloqueado={aGuardar}
      largura="max-w-2xl"
    >
      <div className="space-y-5">
        {erro && <Alerta>{erro}</Alerta>}
        {sucesso && <Alerta tipo="sucesso">{sucesso}</Alerta>}

        <HistoricoSalarios historico={historico} atual={atual} carregando={carregando} />

        {maisRecente && !carregando && (
          <div className={`rounded-xl border p-3 text-xs ${tema.border}`}>
            {aConfirmarApagar ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className={tema.muted}>Apagar o salário mais recente? Use só para corrigir um engano.</span>
                <div className="flex shrink-0 justify-end gap-2">
                  <button
                    type="button"
                    disabled={aGuardar}
                    onClick={() => setAConfirmarApagar(false)}
                    className={`rounded-lg border px-3 py-1.5 font-semibold ${tema.secondaryBtn}`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={aGuardar}
                    onClick={apagar}
                    className="rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                  >
                    {aGuardar ? "A apagar…" : "Apagar"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAConfirmarApagar(true)}
                className="font-semibold text-red-500 hover:underline"
              >
                Apagar o salário mais recente
              </button>
            )}
          </div>
        )}

        <form onSubmit={guardar} className={`space-y-4 border-t pt-5 ${tema.border}`}>
          <div>
            <h3 className="text-sm font-semibold">Definir novo salário</h3>
            <p className={`mt-1 text-xs ${tema.muted}`}>
              Bruto mensal. Uma data futura agenda um aumento; o salário atual mantém-se até lá.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Campo
              id="salario-montante"
              label="Montante"
              obrigatorio
              type="number"
              min="0"
              step="0.01"
              placeholder="Ex.: 2150.00"
              value={form.amount}
              onChange={alterar("amount")}
              disabled={aGuardar}
            />
            <Campo
              id="salario-moeda"
              label="Moeda"
              obrigatorio
              maxLength={3}
              minLength={3}
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))}
              disabled={aGuardar}
            />
            <Campo
              id="salario-inicio"
              label="Em vigor a partir de"
              obrigatorio
              type="date"
              min={maisRecente ? maisRecente.effectiveFrom : undefined}
              value={form.effectiveFrom}
              onChange={alterar("effectiveFrom")}
              disabled={aGuardar}
            />
            <Campo
              id="salario-motivo"
              label="Motivo"
              maxLength={255}
              placeholder="Ex.: Aumento anual"
              className="sm:col-span-3"
              value={form.reason}
              onChange={alterar("reason")}
              disabled={aGuardar}
            />
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={aGuardar}
              onClick={onFechar}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${tema.secondaryBtn}`}
            >
              Fechar
            </button>
            <button
              type="submit"
              disabled={aGuardar || carregando}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60 ${tema.primaryBtn}`}
            >
              {aGuardar ? "A guardar…" : "Definir salário"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
