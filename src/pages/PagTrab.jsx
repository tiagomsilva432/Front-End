import { useState } from "react";

export default function FuncHome({ Usuario, onLogout }) {
  const [abaAtiva, setAbaAtiva] = useState("overview");
  const [isDark, setIsDark] = useState(true);

  // Dados mockados estruturados conforme os endpoints do MVP
  const projetosAlocados = [
    {
      id: 1,
      nome: "Redesign ERP Interno",
      responsavel: "Carlos Mendes",
      percentagem: 60,
      dataInicio: "01/02/2026",
      dataFim: "30/11/2026",
      colegas: ["Ana Costa", "Pedro Silva"],
    },
    {
      id: 2,
      nome: "Portal do Colaborador",
      responsavel: "Mariana Rocha",
      percentagem: 40,
      dataInicio: "15/03/2026",
      dataFim: "15/12/2026",
      colegas: ["João Bento", "Sofia Lima"],
    },
  ];

  const historicoSalarios = [
    {
      data: "01/01/2026",
      valor: "€ 2.200",
      motivo: "Aumento por Avaliação de Pares",
    },
    { data: "01/06/2025", valor: "€ 1.950", motivo: "Ajuste de Categoria" },
    { data: "15/01/2025", valor: "€ 1.800", motivo: "Contratação Inicial" },
  ];

  const competencias = [
    { nome: "React / Frontend", nivel: "Avançado" },
    { nome: "TypeScript & Node.js", nivel: "Intermédio" },
    { nome: "Arquitetura REST API", nivel: "Intermédio" },
  ];

  const avaliacaoPendente = {
    ciclo: "Q3 2026 - Avaliação de Desempenho",
    prazo: "15/09/2026",
    colegasParaAvaliar: [
      {
        id: 101,
        nome: "Ana Costa",
        projeto: "Redesign ERP Interno",
        avaliado: false,
      },
      {
        id: 102,
        nome: "Pedro Silva",
        projeto: "Redesign ERP Interno",
        avaliado: true,
      },
    ],
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 ${
        isDark ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-800"
      }`}
    >
      {/* Navbar Superior */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex justify-between items-center text-xs">
        <div className="flex items-center gap-6">
          <span className="font-bold text-blue-400 text-sm">ERP Software</span>
          <div className="flex gap-4">
            <button
              onClick={() => setAbaAtiva("overview")}
              className={`font-semibold ${
                abaAtiva === "overview"
                  ? "text-blue-400 border-b-2 border-blue-400 pb-1"
                  : "text-slate-400"
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setAbaAtiva("projetos")}
              className={`font-semibold ${
                abaAtiva === "projetos"
                  ? "text-blue-400 border-b-2 border-blue-400 pb-1"
                  : "text-slate-400"
              }`}
            >
              Meus Projetos
            </button>
            <button
              onClick={() => setAbaAtiva("avaliacoes")}
              className={`font-semibold ${
                abaAtiva === "avaliacoes"
                  ? "text-blue-400 border-b-2 border-blue-400 pb-1"
                  : "text-slate-400"
              }`}
            >
              Avaliação entre Pares
            </button>
            <button
              onClick={() => setAbaAtiva("perfil")}
              className={`font-semibold ${
                abaAtiva === "perfil"
                  ? "text-blue-400 border-b-2 border-blue-400 pb-1"
                  : "text-slate-400"
              }`}
            >
              Meu Perfil & Salário
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 hover:bg-white/20"
          >
            {isDark ? "☀️ Claro" : "🌙 Escuro"}
          </button>
          <button onClick={onLogout} className="text-red-400 hover:underline">
            Sair ({Usuario?.email})
          </button>
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Cabeçalho de Boas-Vindas */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Painel do Colaborador</h1>
            <p
              className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              Bem-vindo, {Usuario?.email?.split("@")[0]}
            </p>
          </div>
        </div>

        {/* Visão Geral (Overview) */}
        {abaAtiva === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                <p className="text-xs font-medium uppercase text-gray-400">
                  Projetos Ativos
                </p>
                <h2 className="text-2xl font-bold mt-2">
                  {projetosAlocados.length}
                </h2>
                <p className="text-xs text-blue-400 mt-1">
                  100% do tempo alocado
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                <p className="text-xs font-medium uppercase text-gray-400">
                  Ciclo de Avaliação
                </p>
                <h2 className="text-2xl font-bold mt-2">Pendente (1/2)</h2>
                <p className="text-xs text-amber-400 mt-1">
                  Termina em {avaliacaoPendente.prazo}
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
                <p className="text-xs font-medium uppercase text-gray-400">
                  Salário Atual
                </p>
                <h2 className="text-2xl font-bold mt-2">
                  {historicoSalarios[0].valor}
                </h2>
                <p className="text-xs text-emerald-400 mt-1">
                  Última atualização: {historicoSalarios[0].data}
                </p>
              </div>
            </div>

            {/* Resumo de Alocações */}
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
              <h2 className="text-lg font-bold mb-4">
                Minhas Alocações Atuais
              </h2>
              <div className="space-y-4">
                {projetosAlocados.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">{proj.nome}</span>
                      <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {proj.percentagem}% do Tempo
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${proj.percentagem}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400">
                      Responsável: {proj.responsavel}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Meus Projetos e Alocações */}
        {abaAtiva === "projetos" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">
              Projetos & Equipas Partilhadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projetosAlocados.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-2xl border border-white/10 bg-white/5 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">{proj.nome}</h3>
                    <span className="text-xs text-blue-400 font-semibold">
                      {proj.percentagem}% Tempo
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Período: {proj.dataInicio} a {proj.dataFim}
                  </p>
                  <p className="text-xs text-gray-400">
                    Líder do Projeto:{" "}
                    <span className="text-white">{proj.responsavel}</span>
                  </p>

                  <div className="pt-2 border-t border-white/10">
                    <p className="text-xs font-semibold text-gray-300 mb-2">
                      Colegas no Projeto (Com quem trabalha):
                    </p>
                    <div className="flex gap-2">
                      {proj.colegas.map((colega, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10"
                        >
                          {colega}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Avaliação entre Pares */}
        {abaAtiva === "avaliacoes" && (
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-6">
            <div>
              <h2 className="text-xl font-bold">{avaliacaoPendente.ciclo}</h2>
              <p className="text-xs text-gray-400">
                Os aumentos salariais são decididos com base na avaliação dos
                colegas com quem partilhou projetos[cite: 20].
              </p>
            </div>

            <div className="space-y-4">
              {avaliacaoPendente.colegasParaAvaliar.map((colega) => (
                <div
                  key={colega.id}
                  className="p-4 rounded-xl bg-black/20 border border-white/5 flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-sm">{colega.nome}</p>
                    <p className="text-xs text-gray-400">
                      Projeto em comum: {colega.projeto}
                    </p>
                  </div>

                  {colega.avaliado ? (
                    <span className="text-xs text-emerald-400 font-semibold">
                      ✅ Avaliação Submetida
                    </span>
                  ) : (
                    <button className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 rounded-xl transition-all">
                      Avaliar Colega
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meu Perfil, Competências & Histórico Salarial */}
        {abaAtiva === "perfil" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Competências */}
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
              <h2 className="text-lg font-bold">Catálogo de Competências</h2>
              <div className="space-y-3">
                {competencias.map((comp, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-3 rounded-xl bg-black/20"
                  >
                    <span className="text-sm font-medium">{comp.nome}</span>
                    <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                      {comp.nivel}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Histórico Salarial */}
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4">
              <h2 className="text-lg font-bold">Histórico Salarial</h2>
              <div className="space-y-3">
                {historicoSalarios.map((hist, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-black/20 border border-white/5 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-sm text-emerald-400">
                        {hist.valor}
                      </p>
                      <p className="text-xs text-gray-400">{hist.motivo}</p>
                    </div>
                    <span className="text-xs text-gray-400">{hist.data}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
