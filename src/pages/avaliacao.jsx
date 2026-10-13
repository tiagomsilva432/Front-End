/*import { useState } from "react";
import { projetoService } from "../services/projetoService";

export default function FormCriarAvaliacao({
  projetos = [],
  colaboradores = [],
}) {
  const [projetoId, setProjetoId] = useState("");
  const [colaboradorId, setColaboradorId] = useState("");
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem({ tipo: "", texto: "" });

    if (!projetoId || !colaboradorId) {
      setMensagem({
        tipo: "erro",
        texto: "Selecione o projeto e o colaborador.",
      });
      return;
    }

    try {
      setCarregando(true);
      await projetoService.criarAvaliacao({
        projectId: Number(projetoId),
        employeeId: Number(colaboradorId),
        score: Number(nota),
        feedback: comentario,
      });

      setMensagem({
        tipo: "sucesso",
        texto: "Avaliação registada com sucesso!",
      });
      setComentario("");
      setNota(5);
    } catch (err) {
      setMensagem({ tipo: "erro", texto: err.message });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm space-y-4">
      <h2 className="text-lg font-bold text-gray-900">Avaliar Desempenho</h2>

      {mensagem.texto && (
        <div
          className={`p-3 rounded-xl text-xs font-medium ${
            mensagem.tipo === "erro"
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          {mensagem.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Projeto
            </label>
            <select
              value={projetoId}
              onChange={(e) => setProjetoId(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-emerald-600 outline-none"
            >
              <option value="">Selecione um projeto</option>
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Colaborador
            </label>
            <select
              value={colaboradorId}
              onChange={(e) => setColaboradorId(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-emerald-600 outline-none"
            >
              <option value="">Selecione um colaborador</option>
              {colaboradores.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Pontuação (1 a 5)
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-emerald-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
            Feedback / Comentários
          </label>
          <textarea
            rows="3"
            placeholder="Observações sobre o desempenho..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:bg-white focus:border-emerald-600 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={carregando}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50"
        >
          {carregando ? "A submeter..." : "Submeter Avaliação"}
        </button>
      </form>
    </div>
  );
}*/
