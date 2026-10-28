import { useEffect, useState } from "react";
import { obterUser } from "../services/userservice";
import { listarAlocacoesUser, obterCargaAlocacao } from "../services/allocationservice";
import { listarProjetos } from "../services/projetoservice";
import CaixaAvaliacoes from "../components/avaliacoes/CaixaAvaliacoes";
import PaginaAnuncios from "../components/anuncios/PaginaAnuncios";
import MinhasAusencias from "../components/ausencias/MinhasAusencias";
import CalendarioMes from "../components/calendario/CalendarioMes";
import FinancasProjeto from "../components/financas/FinancasProjeto";
import MeuPerfil from "../components/conta/MeuPerfil";
import EspacoProjeto from "../components/projeto/EspacoProjeto";
import { authService } from "../services/authservice";
import PainelLayout from "../components/layout/PainelLayout";
import Alerta from "../components/ui/Alerta";
import CartaoMetrica from "../components/ui/CartaoMetrica";
import ListaDados from "../components/ui/ListaDados";
import ListaAlocacoes from "../components/colaborador/ListaAlocacoes";
import { useTheme } from "../theme/tema";
import { useNotificacoes } from "../notificacoes/notificacoes";
import { alocacaoEmCurso, formatarData, idDe, nomeCompleto } from "../utils/formatar";

const MENU = [
  { id: "overview", label: "Visão geral", icone: "painel" },
  { id: "projetos", label: "Meus projetos", icone: "pasta" },
  { id: "ausencias", label: "Ausências", icone: "relogio" },
  { id: "calendario", label: "Calendário", icone: "calendario" },
  { id: "avaliacoes", label: "Avaliações", icone: "avaliacao" },
  { id: "anuncios", label: "Anúncios", icone: "megafone" },
  { id: "perfil", label: "O meu perfil", icone: "utilizador" },
];

const ESTADOS_CONTA = {
  active: "Ativa",
  invited: "Convite pendente",
  suspended: "Suspensa",
  terminated: "Terminada",
};

