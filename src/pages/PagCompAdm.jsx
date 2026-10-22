import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { listarUsers } from "../services/userservice";
import { listarProjetos } from "../services/projetoservice";
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
import { useTheme } from "../theme/tema";

const MENU = [
  { id: "overview", label: "Visão geral", icone: "painel" },
  { id: "pessoas", label: "Colaboradores", icone: "pessoas" },
  { id: "projetos", label: "Projetos", icone: "pasta" },
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

  const [colaboradores, setColaboradores] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [carregando, setCarregando] = useState(() => Boolean(companyId));
  const [erroBackend, setErroBackend] = useState(null);
  const [recarga, setRecarga] = useState(0);
  const [colaboradorEmEdicao, setColaboradorEmEdicao] = useState(null);
  const [colaboradorAlocacoes, setColaboradorAlocacoes] = useState(null);

  // Carrega colaboradores e projetos (e volta a carregar quando `recarga` muda).
  useEffect(() => {
    if (!companyId) return;
    let ativo = true;

    Promise.allSettled([
      listarUsers({ companyId, role: "employee" }, token),
      listarProjetos(companyId, "", token),
    ]).then(([resColabs, resProjs]) => {
      if (!ativo) return;
      if (resColabs.status === "fulfilled" && Array.isArray(resColabs.value)) setColaboradores(resColabs.value);
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

  const convitesPendentes = colaboradores.filter((c) => c.status === "invited").length;

  return (
    <PainelLayout
      titulo="ERP Empresa"
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
        <ListaProjetos projetos={projetos} carregando={carregando} onNovo={() => setAbaAtiva("criar-projeto")} />
      )}

      {abaAtiva === "criar-projeto" && (
        <div>
          <BotaoVoltar onClick={() => setAbaAtiva("projetos")}>Voltar à lista de projetos</BotaoVoltar>
          <FormNovoProjeto
            companyId={companyId}
            onSucesso={() => {
              recarregarDados();
              setAbaAtiva("projetos");
            }}
          />
        </div>
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
