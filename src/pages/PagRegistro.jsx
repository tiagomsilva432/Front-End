import { useState } from "react";
import { jwtDecode } from "jwt-decode";

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

    const payload = {
      companyId,
      email,
      role,
    };

    try {
      const response = await fetch(
        "http://localhost:3000/auth/account/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar a conta.");
      }

      setSucesso("Conta criada com sucesso!");
      setEmail("");
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
          Insere o e-mail e define a função para o novo colaborador.
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
        <div>
          <label className={`block text-xs mb-1.5 ${theme.label}`}>
            E-mail
          </label>
          <input
            type="email"
            required
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
