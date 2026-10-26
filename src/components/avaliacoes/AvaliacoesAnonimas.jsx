import { useTheme } from "../../theme/tema";
import { formatarData } from "../../utils/formatar";
import Alerta from "../ui/Alerta";

// Avaliações recebidas por uma pessoa (GET /users/:id/reviews): sem quem as escreveu, só o dia.
// Com `nomeCiclo`, indica de onde veio cada uma (um ciclo ou um pedido avulso).
export default function AvaliacoesAnonimas({ estado, nomeCiclo }) {
  const tema = useTheme();

  if (estado.erro) return <Alerta>{estado.erro}</Alerta>;
  if (estado.carregando) return <p className={`text-xs ${tema.muted}`}>A carregar…</p>;
  if (estado.lista.length === 0) return <p className={`text-xs ${tema.muted}`}>Ainda não há avaliações respondidas.</p>;

  return estado.lista.map((a, i) => (
    <div key={i} className={`rounded-xl border p-3 text-sm ${tema.border} ${tema.cardMuted}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className={`rounded-md border px-2 py-0.5 font-semibold ${a.recommendsRaise ? tema.sucesso : tema.chip}`}>
          {a.recommendsRaise ? "Recomenda aumento" : "Não recomenda aumento"}
        </span>
        {a.performanceScore && <span className={tema.muted}>Nota {a.performanceScore}/5</span>}
        {nomeCiclo && <span className={tema.muted}>· {a.cycleId ? nomeCiclo(a.cycleId) : "Pedido avulso"}</span>}
        <span className={tema.muted}>· {formatarData(a.submittedOn)}</span>
      </div>
      {a.comments && <p className="mt-2 whitespace-pre-line">{a.comments}</p>}
    </div>
  ));
}
