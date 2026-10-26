import { useTheme } from "../../theme/tema";
import { nomeCompleto } from "../../utils/formatar";
import BotaoReenviarConvite from "../ui/BotaoReenviarConvite";
import Icone from "../ui/Icone";

export default function CartaoEmpresa({ empresa, admin, carregandoAdmin, erroAdmin, onVer, onConvidar }) {
  const tema = useTheme();

  let estadoAdmin;
  if (carregandoAdmin) {
    estadoAdmin = <p className={`rounded-xl border px-3 py-2.5 text-center text-xs ${tema.chip}`}>A verificar administrador...</p>;
  } else if (erroAdmin) {
    estadoAdmin = (
      <p role="status" className={`rounded-xl border px-3 py-2.5 text-center text-xs ${tema.aviso}`}>
        Não foi possível verificar o administrador.
      </p>
    );
  } else if (admin) {
    estadoAdmin = (
      <div className={`space-y-1.5 rounded-xl border px-3 py-2.5 text-center text-xs ${tema.chip}`}>
        <p>
          Administrador: <span className={`font-semibold ${tema.accent}`}>{nomeCompleto(admin) || admin.email}</span>
        </p>
        {admin.status === "invited" && (
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span className={tema.muted}>Convite pendente ·</span>
            <BotaoReenviarConvite userId={admin.id} />
          </p>
        )}
      </div>
    );
  } else {
    estadoAdmin = (
      <button
        type="button"
        onClick={onConvidar}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition ${tema.secondaryBtn}`}
      >
        <Icone nome="mais" className="h-4 w-4" />
        Convidar administrador
      </button>
    );
  }

  return (
    <article className={`flex flex-col justify-between space-y-4 rounded-2xl border p-6 ${tema.card}`}>
      <div className="space-y-2">
        <h3 className="min-w-0 break-words text-lg font-bold">{empresa.name}</h3>
        <p className={`break-all font-mono text-xs ${tema.muted}`}>{empresa.id}</p>
        <dl className={`space-y-1 pt-2 text-xs ${tema.muted}`}>
          <div className="flex gap-1">
            <dt>País:</dt>
            <dd className={tema.strong}>{empresa.country || "N/D"}</dd>
          </div>
          <div className="flex min-w-0 gap-1">
            <dt>E-mail:</dt>
            <dd className={`break-all ${tema.strong}`}>{empresa.email || "Não registado"}</dd>
          </div>
        </dl>
      </div>
      <div className="space-y-2">
        <button
          type="button"
          onClick={onVer}
          className={`w-full rounded-xl py-2.5 text-xs font-bold shadow-md transition ${tema.primaryBtn}`}
        >
          Ver resumo da empresa
        </button>
        {estadoAdmin}
      </div>
    </article>
  );
}
