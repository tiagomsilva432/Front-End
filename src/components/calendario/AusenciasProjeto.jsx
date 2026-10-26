import { useEffect, useState } from "react";
import { TIPOS_AUSENCIA } from "../../services/absenceservice";
import { obterCalendarioProjeto } from "../../services/calendarservice";
import { useTheme } from "../../theme/tema";
import { formatarIntervalo, idDe, isoLocal, nomeCompleto } from "../../utils/formatar";
import { corDoTipo } from "../ausencias/estiloAusencia";

const DIAS = 30;

// Quem da equipa de um projeto vai estar fora nos próximos 30 dias (GET /projects/:id/calendar).
export default function AusenciasProjeto({ projectId, pessoas, token }) {
  const tema = useTheme();
  const [calendario, setCalendario] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    const hoje = new Date();
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + DIAS);
    obterCalendarioProjeto(projectId, isoLocal(hoje), isoLocal(fim), token)
      .then((c) => ativo && setCalendario(c))
      .catch((err) => ativo && setErro(err.message || "Não foi possível carregar as ausências da equipa."));
    return () => {
      ativo = false;
    };
  }, [projectId, token]);

  const pessoaPorId = new Map(pessoas.map((p) => [idDe(p), p]));
  const nomeDe = (id) => nomeCompleto(pessoaPorId.get(id)) || pessoaPorId.get(id)?.email || "Colaborador";

  if (erro) return <p className={`text-xs ${tema.muted}`}>{erro}</p>;
  if (!calendario) return <p className={`text-xs ${tema.muted}`}>A carregar…</p>;
  if (calendario.absences.length === 0)
    return <p className={`text-xs ${tema.muted}`}>Ninguém da equipa vai estar fora nos próximos {DIAS} dias.</p>;

  return (
    <ul className="space-y-2">
      {calendario.absences.map((a) => (
        <li key={a.id} className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-sm ${tema.border} ${tema.cardMuted}`}>
          <span>
            <span className="font-medium">{nomeDe(a.userId)}</span>
            <span className={tema.muted}> · {formatarIntervalo(a.startDate, a.endDate)}</span>
          </span>
          <span className="flex items-center gap-2">
            {a.status === "pending" && <span className={`text-[10px] font-semibold uppercase ${tema.muted}`}>Pendente</span>}
            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase ${corDoTipo(tema, a.type)}`}>
              {TIPOS_AUSENCIA[a.type] || a.type}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
