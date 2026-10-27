import { useState } from "react";
import { authService } from "../services/authservice";
import { useTheme } from "../theme/tema";
import EcraAutenticacao from "../components/layout/EcraAutenticacao";
import Alerta from "../components/ui/Alerta";
import Campo from "../components/ui/Campo";
import CampoSenha from "../components/ui/CampoSenha";
import { ERRO_SENHA_FRACA, REGRAS_SENHA, senhaValida } from "../utils/senha";

// Sem ?token= no endereço: pede o e-mail e envia o link.
// Com ?token= (o link do e-mail): pede a nova senha.
export default function PagRedefinirSenha() {
  const tema = useTheme();
  const token = new URLSearchParams(window.location.search).get("token");

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [concluido, setConcluido] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const pedirLink = async (e) => {
    e.preventDefault();
    setErro("");
    try {
      setCarregando(true);
      await authService.pedirRedefinicaoSenha(email.trim());
      setConcluido(true);
    } catch (err) {
      setErro(err.message || "Não foi possível enviar o pedido.");
    } finally {
      setCarregando(false);
    }
  };

  const definirSenha = async (e) => {
    e.preventDefault();
    setErro("");

    if (!senhaValida(senha)) {
      setErro(ERRO_SENHA_FRACA);
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem!");
      return;
    }

    try {
      setCarregando(true);
      await authService.confirmarRedefinicaoSenha({ token, password: senha });
      setConcluido(true);
    } catch (err) {
      setErro(err.message || "O link é inválido ou já expirou. Peça um novo.");
    } finally {
      setCarregando(false);
    }
  };

  const botaoPrincipal = `w-full rounded-xl py-3 text-sm font-semibold shadow-md transition disabled:opacity-50 ${tema.primaryBtn}`;
  const voltarAoLogin = (
    <a href="/entrar" className={`mt-6 block text-center text-xs font-semibold hover:underline ${tema.accent}`}>
      Voltar ao login
    </a>
  );

  if (!token) {
    return (
      <EcraAutenticacao titulo="Recuperar senha" subtitulo="Indique o seu e-mail e enviamos um link para definir uma nova senha.">
        {erro && <Alerta className="mb-5">{erro}</Alerta>}
        {concluido ? (
          <Alerta tipo="sucesso">
            Se existir uma conta ativa com este e-mail, vai receber uma mensagem com o link nos próximos minutos.
          </Alerta>
        ) : (
          <form onSubmit={pedirLink} className="space-y-4">
            <Campo
              id="recuperar-email"
              label="E-mail"
              obrigatorio
              type="email"
              autoComplete="email"
              placeholder="nome@empresa.pt"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={carregando}
            />
            <button type="submit" disabled={carregando} className={botaoPrincipal}>
              {carregando ? "A enviar..." : "Enviar link"}
            </button>
          </form>
        )}
        {voltarAoLogin}
      </EcraAutenticacao>
    );
  }

  return (
    <EcraAutenticacao titulo="Definir nova senha" subtitulo="Escolha a nova senha da sua conta.">
      {erro && <Alerta className="mb-5">{erro}</Alerta>}
      {concluido ? (
        <div className="space-y-4">
          <Alerta tipo="sucesso">Senha alterada com sucesso! Já pode entrar com a nova senha.</Alerta>
          <a href="/entrar" className={`block text-center ${botaoPrincipal}`}>
            Ir para o login
          </a>
        </div>
      ) : (
        <form onSubmit={definirSenha} className="space-y-4">
          <CampoSenha
            id="nova-senha"
            label="Nova senha"
            ajuda={REGRAS_SENHA}
            autoComplete="new-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            disabled={carregando}
          />
          <CampoSenha
            id="confirmar-nova-senha"
            label="Confirmar nova senha"
            autoComplete="new-password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            disabled={carregando}
          />
          <button type="submit" disabled={carregando} className={botaoPrincipal}>
            {carregando ? "A guardar..." : "Guardar nova senha"}
          </button>
        </form>
      )}
      {!concluido && voltarAoLogin}
    </EcraAutenticacao>
  );
}
