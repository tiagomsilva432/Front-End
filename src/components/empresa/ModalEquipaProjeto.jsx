import { useEffect, useState } from "react";
import { listarAlocacoesProjeto } from "../../services/projetoservice";
import { useTheme } from "../../theme/tema";
import { alocacaoEmCurso, formatarData, idDe, nomeCompleto } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import Modal from "../ui/Modal";

// Quem trabalha num projeto (GET /projects/:id/allocations).
export default function ModalEquipaProjeto({ projeto, colaboradores, token, onFechar }) {
  const tema = useTheme();
  const [alocacoes, setAlocacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let ativo = true;
    listarAlocacoesProjeto(idDe(projeto), token)
      .then((lista) => {
        if (!ativo) return;
        setAlocacoes(Array.isArray(lista) ? lista : []);
        setErro("");
      })
      .catch((err) => {
        if (ativo) setErro(err.message || "Não foi possível carregar a equipa do projeto.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [projeto, token, recarga]);

  const pessoaPorId = new Map(colaboradores.map((c) => [idDe(c), c]));
  const nomeDe = (userId) => {
    const pessoa = pessoaPorId.get(userId);
    return nomeCompleto(pessoa) || pessoa?.email || "Utilizador sem perfil de colaborador";
  };

  const emCurso = alocacoes.filter(alocacaoEmCurso);
  const historico = alocacoes.filter((a) => !alocacaoEmCurso(a));
  const dedicacao = emCurso.reduce((total, a) => total + a.allocationPercent, 0);

  const linha = (alocacao) => (
    <div
      key={alocacao.id}
      className={`flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${tema.border} ${tema.cardMuted}`}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{nomeDe(alocacao.userId)}</p>
        <p className={`mt-1 text-xs ${tema.muted}`}>
          {alocacao.roleOnProject || "Função não definida"} ·{" "}
          {alocacao.endDate
            ? `${formatarData(alocacao.startDate)} – ${formatarData(alocacao.endDate)}`
            : `Desde ${formatarData(alocacao.startDate)}`}
        </p>
      </div>
      <span className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-sm font-bold ${alocacaoEmCurso(alocacao) ? tema.active : tema.chip}`}>
        {alocacao.allocationPercent}%
      </span>
    </div>
  );

  return (
    <Modal id="equipa-projeto" titulo={`Equipa · ${projeto.name}`} subtitulo={projeto.clientName || "Cliente não indicado"} onFechar={onFechar} largura="max-w-2xl">
      <div className="space-y-5">
        {erro && (
          <Alerta
            textoAcao="Tentar novamente"
            onAcao={() => {
              setCarregando(true);
              setRecarga((n) => n + 1);
            }}
            acaoDesativada={carregando}
          >
            {erro}
          </Alerta>
        )}

        <div className={`grid grid-cols-2 gap-3 rounded-xl border p-4 ${tema.border} ${tema.cardMuted}`}>
          <div>
            <p className={`text-xs ${tema.muted}`}>Pessoas no projeto</p>
            <p className="mt-1 text-xl font-bold">{carregando ? "…" : emCurso.length}</p>
          </div>
          <div>
            <p className={`text-xs ${tema.muted}`}>Dedicação total</p>
            <p className="mt-1 text-xl font-bold">{carregando ? "…" : `${dedicacao}%`}</p>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Equipa atual</h3>
          {carregando || emCurso.length === 0 ? (
            <p className={`rounded-xl border p-4 text-sm ${tema.border} ${tema.muted}`}>
              {carregando ? "A carregar a equipa…" : "Ainda não há ninguém alocado a este projeto."}
            </p>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">{emCurso.map(linha)}</div>
          )}
        </div>

        {!carregando && historico.length > 0 && (
          <details>
            <summary className={`cursor-pointer text-xs font-semibold ${tema.muted}`}>
              Já trabalharam neste projeto ({historico.length})
            </summary>
            <div className="mt-2 max-h-52 space-y-2 overflow-y-auto pr-1">{historico.map(linha)}</div>
          </details>
        )}

        <p className={`text-xs ${tema.muted}`}>
          Para alocar alguém, abra as alocações da pessoa no diretório de colaboradores.
        </p>
      </div>
    </Modal>
  );
}
