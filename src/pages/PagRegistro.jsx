import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { authService } from "../services/authservice";

export default function PagRegistro({
  companyId: propCompanyId,
  onRegistroSucesso,
  isDark = false, // Por defeito inicia em Light Mode
}) {
  // Extração automática e limpa do companyId via Token JWT
  const token = localStorage.getItem("token") || "";
  let companyIdFromToken = "";
  if (token) {
    try {
      const decoded = jwtDecode(token);
      companyIdFromToken = decoded?.companyId || "";
    } catch (err) {
      console.error("Erro ao descodificar o token no registo:", err);
    }
  }

  const companyId = propCompanyId || companyIdFromToken;

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("employee");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    setSucesso("");

    if (!companyId) {
      setErro("Erro: Company ID não encontrado na sessão.");
      setLoading(false);
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setErro("Preenche o primeiro e o último nome do colaborador.");
      setLoading(false);
      return;
    }

    const payload = {
      companyId,
      email: email.trim(),
      role,
      profile: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      },
    };

    try {
      await authService.registrar(payload);

      setSucesso("Conta criada com sucesso!");
      setEmail("");
      setFirstName("");
      setLastName("");
      setRole("employee");

      if (onRegistroSucesso) {
        setTimeout(() => {
          onRegistroSucesso();
        }, 1500);
      }
    } catch (err) {
      setErro(err.message || "Ocorreu um erro ao comunicar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Mapeamento de estilos para Modo Claro e Modo Escuro
  const theme = {
    card: isDark
      ? "bg-slate-900 border-slate-800 text-white shadow-2xl"
      : "bg-white border-slate-200/80 text-slate-900 shadow-md",
    textMuted: isDark ? "text-slate-400" : "text-slate-500",
    label: isDark
      ? "text-slate-300 font-medium"
      : "text-slate-700 font-semibold",
    inputBg: isDark
      ? "bg-black/30 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500"
      : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:bg-white",
    errorBox: isDark
      ? "bg-red-500/10 border-red-500/30 text-red-400"
      : "bg-red-50 border-red-200 text-red-700",
    successBox: isDark
      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
      : "bg-emerald-50 border-emerald-200 text-emerald-800",
    primaryBtn: isDark
      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20",
  };

  return (
    <div
      className={`p-6 sm:p-8 rounded-2xl border space-y-6 max-w-xl mx-auto transition-all ${theme.card}`}
    >
      <div>
        <h2 className="text-xl font-bold">Criar Nova Conta na Empresa</h2>
        <p className={`text-xs mt-1 ${theme.textMuted}`}>
          Insere o nome e o e-mail do novo colaborador para enviar o convite.
        </p>
      </div>

      {erro && (
        <div
          className={`p-3 rounded-xl border text-xs font-medium ${theme.errorBox}`}
        >
          {erro}
        </div>
      )}

      {sucesso && (
        <div
          className={`p-3 rounded-xl border text-xs font-medium ${theme.successBox}`}
        >
          {sucesso}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="novo-empregado-primeiro-nome" className={`block text-xs mb-1.5 ${theme.label}`}>
              Primeiro nome
            </label>
            <input
              id="novo-empregado-primeiro-nome"
              type="text"
              required
              maxLength={100}
              autoComplete="given-name"
              placeholder="Ex.: Carla"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${theme.inputBg}`}
            />
          </div>
          <div>
            <label htmlFor="novo-empregado-ultimo-nome" className={`block text-xs mb-1.5 ${theme.label}`}>
              Último nome
            </label>
            <input
              id="novo-empregado-ultimo-nome"
              type="text"
              required
              maxLength={100}
              autoComplete="family-name"
              placeholder="Ex.: Mendes"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${theme.inputBg}`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="novo-empregado-email" className={`block text-xs mb-1.5 ${theme.label}`}>
            E-mail
          </label>
          <input
            id="novo-empregado-email"
            type="email"
            required
            autoComplete="email"
            placeholder="user@exemplo.pt"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${theme.inputBg}`}
          />
        </div>

        <div>
          <label className={`block text-xs mb-1.5 ${theme.label}`}>
            Função (Role)
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all cursor-pointer ${theme.inputBg}`}
          >
            <option value="employee">Colaborador</option>
          </select>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-sm font-semibold rounded-xl transition-all shadow-lg disabled:opacity-50 cursor-pointer ${theme.primaryBtn}`}
          >
            {loading ? "A criar conta..." : "Criar Conta"}
          </button>
        </div>
      </form>
    </div>
  );
}
