import { useState } from "react";
import { useTheme } from "../../theme/tema";
import BarraOrcamento from "../financas/BarraOrcamento";
import BarrasMensais from "../financas/BarrasMensais";
import { corDaSerie } from "../financas/cores";
import Icone from "../ui/Icone";
import NivelCompetencia from "../ui/NivelCompetencia";

// Ecrãs da app com dados de demonstração, para a página pública. Os gráficos são os componentes
// verdadeiros do painel; o resto replica os ecrãs sem falar com o servidor.

const MESES_DEMO = [
  ["2026-01", 18400, 1200, 2100],
  ["2026-02", 18400, 2600, 2100],
  ["2026-03", 19100, 900, 2400],
  ["2026-04", 19100, 3100, 2100],
  ["2026-05", 19800, 1800, 2100],
  ["2026-06", 19800, 2200, 2600],
].map(([month, salaries, projectExpenses, overheadExpenses]) => ({ month, salaries, projectExpenses, overheadExpenses }));

const PROJETOS_DEMO = [
  ["Portal do Cliente", 64],
  ["App de Logística", 86],
  ["Migração para a cloud", 103],
];

const fino = (tema) => `rounded-xl border p-3 ${tema.card}`;
const eurosInteiros = (valor) => valor.toLocaleString("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export function EcraFinancas() {
  const tema = useTheme();
  const [visiveis, setVisiveis] = useState({ salaries: true, projectExpenses: true, overheadExpenses: true });
  const series = [
    { chave: "salaries", rotulo: "Salários", cor: corDaSerie(tema, 0) },
    { chave: "projectExpenses", rotulo: "Despesas de projeto", cor: corDaSerie(tema, 1) },
    { chave: "overheadExpenses", rotulo: "Despesas da empresa", cor: corDaSerie(tema, 2) },
  ];
  const total = MESES_DEMO.reduce((soma, m) => soma + series.filter((s) => visiveis[s.chave]).reduce((x, s) => x + m[s.chave], 0), 0);

  return (
    <div className="space-y-3 text-left">
      <div className="grid grid-cols-2 gap-3 2xl:grid-cols-4">
        <div className={`col-span-2 ${fino(tema)}`}>
          <p className={`text-[10px] font-semibold uppercase tracking-wider ${tema.muted}`}>Total do semestre</p>
          <p className="mt-1 text-2xl font-extrabold">{eurosInteiros(total)}</p>
        </div>
        {series.slice(1).map((s) => (
          <div key={s.chave} className={fino(tema)}>
            <p className={`flex items-center gap-1 text-[10px] font-semibold uppercase ${tema.muted}`}>
              <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: s.cor }} />
              {s.chave === "projectExpenses" ? "Projetos" : "Empresa"}
            </p>
            <p className="mt-1 text-sm font-bold">{eurosInteiros(MESES_DEMO.reduce((x, m) => x + m[s.chave], 0))}</p>
          </div>
        ))}
      </div>
      <BarrasMensais
        titulo="Custos por mês"
        meses={MESES_DEMO}
        series={series}
        visiveis={visiveis}
        onAlternar={(chave) => setVisiveis((v) => ({ ...v, [chave]: !v[chave] }))}
      />
    </div>
  );
}

export function EcraOrcamentos() {
  const tema = useTheme();
  return (
    <div className="space-y-3 text-left">
      <p className="text-sm font-bold">Orçamento dos projetos</p>
      {PROJETOS_DEMO.map(([nome, percentagem]) => (
        <div key={nome} className={fino(tema)}>
          <p className="mb-2 text-xs font-semibold">{nome}</p>
          <BarraOrcamento percentagem={percentagem} />
        </div>
      ))}
    </div>
  );
}

const DIAS = Array.from({ length: 35 }, (_, i) => i); // dezembro 2026 começa a uma terça (a segunda é a célula 0, vazia)
const FERIADOS = { 1: "Restauração", 8: "Imaculada Conceição", 24: "Véspera (fecho)", 25: "Natal" };
const FORA = { 21: ["Ana", "Rui"], 22: ["Ana", "Rui"], 23: ["Ana"], 28: ["Ana"], 29: ["Ana", "Marta"], 30: ["Marta"], 9: ["Bruno"], 10: ["Bruno"] };

