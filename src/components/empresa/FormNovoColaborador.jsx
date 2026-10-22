import { useState } from "react";
import { authService } from "../../services/authservice";
import { useTheme } from "../../theme/tema";
import Alerta from "../ui/Alerta";
import Campo from "../ui/Campo";

export default function FormNovoColaborador({ companyId, onRegistroSucesso }) {
  const tema = useTheme();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!companyId) {
      setErro("Não foi possível identificar a empresa da sessão.");
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setErro("Preencha o primeiro e o último nome do colaborador.");
      return;
    }

    try {
      setLoading(true);
      await authService.registrar({
        companyId,
        email: email.trim(),
        role: "employee",
        profile: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        },
      });

      setSucesso("Conta criada com sucesso! O convite foi enviado por e-mail.");
      setEmail("");
      setFirstName("");
      setLastName("");

      if (onRegistroSucesso) {
        setTimeout(onRegistroSucesso, 1500);
      }
    } catch (err) {
      setErro(err.message || "Ocorreu um erro ao comunicar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`mx-auto max-w-xl space-y-6 rounded-2xl border p-6 sm:p-8 ${tema.card}`}>
      <div>
        <h2 className="text-xl font-bold">Criar nova conta na empresa</h2>
        <p className={`mt-1 text-xs ${tema.muted}`}>
          Insira o nome e o e-mail do novo colaborador para enviar o convite. A conta é criada com o cargo de colaborador.
        </p>
      </div>

      {erro && <Alerta tipo="erro">{erro}</Alerta>}
      {sucesso && <Alerta tipo="sucesso">{sucesso}</Alerta>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo
            id="novo-colaborador-primeiro-nome"
            label="Primeiro nome"
            obrigatorio
            maxLength={100}
            autoComplete="given-name"
            placeholder="Ex.: Carla"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Campo
            id="novo-colaborador-ultimo-nome"
            label="Último nome"
            obrigatorio
            maxLength={100}
            autoComplete="family-name"
            placeholder="Ex.: Mendes"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <Campo
          id="novo-colaborador-email"
          label="E-mail"
          obrigatorio
          type="email"
          autoComplete="email"
          placeholder="user@exemplo.pt"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-xl py-3 text-sm font-semibold shadow-lg transition disabled:opacity-50 ${tema.primaryBtn}`}
        >
          {loading ? "A criar conta..." : "Criar conta"}
        </button>
      </form>
    </div>
  );
}
