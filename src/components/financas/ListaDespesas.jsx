import { useEffect, useState } from "react";
import { CATEGORIAS_DESPESA, apagarDespesa, listarDespesas } from "../../services/expenseservice";
import { useTheme } from "../../theme/tema";
import { formatarData, idDe } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import Icone from "../ui/Icone";
import { euros } from "./cores";
import ModalDespesa from "./ModalDespesa";

// Despesas (GET /expenses), com criar, editar e apagar.
// Com `projectId`: as de um projeto (admins e gestor). Sem ele: a empresa toda (só admins), com o projeto de cada uma.
export default function ListaDespesas({ token, projectId, projetos = [], onAlteradas }) {
  const tema = useTheme();
  const [despesas, setDespesas] = useState([]);
  const [categoria, setCategoria] = useState("");
  const [soEmpresa, setSoEmpresa] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [recarga, setRecarga] = useState(0);
  const [emEdicao, setEmEdicao] = useState(null); // null | "nova" | despesa
  const [aApagar, setAApagar] = useState(null);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    let ativo = true;
    listarDespesas(token, { projectId, categoria, soEmpresa: !projectId && soEmpresa })
      .then((lista) => {
        if (!ativo) return;
        setDespesas(Array.isArray(lista) ? lista : []);
        setErro("");
      })
      .catch((err) => ativo && setErro(err.message || "Não foi possível carregar as despesas."))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [token, projectId, categoria, soEmpresa, recarga]);

  const recarregar = () => {
    setCarregando(true);
    setRecarga((n) => n + 1);
    onAlteradas?.();
  };

  const apagar = async (despesa) => {
    setErro("");
    setSucesso("");
    try {
      await apagarDespesa(despesa.id, token);
      setAApagar(null);
      setSucesso("Despesa apagada.");
      recarregar();
    } catch (err) {
      setErro(err.message || "Não foi possível apagar a despesa.");
    }
  };

  const nomeProjeto = (id) => projetos.find((p) => idDe(p) === id)?.name || "Projeto";
  const total = despesas.reduce((soma, d) => soma + Number(d.amount), 0);

  return (
    <section className={`space-y-4 rounded-2xl border p-5 ${tema.card}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Despesas</h2>
          <p className={`mt-1 text-xs ${tema.muted}`}>
            {carregando ? "A carregar…" : `${despesas.length} ${despesas.length === 1 ? "despesa" : "despesas"} · ${euros(total)}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filtrar por categoria"
            value={categoria}
            onChange={(e) => {
              setCarregando(true);
              setCategoria(e.target.value);
            }}
            className={`rounded-xl border px-3 py-2 text-xs outline-none ${tema.input}`}
          >
            <option value="">Todas as categorias</option>
            {Object.entries(CATEGORIAS_DESPESA).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </select>
          {!projectId && (
            <label className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold">
              <input
                type="checkbox"
                checked={soEmpresa}
                onChange={(e) => {
                  setCarregando(true);
                  setSoEmpresa(e.target.checked);
                }}
              />
              Só da empresa
            </label>
          )}
          <button
            type="button"
            onClick={() => setEmEdicao("nova")}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold shadow-md ${tema.primaryBtn}`}
          >
            <Icone nome="mais" className="h-3.5 w-3.5" />
            Registar despesa
          </button>
        </div>
      </div>

      {erro && <Alerta>{erro}</Alerta>}
      {sucesso && <Alerta tipo="sucesso">{sucesso}</Alerta>}

      {!carregando && despesas.length === 0 ? (
        <p className={`rounded-xl border p-6 text-center text-sm ${tema.border} ${tema.muted}`}>Ainda não há despesas registadas.</p>
      ) : (
        <ul className={`divide-y rounded-xl border ${tema.border}`}>
          {despesas.map((d) => (
            <li key={d.id} className={`px-4 py-3 ${tema.border}`}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{d.title}</p>
                  <p className={`mt-0.5 text-xs ${tema.muted}`}>
                    {formatarData(d.incurredOn)} · {CATEGORIAS_DESPESA[d.category] || d.category}
                    {!projectId && ` · ${d.projectId ? nomeProjeto(d.projectId) : "Empresa"}`}
                    {d.description ? ` · ${d.description}` : ""}
                  </p>
                  {d.receipts?.length > 0 && (
                    <p className={`mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] ${tema.muted}`}>
                      {d.receipts.map((r) => (
                        <a key={r.id} href={r.url} target="_blank" rel="noreferrer" className={`max-w-48 truncate font-semibold hover:underline ${tema.accent}`}>
                          📎 {r.name}
                        </a>
                      ))}
                      {d.receipts.some((r) => r.duplicateOwnerIds?.length) && (
                        <span className="font-semibold text-amber-500">⚠ Recibo também noutra despesa</span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="text-sm font-semibold tabular-nums">{euros(d.amount)}</span>
                  {aApagar !== d.id && (
                    <>
                      <button type="button" onClick={() => setEmEdicao(d)} className={`text-xs font-semibold hover:underline ${tema.accent}`}>
                        Editar
                      </button>
                      <button type="button" onClick={() => setAApagar(d.id)} className="text-xs font-semibold text-red-500 hover:underline">
                        Apagar
                      </button>
                    </>
                  )}
                </div>
              </div>
              {aApagar === d.id && (
                <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
                  <span className={`text-xs ${tema.muted}`}>Apagar esta despesa?</span>
                  <button type="button" onClick={() => setAApagar(null)} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${tema.secondaryBtn}`}>
                    Cancelar
                  </button>
                  <button type="button" onClick={() => apagar(d)} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500">
                    Apagar
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {emEdicao && (
        <ModalDespesa
          key={emEdicao === "nova" ? "nova" : emEdicao.id}
          despesa={emEdicao === "nova" ? null : emEdicao}
          outras={despesas}
          onAbrirOutra={setEmEdicao}
          projectId={projectId}
          projetos={projetos}
          token={token}
          onFechar={() => setEmEdicao(null)}
          onGuardada={(mensagem) => {
            setEmEdicao(null);
            setSucesso(mensagem);
            setErro("");
            recarregar();
          }}
        />
      )}
    </section>
  );
}
