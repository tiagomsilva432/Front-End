import { useTheme } from "../../theme/tema";
import { idDe, nomeCompleto } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import Avatar from "../ui/Avatar";

const nomeDe = (p) => nomeCompleto(p) || p.email;
const porNome = (a, b) => nomeDe(a).localeCompare(nomeDe(b), "pt");

// Quem está alocado (com o gestor em destaque) e os admins da empresa que entram no projeto sem estarem alocados.
export default function EquipaProjeto({ projeto, eu, equipa, admins, alocacoes, carregando, erro }) {
  const tema = useTheme();
  const funcaoNoProjeto = new Map(alocacoes.map((a) => [a.userId, a.roleOnProject]));
  const eGestor = (p) => idDe(p) === projeto.managerId;
  const equipaOrdenada = [...equipa].sort((a, b) => eGestor(b) - eGestor(a) || porNome(a, b));

  const linha = (p, cargo, gestor = false) => (
    <li key={idDe(p)} className={`flex items-center gap-3 rounded-xl border p-3 ${gestor ? tema.active : `${tema.border} ${tema.cardMuted}`}`}>
      <Avatar url={p.profile?.avatarUrl} nome={p.profile?.firstName || p.email} tamanho="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">
          <span className="font-semibold">{nomeDe(p)}</span>
          {idDe(p) === eu?.id && <span className={tema.muted}> (eu)</span>}
          <span className={`hidden sm:inline ${tema.muted}`}> | </span>
          <span className={`block truncate text-xs sm:inline sm:text-sm ${tema.muted}`}>{cargo}</span>
        </p>
        <p className={`mt-0.5 truncate text-xs ${tema.muted}`}>{p.email}</p>
      </div>
      {gestor && <span className="shrink-0 rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">Gestor</span>}
    </li>
  );

  if (erro) return <Alerta>Não foi possível carregar a equipa.</Alerta>;
  if (carregando) {
    return <p className={`rounded-2xl border p-8 text-center text-sm ${tema.card} ${tema.muted}`}>A carregar a equipa…</p>;
  }

  return (
    <div className="space-y-4">
      <section className={`rounded-2xl border p-5 ${tema.card}`}>
        <h2 className="text-sm font-semibold">Equipa ({equipa.length})</h2>
        {equipaOrdenada.length === 0 ? (
          <p className={`mt-3 text-sm ${tema.muted}`}>Ainda não há ninguém alocado a este projeto.</p>
        ) : (
          <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            {equipaOrdenada.map((p) =>
              linha(p, funcaoNoProjeto.get(idDe(p)) || p.profile?.jobTitle || "Função não definida", eGestor(p)),
            )}
          </ul>
        )}
      </section>

      {admins.length > 0 && (
        <section className={`rounded-2xl border p-5 ${tema.card}`}>
          <h2 className="text-sm font-semibold">Administradores com acesso ({admins.length})</h2>
          <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">{[...admins].sort(porNome).map((p) => linha(p, p.profile?.jobTitle || "Administrador da empresa"))}</ul>
        </section>
      )}
    </div>
  );
}
