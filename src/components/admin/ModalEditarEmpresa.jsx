import { useState } from "react";
import { atualizarEmpresa } from "../../services/companyservice";
import { useTheme } from "../../theme/tema";
import Alerta from "../ui/Alerta";
import Campo from "../ui/Campo";
import Modal from "../ui/Modal";

// Edição dos dados da empresa (PATCH /companies/:id): só envia o que mudou.
// O NIF só o system_admin o altera; name e country não se limpam.
export default function ModalEditarEmpresa({ empresa, podeAlterarNif, token, onFechar, onGuardada }) {
  const tema = useTheme();
  const [original] = useState(() => ({
    name: empresa.name || "",
    taxId: empresa.taxId || "",
    email: empresa.email || "",
    country: empresa.country || "PT",
  }));
  const [form, setForm] = useState(original);
  const [erro, setErro] = useState("");
  const [aGuardar, setAGuardar] = useState(false);

  const alterar = (campo) => (e) => setForm((atual) => ({ ...atual, [campo]: e.target.value }));

  const guardar = async (e) => {
    e.preventDefault();
    setErro("");

    const alteracoes = {};
    for (const campo of Object.keys(form)) {
      if (campo === "taxId" && !podeAlterarNif) continue;
      const valor = form[campo].trim();
      if (valor === original[campo]) continue;
      if (valor === "" && (campo === "name" || campo === "country")) {
        setErro(campo === "name" ? "O nome da empresa é obrigatório." : "O país é obrigatório.");
        return;
      }
      alteracoes[campo] = valor === "" ? null : valor;
    }

    if (Object.keys(alteracoes).length === 0) {
      onFechar();
      return;
    }

    setAGuardar(true);
    try {
      const atualizada = await atualizarEmpresa(empresa.id, alteracoes, token);
      await onGuardada(atualizada);
    } catch (err) {
      setErro(err.message || "Não foi possível guardar os dados da empresa.");
      setAGuardar(false);
    }
  };

  return (
    <Modal id="editar-empresa" titulo="Editar empresa" subtitulo={empresa.name} onFechar={onFechar} bloqueado={aGuardar}>
      {erro && <Alerta className="mb-4">{erro}</Alerta>}

      <form onSubmit={guardar} className="space-y-4">
        <Campo
          id="editar-empresa-nome"
          label="Nome"
          obrigatorio
          maxLength={150}
          value={form.name}
          onChange={alterar("name")}
          disabled={aGuardar}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            id="editar-empresa-nif"
            label="NIF / Tax ID"
            maxLength={50}
            title={podeAlterarNif ? undefined : "Só o administrador do sistema altera o NIF."}
            placeholder={podeAlterarNif ? undefined : "Só o administrador do sistema altera"}
            value={form.taxId}
            onChange={alterar("taxId")}
            disabled={aGuardar || !podeAlterarNif}
          />
          <Campo
            id="editar-empresa-pais"
            label="País (código de 2 letras)"
            obrigatorio
            maxLength={2}
            minLength={2}
            value={form.country}
            onChange={(e) => setForm((atual) => ({ ...atual, country: e.target.value.toUpperCase() }))}
            disabled={aGuardar}
          />
          <Campo
            id="editar-empresa-email"
            label="E-mail de contacto"
            type="email"
            maxLength={255}
            className="sm:col-span-2"
            value={form.email}
            onChange={alterar("email")}
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
