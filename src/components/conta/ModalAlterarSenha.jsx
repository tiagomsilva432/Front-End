import { useState } from "react";
import { authService } from "../../services/authservice";
import { useTheme } from "../../theme/tema";
import { ERRO_SENHA_FRACA, REGRAS_SENHA, senhaValida } from "../../utils/senha";
import Alerta from "../ui/Alerta";
import CampoSenha from "../ui/CampoSenha";
import Modal from "../ui/Modal";

// Troca da própria senha (POST /auth/password/change). A sessão continua ativa depois da troca.
export default function ModalAlterarSenha({ onFechar }) {
  const tema = useTheme();
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [concluido, setConcluido] = useState(false);
  const [aGuardar, setAGuardar] = useState(false);

  const guardar = async (e) => {
    e.preventDefault();
    setErro("");

    if (!senhaValida(nova)) {
      setErro(ERRO_SENHA_FRACA);
      return;
    }
    if (nova !== confirmar) {
      setErro("As palavras-passe novas não coincidem.");
      return;
    }
    if (nova === atual) {
      setErro("A palavra-passe nova tem de ser diferente da atual.");
      return;
    }

    try {
      setAGuardar(true);
      await authService.alterarSenha({
        currentPassword: atual,
        newPassword: nova,
      });
      setConcluido(true);
    } catch (err) {
      // O Back-End responde 401 quando a senha atual está errada.
      setErro(
        err.status === 401
          ? "A palavra-passe atual está incorreta."
          : err.message || "Não foi possível alterar a palavra-passe.",
      );
    } finally {
      setAGuardar(false);
    }
  };

  return (
    <Modal
      id="alterar-senha"
      titulo="Alterar palavra-passe"
      subtitulo="Por segurança, confirme primeiro a palavra-passe atual."
      onFechar={onFechar}
      bloqueado={aGuardar}
      largura="max-w-md"
    >
      {concluido ? (
        <div className="space-y-4">
          <Alerta tipo="sucesso">
            Palavra-passe alterada com sucesso. Use a nova palavra-passe no próximo login.
          </Alerta>
          <button
            type="button"
            onClick={onFechar}
            className={`w-full rounded-xl py-3 text-sm font-semibold ${tema.primaryBtn}`}
          >
            Fechar
          </button>
        </div>
      ) : (
        <form onSubmit={guardar} className="space-y-4">
          {erro && <Alerta>{erro}</Alerta>}
          <CampoSenha
            id="senha-atual"
            label="Palavra-passe atual"
            autoComplete="current-password"
            required
            value={atual}
            onChange={(e) => setAtual(e.target.value)}
            disabled={aGuardar}
          />
          <CampoSenha
            id="senha-nova"
            label="Nova palavra-passe"
            ajuda={REGRAS_SENHA}
            autoComplete="new-password"
            required
            value={nova}
            onChange={(e) => setNova(e.target.value)}
            disabled={aGuardar}
          />
          <CampoSenha
            id="senha-confirmar"
            label="Confirmar nova palavra-passe"
            autoComplete="new-password"
            required
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            disabled={aGuardar}
          />
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onFechar}
              disabled={aGuardar}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${tema.secondaryBtn}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={aGuardar}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60 ${tema.primaryBtn}`}
            >
              {aGuardar ? "A guardar..." : "Alterar palavra-passe"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
