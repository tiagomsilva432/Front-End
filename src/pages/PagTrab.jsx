import { useState } from "react";

const menuItems = [
  { id: "overview", label: "Visão geral", icon: "◫" },
  { id: "projetos", label: "Meus projetos", icon: "▤" },
  { id: "avaliacoes", label: "Avaliações", icon: "↗" },
  { id: "perfil", label: "Perfil e salário", icon: "◉" },
];

function DataPending({ title, description, fields, theme }) {
  return (
    <section className={`rounded-2xl border p-5 sm:p-6 ${theme.card}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.icon}`}>
          <span aria-hidden="true">◷</span>
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className={`mt-1 text-sm leading-6 ${theme.muted}`}>{description}</p>
        </div>
      </div>
      {fields?.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {fields.map((field) => (
            <span key={field} className={`rounded-lg border px-2.5 py-1.5 text-xs ${theme.field}`}>
              {field}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

function MetricCard({ label, description, theme }) {
  return (
    <div className={`rounded-2xl border p-5 sm:p-6 ${theme.card}`}>
      <p className={`text-xs font-semibold uppercase tracking-wide ${theme.muted}`}>
        {label}
      </p>
      <p className={`mt-3 text-2xl font-bold ${theme.pending}`}>—</p>
      <p className={`mt-2 text-xs leading-5 ${theme.muted}`}>{description}</p>
    </div>
  );
}

export default function FuncHome({ Usuario, onLogout }) {
  const [abaAtiva, setAbaAtiva] = useState("overview");
  const [isDark, setIsDark] = useState(true);

  const theme = {
    page: isDark ? "bg-[#070b14] text-slate-100" : "bg-slate-100 text-slate-900",
    sidebar: isDark ? "bg-[#0b0f19] border-slate-800" : "bg-white border-slate-200",
    card: isDark ? "bg-[#0b0f19] border-slate-800 shadow-xl shadow-black/10" : "bg-white border-slate-200 shadow-sm",
    muted: isDark ? "text-slate-400" : "text-slate-500",
    active: isDark ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-800",
    hover: isDark ? "hover:bg-slate-800/70" : "hover:bg-slate-100",
    icon: isDark ? "bg-slate-800 text-emerald-300" : "bg-emerald-50 text-emerald-700",
    field: isDark ? "border-slate-700 bg-slate-900 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600",
    pending: isDark ? "text-slate-300" : "text-slate-700",
    toggle: isDark ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  };

  const nome = Usuario?.email?.split("@")[0] || "Colaborador";
  const email = Usuario?.email || "E-mail não disponível";
  const cargo = Usuario?.role || "Cargo não disponível";

  const mudarTema = () => setIsDark((atual) => !atual);
  const mudarAba = (id) => setAbaAtiva(id);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${theme.page}`}>
      {/* Navegação compacta para telemóveis e tablets */}
      <header className={`sticky top-0 z-30 border-b px-4 py-3 backdrop-blur md:hidden ${theme.sidebar}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">Área do colaborador</p>
            <p className={`truncate text-xs ${theme.muted}`}>{email}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={mudarTema} aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"} className={`rounded-lg border px-3 py-2 text-xs ${theme.toggle}`}>
              {isDark ? "☀️" : "🌙"}
            </button>
            <button type="button" onClick={onLogout} className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10">
              Sair
            </button>
          </div>
        </div>
        <nav aria-label="Navegação principal" className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {menuItems.map((item) => (
            <button key={item.id} type="button" onClick={() => mudarAba(item.id)} aria-current={abaAtiva === item.id ? "page" : undefined} className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-medium ${abaAtiva === item.id ? theme.active : `border-transparent ${theme.muted} ${theme.hover}`}`}>
              <span aria-hidden="true" className="mr-1.5">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="flex min-h-[calc(100vh-0px)]">
        {/* Navegação lateral em ecrãs largos */}
        <aside className={`hidden w-64 shrink-0 flex-col justify-between border-r p-4 md:flex ${theme.sidebar}`}>
          <div>
            <div className="mb-8 flex items-center gap-3 px-2 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 font-bold text-emerald-500">OS</div>
              <div>
                <p className="font-bold">Área do colaborador</p>
                <p className={`text-xs ${theme.muted}`}>Grupo Os Silvas</p>
              </div>
            </div>
            <nav aria-label="Navegação principal" className="space-y-1.5">
              {menuItems.map((item) => (
                <button key={item.id} type="button" onClick={() => mudarAba(item.id)} aria-current={abaAtiva === item.id ? "page" : undefined} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition-colors ${abaAtiva === item.id ? theme.active : `border-transparent ${theme.muted} ${theme.hover}`}`}>
                  <span aria-hidden="true" className="w-5 text-center text-base">{item.icon}</span>{item.label}
                </button>
              ))}
            </nav>
          </div>
          <div className={`border-t pt-4 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
            <div className="mb-3 flex min-w-0 items-center gap-3 px-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-sm font-bold text-emerald-600">
                {email.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{email}</p>
                <p className={`text-xs ${theme.muted}`}>Colaborador</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={mudarTema} className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium ${theme.toggle}`}>
                {isDark ? "☀️ Modo claro" : "🌙 Modo escuro"}
              </button>
              <button type="button" onClick={onLogout} className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10">
                Sair
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <header>
              <p className={`text-xs font-semibold uppercase tracking-widest ${theme.muted}`}>Espaço pessoal</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Olá, {nome}</h1>
              <p className={`mt-2 text-sm ${theme.muted}`}>Consulte os seus projetos, avaliações e dados de perfil.</p>
            </header>

            {abaAtiva === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <MetricCard label="Projetos atribuídos" description="Este indicador será preenchido com as alocações da sua conta." theme={theme} />
                  <MetricCard label="Avaliações pendentes" description="As avaliações disponíveis aparecerão quando o módulo estiver ligado à API." theme={theme} />
                  <MetricCard label="Perfil" description="Dados associados à sua conta autenticada." theme={theme} />
                </div>
                <DataPending title="As suas alocações" description="Quando o endpoint de alocações estiver disponível, verá aqui os projetos, a percentagem de tempo, o responsável e o período previsto." fields={["Projeto", "Percentagem de alocação", "Responsável", "Datas", "Equipa"]} theme={theme} />
                <div className={`rounded-2xl border p-5 sm:p-6 ${theme.card}`}>
                  <h2 className="font-semibold">Conta</h2>
                  <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div><dt className={`text-xs ${theme.muted}`}>E-mail</dt><dd className="mt-1 break-all text-sm">{email}</dd></div>
                    <div><dt className={`text-xs ${theme.muted}`}>Cargo</dt><dd className="mt-1 text-sm">{cargo}</dd></div>
                  </dl>
                </div>
              </div>
            )}

            {abaAtiva === "projetos" && (
              <div className="space-y-5">
                <div><h2 className="text-xl font-bold sm:text-2xl">Meus projetos</h2><p className={`mt-1 text-sm ${theme.muted}`}>A lista será carregada a partir das suas alocações.</p></div>
                <DataPending title="Ainda sem projetos para apresentar" description="A estrutura desta área está preparada para receber os dados da API. Cada projeto poderá apresentar nome, cliente, estado, datas e percentagem de alocação." fields={["name", "clientName", "status", "startDate", "endDate", "allocation"]} theme={theme} />
              </div>
            )}

            {abaAtiva === "avaliacoes" && (
              <div className="space-y-5">
                <div><h2 className="text-xl font-bold sm:text-2xl">Avaliações entre pares</h2><p className={`mt-1 text-sm ${theme.muted}`}>As avaliações ficarão disponíveis quando os endpoints dos ciclos e pedidos forem implementados.</p></div>
                <DataPending title="Nenhuma avaliação carregada" description="Esta área deverá receber o ciclo ativo, prazo, colegas a avaliar e o estado de cada pedido." fields={["Ciclo", "Prazo", "Colega", "Projeto partilhado", "Estado"]} theme={theme} />
              </div>
            )}

            {abaAtiva === "perfil" && (
              <div className="space-y-5">
                <div><h2 className="text-xl font-bold sm:text-2xl">Perfil e salário</h2><p className={`mt-1 text-sm ${theme.muted}`}>Os dados de conta já disponíveis são apresentados abaixo; perfil profissional e histórico salarial dependem dos respetivos endpoints.</p></div>
                <div className={`rounded-2xl border p-5 sm:p-6 ${theme.card}`}>
                  <h3 className="font-semibold">Dados da conta</h3>
                  <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div><dt className={`text-xs ${theme.muted}`}>E-mail</dt><dd className="mt-1 break-all text-sm">{email}</dd></div>
                    <div><dt className={`text-xs ${theme.muted}`}>Cargo</dt><dd className="mt-1 text-sm">{cargo}</dd></div>
                  </dl>
                </div>
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  <DataPending title="Competências" description="O perfil poderá listar competências, categoria e nível quando a API de competências estiver ligada." fields={["Competência", "Categoria", "Nível"]} theme={theme} />
                  <DataPending title="Histórico salarial" description="O histórico será preenchido pelos registos de salário associados à sua conta." fields={["Valor", "Moeda", "Data de vigência", "Motivo"]} theme={theme} />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
