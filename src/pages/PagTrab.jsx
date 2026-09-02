import { useState } from "react";

export default function FuncHome() {
  const [isDark, setIsDark] = useState(true);

  const infos = [
    {
      titulo: "Total Funcionários",
      valor: "48",
      det: "+3 este mês",
    },
    {
      titulo: "Projetos Ativos",
      valor: "12",
      det: "2 em prazo crítico",
    },
    {
      titulo: "Banco de Horas (Saldo)",
      valor: "+142h",
      det: "Acumulado equipa",
    },
    {
      titulo: "Folha Salarial (Mês)",
      valor: "€ 68.500",
      det: "Processamento dia 28",
    },
  ];
  /*
  const projetos = [
    { id: 1, nome: "Redesign ERP Interno", progresso: 75, prazo: "15/Nov", status: "Em Progresso" },
    { id: 2, nome: "Migração Banco de Dados", progresso: 40, prazo: "30/Nov", status: "Atrasado" },
    { id: 3, nome: "Portal do Colaborador", progresso: 90, prazo: "05/Nov", status: "Concluindo" },
  ];

  const eventos = [
    { id: 1, dia: "05", mes: "NOV", titulo: "Reunião Geral de Alinhamento", hora: "10:00" },
    { id: 2, dia: "12", mes: "NOV", titulo: "Entrega de Relatório Trimestral", hora: "17:00" },
    { id: 3, dia: "28", mes: "NOV", titulo: "Fecho de Processamento Salarial", hora: "18:00" },
  ];

  const funcionariosRecentes = [
    { id: 1, nome: "Ana Costa", cargo: "Desenvolvedora Frontend", salario: "€ 2.200", horas: "+5h" },
    { id: 2, nome: "Carlos Mendes", cargo: "Líder de Projeto", salario: "€ 3.100", horas: "-2h" },
    { id: 3, nome: "Mariana Rocha", cargo: "Designer UX/UI", salario: "€ 1.950", horas: "+12h" },
  ];
*/
  return (
    <div
      className={`min-h-screen font-sans p-6 transition-colors duration-300 ${isDark ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-800"}`}
    >
      <div className="max-27xl mx-auto flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Painel Func</h1>
          <p
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Visão geral
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsDark(!isDark)}
          className={`absolute top-6 right-6 px-4 py-2 rounded-full text-xs font-semibold shadow-md border transition-all flex items-center gap-2 ${
            isDark
              ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
              : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50"
          }`}
        >
          {isDark ? "☀️ Modo Claro" : "🌙 Modo Escuro"}
        </button>
      </div>
      <div>
        {infos.map((infos, chave) => (
          <div
            key={chave}
            className={`p-5 rounded-2xl border backdrop-blur-md relative overflow-hidden transition-all ${
              isDark
                ? "bg-white/5 border-white/10"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <p
              className={`text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              {infos.titulo}
            </p>
            <h2 className="text-2xl font-bold mt-2 mb-1">{infos.valor}</h2>
            <p className="text-xs text-emerald-400">{infos.det}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
