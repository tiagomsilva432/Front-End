import { useState } from "react";
import { authService } from "../services/authservice";
import { useTheme } from "../theme/tema";
import EcraAutenticacao from "../components/layout/EcraAutenticacao";
import Alerta from "../components/ui/Alerta";
import Campo from "../components/ui/Campo";

function PagLogin({ onLogin }) {
  const tema = useTheme();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [empresas, setEmpresas] = useState([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState("");

  const Login = async (e) => {
    e.preventDefault();
    setErro("");

    if (!email || !senha) {
      setErro("Por favor, preencha o e-mail e a senha.");
      return;
    }

    try {
      setCarregando(true);

      const user = await authService.login(
        email.trim(),
        senha,
        empresaSelecionada || undefined,
      );
      onLogin(user);
    } catch (err) {
      if (err.status === 409) {
        const opcoes = Array.isArray(err.data?.data)
          ? err.data.data
          : Array.isArray(err.data)
            ? err.data
            : [];
        if (opcoes.length > 0) {
          setEmpresas(opcoes);
          setEmpresaSelecionada("");
          setErro("");
          return;
        }
      }
      setErro(err.message || "Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  };

  // Ao mudar o e-mail ou a senha, a escolha de empresa deixa de ser válida.
  const limparEmpresas = () => {
    setEmpresas([]);
    setEmpresaSelecionada("");
  };

  return (
    <EcraAutenticacao
      titulo="Bem-vindo"
      subtitulo="Entre na sua conta para continuar."
    >
      {erro && <Alerta className="mb-5">{erro}</Alerta>}

      <form onSubmit={Login} className="space-y-5">
        <Campo
          id="login-email"
          label="E-mail"
          obrigatorio
          type="email"
          autoComplete="email"
          placeholder="nome@empresa.pt"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            limparEmpresas();
          }}
          disabled={carregando}
        />
        <Campo
          id="login-senha"
          label="Senha"
          obrigatorio
          type="password"
          autoComplete="current-password"
          placeholder="Digite a sua senha"
          value={senha}
          onChange={(e) => {
            setSenha(e.target.value);
            limparEmpresas();
          }}
          disabled={carregando}
        />

        {empresas.length > 0 && (
          <fieldset className="space-y-2">
            <legend className={`mb-1 text-sm font-medium ${tema.label}`}>
              Esta conta está associada a várias empresas
            </legend>
            <p className={`mb-3 text-xs ${tema.muted}`}>
              Escolha onde pretende entrar para continuar.
            </p>
            {empresas.map((empresa) => (
              <label
                key={empresa.companyId}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition ${
                  empresaSelecionada === empresa.companyId
                    ? tema.active
                    : `${tema.border} ${tema.hover}`
                }`}
              >
                <input
                  type="radio"
                  name="empresa-login"
                  value={empresa.companyId}
                  checked={empresaSelecionada === empresa.companyId}
                  onChange={() => {
                    setEmpresaSelecionada(empresa.companyId);
                    setErro("");
                  }}
                  className="h-4 w-4 accent-emerald-600"
                  disabled={carregando}
                />
                <span className="text-sm font-medium">
                  {empresa.companyName || "Empresa sem nome"}
                </span>
              </label>
            ))}
          </fieldset>
        )}

        <button
          type="submit"
          disabled={carregando || (empresas.length > 0 && !empresaSelecionada)}
          className={`w-full rounded-xl py-3.5 text-sm font-semibold shadow-lg transition focus:outline-none focus:ring-4 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60 ${tema.primaryBtn}`}
        >
          {carregando
            ? "A entrar..."
            : empresas.length > 0
              ? "Continuar nesta empresa"
              : "Entrar na conta"}
        </button>
      </form>

      <a
        href="/redefinir-senha"
        className={`mt-4 block text-center text-xs font-semibold hover:underline ${tema.accent}`}
      >
        Esqueci-me da senha
      </a>

      <p className={`mt-6 text-center text-xs ${tema.muted}`}>
        Acesso reservado a utilizadores convidados pela empresa.
      </p>
    </EcraAutenticacao>
  );
}

export default PagLogin;
