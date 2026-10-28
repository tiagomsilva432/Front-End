import { useRef, useState } from "react";
import { LIMITES_FICHEIRO, validarFicheiro } from "../../services/api";
import { apagarAvatar, enviarAvatar, obterUser } from "../../services/userservice";
import { useTheme } from "../../theme/tema";
import Alerta from "../ui/Alerta";
import Avatar from "../ui/Avatar";

// Mudar ou remover a foto de perfil (PUT/DELETE /users/:id/avatar).
// Pode a própria pessoa, um company_admin da empresa ou um system_admin.
// `onAlterada(url)` recebe o link novo (ou null), que vem do perfil relido no servidor.
export default function FotoPerfil({ userId, url, nome, token, onAlterada }) {
  const tema = useTheme();
  const entrada = useRef(null);
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState("");

  const recarregar = async () => {
    const conta = await obterUser(userId, token);
    onAlterada?.(conta?.profile?.avatarUrl ?? null);
  };

  const escolher = async (e) => {
    const ficheiro = e.target.files?.[0];
    e.target.value = "";
    if (!ficheiro) return;
    const invalido = validarFicheiro(ficheiro, LIMITES_FICHEIRO.avatar);
    if (invalido) {
      setErro(invalido);
      return;
    }
    setErro("");
    setAGuardar(true);
    try {
      await enviarAvatar(userId, ficheiro, token);
      await recarregar();
    } catch (err) {
      setErro(err.message || "Não foi possível guardar a foto.");
    } finally {
      setAGuardar(false);
    }
  };

  const remover = async () => {
    setErro("");
    setAGuardar(true);
    try {
      await apagarAvatar(userId, token);
      await recarregar();
    } catch (err) {
      setErro(err.message || "Não foi possível remover a foto.");
    } finally {
      setAGuardar(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <Avatar url={url} nome={nome} tamanho="lg" />
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-2">
            <input ref={entrada} type="file" accept={LIMITES_FICHEIRO.avatar.tipos} onChange={escolher} className="hidden" />
            <button
              type="button"
              disabled={aGuardar}
              onClick={() => entrada.current?.click()}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${tema.secondaryBtn}`}
            >
              {aGuardar ? "A guardar…" : url ? "Mudar foto" : "Carregar foto"}
            </button>
            {url && (
              <button type="button" disabled={aGuardar} onClick={remover} className="text-xs font-semibold text-red-500 hover:underline disabled:opacity-50">
                Remover
              </button>
            )}
          </div>
          <p className={`text-[11px] ${tema.muted}`}>{LIMITES_FICHEIRO.avatar.descricao}.</p>
        </div>
      </div>
      {erro && <Alerta>{erro}</Alerta>}
    </div>
  );
}
