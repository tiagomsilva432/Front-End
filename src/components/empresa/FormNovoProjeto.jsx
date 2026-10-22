import { useState } from "react";
import { criarProjeto } from "../../services/projetoservice";
import { authService } from "../../services/authservice";
import { useTheme } from "../../theme/tema";
import { ESTADOS_PROJETO } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import Campo from "../ui/Campo";

export default function FormNovoProjeto({ companyId, onSucesso }) {
  const tema = useTheme();
  const [nome, setNome] = useState("");
  const [cliente, setCliente] = useState("");
  const [status, setStatus] = useState("planned");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [orcamento, setOrcamento] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem({ tipo: "", texto: "" });

    if (!nome.trim()) {
      setMensagem({ tipo: "erro", texto: "O nome do projeto é obrigatório." });
      return;
    }

    if (!companyId) {
      setMensagem({ tipo: "erro", texto: "Não foi possível identificar a empresa." });
      return;
    }

    if (dataInicio && dataFim && dataFim < dataInicio) {
      setMensagem({ tipo: "erro", texto: "A data de fim não pode ser anterior à data de início." });
      return;
    }

    const token = authService.obterToken();
    if (!token) {
      setMensagem({ tipo: "erro", texto: "A sessão expirou. Entre novamente." });
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
      setMensagem({ tipo: "erro", texto: err.message || "Não foi possível criar o projeto." });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={`mx-auto max-w-xl space-y-5 rounded-2xl border p-6 sm:p-8 ${tema.card}`}>
      <div>
        <h2 className="text-lg font-bold">Novo projeto</h2>
        <p className={`mt-1 text-xs ${tema.muted}`}>Os campos opcionais podem ser preenchidos mais tarde.</p>
      </div>

      {mensagem.texto && <Alerta tipo={mensagem.tipo}>{mensagem.texto}</Alerta>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Campo
          id="projeto-nome"
          label="Nome do projeto"
          obrigatorio
          maxLength={150}
          placeholder="Ex.: Reestruturação do ERP"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <Campo
          id="projeto-cliente"
          label="Cliente"
          maxLength={150}
          placeholder="Nome do cliente"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
        />
        <Campo id="projeto-estado" label="Estado" como="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          {Object.entries(ESTADOS_PROJETO).map(([valor, texto]) => (
            <option key={valor} value={valor}>
              {texto}
            </option>
          ))}
        </Campo>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo id="projeto-inicio" label="Data de início" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          <Campo
            id="projeto-fim"
            label="Data de fim"
            type="date"
            min={dataInicio || undefined}
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>
        <Campo
          id="projeto-orcamento"
          label="Orçamento (€)"
          type="number"
          min="0"
          step="0.01"
          placeholder="Ex.: 12500,00"
          value={orcamento}
          onChange={(e) => setOrcamento(e.target.value)}
        />

        <button
          type="submit"
          disabled={carregando}
          className={`w-full rounded-xl py-3 text-sm font-semibold shadow-lg transition disabled:opacity-50 ${tema.primaryBtn}`}
        >
          {carregando ? "A guardar..." : "Criar projeto"}
        </button>
      </form>
    </div>
  );
}
