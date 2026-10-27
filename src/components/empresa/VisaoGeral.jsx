import { useEffect, useState } from "react";
import { TIPOS_AUSENCIA, listarAusencias } from "../../services/absenceservice";
import { obterCalendario } from "../../services/calendarservice";
import { obterPainelFinancas } from "../../services/financeservice";
import { listarCiclos, obterCiclo } from "../../services/reviewservice";
import { useNotificacoes } from "../../notificacoes/notificacoes";
import { useTheme } from "../../theme/tema";
import { idDe, isoLocal, nomeCompleto } from "../../utils/formatar";
import { corDoTipo } from "../ausencias/estiloAusencia";
import BarraOrcamento from "../financas/BarraOrcamento";
import BarrasMensais from "../financas/BarrasMensais";
import { corDaSerie, estadoDoOrcamento, euros } from "../financas/cores";
import CartaoMetrica from "../ui/CartaoMetrica";
import Icone from "../ui/Icone";

const MESES = 6;
const mesDe = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const saudacao = () => {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 20 ? "Boa tarde" : "Boa noite";
};

// Visão geral do company_admin: o resumo de tudo, com atalhos para cada aba.
// Cada bloco carrega à parte: se um pedido falhar, os outros continuam a aparecer.
export default function VisaoGeral({ token, pessoas, projetos, carregandoBase, nome, onIr, onAbrirFinancas }) {
  const tema = useTheme();
  const { versaoDados, versaoAnuncios } = useNotificacoes();
  const [dados, setDados] = useState({ ausencias: null, painel: null, hoje: null, ciclos: null });

  useEffect(() => {
    let ativo = true;
    const agora = new Date();
    const hoje = isoLocal(agora);
    Promise.allSettled([
      listarAusencias(token, { estado: "pending" }),
      obterPainelFinancas(token, { de: mesDe(new Date(agora.getFullYear(), agora.getMonth() - (MESES - 1), 1)), ate: mesDe(agora) }),
      obterCalendario(hoje, hoje, token),
      listarCiclos(token, true).then((ciclos) => Promise.all((ciclos || []).map((c) => obterCiclo(c.id, token)))),
    ]).then(([ausencias, painel, calendario, ciclos]) => {
      if (!ativo) return;
      const valor = (r) => (r.status === "fulfilled" ? r.value : undefined);
      setDados({
        ausencias: valor(ausencias) ?? [],
        painel: valor(painel) ?? false,
        hoje: valor(calendario)?.absences.filter((a) => a.status === "approved") ?? [],
        ciclos: valor(ciclos) ?? [],
      });
    });
    return () => {
      ativo = false;
    };
  }, [token, versaoDados, versaoAnuncios]);

  const [visiveis, setVisiveis] = useState({ salaries: true, projectExpenses: true, overheadExpenses: true });
  const pessoaPorId = new Map(pessoas.map((p) => [idDe(p), p]));
  const nomeDe = (id) => nomeCompleto(pessoaPorId.get(id)) || pessoaPorId.get(id)?.email || "Colaborador";

  const colaboradores = pessoas.filter((p) => p.role === "employee");
  const ativos = colaboradores.filter((p) => p.status === "active").length;
  const convites = colaboradores.filter((p) => p.status === "invited").length;
  const projetosAtivos = projetos.filter((p) => p.status === "active").length;
  const painel = dados.painel || null;
  const mesAtual = painel?.months?.[painel.months.length - 1];
  const emRisco = (painel?.byProject || [])
    .filter((p) => ["aviso", "critico"].includes(estadoDoOrcamento(p.budgetUsedPercent)))
    .sort((a, b) => b.budgetUsedPercent - a.budgetUsedPercent);
  const pendentesAvaliacao = (dados.ciclos || []).reduce((soma, c) => soma + (c.progress?.pending || 0), 0);
  const orcamentos = (painel?.byProject || [])
    .filter((p) => p.budgetUsedPercent !== null)
    .sort((a, b) => b.budgetUsedPercent - a.budgetUsedPercent)
    .slice(0, 4);

  const atencao = [
    dados.ausencias?.length > 0 && {
      icone: "relogio",
      texto: `${dados.ausencias.length} ${dados.ausencias.length === 1 ? "pedido de ausência" : "pedidos de ausência"} por decidir`,
      acao: "Decidir",
      aba: "ausencias",
    },
    emRisco.length > 0 && {
      icone: "moeda",
      texto: `${emRisco.length} ${emRisco.length === 1 ? "projeto acima" : "projetos acima"} de 80% do orçamento: ${emRisco.map((p) => p.projectName).join(", ")}`,
      acao: "Ver finanças",
      aba: "financas",
      grave: emRisco.some((p) => p.budgetUsedPercent >= 100),
    },
    convites > 0 && {
      icone: "pessoas",
      texto: `${convites} ${convites === 1 ? "convite ainda não aceite" : "convites ainda não aceites"}`,
      acao: "Ver equipa",
      aba: "pessoas",
    },
    pendentesAvaliacao > 0 && {
      icone: "avaliacao",
      texto: `${pendentesAvaliacao} ${pendentesAvaliacao === 1 ? "avaliação por responder" : "avaliações por responder"} em ${dados.ciclos.length} ${dados.ciclos.length === 1 ? "ciclo aberto" : "ciclos abertos"}`,
      acao: "Ver ciclos",
      aba: "avaliacoes",
    },
  ].filter(Boolean);
  const aCarregar = dados.ausencias === null;

  const series = [
    { chave: "salaries", rotulo: "Salários", cor: corDaSerie(tema, 0) },
    { chave: "projectExpenses", rotulo: "Despesas de projeto", cor: corDaSerie(tema, 1) },
    { chave: "overheadExpenses", rotulo: "Despesas da empresa", cor: corDaSerie(tema, 2) },
  ];
  const hojeTexto = new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-6">
      <div>
        <p className={`text-xs font-semibold uppercase tracking-widest ${tema.muted}`}>{hojeTexto.charAt(0).toUpperCase() + hojeTexto.slice(1)}</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
          {saudacao()}
          {nome ? `, ${nome}` : ""}
        </h1>
        <p className={`mt-1 text-sm ${tema.muted}`}>O resumo da empresa num só ecrã.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CartaoMetrica
          titulo="Colaboradores ativos"
          valor={carregandoBase ? "…" : ativos}
          descricao={convites ? `Mais ${convites} com convite pendente.` : "Todas as contas estão ativas."}
        />
        <CartaoMetrica
          titulo="Projetos ativos"
          valor={carregandoBase ? "…" : projetosAtivos}
          descricao={`De ${projetos.length} projetos registados.`}
        />
        <CartaoMetrica
          titulo="Custo este mês"
          valor={painel === null && dados.painel !== false ? "…" : euros(mesAtual?.total)}
          descricao="Salários e despesas, até hoje."
        />
        <CartaoMetrica
          titulo={`Custo dos últimos ${MESES} meses`}
          valor={painel === null && dados.painel !== false ? "…" : euros(painel?.totals?.total)}
          descricao="Inclui o custo real dos salários."
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className={`rounded-2xl border p-5 ${tema.card}`}>
          <h2 className="font-semibold">Precisa da sua atenção</h2>
          {aCarregar ? (
            <p className={`mt-4 text-sm ${tema.muted}`}>A carregar…</p>
          ) : atencao.length === 0 ? (
            <p className={`mt-4 flex items-center gap-2 text-sm ${tema.muted}`}>
              <span className={tema.accent} aria-hidden="true">✓</span> Está tudo em dia.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {atencao.map((item) => (
                <li key={item.aba} className={`flex items-center gap-3 rounded-xl border p-3 ${item.grave ? tema.erro : `${tema.border} ${tema.cardMuted}`}`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${item.grave ? "border-current" : tema.iconBox}`}>
                    <Icone nome={item.icone} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm">{item.texto}</span>
                  <button
                    type="button"
                    onClick={() => onIr(item.aba)}
                    className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold ${tema.secondaryBtn}`}
                  >
                    {item.acao}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={`rounded-2xl border p-5 ${tema.card}`}>
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold">Hoje fora</h2>
            <button type="button" onClick={() => onIr("calendario")} className={`text-xs font-semibold hover:underline ${tema.accent}`}>
              Calendário
            </button>
          </div>
          {dados.hoje === null ? (
            <p className={`mt-4 text-sm ${tema.muted}`}>A carregar…</p>
          ) : dados.hoje.length === 0 ? (
            <p className={`mt-4 text-sm ${tema.muted}`}>Está toda a gente hoje.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {dados.hoje.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{nomeDe(a.userId)}</span>
                  <span className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase ${corDoTipo(tema, a.type)}`}>
                    {TIPOS_AUSENCIA[a.type] || a.type}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {painel && (
        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <BarrasMensais
            titulo={`Custos dos últimos ${MESES} meses`}
            meses={painel.months}
            series={series}
            visiveis={visiveis}
            onAlternar={(chave) => setVisiveis((v) => ({ ...v, [chave]: !v[chave] }))}
          />
          <section className={`rounded-2xl border p-5 ${tema.card}`}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">Orçamentos</h2>
              <button type="button" onClick={() => onIr("financas")} className={`text-xs font-semibold hover:underline ${tema.accent}`}>
                Finanças
              </button>
            </div>
            {orcamentos.length === 0 ? (
              <p className={`mt-4 text-sm ${tema.muted}`}>Nenhum projeto tem orçamento definido.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {orcamentos.map((p) => (
                  <li key={p.projectId}>
                    <button
                      type="button"
                      onClick={() => onAbrirFinancas({ id: p.projectId, name: p.projectName })}
                      className="mb-1.5 flex w-full items-center justify-between gap-2 text-left text-sm hover:underline"
                    >
                      <span className="truncate font-medium">{p.projectName}</span>
                      <span className={`shrink-0 text-xs ${tema.muted}`}>
                        {euros(p.spentToDate)} de {euros(p.budget)}
                      </span>
                    </button>
                    <BarraOrcamento percentagem={p.budgetUsedPercent} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
      {dados.painel === false && (
        <p className={`rounded-2xl border p-5 text-sm ${tema.card} ${tema.muted}`}>Não foi possível carregar os números das finanças.</p>
      )}
    </div>
  );
}
