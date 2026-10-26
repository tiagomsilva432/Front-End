import { useState } from "react";
import { alterarEstadoUser } from "../../services/userservice";
import { useTheme } from "../../theme/tema";
import Alerta from "../ui/Alerta";
import EstadoConta from "../ui/EstadoConta";

// Transições que o back aceita (PATCH /users/:id/status). "terminated" é definitivo, e
// uma conta convidada só pode ser terminada (revoga o convite).
const ACOES = {
  active: [["suspended", "Suspender conta"], ["terminated", "Terminar conta"]],
  suspended: [["active", "Reativar conta"], ["terminated", "Terminar conta"]],
  invited: [["terminated", "Revogar convite"]],
  terminated: [],
};

const DESCRICOES = {
  suspended: "A pessoa deixa de conseguir usar a aplicação até a conta ser reativada.",
  terminated: "Esta ação é definitiva: a conta não pode voltar a ser ativada.",
};

export default function AcoesEstadoConta({ conta, token, onAlterado }) {
  const tema = useTheme();
  const [estado, setEstado] = useState(conta.status);
  const [aConfirmar, setAConfirmar] = useState(null); // [novoEstado, rotulo]
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState("");

  const aplicar = async (novoEstado) => {
    setAGuardar(true);
    setErro("");
    try {
      const atualizada = await alterarEstadoUser(conta.id, novoEstado, token);
      setEstado(atualizada?.status || novoEstado);
      setAConfirmar(null);
      onAlterado?.(atualizada);
    } catch (err) {
      setErro(err.message || "Não foi possível alterar o estado da conta.");
    } finally {
      setAGuardar(false);
    }
  };

  const acoes = ACOES[estado] || [];

  return (
    <section className={`space-y-3 rounded-xl border p-4 ${tema.border} ${tema.cardMuted}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Estado da conta</h3>
        <EstadoConta estado={estado} />
      </div>

      {erro && <Alerta>{erro}</Alerta>}

      {aConfirmar ? (
        <div className="space-y-3">
          <p className={`text-xs ${aConfirmar[0] === "terminated" ? "text-red-500" : tema.muted}`}>
            {DESCRICOES[aConfirmar[0]] || "Confirma a alteração?"}
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              disabled={aGuardar}
              onClick={() => setAConfirmar(null)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${tema.secondaryBtn}`}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={aGuardar}
              onClick={() => aplicar(aConfirmar[0])}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
                aConfirmar[0] === "terminated" ? "bg-red-600 text-white hover:bg-red-500" : tema.primaryBtn
              }`}
            >
              {aGuardar ? "A aplicar…" : aConfirmar[1]}
            </button>
          </div>
        </div>
      ) : acoes.length === 0 ? (
        <p className={`text-xs ${tema.muted}`}>Conta terminada. Não há mais ações possíveis.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {acoes.map(([novoEstado, rotulo]) =>
            novoEstado === "active" ? (
              <button
                key={novoEstado}
                type="button"
                disabled={aGuardar}
                onClick={() => aplicar(novoEstado)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${tema.primaryBtn}`}
              >
                {aGuardar ? "A reativar…" : rotulo}
              </button>
            ) : (
              <button
                key={novoEstado}
                type="button"
                onClick={() => setAConfirmar([novoEstado, rotulo])}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                  novoEstado === "terminated" ? "border-red-500/30 text-red-500 hover:bg-red-500/10" : tema.secondaryBtn
                }`}
              >
                {rotulo}
              </button>
            ),
          )}
        </div>
      )}
    </section>
  );
}
