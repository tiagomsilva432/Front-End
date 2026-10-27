import { useState } from "react";
import { useTheme } from "../../theme/tema";

const TAMANHOS = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-20 w-20 text-2xl" };

// Foto de perfil (profile.avatarUrl, um quadrado 512x512 do servidor) sempre redonda e sem esticar.
// Sem foto, ou se o link expirou entretanto, mostra a inicial.
export default function Avatar({ url, nome, tamanho = "md", className = "" }) {
  const tema = useTheme();
  const [falhou, setFalhou] = useState(null);
  const inicial = (nome || "?").trim().charAt(0).toUpperCase() || "?";

  if (url && falhou !== url) {
    return (
      <img
        src={url}
        alt=""
        onError={() => setFalhou(url)}
        className={`shrink-0 rounded-full border object-cover ${tema.border} ${TAMANHOS[tamanho]} ${className}`}
      />
    );
  }
  return (
    <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-full border font-bold ${tema.iconBox} ${TAMANHOS[tamanho]} ${className}`}>
      {inicial}
    </span>
  );
}
