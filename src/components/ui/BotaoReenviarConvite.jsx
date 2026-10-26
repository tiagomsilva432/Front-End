import { useState } from "react";
import { authService } from "../../services/authservice";
import { useTheme } from "../../theme/tema";

// Reenvia o e-mail de ativação a uma conta com o convite pendente (POST /auth/account/:id/resend-activation).
export default function BotaoReenviarConvite({ userId, className = "" }) {
  const tema = useTheme();
  const [estado, setEstado] = useState("inicial"); // inicial | a-enviar | enviado | erro
  const [erro, setErro] = useState("");

  const reenviar = async () => {
    setEstado("a-enviar");
    setErro("");
    try {
      await authService.reenviarConvite(userId);
      setEstado("enviado");
    } catch (err) {
      setErro(err.message || "Não foi possível reenviar o convite.");
      setEstado("erro");
    }
  };

  if (estado === "enviado") {
    return (
      <span role="status" className={`text-xs font-semibold ${tema.accent} ${className}`}>
        Convite reenviado
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-col gap-1 ${className}`}>
      <button
        type="button"
        onClick={reenviar}
        disabled={estado === "a-enviar"}
        className={`text-xs font-bold hover:underline disabled:opacity-50 ${tema.strong}`}
      >
        {estado === "a-enviar" ? "A reenviar…" : estado === "erro" ? "Tentar reenviar" : "Reenviar convite"}
      </button>
      {erro && (
        <span role="alert" className="text-[11px] text-red-500">
          {erro}
        </span>
      )}
    </span>
  );
}
