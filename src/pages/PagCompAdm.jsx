import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { authService } from "../services/authService";
import { listarProjetos } from "../services/projetoservice";
import PagRegistro from "./PagRegistro";
import CriarProjeto from "./CriarProjeto";

export default function AdmCompHome({
  companyId: propCompanyId,
  Usuario,
  onLogout,
}) {
  const [abaAtiva, setAbaAtiva] = useState("overview");
  const [isDark, setIsDark] = useState(true);

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroCargo, setFiltroCargo] = useState("TODOS");

  // Token e Identificador da Empresa seguro com jwt-decode
  const token = localStorage.getItem("token") || "";

  let companyIdFromToken = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      companyIdFromToken = decoded?.companyId;
    } catch (err) {
      console.error("Erro ao descodificar o token JWT:", err);
    }
  }

  const companyId = propCompanyId || Usuario?.companyId || companyIdFromToken;

  // --- Estados do Backend ---
  const [colaboradores, setColaboradores] = useState([]);
  const [projetos, setProjetos] = useState([]);

  const [carregando, setCarregando] = useState(() => Boolean(companyId));
  const [erroBackend, setErroBackend] = useState(null);

  // Efeito assíncrono para carregar colaboradores e projetos
  useEffect(() => {
    if (!companyId) return;

    let isMounted = true;

    async function buscarDadosDoServidor() {
      try {
        const [resColabs, resProjs] = await Promise.allSettled([
          authService.obterColaboradores
            ? authService.obterColaboradores(companyId)
            : Promise.resolve([]),
          listarProjetos(companyId, "", token),
        ]);

        if (!isMounted) return;

        if (
          resColabs.status === "fulfilled" &&
          Array.isArray(resColabs.value)
        ) {
          setColaboradores(resColabs.value);
        }
        if (resProjs.status === "fulfilled" && Array.isArray(resProjs.value)) {
          setProjetos(resProjs.value);
        } else if (resProjs.status === "rejected") {
          setErroBackend("Não foi possível carregar os projetos. Verifique a ligação à API.");
        }
        if (resColabs.status === "rejected") {
          setErroBackend("Não foi possível carregar os colaboradores.");
        }
      } catch (err) {
        console.error("Erro na comunicação com a API:", err);
        if (isMounted) {
          setErroBackend(
            "Erro ao carregar os dados do servidor. Verifique a sua ligação.",
          );
        }
      } finally {
        if (isMounted) {
          setCarregando(false);
        }
      }
    }

    buscarDadosDoServidor();

    return () => {
      isMounted = false;
    };
  }, [companyId, token]);

  // Função para recarregar dados manualmente
  const recarregarDados = async () => {
    if (!companyId) return;
    setCarregando(true);
    setErroBackend(null);

    try {
      const projetosAtualizados = await listarProjetos(companyId, "", token);
      if (Array.isArray(projetosAtualizados)) setProjetos(projetosAtualizados);
    } catch (err) {
      console.error("Erro ao recarregar dados:", err);
      setErroBackend("Não foi possível atualizar a lista.");
    } finally {
      setCarregando(false);
    }
  };

  const handleRegistroSucesso = (novoColaborador) => {
    if (novoColaborador && typeof novoColaborador === "object") {
      setColaboradores((prev) => [novoColaborador, ...prev]);
    } else {
      recarregarDados();
    }
    setAbaAtiva("pessoas");
  };

  const handleProjetoCriado = () => {
    recarregarDados();
    setAbaAtiva("projetos");
  };

  const folhaSalarialTotal = colaboradores.reduce(
    (acc, item) => acc + (Number(item.salario) || 0),
    0,
  );

  const colaboradoresDisponiveis = typeof authService.obterColaboradores === "function";
  const kpis = [
    {
      titulo: "Colaboradores Ativos",
      valor: colaboradoresDisponiveis
        ? carregando
          ? "..."
          : colaboradores.length
        : "—",
      det: colaboradoresDisponiveis
        ? "Registados na empresa"
        : "Aguardando endpoint de colaboradores",
    },
    {
      titulo: "Projetos ativos",
      valor: carregando ? "..." : projetos.filter((projeto) => projeto.status === "active").length,
      det: "Com estado ativo na base de dados",
    },
    {
      titulo: "Folha Salarial Base",
      valor: colaboradoresDisponiveis
        ? carregando
          ? "..."
          : `€ ${folhaSalarialTotal.toLocaleString("pt-PT")}`
        : "—",
      det: colaboradoresDisponiveis
        ? "Total do mês atual"
        : "Aguardando dados salariais da API",
    },
  ];

  const menuItems = [
    { id: "overview", label: "Visão Geral", icon: "📊" },
    { id: "pessoas", label: "Gestão de Pessoas", icon: "👥" },
    { id: "projetos", label: "Projetos & Alocações", icon: "📁" },
    { id: "avaliacoes", label: "Ciclos de Avaliação", icon: "🔄" },
  ];

  const formatarSalario = (valor) => {
    if (valor === undefined || valor === null || valor === "") return "—";
    if (typeof valor === "string" && valor.includes("€")) return valor;
    return `€ ${Number(valor).toLocaleString("pt-PT", { minimumFractionDigits: 0 })}`;
  };

  const colaboradoresFiltrados = colaboradores.filter((item) => {
    const nomeOuEmail = `${item.nome || ""} ${item.email || ""}`.toLowerCase();
    const atendeBusca = nomeOuEmail.includes(busca.toLowerCase());
    const atendeCargo =
      filtroCargo === "TODOS" || (item.role || item.cargo) === filtroCargo;
    return atendeBusca && atendeCargo;
  });

  const theme = {
    bg: isDark
      ? "bg-[#070b14] text-slate-100"
      : "bg-slate-100/80 text-slate-800",
    sidebar: isDark
      ? "bg-[#0b0f19] border-slate-800/80"
      : "bg-slate-50 border-slate-200/80 shadow-sm",
    sidebarHover: isDark ? "hover:bg-slate-800/60" : "hover:bg-slate-200/60",
    sidebarActive: isDark
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : "bg-emerald-100/70 text-emerald-800 border-emerald-300/80 font-semibold",
    card: isDark
      ? "bg-[#0b0f19] border-slate-800/80 shadow-2xl"
      : "bg-white border-slate-200/70 shadow-sm",
    cardMuted: isDark ? "bg-black/20" : "bg-slate-50",
    textMuted: isDark ? "text-slate-400" : "text-slate-500",
    border: isDark ? "border-slate-800" : "border-slate-200/80",
    tableHeader: isDark
      ? "bg-[#0e1321] text-slate-400 border-slate-800"
      : "bg-slate-50 text-slate-600 border-slate-200/80",
    tableRowHover: isDark ? "hover:bg-slate-800/30" : "hover:bg-slate-50/80",
    inputBg: isDark
      ? "bg-slate-900 border-slate-800 text-white focus:border-emerald-500"
      : "bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-600",
    primaryBtn: isDark
      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10",
  };

  return (
      <div
      className={`flex min-h-screen flex-col font-sans transition-colors duration-300 md:flex-row ${theme.bg}`}
    >
      <header className={`sticky top-0 z-40 border-b p-4 backdrop-blur md:hidden ${theme.sidebar}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">ERP Empresa</p>
            <p className={`truncate text-xs ${theme.textMuted}`}>{Usuario?.email || "Administrador da empresa"}</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button type="button" onClick={() => setIsDark(!isDark)} aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"} className={`rounded-lg border px-3 py-2 text-xs ${isDark ? "border-slate-700 bg-slate-900 text-slate-200" : "border-slate-200 bg-white text-slate-700"}`}>
              {isDark ? "☀️" : "🌙"}
            </button>
            {onLogout && <button type="button" onClick={onLogout} className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-500">Sair</button>}
          </div>
        </div>
        <nav aria-label="Navegação principal" className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {menuItems.map((item) => (
            <button key={item.id} type="button" onClick={() => setAbaAtiva(item.id)} aria-current={abaAtiva === item.id ? "page" : undefined} className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-medium ${abaAtiva === item.id || (abaAtiva === "registro" && item.id === "pessoas") || (abaAtiva === "criar-projeto" && item.id === "projetos") ? theme.sidebarActive : `border-transparent ${theme.textMuted} ${theme.sidebarHover}`}`}>
              <span className="mr-1.5" aria-hidden="true">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Sidebar Lateral */}
      <aside
        className={`hidden w-64 flex-shrink-0 flex-col justify-between overflow-y-auto border-r px-3 py-6 md:flex ${theme.sidebar}`}
      >
        <div className="space-y-8">
          <div className="px-3 flex items-center gap-4 overflow-hidden whitespace-nowrap">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                isDark
                  ? "bg-emerald-500/20 border-emerald-500/30"
                  : "bg-emerald-100 border-emerald-300"
              }`}
            >
              <span
                className={`font-bold ${isDark ? "text-emerald-400" : "text-emerald-700"}`}
              >
                E
              </span>
            </div>
            <div>
              <span
                className={`font-bold text-lg tracking-wide ${isDark ? "text-emerald-400" : "text-emerald-700"}`}
              >
                ERP Empresa
              </span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setAbaAtiva(item.id)}
                className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl border transition-all cursor-pointer ${
                  abaAtiva === item.id ||
                  (abaAtiva === "registro" && item.id === "pessoas") ||
                  (abaAtiva === "criar-projeto" && item.id === "projetos")
                    ? theme.sidebarActive
                    : `border-transparent ${theme.textMuted}${theme.sidebarHover}`
                }`}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <span className="text-sm font-medium whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Rodapé da Sidebar */}
        <div
          className={`pt-4 border-t space-y-3 overflow-hidden whitespace-nowrap ${theme.border}`}
        >
          <button
            type="button"
            onClick={() => setIsDark(!isDark)}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center gap-4 cursor-pointer ${
              isDark
                ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span className="flex-shrink-0 text-base">
              {isDark ? "☀️" : "🌙"}
            </span>
            <span>
              {isDark ? "Modo Claro" : "Modo Escuro"}
            </span>
          </button>

          <div
            className={`px-3 py-2.5 rounded-xl border flex items-center gap-3 ${theme.cardMuted} ${theme.border}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold border ${
                isDark
                  ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30"
                  : "bg-emerald-100 text-emerald-800 border-emerald-300"
              }`}
            >
              {Usuario?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="flex min-w-0 flex-col overflow-hidden">
              <span
                className={`text-xs font-medium truncate w-32 ${isDark ? "text-slate-200" : "text-slate-800"}`}
              >
                {Usuario?.email || "Sessão Ativa"}
              </span>
              <button
                onClick={onLogout}
                className="text-left text-[11px] text-red-500 hover:underline font-semibold mt-0.5 cursor-pointer"
              >
                Terminar Sessão
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="min-w-0 w-full max-w-7xl flex-1 overflow-y-auto p-4 transition-all duration-300 sm:p-6 lg:p-8">
        {erroBackend && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex justify-between items-center">
            <span>⚠️ {erroBackend}</span>
            <button
              onClick={recarregarDados}
              className="font-bold underline cursor-pointer ml-2"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* 1. VISÃO GERAL */}
        {abaAtiva === "overview" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Painel Administrativo</h1>
              <p className={`text-xs mt-1 ${theme.textMuted}`}>
                Indicadores e informação da empresa.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {kpis.map((kpi, idx) => (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl border transition-all ${theme.card}`}
                >
                  <p
                    className={`text-xs font-semibold uppercase tracking-wider ${theme.textMuted}`}
                  >
                    {kpi.titulo}
                  </p>
                  <h2 className="text-3xl font-extrabold mt-3">{kpi.valor}</h2>
                  <p
                    className={`text-xs font-medium mt-2 ${isDark ? "text-emerald-400" : "text-emerald-700"}`}
                  >
                    {kpi.det}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. GESTÃO DE PESSOAS */}
        {abaAtiva === "pessoas" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  Diretório de Colaboradores
                </h2>
                <p className={`text-xs mt-1 ${theme.textMuted}`}>
                  Gira as contas e os acessos da equipa.
                </p>
              </div>
              <button
                onClick={() => setAbaAtiva("registro")}
                className={`px-5 py-2.5 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer ${theme.primaryBtn}`}
              >
                + Novo Colaborador
              </button>
            </div>

            {/* Filtros */}
            <div
              className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-4 justify-between items-center ${theme.card}`}
            >
              <div className="relative w-full md:w-80">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-xs">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou e-mail..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs outline-none transition-all ${theme.inputBg}`}
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <span className={`text-xs font-medium ${theme.textMuted}`}>
                  Cargo:
                </span>
                <select
                  value={filtroCargo}
                  onChange={(e) => setFiltroCargo(e.target.value)}
                  className={`px-3 py-2 rounded-xl border text-xs outline-none cursor-pointer ${theme.inputBg}`}
                >
                  <option value="TODOS">Todos os Cargos</option>
                  <option value="employee">Colaborador</option>
                  <option value="company_admin">Administrador da empresa</option>
                </select>
              </div>
            </div>

            {/* Tabela de Colaboradores */}
            <div
              className={`rounded-2xl border overflow-hidden transition-all ${theme.card}`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead
                    className={`text-[11px] uppercase tracking-wider font-semibold border-b ${theme.tableHeader}`}
                  >
                    <tr>
                      <th className="px-6 py-4">Nome</th>
                      <th className="px-6 py-4">E-mail</th>
                      <th className="px-6 py-4">Cargo</th>
                      <th className="px-6 py-4">Salário Atual</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme.border}`}>
                    {carregando ? (
                      <tr>
                        <td
                          colSpan="5"
                          className={`px-6 py-12 text-center text-xs ${theme.textMuted}`}
                        >
                          A carregar dados do servidor...
                        </td>
                      </tr>
                    ) : colaboradoresFiltrados.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className={`px-6 py-12 text-center text-xs ${theme.textMuted}`}
                        >
                          {colaboradoresDisponiveis
                            ? "Nenhum colaborador encontrado para os filtros atuais."
                            : "A lista será carregada aqui quando o endpoint de colaboradores estiver disponível."}
                        </td>
                      </tr>
                    ) : (
                      colaboradoresFiltrados.map((colab) => (
                        <tr
                          key={colab.id || colab._id}
                          className={`transition-colors ${theme.tableRowHover}`}
                        >
                          <td className="px-6 py-4 font-semibold text-xs sm:text-sm">
                            {colab.nome || colab.name || "—"}
                          </td>
                          <td
                            className={`px-6 py-4 font-mono text-xs ${theme.textMuted}`}
                          >
                            {colab.email || "—"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase border ${
                                (colab.role || colab.cargo) === "company_admin"
                                  ? isDark
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    : "bg-amber-100/70 text-amber-800 border-amber-200"
                                  : (colab.role || colab.cargo) === "employee"
                                    ? isDark
                                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                      : "bg-emerald-100/70 text-emerald-800 border-emerald-200"
                                    : isDark
                                      ? "bg-slate-800/80 text-slate-300 border-slate-700"
                                      : "bg-slate-200/60 text-slate-700 border-slate-300/60"
                              }`}
                            >
                              {(colab.role || colab.cargo) === "company_admin"
                                ? "Administrador da empresa"
                                : (colab.role || colab.cargo) === "employee"
                                  ? "Colaborador"
                                  : colab.role || colab.cargo || "Cargo indisponível"}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold text-xs sm:text-sm">
                            {formatarSalario(colab.salario || colab.salary)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              className={`text-xs font-bold transition-colors cursor-pointer ${
                                isDark
                                  ? "text-emerald-400 hover:text-emerald-300"
                                  : "text-emerald-700 hover:text-emerald-800"
                              }`}
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Rodapé Tabela */}
              <div
                className={`px-6 py-3 border-t text-xs flex justify-between items-center ${theme.border} ${theme.cardMuted} ${theme.textMuted}`}
              >
                <span>
                  A mostrar {colaboradoresFiltrados.length} de{" "}
                  {colaboradores.length} colaboradores
                </span>
                <span>{colaboradoresDisponiveis ? "Dados da API" : "Endpoint pendente"}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. REGISTO DE NOVO COLABORADOR */}
        {abaAtiva === "registro" && (
          <div className="space-y-4">
            <button
              onClick={() => setAbaAtiva("pessoas")}
              className={`text-xs hover:underline flex items-center gap-2 mb-4 cursor-pointer ${theme.textMuted}`}
            >
              ← Voltar à Lista de Colaboradores
            </button>
            <PagRegistro
              companyId={companyId}
              isDark={isDark}
              onRegistroSucesso={handleRegistroSucesso}
            />
          </div>
        )}

        {/* 4. PROJETOS */}
        {abaAtiva === "projetos" && (
          <div className="space-y-6">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <h2 className="text-xl font-bold">Projetos & Alocações</h2>
              <button
                onClick={() => setAbaAtiva("criar-projeto")}
                className={`px-4 py-2 text-xs font-bold rounded-xl cursor-pointer ${theme.primaryBtn}`}
              >
                + Novo Projeto
              </button>
            </div>

            {projetos.length === 0 ? (
              <div
                className={`p-12 text-center rounded-2xl border ${theme.card} ${theme.textMuted} text-xs`}
              >
                Nenhum projeto registado no servidor.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {projetos.map((proj) => (
                  <div
                    key={proj.id || proj._id}
                    className={`p-6 rounded-2xl border space-y-4 ${theme.card}`}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-base">
                        {proj.name || proj.nome}
                      </h3>
                      <span
                        className={`text-[10px] px-2.5 py-1 font-bold rounded border ${
                          isDark
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-emerald-100/70 text-emerald-800 border-emerald-200"
                        }`}
                      >
                        {proj.status || "Ativo"}
                      </span>
                    </div>
                    <div className={`space-y-1 text-xs ${theme.textMuted}`}>
                      <p>
                        Cliente:{" "}
                        <span
                          className={
                            isDark ? "text-slate-200" : "text-slate-800"
                          }
                        >
                          {proj.clientName || "—"}
                        </span>
                      </p>
                      <p>
                        Início:{" "}
                        <span
                          className={
                            isDark ? "text-slate-200" : "text-slate-800"
                          }
                        >
                          {proj.startDate || proj.inicio || "—"}
                        </span>
                      </p>
                      <p>
                        Orçamento:{" "}
                        <span
                          className={`font-semibold ${isDark ? "text-emerald-400" : "text-emerald-700"}`}
                        >
                          {proj.budget
                            ? `€ ${Number(proj.budget).toLocaleString("pt-PT")}`
                            : "—"}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. CRIAR PROJETO */}
        {abaAtiva === "criar-projeto" && (
          <div className="space-y-4">
            <button
              onClick={() => setAbaAtiva("projetos")}
              className={`text-xs hover:underline flex items-center gap-2 mb-4 cursor-pointer ${theme.textMuted}`}
            >
              ← Voltar à Lista de Projetos
            </button>
            <CriarProjeto
              companyId={companyId}
              isDark={isDark}
              onSucesso={handleProjetoCriado}
            />
          </div>
        )}

        {/* 6. CICLOS DE AVALIAÇÃO */}
        {abaAtiva === "avaliacoes" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">Ciclos de Avaliação</h2>
              <p className={`text-xs mt-1 ${theme.textMuted}`}>
                Gestão de performance e aumentos salariais.
              </p>
            </div>
            <div
              className={`p-12 text-center rounded-2xl border ${theme.card} ${theme.textMuted} text-xs`}
            >
              Módulo de avaliações em desenvolvimento.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
