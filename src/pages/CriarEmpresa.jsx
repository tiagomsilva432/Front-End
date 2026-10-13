import { useState } from "react";
import { criarEmpresa } from "../services/companyservice";

export default function CriarEmpresa({ token, onSucesso, isDark }) {
  const [form, setForm] = useState({
    name: "",
    taxId: "",
    email: "",
    country: "PT",
  });
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    try {
      await criarEmpresa(form, token);
      if (onSucesso) onSucesso();
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  const theme = {
    card: isDark
      ? "bg-[#0b0f19] border-slate-800 text-white"
      : "bg-white border-slate-200 text-slate-800",
    inputBg: isDark
      ? "bg-slate-900 border-slate-800 text-white"
      : "bg-slate-50 border-slate-200 text-slate-800",
    primaryBtn: isDark
      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
      : "bg-emerald-600 hover:bg-emerald-700 text-white",
  };

  return (
    <div
      className={`mx-auto w-full max-w-lg rounded-2xl border p-5 shadow-xl sm:p-6 ${theme.card}`}
    >
      <h2 className="text-xl font-bold mb-4">Registar Nova Empresa</h2>

      {erro && (
        <div className={`mb-4 rounded-xl border p-3 text-xs ${isDark ? "border-red-500/20 bg-red-500/10 text-red-300" : "border-red-200 bg-red-50 text-red-700"}`}>
          ⚠️ {erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold mb-1">Nome da Empresa</label>
          <input
            type="text"
            required
            placeholder="Ex: Os Silvas, Lda."
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={`w-full p-2.5 rounded-xl border outline-none ${theme.inputBg}`}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">NIF (Tax ID)</label>
          <input
            type="text"
            placeholder="Ex: 500123456"
            value={form.taxId}
            onChange={(e) => setForm({ ...form, taxId: e.target.value })}
            className={`w-full p-2.5 rounded-xl border outline-none ${theme.inputBg}`}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">E-mail de Contacto</label>
          <input
            type="email"
            placeholder="Ex: geral@ossilvas.pt"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={`w-full p-2.5 rounded-xl border outline-none ${theme.inputBg}`}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Código do país (ISO)</label>
          <input
            type="text"
            maxLength={2}
            placeholder="PT"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            className={`w-full p-2.5 rounded-xl border outline-none ${theme.inputBg}`}
          />
        </div>

        <button
          type="submit"
          disabled={carregando}
          className={`w-full py-3 font-bold rounded-xl transition-all cursor-pointer ${theme.primaryBtn}`}
        >
          {carregando ? "A criar empresa..." : "Criar Empresa"}
        </button>
      </form>
    </div>
  );
}
