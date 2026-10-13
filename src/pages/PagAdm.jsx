import { useState, useEffect } from "react";
import { listarEmpresas, criarEmpresa } from "../services/companyservice";

export default function PainelGeralAdmin({ onLogout }) {
  const [companias, setCompanias] = useState([]);
  const [carregandoEmpresas, setCarregandoEmpresas] = useState(true);
  const [erroEmpresas, setErroEmpresas] = useState("");
  const [companiaSelecionada, setCompaniaSelecionada] = useState(null);

  // Estados para o Modal de Gestão de Dados (Editar)
  const [modalDadosAberto, setModalDadosAberto] = useState(false);
  const [empresaParaEditar, setEmpresaParaEditar] = useState(null);
  const [nomeEditado, setNomeEditado] = useState("");
  const [emailEditado, setEmailEditado] = useState("");
  const [taxIdEditado, setTaxIdEditado] = useState("");
  const [paisEditado, setPaisEditado] = useState("");
  const [carregandoDados, setCarregandoDados] = useState(false);
  const [mensagemModal, setMensagemModal] = useState("");

  // Estados para o Modal de Criar Nova Empresa
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novoTaxId, setNovoTaxId] = useState("");
  const [novoPais, setNovoPais] = useState("");
  const [carregandoCriacao, setCarregandoCriacao] = useState(false);
  const [mensagemCriacao, setMensagemCriacao] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const carregarCompanias = async () => {
      try {
        if (!token) {
          setErroEmpresas("Inicie sessão para consultar as empresas.");
          return;
        }
        setErroEmpresas("");
        const dadosEmpresas = await listarEmpresas(token);
        setCompanias(dadosEmpresas);
      } catch (err) {
        setErroEmpresas(err.message || "Não foi possível carregar as empresas.");
      } finally {
        setCarregandoEmpresas(false);
      }
    };
    carregarCompanias();
  }, [token]);

  const handleCriarEmpresa = async (e) => {
    e.preventDefault();
    setMensagemCriacao("");

    if (!novoNome || novoNome.trim() === "") {
      setMensagemCriacao("❌ O nome da empresa é obrigatório.");
      return;
    }

    try {
      setCarregandoCriacao(true);

      const dadosNovaEmpresa = {
        name: novoNome.trim(),
        taxId: novoTaxId ? novoTaxId.trim() : null,
        email: novoEmail ? novoEmail.trim() : null,
        country: novoPais ? novoPais.trim().toUpperCase() : "PT",
      };

      const respostaCriacao = await criarEmpresa(dadosNovaEmpresa, token);

      setMensagemCriacao("✅ Empresa criada com sucesso!");

      const empresaCriada = respostaCriacao.data || respostaCriacao;
      setCompanias([empresaCriada, ...companias]);

      setTimeout(() => {
        setModalCriarAberto(false);
        setNovoNome("");
        setNovoEmail("");
        setNovoTaxId("");
        setNovoPais("");
        setMensagemCriacao("");
      }, 1200);
    } catch (err) {
      setMensagemCriacao(`❌ ${err.message || "Erro ao criar a empresa."}`);
    } finally {
      setCarregandoCriacao(false);
    }
  };

  // Função para salvar alterações de dados da empresa existente
  const handleSalvarDadosEmpresa = async (e) => {
    e.preventDefault();
    setMensagemModal("");

    try {
      setCarregandoDados(true);
      const res = await fetch(
        `http://localhost:3000/companies/${empresaParaEditar.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: nomeEditado,
            email: emailEditado,
            taxId: taxIdEditado,
            country: paisEditado,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Erro ao atualizar os dados da empresa.",
        );
      }

      setMensagemModal("✅ Dados atualizados com sucesso!");

      setCompanias(
        companias.map((c) =>
          c.id === empresaParaEditar.id
            ? {
                ...c,
                name: nomeEditado,
                email: emailEditado,
                taxId: taxIdEditado,
                country: paisEditado,
              }
            : c,
        ),
      );

      setTimeout(() => {
        setModalDadosAberto(false);
        setMensagemModal("");
      }, 1500);
    } catch (err) {
      setMensagemModal(`❌ ${err.message}`);
    } finally {
      setCarregandoDados(false);
    }
  };

  // O system_admin consulta apenas os dados cadastrais da empresa.
  if (companiaSelecionada) {
    return (
      <div className="min-h-screen bg-[#070b14] p-4 font-sans text-slate-100 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                Resumo da empresa
              </p>
              <h1 className="text-2xl font-bold tracking-tight mt-1">
                {companiaSelecionada.name}
              </h1>
            </div>
            <button
              onClick={() => setCompaniaSelecionada(null)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-800 transition-all cursor-pointer"
            >
              ← Voltar à lista de empresas
            </button>
          </div>

          <section className="rounded-2xl border border-slate-800 bg-[#0b0f19] p-6 shadow-xl">
            <h2 className="text-sm font-bold text-slate-100 mb-4">
              Dados cadastrais
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <dt className="text-xs text-slate-500">Nome</dt>
                <dd className="mt-1 text-sm text-slate-100">
                  {companiaSelecionada.name || "Não registado"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">NIF / Tax ID</dt>
                <dd className="mt-1 text-sm text-slate-100">
                  {companiaSelecionada.taxId || "Não registado"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">E-mail de contacto</dt>
                <dd className="mt-1 text-sm text-slate-100 break-all">
                  {companiaSelecionada.email || "Não registado"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">País</dt>
                <dd className="mt-1 text-sm text-slate-100">
                  {companiaSelecionada.country || "Não registado"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-500">Identificador</dt>
                <dd className="mt-1 text-xs font-mono text-slate-400 break-all">
                  {companiaSelecionada.id}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    );
  }

  // Vista normal: listagem de empresas do system_admin
  return (
    <div className="min-h-screen bg-[#070b14] p-4 font-sans text-slate-100 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-800 pb-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Painel Geral de Companhias
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Consulte os dados das empresas e registe novas entidades.
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
            <button
              onClick={() => setModalCriarAberto(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
            >
              + Criar Nova Empresa
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition-all cursor-pointer"
              >
                Terminar Sessão
              </button>
            )}
          </div>
        </div>

        {erroEmpresas && (
          <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {erroEmpresas}
          </div>
        )}

        {carregandoEmpresas ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="A carregar empresas">
            {[1, 2, 3].map((item) => <div key={item} className="h-52 animate-pulse rounded-2xl border border-slate-800 bg-[#0b0f19]" />)}
          </div>
        ) : companias.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-[#0b0f19] p-8 text-center">
            <h2 className="font-semibold">Ainda não há empresas registadas</h2>
            <p className="mt-2 text-sm text-slate-400">Quando criar uma empresa, ela aparecerá nesta lista.</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {companias.map((comp) => (
            <div
              key={comp.id}
              className="p-6 rounded-2xl border border-slate-800 bg-[#0b0f19] space-y-4 shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-slate-100">
                    {comp.name}
                  </h3>
                  <button
                    onClick={() => {
                      setEmpresaParaEditar(comp);
                      setNomeEditado(comp.name || "");
                      setEmailEditado(comp.email || "");
                      setTaxIdEditado(comp.taxId || "");
                      setPaisEditado(comp.country || "");
                      setModalDadosAberto(true);
                    }}
                    title="Gerir Dados da Empresa"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-all cursor-pointer"
                  >
                    ⚙️ Dados
                  </button>
                </div>
                <p className="text-xs font-mono text-slate-500 break-all">
                  {comp.id}
                </p>
                <div className="text-xs text-slate-400 space-y-1 pt-2">
                  <p>
                    País:{" "}
                    <span className="text-slate-200">
                      {comp.country || "N/D"}
                    </span>
                  </p>
                  <p>
                    Email:{" "}
                    <span className="text-slate-200">
                      {comp.email || "Não registado"}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCompaniaSelecionada(comp)}
                className="w-full py-2.5 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer shadow-md"
              >
                Ver resumo da empresa →
              </button>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Modal de criar nova empresa */}
      {modalCriarAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg space-y-6 overflow-y-auto rounded-3xl border border-slate-800 bg-[#0b0f19] p-5 shadow-2xl sm:p-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  Criar Nova Empresa
                </h2>
                <p className="text-xs text-slate-400">
                  Registe uma nova entidade no sistema
                </p>
              </div>
              <button
                onClick={() => setModalCriarAberto(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {mensagemCriacao && (
              <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium text-slate-200">
                {mensagemCriacao}
              </div>
            )}

            <form onSubmit={handleCriarEmpresa} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  placeholder="Ex: Empresa Exemplo, Lda"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    NIF / Tax ID
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 500000000"
                    value={novoTaxId}
                    onChange={(e) => setNovoTaxId(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Código do país (ISO)
                  </label>
                  <input
                    type="text"
                    placeholder="PT"
                    value={novoPais}
                    onChange={(e) => setNovoPais(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  E-mail de Contacto
                </label>
                <input
                  type="email"
                  placeholder="contacto@empresa.com"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalCriarAberto(false)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={carregandoCriacao}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {carregandoCriacao ? "A criar..." : "Criar Empresa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para editar dados da empresa */}
      {modalDadosAberto && empresaParaEditar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg space-y-6 overflow-y-auto rounded-3xl border border-slate-800 bg-[#0b0f19] p-5 shadow-2xl sm:p-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100">
                  Gerir Dados da Empresa
                </h2>
                <p className="text-xs text-slate-400">
                  Atualize informações cadastrais globais
                </p>
              </div>
              <button
                onClick={() => setModalDadosAberto(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {mensagemModal && (
              <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs font-medium text-slate-200">
                {mensagemModal}
              </div>
            )}

            <form onSubmit={handleSalvarDadosEmpresa} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  value={nomeEditado}
                  onChange={(e) => setNomeEditado(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    NIF / Tax ID
                  </label>
                  <input
                    type="text"
                    value={taxIdEditado}
                    onChange={(e) => setTaxIdEditado(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    País
                  </label>
                  <input
                    type="text"
                    value={paisEditado}
                    onChange={(e) => setPaisEditado(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  E-mail de Contacto
                </label>
                <input
                  type="email"
                  value={emailEditado}
                  onChange={(e) => setEmailEditado(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalDadosAberto(false)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={carregandoDados}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {carregandoDados ? "A guardar..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
