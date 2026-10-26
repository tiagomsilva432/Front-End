import { useEffect, useState } from "react";
import {
  ESTADOS_AUSENCIA,
  TIPOS_AUSENCIA,
  cancelarAusencia,
  listarMinhasAusencias,
  obterResumoAusencias,
  pedirAusencia,
} from "../../services/absenceservice";
import { useNotificacoes } from "../../notificacoes/notificacoes";
import { useTheme } from "../../theme/tema";
import { formatarIntervalo, isoLocal } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import Campo from "../ui/Campo";
import CartaoMetrica from "../ui/CartaoMetrica";
import { corDoEstado } from "./estiloAusencia";

const pedidoVazio = () => ({ type: "vacation", startDate: isoLocal(new Date()), endDate: isoLocal(new Date()), note: "" });

// Pode cancelar: um pendente, ou um aprovado que ainda não começou.
const podeCancelar = (a) => a.status === "pending" || (a.status === "approved" && a.startDate > isoLocal(new Date()));

// As ausências de quem tem a sessão (POST /absences, GET /absences/mine, cancelar) e o resumo do ano.
export default function MinhasAusencias({ token, userId }) {
  const tema = useTheme();
  const { versaoDados } = useNotificacoes();
  const ano = new Date().getFullYear();
  const [pedidos, setPedidos] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [recarga, setRecarga] = useState(0);
  const [form, setForm] = useState(pedidoVazio);
  const [formAberto, setFormAberto] = useState(false);
  const [aGuardar, setAGuardar] = useState(false);
  const [aCancelar, setACancelar] = useState(null);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    if (!userId) return;
    let ativo = true;
    Promise.all([listarMinhasAusencias(token), obterResumoAusencias(userId, ano, token)])
      .then(([lista, res]) => {
        if (!ativo) return;
        setPedidos(Array.isArray(lista) ? lista : []);
        setResumo(res);
      })
      .catch((err) => ativo && setErro(err.message || "Não foi possível carregar as ausências."))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [token, userId, ano, recarga, versaoDados]);

  const recarregar = () => {
    setCarregando(true);
    setRecarga((n) => n + 1);
  };

  const alterar = (campo) => (e) =>
    setForm((f) => {
      const novo = { ...f, [campo]: e.target.value };
      if (campo === "startDate" && novo.endDate < novo.startDate) novo.endDate = novo.startDate;
      return novo;
    });

  const enviar = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setAGuardar(true);
    try {
      const criado = await pedirAusencia(
        {
          type: form.type,
          startDate: form.startDate,
          endDate: form.endDate,
          ...(form.note.trim() ? { note: form.note.trim() } : {}),
        },
        token,
      );
      setSucesso(
        `Pedido enviado (${criado?.workingDays ?? "?"} ${criado?.workingDays === 1 ? "dia útil" : "dias úteis"}). Fica pendente até ser aprovado.`,
      );
      setForm(pedidoVazio());
      setFormAberto(false);
      recarregar();
    } catch (err) {
      setErro(err.message || "Não foi possível enviar o pedido.");
    } finally {
      setAGuardar(false);
    }
  };

  const cancelar = async (id) => {
    setErro("");
    setSucesso("");
    try {
      await cancelarAusencia(id, "", token);
      setACancelar(null);
      setSucesso("Pedido cancelado.");
      recarregar();
    } catch (err) {
      setErro(err.message || "Não foi possível cancelar o pedido.");
    }
  };

  const hoje = isoLocal(new Date());

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">As minhas ausências</h2>
          <p className={`mt-1 text-sm ${tema.muted}`}>Peça férias ou registe uma baixa. Os pedidos ficam pendentes até um administrador decidir.</p>
        </div>
        {!formAberto && (
          <button
            type="button"
            onClick={() => setFormAberto(true)}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold shadow-md transition ${tema.primaryBtn}`}
          >
            Pedir ausência
          </button>
        )}
      </div>

      {erro && <Alerta>{erro}</Alerta>}
      {sucesso && <Alerta tipo="sucesso">{sucesso}</Alerta>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CartaoMetrica titulo={`Férias em ${ano}`} valor={carregando ? "…" : `${resumo?.vacation ?? 0} dias`} descricao="Dias úteis aprovados." />
        <CartaoMetrica titulo={`Baixa em ${ano}`} valor={carregando ? "…" : `${resumo?.sick ?? 0} dias`} descricao="Dias úteis aprovados." />
        <CartaoMetrica titulo={`Outras em ${ano}`} valor={carregando ? "…" : `${resumo?.leave ?? 0} dias`} descricao="Dias úteis aprovados." />
      </div>

      {formAberto && (
        <form onSubmit={enviar} className={`space-y-4 rounded-2xl border p-5 ${tema.card}`}>
          <h3 className="font-semibold">Novo pedido</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Campo id="ausencia-tipo" label="Tipo" como="select" value={form.type} onChange={alterar("type")} disabled={aGuardar}>
              <option value="vacation">Férias</option>
              <option value="sick">Baixa médica</option>
              <option value="leave">Outra ausência</option>
            </Campo>
            <Campo
              id="ausencia-inicio"
              label="Primeiro dia"
              obrigatorio
              type="date"
              min={form.type === "vacation" ? hoje : undefined}
              value={form.startDate}
              onChange={alterar("startDate")}
              disabled={aGuardar}
            />
            <Campo
              id="ausencia-fim"
              label="Último dia"
              obrigatorio
              type="date"
              min={form.startDate}
              value={form.endDate}
              onChange={alterar("endDate")}
              disabled={aGuardar}
            />
            <Campo
              id="ausencia-nota"
              label="Nota (opcional, só os administradores a veem)"
              maxLength={1000}
              className="sm:col-span-3"
              value={form.note}
              onChange={alterar("note")}
              disabled={aGuardar}
            />
          </div>
          <p className={`text-xs ${tema.muted}`}>
            Contam só os dias úteis: fins de semana e feriados ficam de fora. As férias não podem começar no passado; uma
            baixa pode ser registada depois.
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={aGuardar}
              onClick={() => setFormAberto(false)}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${tema.secondaryBtn}`}
            >
              Cancelar
            </button>
            <button type="submit" disabled={aGuardar} className={`rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60 ${tema.primaryBtn}`}>
              {aGuardar ? "A enviar…" : "Enviar pedido"}
            </button>
          </div>
        </form>
      )}

      {carregando || pedidos.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center text-sm ${tema.card} ${tema.muted}`}>
          {carregando ? "A carregar pedidos…" : "Ainda não fez nenhum pedido de ausência."}
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((a) => (
            <article key={a.id} className={`rounded-2xl border p-4 sm:p-5 ${tema.card}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold">
                    {TIPOS_AUSENCIA[a.type] || a.type} · {formatarIntervalo(a.startDate, a.endDate)}
                  </p>
                  <p className={`mt-1 text-xs ${tema.muted}`}>
                    {a.workingDays} {a.workingDays === 1 ? "dia útil" : "dias úteis"}
                    {a.note ? ` · ${a.note}` : ""}
                  </p>
                  {a.decisionNote && <p className={`mt-1 text-xs ${tema.muted}`}>Motivo: {a.decisionNote}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className={`rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase ${corDoEstado(tema, a.status)}`}>
                    {ESTADOS_AUSENCIA[a.status] || a.status}
                  </span>
                  {podeCancelar(a) && aCancelar !== a.id && (
                    <button type="button" onClick={() => setACancelar(a.id)} className="text-xs font-semibold text-red-500 hover:underline">
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
              {aCancelar === a.id && (
                <div className={`mt-3 flex flex-col gap-2 border-t pt-3 sm:flex-row sm:items-center sm:justify-between ${tema.border}`}>
                  <span className={`text-xs ${tema.muted}`}>Cancelar este pedido? Para mudar as datas, cancele e peça de novo.</span>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setACancelar(null)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${tema.secondaryBtn}`}
                    >
                      Manter
                    </button>
                    <button
                      type="button"
                      onClick={() => cancelar(a.id)}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
                    >
                      Cancelar pedido
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
