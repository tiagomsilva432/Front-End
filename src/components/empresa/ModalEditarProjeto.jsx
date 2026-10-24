import { useState } from "react";
import { atualizarProjeto } from "../../services/projetoservice";
import { useTheme } from "../../theme/tema";
import { ESTADOS_PROJETO, idDe, nomeCompleto } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import Campo from "../ui/Campo";
import Modal from "../ui/Modal";

// Campos que um null limpa; name e status não se limpam.
const LIMPAVEIS = ["managerId", "clientName", "startDate", "endDate", "budget"];

const formDoProjeto = (projeto) => ({
  name: projeto.name || "",
  clientName: projeto.clientName || "",
  status: projeto.status || "planned",
  managerId: projeto.managerId || "",
  startDate: projeto.startDate || "",
  endDate: projeto.endDate || "",
  budget: projeto.budget ?? "",
});

// Edição de um projeto (PATCH /projects/:id): só envia o que mudou.
export default function ModalEditarProjeto({ projeto, pessoas, token, onFechar, onGuardado }) {
  const tema = useTheme();
  const [original] = useState(() => formDoProjeto(projeto));
  const [form, setForm] = useState(original);
  const [erro, setErro] = useState("");
  const [aGuardar, setAGuardar] = useState(false);

  const alterar = (campo) => (e) => setForm((atual) => ({ ...atual, [campo]: e.target.value }));

  const guardar = async (e) => {
    e.preventDefault();
    setErro("");

    if (!form.name.trim()) {
      setErro("O nome do projeto é obrigatório.");
      return;
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      setErro("A data de fim não pode ser anterior à data de início.");
      return;
    }

    const alteracoes = {};
    for (const campo of Object.keys(form)) {
      const valor = String(form[campo]).trim();
      if (valor === String(original[campo]).trim()) continue;
      if (valor === "") {
        if (LIMPAVEIS.includes(campo)) alteracoes[campo] = null;
      } else {
        alteracoes[campo] = campo === "budget" ? Number(valor) : valor;
      }
    }

    if (Object.keys(alteracoes).length === 0) {
      onFechar();
      return;
    }

    setAGuardar(true);
    try {
      const atualizado = await atualizarProjeto(idDe(projeto), alteracoes, token);
      await onGuardado(atualizado);
    } catch (err) {
      setErro(err.message || "Não foi possível guardar o projeto.");
      setAGuardar(false);
    }
  };

  return (
    <Modal id="editar-projeto" titulo="Editar projeto" subtitulo={projeto.name} onFechar={onFechar} bloqueado={aGuardar}>
      {erro && <Alerta className="mb-4">{erro}</Alerta>}

      <form onSubmit={guardar} className="space-y-4">
        <Campo
          id="editar-projeto-nome"
          label="Nome do projeto"
          obrigatorio
          maxLength={150}
          value={form.name}
          onChange={alterar("name")}
          disabled={aGuardar}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            id="editar-projeto-cliente"
            label="Cliente"
            maxLength={150}
            value={form.clientName}
            onChange={alterar("clientName")}
            disabled={aGuardar}
          />
          <Campo
            id="editar-projeto-estado"
            label="Estado"
            como="select"
            value={form.status}
            onChange={alterar("status")}
            disabled={aGuardar}
          >
            {Object.entries(ESTADOS_PROJETO).map(([valor, texto]) => (
              <option key={valor} value={valor}>
                {texto}
              </option>
            ))}
          </Campo>
          <Campo
            id="editar-projeto-gestor"
            label="Gestor do projeto"
            como="select"
            className="sm:col-span-2"
            value={form.managerId}
            onChange={alterar("managerId")}
            disabled={aGuardar}
          >
            <option value="">Sem gestor</option>
            {pessoas.map((pessoa) => (
              <option key={idDe(pessoa)} value={idDe(pessoa)}>
                {nomeCompleto(pessoa) || pessoa.email}
              </option>
            ))}
          </Campo>
          <Campo
            id="editar-projeto-inicio"
            label="Data de início"
            type="date"
            value={form.startDate}
            onChange={alterar("startDate")}
            disabled={aGuardar}
          />
          <Campo
            id="editar-projeto-fim"
            label="Data de fim"
            type="date"
            min={form.startDate || undefined}
            value={form.endDate}
            onChange={alterar("endDate")}
            disabled={aGuardar}
          />
          <Campo
            id="editar-projeto-orcamento"
            label="Orçamento (€)"
            type="number"
            min="0"
            step="0.01"
            className="sm:col-span-2"
            value={form.budget}
            onChange={alterar("budget")}
            disabled={aGuardar}
          />
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={aGuardar}
            onClick={onFechar}
            className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${tema.secondaryBtn}`}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={aGuardar}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60 ${tema.primaryBtn}`}
          >
            {aGuardar ? "A guardar..." : "Guardar alterações"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