export default function FuncHome({ Usuario, onLogout }) {
  const tema = useTheme();
  const token = authService.obterToken();
  const userId = Usuario?.id;
  const [abaAtiva, setAbaAtiva] = useState("overview");

  const [dadosConta, setDadosConta] = useState(null);
  const [carregandoConta, setCarregandoConta] = useState(Boolean(userId));
  const [erroConta, setErroConta] = useState("");
  const [tentativaConta, setTentativaConta] = useState(0);

  const [alocacoes, setAlocacoes] = useState([]);
  const [cargaAlocacao, setCargaAlocacao] = useState(null);
  const [carregandoAlocacoes, setCarregandoAlocacoes] = useState(Boolean(userId));
  const [erroAlocacoes, setErroAlocacoes] = useState("");
  const [tentativaAlocacoes, setTentativaAlocacoes] = useState(0);

  const [projetosEmpresa, setProjetosEmpresa] = useState([]);
  const { versaoDados, chatPorLer } = useNotificacoes();
  const [projetoAberto, setProjetoAberto] = useState(null); // { projeto, separador, tarefaId }
  const [projetoFinancas, setProjetoFinancas] = useState(null);

  // A notificação de orçamento (80% / 100%) abre as finanças do projeto que gere.
  const abrirNotificacao = (n) => {
    // Tarefas do quadro: abre o projeto já nessa tarefa.
    if (["task.assigned", "task.review_requested", "task.reviewed", "task.commented"].includes(n.type) && n.data?.projectId) {
      const projeto = projetosEmpresa.find((p) => idDe(p) === n.data.projectId) || { id: n.data.projectId, name: n.data.projectName };
      setProjetoAberto({ projeto, separador: "quadro", tarefaId: n.data.taskId });
      setAbaAtiva("projetos");
      return true;
    }
    if (n.type !== "project.budget_threshold" || !n.data?.projectId) return false;
    setProjetoFinancas({ id: n.data.projectId, name: n.data.projectName });
    return true;
  };

  // Dados da conta e do perfil.
  useEffect(() => {
    if (!userId) return;
    let ativo = true;
    obterUser(userId, token)
      .then((conta) => {
        if (!ativo) return;
        setDadosConta(conta);
        setErroConta("");
      })
      .catch((erro) => {
        if (ativo) setErroConta(erro.message || "Não foi possível carregar o perfil.");
      })
      .finally(() => {
        if (ativo) setCarregandoConta(false);
      });
    return () => {
      ativo = false;
    };
  }, [userId, token, tentativaConta]);

  // Alocações abertas e carga total.
  useEffect(() => {
    if (!userId) return;
    let ativo = true;
    Promise.all([listarAlocacoesUser(userId, token, false), obterCargaAlocacao(userId, token)])
      .then(([lista, carga]) => {
        if (!ativo) return;
        // Inclui as que têm data de fim futura; as já terminadas ficam de fora.
        setAlocacoes(Array.isArray(lista) ? lista.filter(alocacaoEmCurso) : []);
        setCargaAlocacao(carga);
        setErroAlocacoes("");
      })
      .catch((erro) => {
        if (ativo) setErroAlocacoes(erro.message || "Não foi possível carregar as alocações.");
      })
      .finally(() => {
        if (ativo) setCarregandoAlocacoes(false);
      });
    return () => {
      ativo = false;
    };
  }, [userId, token, tentativaAlocacoes, versaoDados]);

  // Projetos da empresa, para mostrar o nome de cada projeto alocado.
  useEffect(() => {
    if (!dadosConta?.companyId) return;
    let ativo = true;
    listarProjetos(dadosConta.companyId, "", token)
      .then((lista) => {
        if (ativo && Array.isArray(lista)) setProjetosEmpresa(lista);
      })
      .catch((erro) => {
        console.error("Erro ao carregar os nomes dos projetos alocados:", erro);
      });
    return () => {
      ativo = false;
    };
  }, [dadosConta?.companyId, token, versaoDados]);

  const tentarConta = () => {
    setCarregandoConta(true);
    setTentativaConta((n) => n + 1);
  };
  const tentarAlocacoes = () => {
    setCarregandoAlocacoes(true);
    setTentativaAlocacoes((n) => n + 1);
  };

  const perfil = dadosConta?.profile || null;
  const nomeDaConta = nomeCompleto(dadosConta);
  const nome = nomeDaConta || Usuario?.email?.split("@")[0] || "Colaborador";
  const email = dadosConta?.email || Usuario?.email || "E-mail não disponível";
  const cargo = perfil?.jobTitle || "Colaborador";
  const estadoConta = ESTADOS_CONTA[dadosConta?.status] || "Indisponível";
  const projetosPorId = new Map(projetosEmpresa.map((projeto) => [idDe(projeto), projeto]));
  const projetosAlocados = alocacoes.map((alocacao) => ({
    ...alocacao,
    projeto: projetosPorId.get(alocacao.projectId),
  }));
  // O gestor de um projeto (managerId) pode publicar anúncios nesse projeto.
  const projetosGeridos = projetosEmpresa.filter((projeto) => projeto.managerId === userId);
  const valorConta = (valor) => (carregandoConta ? "A carregar…" : valor);

  const erroSemConta = !userId ? "Não foi possível identificar a conta autenticada." : "";
  const avisoSobrealocacao = cargaAlocacao?.overAllocated && (
    <Alerta tipo="aviso">A sua carga atual é de {cargaAlocacao.totalPercent}%, acima dos 100% previstos.</Alerta>
  );
  const alertaAlocacoes = erroAlocacoes && (
    <Alerta textoAcao="Tentar novamente" onAcao={tentarAlocacoes} acaoDesativada={carregandoAlocacoes}>
      {erroAlocacoes}
    </Alerta>
  );

  return (
    <PainelLayout
      titulo="Área do colaborador"
      menuItems={MENU.map((item) => (item.id === "projetos" ? { ...item, contador: chatPorLer.total } : item))}
      abaSelecionada={abaAtiva}
      onMudarAba={(aba) => {
        setProjetoAberto(null);
        setAbaAtiva(aba);
      }}
      email={email}
      papel={cargo}
      avatarUrl={perfil?.avatarUrl}
      onLogout={onLogout}
      onAbrirNotificacao={abrirNotificacao}
    >
      <header>
        <p className={`text-xs font-semibold uppercase tracking-widest ${tema.muted}`}>Espaço pessoal</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Olá, {nome}</h1>
        <p className={`mt-2 text-sm ${tema.muted}`}>Consulte os seus projetos e os dados do seu perfil.</p>
      </header>

      {(erroSemConta || erroConta) && (
        <Alerta
          textoAcao="Tentar novamente"
          onAcao={userId ? tentarConta : undefined}
          acaoDesativada={carregandoConta}
        >
          {erroSemConta || erroConta}
        </Alerta>
      )}

      {abaAtiva === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <CartaoMetrica
              titulo="Projetos atribuídos"
              valor={carregandoAlocacoes ? "…" : alocacoes.length}
              descricao="Projetos com alocação aberta na sua conta."
            />
            <CartaoMetrica
              titulo="Carga de trabalho"
              valor={carregandoAlocacoes ? "…" : `${cargaAlocacao?.totalPercent ?? 0}%`}
              descricao="Soma das percentagens das alocações abertas."
            />
            <CartaoMetrica
              titulo="Perfil"
              valor={carregandoConta ? "…" : perfil ? "Disponível" : "Incompleto"}
              descricao="Estado dos dados pessoais associados à conta."
            />
          </div>
          {avisoSobrealocacao}
          {alertaAlocacoes}
          <section className={`rounded-2xl border p-5 sm:p-6 ${tema.card}`}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-semibold">Projetos atuais</h2>
              <button type="button" onClick={() => setAbaAtiva("projetos")} className={`text-xs font-semibold hover:underline ${tema.accent}`}>
                Ver todos
              </button>
            </div>
            <ListaAlocacoes alocacoes={projetosAlocados.slice(0, 3)} carregando={carregandoAlocacoes} resumida />
          </section>
          <ListaDados
            titulo="Conta"
            etiqueta={carregandoConta ? "A carregar…" : estadoConta}
            campos={[
              ["Nome", valorConta(nomeDaConta || "Não informado")],
              ["E-mail", email],
              ["Função", cargo],
              ["Data de admissão", formatarData(perfil?.hireDate)],
            ]}
          />
        </div>
      )}

      {abaAtiva === "projetos" && projetoAberto && (
        <EspacoProjeto
          key={`${projetoAberto.projeto.id}-${projetoAberto.tarefaId || ""}`}
          projeto={projetoAberto.projeto}
          token={token}
          eu={{ id: userId, role: Usuario?.role }}
          separadorInicial={projetoAberto.separador}
          tarefaInicial={projetoAberto.tarefaId}
          onVoltar={() => setProjetoAberto(null)}
        />
      )}

      {abaAtiva === "projetos" && !projetoAberto && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">Meus projetos</h2>
            <p className={`mt-1 text-sm ${tema.muted}`}>Projetos com alocações abertas associadas à sua conta.</p>
          </div>
          {alertaAlocacoes}
          {avisoSobrealocacao}
          <ListaAlocacoes
            alocacoes={projetosAlocados}
            carregando={carregandoAlocacoes}
            token={token}
            porLer={chatPorLer.porProjeto}
            onAbrir={(projeto) => setProjetoAberto({ projeto, separador: "quadro" })}
          />

          {projetosGeridos.length > 0 && (
            <section className={`rounded-2xl border p-5 sm:p-6 ${tema.card}`}>
              <h3 className="font-semibold">Projetos que gere</h3>
              <p className={`mt-1 text-xs ${tema.muted}`}>Como gestor, regista as despesas do projeto e acompanha o orçamento.</p>
              <ul className={`mt-4 divide-y rounded-xl border ${tema.border}`}>
                {projetosGeridos.map((projeto) => (
                  <li key={idDe(projeto)} className={`flex items-center justify-between gap-3 px-4 py-3 text-sm ${tema.border}`}>
                    <span className="min-w-0 truncate font-medium">{projeto.name}</span>
                    <span className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setProjetoAberto({ projeto, separador: "quadro" })}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold ${tema.primaryBtn}`}
                    >
                      Abrir
                    </button>
                    <button
                      type="button"
                      onClick={() => setProjetoFinancas({ id: idDe(projeto), name: projeto.name })}
                      className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold ${tema.secondaryBtn}`}
                    >
                      Finanças e despesas
                    </button>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      {projetoFinancas && <FinancasProjeto projeto={projetoFinancas} token={token} onFechar={() => setProjetoFinancas(null)} />}

      {abaAtiva === "avaliacoes" && <CaixaAvaliacoes token={token} />}

      {abaAtiva === "ausencias" && <MinhasAusencias token={token} userId={userId} />}

      {abaAtiva === "calendario" && <CalendarioMes token={token} />}

      {abaAtiva === "anuncios" && (
        <PaginaAnuncios token={token} ambitos={projetosGeridos.length ? ["project"] : []} projetos={projetosGeridos} />
      )}

      {abaAtiva === "perfil" && (
        <MeuPerfil
          userId={userId}
          token={token}
          conta={dadosConta}
          carregandoConta={carregandoConta}
          cargoPadrao="Colaborador"
          descricao="Dados pessoais registados pela empresa. Para alterar algum dado, contacte o administrador."
          onAvatarAlterado={(url) =>
            setDadosConta((conta) => (conta ? { ...conta, profile: { ...(conta.profile || {}), avatarUrl: url } } : conta))
          }
        />
      )}
    </PainelLayout>
  );
}
