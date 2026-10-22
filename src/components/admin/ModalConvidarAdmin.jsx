import { useState } from "react";
import { authService } from "../../services/authservice";
import { useTheme } from "../../theme/tema";
import Alerta from "../ui/Alerta";
import Campo from "../ui/Campo";
import Modal from "../ui/Modal";

export default function ModalConvidarAdmin({ empresa, onFechar, onConvidado }) {
  const tema = useTheme();
  const [dados, setDados] = useState({ email: "", firstName: "", lastName: "", jobTitle: "" });
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  const alterar = (campo) => (e) => setDados((atual) => ({ ...atual, [campo]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem(null);

    const firstName = dados.firstName.trim();
    const lastName = dados.lastName.trim();
    if (Boolean(firstName) !== Boolean(lastName)) {
      setMensagem({ tipo: "erro", texto: "Preencha o primeiro e o último nome, ou deixe ambos vazios." });
      return;
    }

    const profile =
      firstName && lastName
        ? { firstName, lastName, ...(dados.jobTitle.trim() ? { jobTitle: dados.jobTitle.trim() } : {}) }
        : undefined;

    try {
      setCarregando(true);
      const resposta = await authService.registrar({
        email: dados.email.trim(),
        role: "company_admin",
        companyId: empresa.id,
        ...(profile ? { profile } : {}),
      });
      onConvidado(resposta?.data || resposta);
      setMensagem({ tipo: "sucesso", texto: "Convite criado. A conta aguarda ativação pelo administrador." });
    } catch (err) {
      setMensagem({ tipo: "erro", texto: err.message || "Não foi possível criar o convite." });
    } finally {
      setCarregando(false);
    }
  };

  const enviado = mensagem?.tipo === "sucesso";

  return (
    <Modal
      id="convidar-admin"
      titulo="Convidar administrador"
      subtitulo={
        <>
          <span className={`block text-sm ${tema.accent}`}>{empresa.name}</span>
          Será criada uma conta com o cargo de administrador desta empresa.
        </>
      }
      onFechar={onFechar}
      bloqueado={carregando}
      largura="max-w-lg"
    >
      {mensagem && (
        <Alerta tipo={mensagem.tipo} className="mb-4">
          {mensagem.texto}
        </Alerta>
      )}

      {enviado ? (
        <button type="button" onClick={onFechar} className={`w-full rounded-xl py-3 text-xs font-bold ${tema.primaryBtn}`}>
          Fechar
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Campo
            id="email-admin"
            label="E-mail do administrador"
            obrigatorio
            type="email"
            autoComplete="email"
            placeholder="admin@empresa.com"
            value={dados.email}
            onChange={alterar("email")}
          />
          <p className={`text-xs ${tema.muted}`}>Nome e cargo são opcionais.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo id="nome-admin" label="Primeiro nome" autoComplete="given-name" value={dados.firstName} onChange={alterar("firstName")} />
            <Campo id="sobrenome-admin" label="Último nome" autoComplete="family-name" value={dados.lastName} onChange={alterar("lastName")} />
          </div>
          <Campo id="cargo-admin" label="Cargo" placeholder="Ex.: Diretor de operações" value={dados.jobTitle} onChange={alterar("jobTitle")} />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onFechar} disabled={carregando} className={`w-full rounded-xl border py-3 text-xs font-semibold ${tema.secondaryBtn}`}>
              Cancelar
            </button>
            <button type="submit" disabled={carregando} className={`w-full rounded-xl py-3 text-xs font-bold transition disabled:opacity-50 ${tema.primaryBtn}`}>
              {carregando ? "A enviar convite..." : "Criar convite"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
