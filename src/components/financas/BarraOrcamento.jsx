import { useTheme } from "../../theme/tema";
import { ESTADO_ORCAMENTO, estadoDoOrcamento } from "./cores";

// Medidor do orçamento gasto (budgetUsedPercent). A cor carrega a gravidade e vai sempre com ícone + texto.
export default function BarraOrcamento({ percentagem, compacta = false }) {
  const tema = useTheme();
  const estado = estadoDoOrcamento(percentagem);

  if (!estado) {
    return <p className={`text-xs ${tema.muted}`}>Sem orçamento definido.</p>;
  }

  const { cor, rotulo, icone } = ESTADO_ORCAMENTO[estado];
  const largura = Math.min(100, Math.max(0, percentagem));

  return (
    <div>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percentagem)}
        aria-label={`Orçamento gasto: ${percentagem.toLocaleString("pt-PT", { maximumFractionDigits: 1 })}%`}
        className={`h-2 w-full overflow-hidden rounded-full ${tema.isDark ? "bg-slate-800" : "bg-slate-200"}`}
      >
        <div className="h-full rounded-full" style={{ width: `${largura}%`, backgroundColor: cor }} />
      </div>
      {!compacta && (
        <p className={`mt-1.5 flex items-center gap-1.5 text-xs ${tema.muted}`}>
          <span aria-hidden="true" style={{ color: cor }}>
            {icone}
          </span>
          <span className={tema.strong}>{percentagem.toLocaleString("pt-PT", { maximumFractionDigits: 1 })}%</span> ·{" "}
          {rotulo}
        </p>
      )}
    </div>
  );
}
