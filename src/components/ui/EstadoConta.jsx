import { useTheme } from "../../theme/tema";

const ESTADOS_CONTA = {
  active: "Ativo",
  invited: "Convite pendente",
  suspended: "Suspenso",
  terminated: "Terminado",
};

// Etiqueta colorida com o estado da conta de um utilizador.
export default function EstadoConta({ estado }) {
  const tema = useTheme();
  const cores =
    estado === "active" ? tema.sucesso : estado === "invited" ? tema.aviso : tema.chip;

  return (
    <span className={`inline-block shrink-0 rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase ${cores}`}>
      {ESTADOS_CONTA[estado] || estado || "Indisponível"}
    </span>
  );
}
