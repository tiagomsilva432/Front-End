import { useTheme } from "../../theme/tema";
import BotaoVoltar from "../ui/BotaoVoltar";
import ListaDados from "../ui/ListaDados";

// O system_admin consulta apenas os dados cadastrais da empresa.
export default function ResumoEmpresa({ empresa, onVoltar }) {
  const tema = useTheme();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <BotaoVoltar onClick={onVoltar}>Voltar à lista de empresas</BotaoVoltar>
        <p className={`text-xs font-semibold uppercase tracking-wider ${tema.accent}`}>Resumo da empresa</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{empresa.name}</h1>
      </div>
      <ListaDados
        titulo="Dados cadastrais"
        campos={[
          ["Nome", empresa.name || "Não registado"],
          ["NIF / Tax ID", empresa.taxId || "Não registado"],
          ["E-mail de contacto", empresa.email || "Não registado"],
          ["País", empresa.country || "Não registado"],
          ["Identificador", <span className="font-mono text-xs">{empresa.id}</span>],
        ]}
      />
    </div>
  );
}
