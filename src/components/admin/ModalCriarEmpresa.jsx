import { useState } from "react";
import { criarEmpresa } from "../../services/companyservice";
import { useTheme } from "../../theme/tema";
import Alerta from "../ui/Alerta";
import Campo from "../ui/Campo";
import Modal from "../ui/Modal";

export default function ModalCriarEmpresa({ token, onFechar, onCriada }) {
  const tema = useTheme();
  const [form, setForm] = useState({ name: "", taxId: "", email: "", country: "" });
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  const alterar = (campo) => (e) => setForm((atual) => ({ ...atual, [campo]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem(null);

    if (!form.name.trim()) {
      setMensagem({ tipo: "erro", texto: "O nome da empresa é obrigatório." });
      return;
    }

    try {
      setCarregando(true);
      const resposta = await criarEmpresa(
        {
          name: form.name.trim(),
          taxId: form.taxId.trim() || null,
          email: form.email.trim() || null,
          country: form.country.trim().toUpperCase() || "PT",
        },
        token,
      );
      onCriada(resposta?.data || resposta);
      setMensagem({ tipo: "sucesso", texto: "Empresa criada com sucesso!" });
      setTimeout(onFechar, 1200);
    } catch (err) {
      setMensagem({ tipo: "erro", texto: err.message || "Erro ao criar a empresa." });
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Modal id="criar-empresa" titulo="Criar nova empresa" subtitulo="Registe uma nova entidade no sistema" onFechar={onFechar} bloqueado={carregando} largura="max-w-lg">
      {mensagem && (
        <Alerta tipo={mensagem.tipo} className="mb-4">
          {mensagem.texto}
        </Alerta>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Campo id="empresa-nome" label="Nome da empresa" obrigatorio placeholder="Ex.: Empresa Exemplo, Lda" value={form.name} onChange={alterar("name")} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo id="empresa-nif" label="NIF / Tax ID" placeholder="Ex.: 500000000" value={form.taxId} onChange={alterar("taxId")} />
          <Campo id="empresa-pais" label="Código do país (ISO)" maxLength={2} placeholder="PT" value={form.country} onChange={alterar("country")} />
        </div>
        <Campo id="empresa-email" label="E-mail de contacto" type="email" placeholder="contacto@empresa.com" value={form.email} onChange={alterar("email")} />

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onFechar} disabled={carregando} className={`w-full rounded-xl border py-3 text-xs font-semibold ${tema.secondaryBtn}`}>
            Cancelar
          </button>
          <button type="submit" disabled={carregando} className={`w-full rounded-xl py-3 text-xs font-bold transition disabled:opacity-50 ${tema.primaryBtn}`}>
            {carregando ? "A criar..." : "Criar empresa"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