export function EcraCalendario() {
  const tema = useTheme();
  return (
    <div className="text-left">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold">Calendário</p>
        <p className={`text-xs font-semibold ${tema.muted}`}>‹ Dezembro de 2026 ›</p>
      </div>
      <div className={`overflow-hidden rounded-xl border ${tema.card}`}>
        <div className={`grid grid-cols-7 border-b text-center text-[9px] font-semibold uppercase ${tema.tableHeader}`}>
          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
            <span key={d} className="py-1.5">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {DIAS.map((d, i) => {
            const valido = d >= 1 && d <= 31;
            return (
              <div key={i} className={`min-h-12 border-b border-r p-1 sm:min-h-14 ${tema.border} ${!valido ? "opacity-30" : i % 7 >= 5 || FERIADOS[d] ? tema.cardMuted : ""}`}>
                {valido && (
                  <>
                    <span className={`text-[10px] font-semibold ${FERIADOS[d] ? "text-red-500" : ""}`}>{d}</span>
                    {FERIADOS[d] && <span className="hidden truncate text-[8px] font-semibold text-red-500 sm:block">{FERIADOS[d]}</span>}
                    {(FORA[d] || []).map((nome) => (
                      <span key={nome} className={`mt-0.5 hidden truncate rounded border px-1 text-[8px] sm:block ${nome === "Bruno" ? tema.aviso : tema.sucesso}`}>
                        {nome}
                      </span>
                    ))}
                    {FORA[d] && <span className="mt-0.5 flex gap-0.5 sm:hidden">{FORA[d].map((n) => <span key={n} className="h-1 w-1 rounded-full bg-emerald-500" />)}</span>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const PEDIDOS = [
  ["Ana Silva", "Férias · 21/12 – 31/12", "7 dias úteis", "Natal com a família"],
  ["Rui Costa", "Férias · 21/12 – 22/12", "2 dias úteis", ""],
  ["Bruno Martins", "Baixa médica · 09/12 – 10/12", "2 dias úteis", "Com atestado"],
];

export function EcraAusencias() {
  const tema = useTheme();
  return (
    <div className="space-y-3 text-left">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold">Pedidos de ausência</p>
        <span className={`rounded-lg border px-2 py-1 text-[10px] font-semibold ${tema.active}`}>3 pendentes</span>
      </div>
      {PEDIDOS.map(([nome, tipo, dias, nota]) => (
        <div key={nome} className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ${fino(tema)}`}>
          <div className="min-w-0">
            <p className="text-xs font-semibold">{nome}</p>
            <p className="mt-0.5 text-[11px]">
              {tipo} · <span className={tema.muted}>{dias}</span>
            </p>
            {nota && <p className={`mt-0.5 text-[10px] ${tema.muted}`}>Nota: {nota}</p>}
          </div>
          <div className="flex shrink-0 gap-1.5">
            <span className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold ${tema.primaryBtn}`}>Aprovar</span>
            <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-semibold ${tema.secondaryBtn}`}>Recusar</span>
          </div>
        </div>
      ))}
    </div>
  );
}

const EQUIPA = [
  ["Ana Silva", "Frontend Developer", "React", 5, "Ativo"],
  ["Rui Costa", "Backend Developer", "Node.js", 4, "Ativo"],
  ["Marta Lopes", "UX Designer", "Figma", 4, "Ativo"],
  ["Bruno Martins", "DevOps", "Docker", 3, "Convite pendente"],
];

export function EcraEquipa() {
  const tema = useTheme();
  return (
    <div className="space-y-3 text-left">
      <p className="text-sm font-bold">Diretório de colaboradores</p>
      <div className={`overflow-hidden rounded-xl border ${tema.card}`}>
        {EQUIPA.map(([nome, cargo, skill, nivel, estado]) => (
          <div key={nome} className={`flex items-center justify-between gap-3 border-b px-3 py-2.5 last:border-b-0 ${tema.border}`}>
            <div className="flex min-w-0 items-center gap-2.5">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${tema.iconBox}`}>{nome[0]}</span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{nome}</p>
                <p className={`truncate text-[10px] ${tema.muted}`}>{cargo}</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <span className={`text-[10px] ${tema.muted}`}>{skill}</span>
              <NivelCompetencia nivel={nivel} />
            </div>
            <span className={`shrink-0 rounded-md border px-2 py-0.5 text-[9px] font-semibold uppercase ${estado === "Ativo" ? tema.sucesso : tema.aviso}`}>
              {estado}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const NOTIFICACOES = [
  ["Passou a gerir o projeto App de Logística", "agora"],
  ["O projeto Migração para a cloud já gastou 100% do orçamento", "há 5 min"],
  ["O seu pedido de férias de 21/12 a 31/12 foi aprovado", "há 1 h"],
  ["Foi submetida uma avaliação que pediu", "ontem"],
];

export function EcraAvisos() {
  const tema = useTheme();
  return (
    <div className="space-y-3 text-left">
      <div className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs ${tema.erro}`}>
        <Icone nome="megafone" className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-semibold">Manutenção hoje às 18h</p>
          <p className="mt-0.5 opacity-90">A plataforma fica indisponível durante 30 minutos.</p>
        </div>
      </div>
      <div className={`overflow-hidden rounded-xl border ${tema.card}`}>
        <div className={`flex items-center justify-between border-b px-3 py-2.5 ${tema.border}`}>
          <p className="text-xs font-semibold">Notificações</p>
        </div>
        {NOTIFICACOES.map(([texto, quando], i) => (
          <div key={texto} className={`flex items-start gap-2.5 border-b px-3 py-2.5 last:border-b-0 ${tema.border} ${i < 2 ? tema.cardMuted : ""}`}>
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${i < 2 ? "bg-emerald-500" : "bg-transparent"}`} />
            <div>
              <p className={`text-xs ${i < 2 ? "font-medium" : tema.muted}`}>{texto}</p>
              <p className={`text-[10px] ${tema.muted}`}>{quando}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
