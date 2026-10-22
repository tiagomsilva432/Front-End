import { useState } from "react";
import { authService } from "../services/authservice";
import { useTheme } from "../theme/tema";
import EcraAutenticacao from "../components/layout/EcraAutenticacao";
import Alerta from "../components/ui/Alerta";
import CampoSenha from "../components/ui/CampoSenha";

export default function PagAtivacao({ onConcluido }) {
  const tema = useTheme();
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleAtivacao = async (e) => {
    e.preventDefault();
    setErro("");

    if (!token) {
      setErro("Token de ativação inválido ou ausente no link.");
      return;
    }

    if (
      senha.length < 8 ||
      !/[a-z]/.test(senha) ||
      !/[A-Z]/.test(senha) ||
      !/[0-9]/.test(senha) ||
      !/[@$!%*?&#]/.test(senha)
    ) {
      setErro("Use pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e um símbolo (@$!%*?&#).");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem!");
      return;
    }

    try {
      setCarregando(true);
      await authService.ativarConta({ token, password: senha });
      setSucesso(true);
    } catch (err) {
      setErro(err.message || "Não foi possível ativar a conta.");
    } finally {
      setCarregando(false);
    }
  };

  const irParaLogin = () => {
    if (onConcluido) onConcluido();
    else window.location.href = "/";
  };

  return (
    <EcraAutenticacao titulo="Ativar conta" subtitulo="Defina a sua senha para concluir o acesso ao sistema.">
      {erro && <Alerta className="mb-5">{erro}</Alerta>}

      {sucesso ? (
        <div className="space-y-4 text-center">
          <Alerta tipo="sucesso">Conta ativada com sucesso! A sua senha foi definida.</Alerta>
          <button
            type="button"
            onClick={irParaLogin}
            className={`w-full rounded-xl py-3 text-sm font-semibold shadow-md transition ${tema.primaryBtn}`}
          >
            Ir para o login
          </button>
        </div>
      ) : (
        <form onSubmit={handleAtivacao} className="space-y-4">
          <CampoSenha
            id="ativacao-senha"
            label="Nova senha"
            ajuda="Mínimo de 8 caracteres, com maiúscula, minúscula, número e símbolo."
            disabled={carregando}
            minLength={8}
            autoComplete="new-password"
            placeholder="Crie uma senha segura"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <CampoSenha
            id="ativacao-confirmar"
            label="Confirmar nova senha"
            disabled={carregando}
            minLength={8}
            autoComplete="new-password"
            placeholder="Repita a senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
          />
          <button
            type="submit"
            disabled={carregando}
            className={`w-full rounded-xl py-3 text-sm font-semibold shadow-md transition disabled:opacity-50 ${tema.primaryBtn}`}
          >
            {carregando ? "A ativar..." : "Concluir ativação"}
          </button>
        </form>
      )}
    </EcraAutenticacao>
  );
}
