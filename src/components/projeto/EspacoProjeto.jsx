import { useEffect, useState } from "react";
import { listarAlocacoesProjeto, obterProjeto } from "../../services/projetoservice";
import { listarUsers } from "../../services/userservice";
import { useNotificacoes } from "../../notificacoes/notificacoes";
import { useTheme } from "../../theme/tema";
import { ESTADOS_PROJETO, alocacaoEmCurso, idDe } from "../../utils/formatar";
import Icone from "../ui/Icone";
import BotaoVoltar from "../ui/BotaoVoltar";
import ChatProjeto from "./ChatProjeto";
import EquipaProjeto from "./EquipaProjeto";
import QuadroTarefas from "./QuadroTarefas";
import RecursosProjeto from "./RecursosProjeto";

const SEPARADORES = [
  ["quadro", "Quadro", "quadro"],
  ["chat", "Chat", "chat"],
  ["recursos", "Recursos", "clipe"],
  ["equipa", "Equipa", "pessoas"],
];

// O espaço de um projeto para os seus membros: quadro de tarefas, chat, recursos e equipa.
// Membros: quem tem uma alocação que ainda não acabou, o gestor e os admins (o back recusa os outros com 403).
// `separadorInicial`/`tarefaInicial` vêm de uma notificação (ex.: tarefa atribuída) e abrem já o sítio certo.
export default function EspacoProjeto({ projeto: projetoDado, token, eu, pessoas: pessoasDadas, separadorInicial = "quadro", tarefaInicial, onVoltar }) {
  const tema = useTheme();
  const { chatPorLer } = useNotificacoes();
  const [separador, setSeparador] = useState(separadorInicial);
  const [projetoCompleto, setProjetoCompleto] = useState(null);
  const [pessoasCarregadas, setPessoasCarregadas] = useState(null);
  const [alocacoes, setAlocacoes] = useState(null);
  const [erroEquipa, setErroEquipa] = useState(false);

  // Aberto por uma notificação antes de a lista de projetos carregar, só traz id e nome (sem managerId).
  useEffect(() => {
    if (projetoDado.managerId !== undefined) return;
    let ativo = true;
    obterProjeto(projetoDado.id, token)
      .then((p) => ativo && p && setProjetoCompleto(p))
      .catch((err) => {
        console.error("Erro ao carregar o projeto:", err);
        if (ativo) setErroEquipa(true);
      });
    return () => {
      ativo = false;
    };
  }, [projetoDado, token]);

  // Nomes e fotos (o back só manda ids). Um colaborador não recebe a lista de fora; carrega-a.
  useEffect(() => {
    if (pessoasDadas) return;
    let ativo = true;
    listarUsers({}, token)
      .then((lista) => ativo && setPessoasCarregadas(Array.isArray(lista) ? lista : []))
      .catch((err) => {
        console.error("Erro ao carregar a equipa:", err);
        if (ativo) setErroEquipa(true);
      });
    return () => {
      ativo = false;
    };
  }, [pessoasDadas, token]);

  // Quem está alocado agora: é quem pode ser responsável por uma tarefa (com o gestor e os admins).
  useEffect(() => {
    let ativo = true;
    listarAlocacoesProjeto(projetoDado.id, token)
      .then((lista) => ativo && setAlocacoes((lista || []).filter(alocacaoEmCurso)))
      .catch((err) => {
        console.error("Erro ao carregar a equipa do projeto:", err);
        if (ativo) setErroEquipa(true);
      });
    return () => {
      ativo = false;
    };
  }, [projetoDado.id, token]);

  const projeto = projetoCompleto || projetoDado;
  const pessoas = pessoasDadas || pessoasCarregadas || [];
  const alocados = (alocacoes || []).map((a) => a.userId);
  const souAdmin = eu?.role === "company_admin" || eu?.role === "system_admin";
  const souGestor = projeto.managerId && projeto.managerId === eu?.id;
  const gere = souAdmin || souGestor;
  const membros = pessoas.filter(
    (p) => p.status === "active" && (alocados.includes(idDe(p)) || idDe(p) === projeto.managerId || p.role === "company_admin"),
  );
  const equipa = membros.filter((p) => alocados.includes(idDe(p)) || idDe(p) === projeto.managerId);
  const adminsComAcesso = membros.filter((p) => !equipa.includes(p));
  const carregandoEquipa =
    !erroEquipa && (alocacoes === null || !(pessoasDadas || pessoasCarregadas) || projeto.managerId === undefined);
  const porLerChat = chatPorLer.porProjeto[projeto.id] || 0;

  return (
    <div className="space-y-5">
      <div>
        <BotaoVoltar onClick={onVoltar}>Voltar aos projetos</BotaoVoltar>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold">{projeto.name}</h1>
          <p className={`mt-1 text-sm ${tema.muted}`}>
            {[
              projeto.clientName,
              ESTADOS_PROJETO[projeto.status],
              `${equipa.length} ${equipa.length === 1 ? "membro" : "membros"}`,
              souGestor ? "É o gestor deste projeto" : souAdmin ? "Vista de administrador" : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div role="tablist" aria-label="Secções do projeto" className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {SEPARADORES.map(([id, rotulo, icone]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={separador === id}
              onClick={() => setSeparador(id)}
              className={`relative flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${separador === id ? tema.active : tema.secondaryBtn}`}
            >
              <Icone nome={icone} className="h-5 w-5" />
              {rotulo}
              {id === "chat" && porLerChat > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {porLerChat > 99 ? "99+" : porLerChat}
                  <span className="sr-only"> mensagens por ler</span>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {separador === "quadro" && (
        <QuadroTarefas projectId={projeto.id} token={token} eu={eu} gere={gere} membros={membros} pessoas={pessoas} tarefaInicial={tarefaInicial} />
      )}
      {separador === "chat" && <ChatProjeto projectId={projeto.id} token={token} eu={eu} gere={gere} pessoas={pessoas} />}
      {separador === "recursos" && <RecursosProjeto projectId={projeto.id} token={token} eu={eu} gere={gere} />}
      {separador === "equipa" && (
        <EquipaProjeto
          projeto={projeto}
          eu={eu}
          equipa={equipa}
          admins={adminsComAcesso}
          alocacoes={alocacoes || []}
          carregando={carregandoEquipa}
          erro={erroEquipa}
        />
      )}
    </div>
  );
}
