import { useEffect, useState } from "react";
import { CATEGORIAS_DESPESA } from "../../services/expenseservice";
import { obterPainelFinancas } from "../../services/financeservice";
import { useTheme } from "../../theme/tema";
import { ESTADOS_PROJETO, idDe } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import BarrasCategoria from "./BarrasCategoria";
import BarrasMensais from "./BarrasMensais";
import { ESTADO_ORCAMENTO, corDaSerie, estadoDoOrcamento, euros } from "./cores";
import FinancasProjeto from "./FinancasProjeto";
import ListaDespesas from "./ListaDespesas";

const mesDe = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const esteAno = () => {
  const ano = new Date().getFullYear();
  return { de: `${ano}-01`, ate: `${ano}-12` };
};
const ultimos12 = () => {
  const hoje = new Date();
  return { de: mesDe(new Date(hoje.getFullYear(), hoje.getMonth() - 11, 1)), ate: mesDe(hoje) };
};
const mesesEntre = (de, ate) => {
  const [a1, m1] = de.split("-").map(Number);
  const [a2, m2] = ate.split("-").map(Number);
  return (a2 - a1) * 12 + (m2 - m1) + 1;
};

// Painel de finanças da empresa (GET /finance/overview), só para admins.
export default function PainelFinancas({ token, projetos }) {
  const tema = useTheme();
  const [periodo, setPeriodo] = useState(esteAno);
  const [projetosEscolhidos, setProjetosEscolhidos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [painel, setPainel] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [recarga, setRecarga] = useState(0);
  const [erro, setErro] = useState("");
  const [visiveis, setVisiveis] = useState({ salaries: true, projectExpenses: true, overheadExpenses: true });
  const [ordem, setOrdem] = useState("desc");
  const [projetoAberto, setProjetoAberto] = useState(null);

  const intervaloValido = periodo.de && periodo.ate && periodo.de <= periodo.ate && mesesEntre(periodo.de, periodo.ate) <= 24;
  const chaveProjetos = projetosEscolhidos.join(",");
  const chaveCategorias = categorias.join(",");

  useEffect(() => {
    if (!intervaloValido) return;
    let ativo = true;
    obterPainelFinancas(token, {
      de: periodo.de,
      ate: periodo.ate,
      projectIds: chaveProjetos ? chaveProjetos.split(",") : [],
      categorias: chaveCategorias ? chaveCategorias.split(",") : [],
    })
      .then((p) => {
        if (!ativo) return;
        setPainel(p);
        setErro("");
      })
      .catch((err) => ativo && setErro(err.message || "Não foi possível carregar o painel de finanças."))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [token, periodo.de, periodo.ate, intervaloValido, chaveProjetos, chaveCategorias, recarga]);

  const mudar = (fn) => {
    setCarregando(true);
    fn();
  };
  const alternarLista = (lista, valor) => (lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor]);

  const series = [
    { chave: "salaries", rotulo: "Salários", cor: corDaSerie(tema, 0) },
    { chave: "projectExpenses", rotulo: "Despesas de projeto", cor: corDaSerie(tema, 1) },
    { chave: "overheadExpenses", rotulo: "Despesas da empresa", cor: corDaSerie(tema, 2) },
  ];
  // O total mostrado é a soma das séries visíveis (desligar uma não pede nada ao servidor).
  const totalVisivel = painel ? series.filter((s) => visiveis[s.chave]).reduce((soma, s) => soma + Number(painel.totals[s.chave]), 0) : 0;
  const porProjeto = painel
    ? [...painel.byProject].sort((a, b) => {
        const pa = a.budgetUsedPercent ?? -1;
        const pb = b.budgetUsedPercent ?? -1;
        return ordem === "desc" ? pb - pa : pa - pb;
      })
    : [];
  const chip = (ativo) => `rounded-lg border px-2.5 py-1 text-xs font-medium transition ${ativo ? tema.active : tema.secondaryBtn}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Finanças</h1>
        <p className={`mt-1 text-xs ${tema.muted}`}>Salários, despesas de projeto e despesas da empresa, mês a mês.</p>
      </div>

      {/* Filtros numa linha, por cima dos gráficos. */}
      <section className={`space-y-3 rounded-2xl border p-4 ${tema.card}`}>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-semibold">
            <span className={`mb-1 block ${tema.label}`}>De</span>
            <input
              type="month"
              value={periodo.de}
              onChange={(e) => mudar(() => setPeriodo((p) => ({ ...p, de: e.target.value })))}
              className={`rounded-xl border px-3 py-2 text-xs outline-none ${tema.input}`}
            />
          </label>
          <label className="text-xs font-semibold">
            <span className={`mb-1 block ${tema.label}`}>Até</span>
            <input
              type="month"
              value={periodo.ate}
              onChange={(e) => mudar(() => setPeriodo((p) => ({ ...p, ate: e.target.value })))}
              className={`rounded-xl border px-3 py-2 text-xs outline-none ${tema.input}`}
            />
          </label>
          <button type="button" onClick={() => mudar(() => setPeriodo(esteAno()))} className={chip(false)}>
            Este ano
          </button>
          <button type="button" onClick={() => mudar(() => setPeriodo(ultimos12()))} className={chip(false)}>
            Últimos 12 meses
          </button>
        </div>
        {!intervaloValido && <Alerta tipo="aviso">Escolha um intervalo de 1 a 24 meses, com o início antes do fim.</Alerta>}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs font-semibold ${tema.label}`}>Projetos:</span>
          <button type="button" aria-pressed={!projetosEscolhidos.length} onClick={() => mudar(() => setProjetosEscolhidos([]))} className={chip(!projetosEscolhidos.length)}>
            Todos
          </button>
          {projetos.map((p) => (
            <button
              key={idDe(p)}
              type="button"
              aria-pressed={projetosEscolhidos.includes(idDe(p))}
              onClick={() => mudar(() => setProjetosEscolhidos((l) => alternarLista(l, idDe(p))))}
              className={chip(projetosEscolhidos.includes(idDe(p)))}
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs font-semibold ${tema.label}`}>Categorias:</span>
          <button type="button" aria-pressed={!categorias.length} onClick={() => mudar(() => setCategorias([]))} className={chip(!categorias.length)}>
            Todas
          </button>
          {Object.entries(CATEGORIAS_DESPESA).map(([valor, rotulo]) => (
            <button
              key={valor}
              type="button"
              aria-pressed={categorias.includes(valor)}
              onClick={() => mudar(() => setCategorias((l) => alternarLista(l, valor)))}
              className={chip(categorias.includes(valor))}
            >
              {rotulo}
            </button>
          ))}
        </div>
        {(projetosEscolhidos.length > 0 || categorias.length > 0) && (
          <p className={`text-xs ${tema.muted}`}>Os filtros aplicam-se às despesas; os salários mostram sempre a empresa toda.</p>
        )}
      </section>

      {erro && <Alerta>{erro}</Alerta>}

      {!painel ? (
        <div className={`rounded-2xl border p-10 text-center text-sm ${tema.card} ${tema.muted}`}>A carregar o painel…</div>
      ) : (
        <div className={`space-y-6 ${carregando ? "opacity-60" : ""}`}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 2xl:grid-cols-[1.3fr_1fr_1fr_1fr]">
            <div className={`rounded-2xl border p-5 sm:col-span-3 sm:p-6 2xl:col-span-1 ${tema.card}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider ${tema.muted}`}>Total do período</p>
              <p className="mt-2 text-5xl font-extrabold">{euros(totalVisivel)}</p>
              <p className={`mt-2 text-xs ${tema.muted}`}>Soma das séries visíveis no gráfico.</p>
            </div>
            {series.map((s) => (
              <div key={s.chave} className={`rounded-2xl border p-5 ${tema.card}`}>
                <p className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${tema.muted}`}>
                  <span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.cor }} />
                  {s.rotulo}
                </p>
                <p className="mt-3 text-xl font-bold sm:text-2xl">{euros(painel.totals[s.chave])}</p>
              </div>
            ))}
          </div>

          <BarrasMensais
            titulo="Custos por mês"
            meses={painel.months}
            series={series}
            visiveis={visiveis}
            onAlternar={(chave) => setVisiveis((v) => ({ ...v, [chave]: !v[chave] }))}
          />

          <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
            <BarrasCategoria titulo="Despesas por categoria" porCategoria={painel.byCategory} descricao="Despesas de projeto e da empresa, no período." />
            <section className={`rounded-2xl border p-5 ${tema.card}`}>
              <h2 className="font-semibold">Salários não alocados</h2>
              <p className="mt-3 text-2xl font-bold">{euros(painel.unallocatedSalaries)}</p>
              <p className={`mt-2 text-xs leading-5 ${tema.muted}`}>
                A parte dos salários que não cabe a nenhum projeto (pessoas sem alocação, ou alocadas a menos de 100%).
              </p>
              <p className={`mt-3 border-t pt-3 text-xs leading-5 ${tema.border} ${tema.muted}`}>
                Os salários são o custo para a empresa, não o bruto: bruto ×{" "}
                {Number(painel.salaryCostFactor).toLocaleString("pt-PT", { maximumFractionDigits: 5 })} (14 meses + TSU).
              </p>
            </section>
          </div>

          <section className={`overflow-hidden rounded-2xl border ${tema.card}`}>
            <div className="flex items-center justify-between gap-3 p-5 pb-3">
              <h2 className="font-semibold">Projetos</h2>
              <p className={`text-xs ${tema.muted}`}>Clique num projeto para ver as finanças e as despesas.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[44rem] text-sm">
                <thead className={`border-y text-[11px] font-semibold uppercase tracking-wider ${tema.tableHeader}`}>
                  <tr>
                    <th className="px-5 py-3 text-left">Projeto</th>
                    <th className="px-5 py-3 text-right">Despesas no período</th>
                    <th className="px-5 py-3 text-right">Pessoas no período</th>
                    <th className="px-5 py-3 text-right">Gasto até hoje</th>
                    <th className="px-5 py-3 text-right" aria-sort={ordem === "desc" ? "descending" : "ascending"}>
                      <button type="button" onClick={() => setOrdem((o) => (o === "desc" ? "asc" : "desc"))} className="font-semibold uppercase hover:underline">
                        % do orçamento {ordem === "desc" ? "↓" : "↑"}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${tema.border}`}>
                  {porProjeto.length === 0 ? (
                    <tr>
                      <td colSpan="5" className={`px-5 py-8 text-center text-xs ${tema.muted}`}>
                        Sem projetos.
                      </td>
                    </tr>
                  ) : (
                    porProjeto.map((p) => {
                      const estado = estadoDoOrcamento(p.budgetUsedPercent);
                      const destaque = estado === "aviso" || estado === "critico";
                      return (
                        <tr key={p.projectId} className={`${tema.tableRowHover} ${destaque ? (tema.isDark ? "bg-amber-500/5" : "bg-amber-50/60") : ""}`}>
                          <td className="px-5 py-3">
                            <button
                              type="button"
                              onClick={() => setProjetoAberto({ id: p.projectId, name: p.projectName })}
                              className="text-left font-semibold hover:underline"
                            >
                              {p.projectName}
                            </button>
                            <span className={`ml-2 text-xs ${tema.muted}`}>{ESTADOS_PROJETO[p.status] || p.status}</span>
                          </td>
                          <td className="px-5 py-3 text-right tabular-nums">{euros(p.expenses)}</td>
                          <td className="px-5 py-3 text-right tabular-nums">{euros(p.labourCost)}</td>
                          <td className="px-5 py-3 text-right tabular-nums">
                            {euros(p.spentToDate)}
                            <span className={`block text-[11px] ${tema.muted}`}>de {euros(p.budget)}</span>
                          </td>
                          <td className="px-5 py-3 text-right tabular-nums">
                            {estado ? (
                              <span className="inline-flex items-center gap-1.5 font-semibold">
                                <span aria-hidden="true" style={{ color: ESTADO_ORCAMENTO[estado].cor }}>
                                  {ESTADO_ORCAMENTO[estado].icone}
                                </span>
                                {p.budgetUsedPercent.toLocaleString("pt-PT", { maximumFractionDigits: 1 })}%
                                <span className="sr-only"> · {ESTADO_ORCAMENTO[estado].rotulo}</span>
                              </span>
                            ) : (
                              <span className={tema.muted}>Sem orçamento</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      <ListaDespesas token={token} projetos={projetos} onAlteradas={() => mudar(() => setRecarga((n) => n + 1))} />

      {projetoAberto && <FinancasProjeto projeto={projetoAberto} token={token} onFechar={() => setProjetoAberto(null)} />}
    </div>
  );
}
