import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { listarUsers } from "../services/userservice";
import { listarProjetos } from "../services/projetoservice";
import { obterEmpresa } from "../services/companyservice";
import { authService } from "../services/authservice";
import PainelLayout from "../components/layout/PainelLayout";
import Alerta from "../components/ui/Alerta";
import BotaoVoltar from "../components/ui/BotaoVoltar";
import CartaoMetrica from "../components/ui/CartaoMetrica";
import ListaColaboradores from "../components/empresa/ListaColaboradores";
import ListaProjetos from "../components/empresa/ListaProjetos";
import FormNovoColaborador from "../components/empresa/FormNovoColaborador";
import FormNovoProjeto from "../components/empresa/FormNovoProjeto";
import ModalEditarColaborador from "../components/empresa/ModalEditarColaborador";
import ModalAlocacoes from "../components/empresa/ModalAlocacoes";
import ModalEquipaProjeto from "../components/empresa/ModalEquipaProjeto";
import ModalEditarProjeto from "../components/empresa/ModalEditarProjeto";
import ModalEditarEmpresa from "../components/admin/ModalEditarEmpresa";
import ListaDados from "../components/ui/ListaDados";
import ModalCompetencias from "../components/empresa/ModalCompetencias";
import ModalSalario from "../components/empresa/ModalSalario";
import CatalogoCompetencias from "../components/competencias/CatalogoCompetencias";
import GestaoAvaliacoes from "../components/avaliacoes/GestaoAvaliacoes";
import CaixaAvaliacoes from "../components/avaliacoes/CaixaAvaliacoes";
import ResultadosPorPessoa from "../components/avaliacoes/ResultadosPorPessoa";
import PaginaAnuncios from "../components/anuncios/PaginaAnuncios";
import DecidirAusencias from "../components/ausencias/DecidirAusencias";
import MinhasAusencias from "../components/ausencias/MinhasAusencias";
import CalendarioMes from "../components/calendario/CalendarioMes";
import { useTheme } from "../theme/tema";

const MENU = [
  { id: "overview", label: "Visão geral", icone: "painel" },
  { id: "pessoas", label: "Colaboradores", icone: "pessoas" },
  { id: "projetos", label: "Projetos", icone: "pasta" },
  { id: "competencias", label: "Competências", icone: "estrela" },
  { id: "ausencias", label: "Ausências", icone: "relogio" },
  { id: "calendario", label: "Calendário", icone: "calendario" },
  { id: "avaliacoes", label: "Avaliações", icone: "avaliacao" },
  { id: "anuncios", label: "Anúncios", icone: "megafone" },
  { id: "empresa", label: "Empresa", icone: "empresa" },
];

// Sub-ecrãs que pertencem a uma entrada do menu.
const ABA_DO_MENU = { registro: "pessoas", "criar-projeto": "projetos" };

function obterCompanyIdDoToken(token) {
  if (!token) return null;
  try {
    return jwtDecode(token)?.companyId || null;
  } catch (err) {
    console.error("Erro ao descodificar o token JWT:", err);
    return null;
  }
}

