import { useEffect, useState } from "react";
import { criarAlocacao, listarAlocacoesUser, obterCargaAlocacao } from "../../services/allocationservice";
import { useTheme } from "../../theme/tema";
import { alocacaoEmCurso, hojeISO, idDe, nomeCompleto } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import Campo from "../ui/Campo";
import Modal from "../ui/Modal";
import LinhaAlocacao from "./LinhaAlocacao";

const alocacaoVazia = () => ({
  projectId: "",
  allocationPercent: "100",
  roleOnProject: "",
  startDate: hojeISO(),
  endDate: "",
});

export default function ModalAlocacoes({ colaborador, projetos, token, onFechar }) {
  const tema = useTheme();
  const [alocacoes, setAlocacoes] = useState([]);
  const [carga, setCarga] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [recarga, setRecarga] = useState(0);
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [nova, setNova] = useState(alocacaoVazia);

  useEffect(() => {
    let ativo = true;
    Promise.all([listarAlocacoesUser(colaborador.id, token, false), obterCargaAlocacao(colaborador.id, token)])
      .then(([lista, cargaAtual]) => {
        if (!ativo) return;
        setAlocacoes(Array.isArray(lista) ? lista : []);
        setCarga(cargaAtual);
      })
      .catch((err) => {
        if (ativo) setErro(err.message || "Não foi possível carregar as alocações.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [colaborador.id, token, recarga]);

  const recarregar = () => {
    setCarregando(true);
    setErro("");
    setRecarga((n) => n + 1);
  };

  const alterar = (campo) => (e) => setNova((atual) => ({ ...atual, [campo]: e.target.value }));

  const guardar = async (e) => {
    e.preventDefault();
    setAGuardar(true);
    setErro("");
    setSucesso("");
    try {
      await criarAlocacao(
        {
          userId: colaborador.id,
          projectId: nova.projectId,
          allocationPercent: Number(nova.allocationPercent),
          startDate: nova.startDate,
          ...(nova.roleOnProject.trim() ? { roleOnProject: nova.roleOnProject.trim() } : {}),
          ...(nova.endDate ? { endDate: nova.endDate } : {}),
        },
        token,
      );
      setSucesso("Alocação criada com sucesso.");
      setNova((atual) => ({ ...atual, projectId: "", roleOnProject: "", endDate: "" }));
      recarregar();
    } catch (err) {
      setErro(err.message || "Não foi possível criar a alocação.");
    } finally {
      setAGuardar(false);
    }
  };

  const totalAtual = carga?.totalPercent || 0;
  const percentagemNova = Number(nova.allocationPercent);
  const vaiSobrealocar = carga?.overAllocated || (percentagemNova > 0 && totalAtual + percentagemNova > 100);
  const nome = nomeCompleto(colaborador);
  const emCurso = alocacoes.filter(alocacaoEmCurso);
  const historico = alocacoes.filter((alocacao) => !alocacaoEmCurso(alocacao));

  const linha = (alocacao) => (
    <LinhaAlocacao
      key={alocacao.id}
      alocacao={alocacao}
      nomeProjeto={projetos.find((item) => idDe(item) === alocacao.projectId)?.name || "Projeto"}
      token={token}
      onAlterada={(mensagem) => {
        setSucesso(mensagem);
        recarregar();
      }}
    />
  );

  return (
    <Modal
      id="alocacoes-colaborador"
      titulo="Alocações do colaborador"
      subtitulo={nome ? `${nome} · ${colaborador.email}` : colaborador.email}
      onFechar={onFechar}
      bloqueado={aGuardar}
      largura="max-w-3xl"
    >
      <div className="space-y-5">
        {erro && (
          <Alerta
            textoAcao="Tentar novamente"
            onAcao={!carregando && alocacoes.length === 0 && !sucesso ? recarregar : undefined}
          >
            {erro}
          </Alerta>
        )}
        {sucesso && <Alerta tipo="sucesso">{sucesso}</Alerta>}

        <div className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${tema.border} ${tema.cardMuted}`}>
          <div>
            <p className={`text-xs ${tema.muted}`}>Carga de alocação atual</p>
            <p className="mt-1 text-xl font-bold">{carregando ? "…" : `${totalAtual}%`}</p>
          </div>
          <button
            type="button"
            onClick={recarregar}
            disabled={carregando}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50 ${tema.secondaryBtn}`}
          >
            {carregando ? "A atualizar…" : "Atualizar"}
          </button>
        </div>

        {vaiSobrealocar && (
          <Alerta tipo="aviso">
            Com esta alocação, a carga ficará acima de 100%. O sistema permite guardar e sinaliza a sobrealocação.
          </Alerta>
        )}

        <div>
          <h3 className="mb-3 text-sm font-semibold">Projetos atuais</h3>
          {carregando || emCurso.length === 0 ? (
            <p className={`rounded-xl border p-4 text-sm ${tema.border} ${tema.muted}`}>
              {carregando ? "A carregar alocações…" : "Ainda não há alocações em curso para este colaborador."}
            </p>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">{emCurso.map(linha)}</div>
          )}
          {!carregando && historico.length > 0 && (
            <details className="mt-3">
              <summary className={`cursor-pointer text-xs font-semibold ${tema.muted}`}>
                Histórico ({historico.length} {historico.length === 1 ? "alocação terminada" : "alocações terminadas"})
              </summary>
              <div className="mt-2 max-h-52 space-y-2 overflow-y-auto pr-1">{historico.map(linha)}</div>
            </details>
          )}
        </div>

        <form onSubmit={guardar} className={`space-y-4 border-t pt-5 ${tema.border}`}>
          <div>
            <h3 className="text-sm font-semibold">Nova alocação</h3>
            <p className={`mt-1 text-xs ${tema.muted}`}>Escolha um projeto e defina a participação e o período.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              id="alocacao-projeto"
              label="Projeto"
              obrigatorio
              como="select"
              className="sm:col-span-2"
              value={nova.projectId}
              onChange={alterar("projectId")}
              disabled={aGuardar || projetos.length === 0}
            >
              <option value="">{projetos.length ? "Selecione um projeto" : "Não há projetos disponíveis"}</option>
              {projetos.map((projeto) => (
                <option key={idDe(projeto)} value={idDe(projeto)}>
                  {projeto.name || "Projeto sem nome"}
                </option>
              ))}
            </Campo>
            <Campo
              id="alocacao-percentagem"
              label="Percentagem (1–100)"
              obrigatorio
              type="number"
              min="1"
              max="100"
              step="1"
              value={nova.allocationPercent}
              onChange={alterar("allocationPercent")}
              disabled={aGuardar}
            />
            <Campo
              id="alocacao-funcao"
              label="Função no projeto"
              maxLength="100"
              placeholder="Ex.: Designer"
              value={nova.roleOnProject}
              onChange={alterar("roleOnProject")}
              disabled={aGuardar}
            />
            <Campo
              id="alocacao-inicio"
              label="Data de início"
              obrigatorio
              type="date"
              value={nova.startDate}
              onChange={alterar("startDate")}
              disabled={aGuardar}
            />
            <Campo
              id="alocacao-fim"
              label="Data de fim (opcional)"
              type="date"
              min={nova.startDate}
              value={nova.endDate}
              onChange={alterar("endDate")}
              disabled={aGuardar}
            />
          </div>
          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={aGuardar}
              onClick={onFechar}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${tema.secondaryBtn}`}
            >
              Fechar
            </button>
            <button
              type="submit"
              disabled={aGuardar || carregando || projetos.length === 0}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60 ${tema.primaryBtn}`}
            >
              {aGuardar ? "A guardar…" : "Criar alocação"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
