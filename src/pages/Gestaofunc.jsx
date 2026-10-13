export default function GestaoPessoasView({
  companyId,
  onNovoColaborador,
  isDark = true,
}) {
  const theme = {
    card: isDark
      ? "border-slate-800 bg-[#0b0f19] text-slate-100"
      : "border-slate-200 bg-white text-slate-900",
    muted: isDark ? "text-slate-400" : "text-slate-500",
    chip: isDark
      ? "border-slate-700 bg-slate-900 text-slate-300"
      : "border-slate-200 bg-slate-50 text-slate-600",
  };

  return (
    <section className="w-full space-y-5">
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Diretório de colaboradores</h1>
          <p className={`mt-1 text-sm ${theme.muted}`}>
            A lista será carregada da empresa associada à sessão.
          </p>
        </div>
        <button
          type="button"
          onClick={onNovoColaborador}
          className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto"
        >
          + Novo colaborador
        </button>
      </header>

      <div className={`rounded-2xl border p-5 sm:p-6 ${theme.card}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Pré-visualização dos dados</h2>
            <p className={`mt-1 text-sm leading-6 ${theme.muted}`}>
              O endpoint de listagem de colaboradores ainda não está disponível. A tabela será preenchida quando o back-end fornecer estes campos.
            </p>
          </div>
          <span className={`w-fit rounded-lg border px-3 py-1.5 text-xs ${theme.chip}`}>
            {companyId ? "Empresa identificada" : "A aguardar empresa da sessão"}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {["id", "name", "email", "role", "status", "salary"].map((field) => (
            <span key={field} className={`rounded-lg border px-2.5 py-1.5 font-mono text-xs ${theme.chip}`}>
              {field}
            </span>
          ))}
        </div>

        <div className={`mt-5 overflow-x-auto rounded-xl border ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className={isDark ? "bg-slate-900 text-slate-400" : "bg-slate-50 text-slate-600"}>
              <tr>
                {["Nome", "E-mail", "Cargo", "Estado", "Salário"].map((label) => (
                  <th key={label} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className={`px-4 py-10 text-center text-sm ${theme.muted}`}>
                  Sem dados para apresentar até a API de colaboradores estar ligada.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