export default function AdmCompHome({ Usuario, onLogout }) {
  const tema = useTheme();
  const [abaAtiva, setAbaAtiva] = useState("overview");
  const token = authService.obterToken();
  const companyId = Usuario?.companyId || obterCompanyIdDoToken(token);

  // Todas as contas da empresa (incluindo admins): servem para escolher o gestor e mostrar nomes.
  const [pessoas, setPessoas] = useState([]);
  const [empresa, setEmpresa] = useState(null);
  const [editarEmpresaAberto, setEditarEmpresaAberto] = useState(false);
  const [projetoEmEdicao, setProjetoEmEdicao] = useState(null);
  const [colaboradorCompetencias, setColaboradorCompetencias] = useState(null);
  const [colaboradorSalario, setColaboradorSalario] = useState(null);
  const [vistaAvaliacoes, setVistaAvaliacoes] = useState("ciclos");
  const [vistaAusencias, setVistaAusencias] = useState("decidir");
  const [projetos, setProjetos] = useState([]);
  const [carregando, setCarregando] = useState(() => Boolean(companyId));
  const [erroBackend, setErroBackend] = useState(null);
  const [recarga, setRecarga] = useState(0);
  const [colaboradorEmEdicao, setColaboradorEmEdicao] = useState(null);
  const [colaboradorAlocacoes, setColaboradorAlocacoes] = useState(null);
  const [projetoEquipa, setProjetoEquipa] = useState(null);

  // Carrega colaboradores e projetos (e volta a carregar quando `recarga` muda).
  useEffect(() => {
    if (!companyId) return;
    let ativo = true;

    Promise.allSettled([
      listarUsers({ companyId }, token),
      listarProjetos(companyId, "", token),
      obterEmpresa(companyId, token),
    ]).then(([resColabs, resProjs, resEmpresa]) => {
      if (!ativo) return;
      if (resColabs.status === "fulfilled" && Array.isArray(resColabs.value)) setPessoas(resColabs.value);
      if (resEmpresa.status === "fulfilled") setEmpresa(resEmpresa.value);
      if (resProjs.status === "fulfilled" && Array.isArray(resProjs.value)) setProjetos(resProjs.value);

      if (resColabs.status === "rejected") setErroBackend("Não foi possível carregar os colaboradores.");
      else if (resProjs.status === "rejected") setErroBackend("Não foi possível carregar os projetos.");
      else setErroBackend(null);
      setCarregando(false);
    });

    return () => {
      ativo = false;
    };
  }, [companyId, token, recarga]);

  const recarregarDados = () => {
    setCarregando(true);
    setRecarga((n) => n + 1);
  };

  const colaboradores = pessoas.filter((p) => p.role === "employee");
  const convitesPendentes = colaboradores.filter((c) => c.status === "invited").length;

  return (
    <PainelLayout
      titulo={empresa?.name || "ERP Empresa"}
      menuItems={MENU}
      abaSelecionada={ABA_DO_MENU[abaAtiva] || abaAtiva}
      onMudarAba={setAbaAtiva}
      email={Usuario?.email}
      papel="Administrador da empresa"
      onLogout={onLogout}
    >
      {!companyId && <Alerta>Não foi possível identificar a empresa da sessão. Termine a sessão e entre novamente.</Alerta>}
      {erroBackend && (
        <Alerta textoAcao="Tentar novamente" onAcao={recarregarDados} acaoDesativada={carregando}>
          {erroBackend}
        </Alerta>
      )}

      {abaAtiva === "overview" && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Painel administrativo</h1>
            <p className={`mt-1 text-xs ${tema.muted}`}>Indicadores e informação da empresa.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <CartaoMetrica
              titulo="Colaboradores"
              valor={carregando ? "…" : colaboradores.length}
              descricao="Contas com cargo de colaborador na empresa."
            />
            <CartaoMetrica
              titulo="Projetos registados"
              valor={carregando ? "…" : projetos.length}
              descricao="Total de projetos da empresa, em qualquer estado."
            />
            <CartaoMetrica
              titulo="Convites pendentes"
              valor={carregando ? "…" : convitesPendentes}
              descricao="Colaboradores que ainda não ativaram a conta."
            />
          </div>
        </div>
      )}

      {abaAtiva === "pessoas" && (
        <ListaColaboradores
          colaboradores={colaboradores}
          carregando={carregando}
          onNovo={() => setAbaAtiva("registro")}
          onAlocacoes={setColaboradorAlocacoes}
          onCompetencias={setColaboradorCompetencias}
          onSalario={setColaboradorSalario}
          onEditar={setColaboradorEmEdicao}
        />
      )}

      {abaAtiva === "registro" && (
        <div>
          <BotaoVoltar onClick={() => setAbaAtiva("pessoas")}>Voltar à lista de colaboradores</BotaoVoltar>
          <FormNovoColaborador
            companyId={companyId}
            onRegistroSucesso={() => {
              recarregarDados();
              setAbaAtiva("pessoas");
            }}
          />
        </div>
      )}

      {abaAtiva === "projetos" && (
        <ListaProjetos
          projetos={projetos}
          carregando={carregando}
          pessoas={pessoas}
          onNovo={() => setAbaAtiva("criar-projeto")}
          onVerEquipa={setProjetoEquipa}
          onEditar={setProjetoEmEdicao}
        />
      )}

      {abaAtiva === "criar-projeto" && (
        <div>
          <BotaoVoltar onClick={() => setAbaAtiva("projetos")}>Voltar à lista de projetos</BotaoVoltar>
          <FormNovoProjeto
            companyId={companyId}
            pessoas={pessoas.filter((p) => p.status === "active")}
            onSucesso={() => {
              recarregarDados();
              setAbaAtiva("projetos");
            }}
          />
        </div>
      )}

      {abaAtiva === "avaliacoes" && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {[
              ["ciclos", "Ciclos da empresa"],
              ["resultados", "Resultados por pessoa"],
              ["meus", "Os meus pedidos"],
            ].map(([valor, rotulo]) => (
              <button
                key={valor}
                type="button"
                aria-pressed={vistaAvaliacoes === valor}
                onClick={() => setVistaAvaliacoes(valor)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${vistaAvaliacoes === valor ? tema.active : tema.secondaryBtn}`}
              >
                {rotulo}
              </button>
            ))}
          </div>
          {vistaAvaliacoes === "ciclos" ? (
            <GestaoAvaliacoes token={token} pessoas={pessoas} />
          ) : vistaAvaliacoes === "resultados" ? (
            <ResultadosPorPessoa token={token} pessoas={pessoas} />
          ) : (
            <CaixaAvaliacoes token={token} pessoas={pessoas} />
          )}
        </div>
      )}

      {abaAtiva === "ausencias" && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {[
              ["decidir", "Pedidos da equipa"],
              ["meus", "As minhas ausências"],
            ].map(([valor, rotulo]) => (
              <button
                key={valor}
                type="button"
                aria-pressed={vistaAusencias === valor}
                onClick={() => setVistaAusencias(valor)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${vistaAusencias === valor ? tema.active : tema.secondaryBtn}`}
              >
                {rotulo}
              </button>
            ))}
          </div>
          {vistaAusencias === "decidir" ? (
            <DecidirAusencias token={token} pessoas={pessoas} meuId={Usuario?.id} />
          ) : (
            <MinhasAusencias token={token} userId={Usuario?.id} />
          )}
        </div>
      )}

      {abaAtiva === "calendario" && <CalendarioMes token={token} pessoas={pessoas} podeGerirFeriados />}

      {abaAtiva === "anuncios" && <PaginaAnuncios token={token} ambitos={["company", "project"]} projetos={projetos} />}

      {abaAtiva === "competencias" && <CatalogoCompetencias token={token} pessoas={pessoas} />}

      {abaAtiva === "empresa" && (
        <div className="max-w-4xl space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Dados da empresa</h1>
              <p className={`mt-1 text-xs ${tema.muted}`}>Informação cadastral usada nos e-mails e documentos.</p>
            </div>
            <button
              type="button"
              disabled={!empresa}
              onClick={() => setEditarEmpresaAberto(true)}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold shadow-md transition disabled:opacity-50 ${tema.primaryBtn}`}
            >
              Editar dados
            </button>
          </div>
          <ListaDados
            titulo="Dados cadastrais"
            campos={[
              ["Nome", empresa ? empresa.name : "A carregar…"],
              ["NIF / Tax ID", empresa?.taxId || "Não registado"],
              ["E-mail de contacto", empresa?.email || "Não registado"],
              ["País", empresa?.country || "Não registado"],
            ]}
          />
        </div>
      )}

      {editarEmpresaAberto && empresa && (
        <ModalEditarEmpresa
          empresa={empresa}
          podeAlterarNif={false}
          token={token}
          onFechar={() => setEditarEmpresaAberto(false)}
          onGuardada={(atualizada) => {
            setEmpresa(atualizada);
            setEditarEmpresaAberto(false);
          }}
        />
      )}

      {colaboradorCompetencias && (
        <ModalCompetencias
          colaborador={colaboradorCompetencias}
          token={token}
          onFechar={() => setColaboradorCompetencias(null)}
        />
      )}

      {colaboradorSalario && (
        <ModalSalario colaborador={colaboradorSalario} token={token} onFechar={() => setColaboradorSalario(null)} />
      )}

      {projetoEmEdicao && (
        <ModalEditarProjeto
          projeto={projetoEmEdicao}
          pessoas={pessoas.filter((p) => p.status === "active" || p.id === projetoEmEdicao.managerId)}
          token={token}
          onFechar={() => setProjetoEmEdicao(null)}
          onGuardado={() => {
            setProjetoEmEdicao(null);
            recarregarDados();
          }}
        />
      )}

      {colaboradorEmEdicao && (
        <ModalEditarColaborador
          colaborador={colaboradorEmEdicao}
          token={token}
          onFechar={() => setColaboradorEmEdicao(null)}
          onGuardado={() => {
            setColaboradorEmEdicao(null);
            recarregarDados();
          }}
          onEstadoAlterado={recarregarDados}
        />
      )}

      {projetoEquipa && (
        <ModalEquipaProjeto
          projeto={projetoEquipa}
          colaboradores={pessoas}
          token={token}
          onFechar={() => setProjetoEquipa(null)}
        />
      )}

      {colaboradorAlocacoes && (
        <ModalAlocacoes
          colaborador={colaboradorAlocacoes}
          projetos={projetos}
          token={token}
          onFechar={() => setColaboradorAlocacoes(null)}
        />
      )}
    </PainelLayout>
  );
}
