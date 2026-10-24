import { useState } from "react";
import { atualizarPerfilUser } from "../../services/userservice";
import { useTheme } from "../../theme/tema";
import { hojeISO } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import Campo from "../ui/Campo";
import Modal from "../ui/Modal";
import AcoesEstadoConta from "../conta/AcoesEstadoConta";

const CAMPOS = [
  ["firstName", "Primeiro nome", "text", true],
  ["lastName", "Último nome", "text", true],
  ["jobTitle", "Cargo / função", "text", false],
  ["phone", "Telefone", "tel", false],
  ["hireDate", "Data de admissão", "date", true],
  ["birthDate", "Data de nascimento", "date", false],
];
const OPCIONAIS = ["phone", "address", "birthDate", "jobTitle", "avatarUrl"];

export default function ModalEditarColaborador({ colaborador, token, onFechar, onGuardado, onEstadoAlterado }) {
  const tema = useTheme();
  const [perfil, setPerfil] = useState(() => {
    const atual = colaborador.profile || {};
    return {
      firstName: atual.firstName || "",
      lastName: atual.lastName || "",
      hireDate: atual.hireDate || hojeISO(),
      phone: atual.phone || "",
      address: atual.address || "",
      birthDate: atual.birthDate || "",
      jobTitle: atual.jobTitle || "",
      avatarUrl: atual.avatarUrl || "",
    };
  });
  const [erro, setErro] = useState("");
  const [aGuardar, setAGuardar] = useState(false);

  const alterar = (campo) => (e) => setPerfil((atual) => ({ ...atual, [campo]: e.target.value }));

  const guardar = async (e) => {
    e.preventDefault();
    setAGuardar(true);
    setErro("");
    try {
      const payload = {
        firstName: perfil.firstName.trim(),
        lastName: perfil.lastName.trim(),
        hireDate: perfil.hireDate,
        ...Object.fromEntries(
          OPCIONAIS.filter((campo) => perfil[campo]?.trim()).map((campo) => [campo, perfil[campo].trim()]),
        ),
      };
      await atualizarPerfilUser(colaborador.id, payload, token);
      await onGuardado();
    } catch (err) {
      setErro(err.message || "Não foi possível guardar as alterações.");
      setAGuardar(false);
    }
  };

  return (
    <Modal id="editar-colaborador" titulo="Editar colaborador" subtitulo={colaborador.email} onFechar={onFechar} bloqueado={aGuardar}>
      {erro && <Alerta className="mb-4">{erro}</Alerta>}

      <form onSubmit={guardar} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {CAMPOS.map(([campo, label, tipo, obrigatorio]) => (
            <Campo
              key={campo}
              id={`editar-${campo}`}
              label={label}
              type={tipo}
              obrigatorio={obrigatorio}
              value={perfil[campo]}
              onChange={alterar(campo)}
              disabled={aGuardar}
            />
          ))}
          <Campo
            id="editar-address"
            label="Morada"
            className="sm:col-span-2"
            value={perfil.address}
            onChange={alterar("address")}
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

      <div className={`mt-6 border-t pt-5 ${tema.border}`}>
        <AcoesEstadoConta conta={colaborador} token={token} onAlterado={onEstadoAlterado} />
      </div>
    </Modal>
  );
}
