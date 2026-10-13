import { useState } from "react";
import { criarProjeto } from "../services/projetoservice";

const STATUS_PROJETO = [
  { value: "planned", label: "Planeado" },
  { value: "active", label: "Ativo" },
  { value: "on_hold", label: "Em pausa" },
  { value: "completed", label: "Concluído" },
  { value: "cancelled", label: "Cancelado" },
];

export default function CriarProjeto({ companyId, onSucesso, isDark = true }) {
  const [nome, setNome] = useState("");
  const [cliente, setCliente] = useState("");
  const [status, setStatus] = useState("planned");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [orcamento, setOrcamento] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

  const tema = {
    card: isDark
      ? "bg-slate-900 border-slate-800 text-white"
      : "bg-white border-gray-200 text-gray-900",
    texto: isDark ? "text-slate-400" : "text-gray-600",
    input: isDark
      ? "bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500"
      : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-emerald-600",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem({ tipo: "", texto: "" });

    if (!nome.trim()) {
      setMensagem({ tipo: "erro", texto: "O nome do projeto é obrigatório." });
      return;
    }

    if (!companyId) {
      setMensagem({
        tipo: "erro",
        texto: "Não foi possível identificar a empresa.",
      });
      return;
    }

    if (dataInicio && dataFim && dataFim < dataInicio) {
      setMensagem({
        tipo: "erro",
        texto: "A data de fim não pode ser anterior à data de início.",
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMensagem({
        tipo: "erro",
        texto: "A sessão expirou. Entre novamente.",
      });
      return;
    }

    const dadosProjeto = {
      companyId,
      name: nome.trim(),
      clientName: cliente.trim() || undefined,
      status,
      startDate: dataInicio || undefined,
      endDate: dataFim || undefined,
      budget: orcamento === "" ? undefined : Number(orcamento),
    };

    try {
      setCarregando(true);
      await criarProjeto(dadosProjeto, token);

      setMensagem({ tipo: "sucesso", texto: "Projeto criado com sucesso!" });
      setNome("");
      setCliente("");
      setStatus("planned");
      setDataInicio("");
      setDataFim("");
      setOrcamento("");
      if (onSucesso) onSucesso();
    } catch (err) {
      setMensagem({
        tipo: "erro",
        texto: err.message || "Não foi possível criar o projeto.",
      });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={`border p-6 rounded-3xl shadow-sm space-y-5 ${tema.card}`}>
      <div>
        <h2 className="text-lg font-bold">Novo Projeto</h2>
        <p className={`text-xs mt-1 ${tema.text}`}>
          Os campos opcionais podem ser preenchidos mais tarde.
        </p>
      </div>

      {mensagem.texto && (
        <div
          role="status"
          className={`p-3 rounded-xl text-xs font-medium ${
            mensagem.tipo === "erro"
              ? "bg-red-500/10 text-red-400 border border-red-500/30"
              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
          }`}
        >
          {mensagem.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className={`block text-xs font-semibold uppercase mb-1 ${tema.text}`}
          >
            Nome do projeto *
          </label>
          <input
            type="text"
            required
            maxLength={150}
            placeholder="Ex.: Reestruturação do ERP"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={`w-full p-3 border rounded-xl text-sm outline-none ${tema.input}`}
          />
        </div>

        <div>
          <label
            className={`block text-xs font-semibold uppercase mb-1 ${tema.text}`}
          >
            Cliente
          </label>
          <input
            type="text"
            maxLength={150}
            placeholder="Nome do cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            className={`w-full p-3 border rounded-xl text-sm outline-none ${tema.input}`}
          />
        </div>

        <div>
          <label
            className={`block text-xs font-semibold uppercase mb-1 ${tema.text}`}
          >
            Estado
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`w-full p-3 border rounded-xl text-sm outline-none ${tema.input}`}
          >
            {STATUS_PROJETO.map((opcao) => (
              <option key={opcao.value} value={opcao.value}>
                {opcao.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              className={`block text-xs font-semibold uppercase mb-1 ${tema.text}`}
            >
              Data de início
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className={`w-full p-3 border rounded-xl text-sm outline-none ${tema.input}`}
            />
          </div>
          <div>
            <label
              className={`block text-xs font-semibold uppercase mb-1 ${tema.text}`}
            >
              Data de fim
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              min={dataInicio || undefined}
              className={`w-full p-3 border rounded-xl text-sm outline-none ${tema.input}`}
            />
          </div>
        </div>

        <div>
          <label
            className={`block text-xs font-semibold uppercase mb-1 ${tema.text}`}
          >
            Orçamento (€)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Ex.: 12500,00"
            value={orcamento}
            onChange={(e) => setOrcamento(e.target.value)}
            className={`w-full p-3 border rounded-xl text-sm outline-none ${tema.input}`}
          />
        </div>

        <button
          type="submit"
          disabled={carregando}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50"
        >
          {carregando ? "A guardar..." : "Criar Projeto"}
        </button>
      </form>
    </div>
  );
}
