import { useEffect, useState } from "react";
import { obterUser } from "../services/userservice";
import { listarAlocacoesUser, obterCargaAlocacao } from "../services/allocationservice";
import { listarProjetos } from "../services/projetoservice";
import { CATEGORIAS_COMPETENCIA, listarCompetenciasUser } from "../services/skillservice";
import { listarSalarios, obterSalarioAtual } from "../services/salaryservice";
import HistoricoSalarios from "../components/salarios/HistoricoSalarios";
import NivelCompetencia from "../components/ui/NivelCompetencia";
import CaixaAvaliacoes from "../components/avaliacoes/CaixaAvaliacoes";
import { authService } from "../services/authservice";
import PainelLayout from "../components/layout/PainelLayout";
import Alerta from "../components/ui/Alerta";
import CartaoMetrica from "../components/ui/CartaoMetrica";
import ListaDados from "../components/ui/ListaDados";
import ListaAlocacoes from "../components/colaborador/ListaAlocacoes";
import { useTheme } from "../theme/tema";
import { alocacaoEmCurso, formatarData, idDe, nomeCompleto } from "../utils/formatar";

const MENU = [
  { id: "overview", label: "Visão geral", icone: "painel" },
  { id: "projetos", label: "Meus projetos", icone: "pasta" },
  { id: "avaliacoes", label: "Avaliações", icone: "avaliacao" },
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

  const [competencias, setCompetencias] = useState({ carregando: Boolean(userId), lista: [], erro: "" });
  const [salario, setSalario] = useState({ carregando: Boolean(userId), historico: [], atual: null, erro: "" });

  // Competências e salário (só leitura: são definidos pelo administrador da empresa).
  useEffect(() => {
    if (!userId) return;
    let ativo = true;
    listarCompetenciasUser(userId, token)
      .then((lista) => ativo && setCompetencias({ carregando: false, lista: Array.isArray(lista) ? lista : [], erro: "" }))
      .catch((erro) => ativo && setCompetencias({ carregando: false, lista: [], erro: erro.message || "Não foi possível carregar as competências." }));
    Promise.all([listarSalarios(userId, token), obterSalarioAtual(userId, token)])
      .then(([historico, atual]) =>
        ativo && setSalario({ carregando: false, historico: Array.isArray(historico) ? historico : [], atual, erro: "" }),
      )
      .catch((erro) =>
        ativo && setSalario({ carregando: false, historico: [], atual: null, erro: erro.message || "Não foi possível carregar o salário." }),
      );
    return () => {
      ativo = false;
    };
  }, [userId, token]);

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
  }, [userId, token, tentativaAlocacoes]);

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
  }, [dadosConta?.companyId, token]);

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
      menuItems={MENU}
      abaSelecionada={abaAtiva}
      onMudarAba={setAbaAtiva}
      email={email}
      papel={cargo}
      onLogout={onLogout}
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

      {abaAtiva === "projetos" && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">Meus projetos</h2>
            <p className={`mt-1 text-sm ${tema.muted}`}>Projetos com alocações abertas associadas à sua conta.</p>
          </div>
          {alertaAlocacoes}
          {avisoSobrealocacao}
          <ListaAlocacoes alocacoes={projetosAlocados} carregando={carregandoAlocacoes} />
        </div>
      )}

      {abaAtiva === "avaliacoes" && <CaixaAvaliacoes token={token} />}

      {abaAtiva === "perfil" && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">O meu perfil</h2>
            <p className={`mt-1 text-sm ${tema.muted}`}>
              Dados pessoais registados pela empresa. Para alterar algum dado, contacte o administrador.
            </p>
          </div>
          <ListaDados
            titulo="Dados da conta"
            campos={[
              ["Nome", valorConta(nomeDaConta || "Não informado")],
              ["E-mail", email],
              ["Função", cargo],
              ["Telefone", perfil?.phone || "Não informado"],
              ["Morada", perfil?.address || "Não informada"],
              ["Data de nascimento", formatarData(perfil?.birthDate)],
              ["Data de admissão", formatarData(perfil?.hireDate)],
            ]}
          />

          <section className={`rounded-2xl border p-5 sm:p-6 ${tema.card}`}>
            <h2 className="font-semibold">As minhas competências</h2>
            {competencias.erro && <Alerta className="mt-4">{competencias.erro}</Alerta>}
            {competencias.carregando ? (
              <p className={`mt-4 text-sm ${tema.muted}`}>A carregar…</p>
            ) : competencias.lista.length === 0 && !competencias.erro ? (
              <p className={`mt-4 text-sm ${tema.muted}`}>Ainda não tem competências registadas.</p>
            ) : (
              <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {competencias.lista.map((c) => (
                  <li key={c.skillId} className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${tema.border} ${tema.cardMuted}`}>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{c.name}</p>
                      <p className={`text-xs ${tema.muted}`}>
                        {CATEGORIAS_COMPETENCIA[c.category] || c.category}
                        {c.yearsExperience ? ` · ${Number(c.yearsExperience)} anos` : ""}
                      </p>
                    </div>
                    <NivelCompetencia nivel={c.proficiency} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={`rounded-2xl border p-5 sm:p-6 ${tema.card}`}>
            <h2 className="mb-4 font-semibold">O meu salário</h2>
            {salario.erro ? (
              <Alerta>{salario.erro}</Alerta>
            ) : (
              <HistoricoSalarios historico={salario.historico} atual={salario.atual} carregando={salario.carregando} />
            )}
          </section>
        </div>
      )}
    </PainelLayout>
  );
}
