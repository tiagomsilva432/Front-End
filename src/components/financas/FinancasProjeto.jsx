import { useEffect, useState } from "react";
import { obterFinancasProjeto } from "../../services/financeservice";
import { useTheme } from "../../theme/tema";
import Alerta from "../ui/Alerta";
import Modal from "../ui/Modal";
import BarraOrcamento from "./BarraOrcamento";
import BarrasCategoria from "./BarrasCategoria";
import BarrasMensais from "./BarrasMensais";
import { corDaSerie, euros } from "./cores";
import ListaDespesas from "./ListaDespesas";

// Orçamento de um projeto (GET /projects/:id/finance) + as suas despesas.
// Para o gestor, includesLabour é false e não há labourCost: o custo em pessoas revelaria salários.
export default function FinancasProjeto({ projeto, token, onFechar }) {
  const tema = useTheme();
  const [financas, setFinancas] = useState(null);
  const [recarga, setRecarga] = useState(0);
  const [erro, setErro] = useState("");
  const [visiveis, setVisiveis] = useState({ expenses: true, labourCost: true });

  useEffect(() => {
    let ativo = true;
    obterFinancasProjeto(projeto.id, token)
      .then((f) => {
        if (!ativo) return;
        setFinancas(f);
        setErro("");
      })
      .catch((err) => ativo && setErro(err.message || "Não foi possível carregar as finanças do projeto."));
    return () => {
      ativo = false;
    };
  }, [projeto.id, token, recarga]);

  const comPessoas = Boolean(financas?.includesLabour);
  const series = [
    { chave: "expenses", rotulo: "Despesas", cor: corDaSerie(tema, 0) },
    ...(comPessoas ? [{ chave: "labourCost", rotulo: "Custo em pessoas", cor: corDaSerie(tema, 1) }] : []),
  ];
  const negativo = financas?.remaining !== null && Number(financas?.remaining) < 0;

  return (
    <Modal id="financas-projeto" titulo={`Finanças · ${projeto.name}`} subtitulo="Orçamento contra o que já se gastou, desde o início do projeto." onFechar={onFechar} largura="max-w-4xl">
      <div className="space-y-5">
        {erro && <Alerta>{erro}</Alerta>}

        <section className={`rounded-2xl border p-5 ${tema.border} ${tema.cardMuted}`}>
          <h3 className="mb-3 text-sm font-semibold">Orçamento</h3>
          {!financas ? (
            <p className={`text-sm ${tema.muted}`}>A carregar…</p>
          ) : (
            <>
              <BarraOrcamento percentagem={financas.budgetUsedPercent} />
              <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <dt className={`text-xs ${tema.muted}`}>Orçamento</dt>
                  <dd className="mt-1 text-lg font-bold">{euros(financas.budget)}</dd>
                </div>
                <div>
                  <dt className={`text-xs ${tema.muted}`}>Gasto</dt>
                  <dd className="mt-1 text-lg font-bold">{euros(financas.spent)}</dd>
                </div>
                <div>
                  <dt className={`text-xs ${tema.muted}`}>Restante</dt>
                  <dd className={`mt-1 text-lg font-bold ${negativo ? "text-red-500" : ""}`}>{euros(financas.remaining)}</dd>
                </div>
                <div>
                  <dt className={`text-xs ${tema.muted}`}>{comPessoas ? "Despesas · pessoas" : "Despesas"}</dt>
                  <dd className="mt-1 text-sm font-semibold">
                    {euros(financas.expenses)}
                    {comPessoas && <span className={tema.muted}> · {euros(financas.labourCost)}</span>}
                  </dd>
                </div>
              </dl>
              <p className={`mt-3 text-xs ${tema.muted}`}>
                {comPessoas
                  ? "O gasto inclui o custo das pessoas alocadas ao projeto."
                  : "Como gestor do projeto, vê apenas as despesas."}
              </p>
            </>
          )}
        </section>

        {financas && financas.months.length > 0 && (
          <BarrasMensais
            titulo="Gasto por mês"
            meses={financas.months}
            series={series}
            visiveis={visiveis}
            onAlternar={(chave) => setVisiveis((v) => ({ ...v, [chave]: !v[chave] }))}
          />
        )}

        {financas && <BarrasCategoria titulo="Despesas por categoria" porCategoria={financas.byCategory} />}

        <ListaDespesas token={token} projectId={projeto.id} onAlteradas={() => setRecarga((n) => n + 1)} />
      </div>
    </Modal>
  );
}
