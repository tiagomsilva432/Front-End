import { useState } from "react";
import PagRegistro from "./PagRegistro";

export default function AdmHome({ Usuario, onLogout }) {
  const [abaAtiva, setAbaAtiva] = useState("overview");
  const [isDark, setIsDark] = useState(true);

  // --- Dados Mockados do ERP ---
  const kpis = [
    { titulo: "Colaboradores Ativos", valor: "48", det: "+3 este mês" },
    {
      titulo: "Projetos em Andamento",
      valor: "12",
      det: "Alocação média: 85%",
    },
    { titulo: "Folha Salarial Base", valor: "€ 68.500", det: "Mês atual" },
  ];

  const colaboradores = [
    {
      id: 1,
      nome: "Ana Costa",
      email: "ana@empresa.com",
      cargo: "WORKER",
      salario: "€ 2.200",
    },
    {
      id: 2,
      nome: "Carlos Mendes",
      email: "carlos@empresa.com",
      cargo: "TEAM_LEADER",
      salario: "€ 3.100",
    },
    {
      id: 3,
      nome: "Mariana Rocha",
      email: "mariana@empresa.com",
      cargo: "WORKER",
      salario: "€ 1.950",
    },
  ];

  const projetos = [
    {
      id: 1,
      nome: "Redesign ERP Interno",
      responsavel: "Carlos Mendes",
      alocados: 4,
      inicio: "01/02/2026",
      status: "Ativo",
    },
    {
      id: 2,
      nome: "Portal do Colaborador",
      responsavel: "Mariana Rocha",
      alocados: 2,
      inicio: "15/03/2026",
      status: "Ativo",
    },
  ];

  const ciclosAvaliacao = [
    {
      id: 1,
      nome: "Q3 2026 - Avaliação de Desempenho",
      status: "Em Progresso",
      aderencia: "65%",
      prazo: "15/09/2026",
    },
    {
      id: 2,
      nome: "Q1 2026 - Avaliação de Desempenho",
      status: "Concluído",
      aderencia: "100%",
      prazo: "15/03/2026",
    },
  ];

  const menuItems = [
    { id: "overview", label: "Visão Geral", icon: "📊" },
    { id: "pessoas", label: "Gestão de Pessoas", icon: "👥" },
    { id: "projetos", label: "Projetos & Alocações", icon: "📁" },
    { id: "avaliacoes", label: "Ciclos de Avaliação", icon: "🔄" },
  ];

  return (
    <div
      className={`flex min-h-screen font-sans transition-colors duration-300 ${isDark ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-800"}`}
    >
      {/* Sidebar Lateral (Expande no Hover via Tailwind CSS) */}
      <aside className="group w-[76px] hover:w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between py-6 px-3 flex-shrink-0 transition-all duration-300 overflow-hidden relative z-50">
        <div className="space-y-8">
          {/* Logo / Header da Sidebar */}
          <div className="px-3 flex items-center gap-4 overflow-hidden whitespace-nowrap">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
              <span className="font-bold text-emerald-400">E</span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="font-bold text-emerald-400 text-lg tracking-wide">
                ERP Admin
              </span>
            </div>
          </div>

          {/* Menus de Navegação */}
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setAbaAtiva(item.id)}
                className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all ${
                  abaAtiva === item.id ||
                  (abaAtiva === "registro" && item.id === "pessoas")
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <span className="text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Rodapé da Sidebar (Ações e Utilizador) */}
        <div className="pt-4 border-t border-slate-800 space-y-4 overflow-hidden whitespace-nowrap">
          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            className="w-full py-3 px-3 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all flex items-center gap-4"
          >
            <span className="flex-shrink-0 text-xl">
              {isDark ? "☀️" : "🌙"}
            </span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {isDark ? "Modo Claro" : "Modo Escuro"}
            </span>
          </button>

          <div className="px-3 py-3 rounded-xl bg-black/20 border border-white/5 flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
              {Usuario?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-xs text-slate-300 font-medium truncate w-32">
                {Usuario?.email}
              </span>
              <button
                onClick={onLogout}
                className="text-left text-xs text-red-400 hover:underline font-semibold mt-1"
              >
                Terminar Sessão
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Área Principal de Conteúdo */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl transition-all duration-300">
        {/* Visão Geral */}
        {abaAtiva === "overview" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Painel Administrativo</h1>
              <p
                className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
              >
                Resumo global da organização e indicadores de gestão.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {kpis.map((kpi, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md"
                >
                  <p className="text-xs font-medium uppercase text-gray-400 tracking-wider">
                    {kpi.titulo}
                  </p>
                  <h2 className="text-2xl font-bold mt-2">{kpi.valor}</h2>
                  <p className="text-xs text-emerald-400 mt-1">{kpi.det}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gestão de Pessoas */}
        {abaAtiva === "pessoas" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">
                  Diretório de Colaboradores
                </h2>
                <p className="text-xs text-gray-400">
                  Gerencie contas e perfis de acesso.
                </p>
              </div>
              <button
                onClick={() => setAbaAtiva("registro")}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/30"
              >
                + Novo Colaborador
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead
                  className={`text-xs uppercase bg-black/20 ${isDark ? "text-gray-400" : "text-gray-600"}`}
                >
                  <tr>
                    <th className="px-6 py-4">Nome</th>
                    <th className="px-6 py-4">E-mail</th>
                    <th className="px-6 py-4">Cargo</th>
                    <th className="px-6 py-4">Salário Atual</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {colaboradores.map((colab) => (
                    <tr
                      key={colab.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold">{colab.nome}</td>
                      <td className="px-6 py-4 text-gray-400">{colab.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs rounded bg-white/10 border border-white/10">
                          {colab.cargo}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{colab.salario}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-emerald-400 hover:underline text-xs font-semibold">
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Formulário de Registo */}
        {abaAtiva === "registro" && (
          <div className="space-y-4">
            <button
              onClick={() => setAbaAtiva("pessoas")}
              className="text-sm text-gray-400 hover:text-white flex items-center gap-2 mb-4"
            >
              ← Voltar à Lista de Colaboradores
            </button>
            <PagRegistro onRegistroSucesso={() => setAbaAtiva("pessoas")} />
          </div>
        )}

        {/* Projetos & Alocações */}
        {abaAtiva === "projetos" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Projetos & Alocações</h2>
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl">
                Novo Projeto
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projetos.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-2xl border border-white/10 bg-white/5 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">{proj.nome}</h3>
                    <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {proj.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Início: {proj.inicio}</p>
                  <p className="text-sm">
                    Responsável:{" "}
                    <span className="font-semibold text-white">
                      {proj.responsavel}
                    </span>
                  </p>
                  <p className="text-sm text-gray-300">
                    Pessoas Alocadas: {proj.alocados} colaboradores
                  </p>
                  <button className="mt-2 w-full py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                    Gerir Alocações
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ciclos de Avaliação */}
        {abaAtiva === "avaliacoes" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">
                  Ciclos de Avaliação entre Pares
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Definição de aumentos com base em colaboração direta.
                </p>
              </div>
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl">
                Novo Ciclo
              </button>
            </div>

            <div className="space-y-4">
              {ciclosAvaliacao.map((ciclo) => (
                <div
                  key={ciclo.id}
                  className="p-5 rounded-2xl border border-white/10 bg-white/5 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold text-lg">{ciclo.nome}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Prazo: {ciclo.prazo} • Taxa de Resposta:{" "}
                      <span className="text-white font-semibold">
                        {ciclo.aderencia}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xs font-bold ${ciclo.status === "Em Progresso" ? "text-amber-400" : "text-emerald-400"}`}
                    >
                      {ciclo.status}
                    </span>
                    <button className="px-4 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                      {ciclo.status === "Em Progresso"
                        ? "Ver Respostas"
                        : "Ver Aumentos Aprovados"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
