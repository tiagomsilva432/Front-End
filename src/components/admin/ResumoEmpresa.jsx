import { useState } from "react";
import { useTheme } from "../../theme/tema";
import { nomeCompleto } from "../../utils/formatar";
import AcoesEstadoConta from "../conta/AcoesEstadoConta";
import BotaoVoltar from "../ui/BotaoVoltar";
import ListaDados from "../ui/ListaDados";
import ModalEditarEmpresa from "./ModalEditarEmpresa";

// O system_admin consulta e edita os dados cadastrais da empresa e gere a conta do seu administrador.
export default function ResumoEmpresa({ empresa, admin, token, onVoltar, onEmpresaAtualizada, onAdminAtualizado }) {
  const tema = useTheme();
  const [editarAberto, setEditarAberto] = useState(false);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <BotaoVoltar onClick={onVoltar}>Voltar à lista de empresas</BotaoVoltar>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider ${tema.accent}`}>Resumo da empresa</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">{empresa.name}</h1>
          </div>
          <button
            type="button"
            onClick={() => setEditarAberto(true)}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold shadow-md transition ${tema.primaryBtn}`}
          >
            Editar dados
          </button>
        </div>
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

      {admin && (
        <section className={`space-y-4 rounded-2xl border p-5 sm:p-6 ${tema.card}`}>
          <div>
            <h2 className="font-semibold">Administrador da empresa</h2>
            <p className={`mt-1 text-xs ${tema.muted}`}>
              {nomeCompleto(admin) ? `${nomeCompleto(admin)} · ${admin.email}` : admin.email}
            </p>
          </div>
          <AcoesEstadoConta key={admin.id} conta={admin} token={token} onAlterado={onAdminAtualizado} />
        </section>
      )}

      {editarAberto && (
        <ModalEditarEmpresa
          empresa={empresa}
          podeAlterarNif
          token={token}
          onFechar={() => setEditarAberto(false)}
          onGuardada={(atualizada) => {
            onEmpresaAtualizada(atualizada);
            setEditarAberto(false);
          }}
        />
      )}
    </div>
  );
}
