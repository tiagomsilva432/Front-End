import { useEffect, useState } from "react";
import { CATEGORIAS_COMPETENCIA, listarCompetenciasUser } from "../../services/skillservice";
import { listarSalarios, obterSalarioAtual } from "../../services/salaryservice";
import { useTheme } from "../../theme/tema";
import { formatarData, nomeCompleto } from "../../utils/formatar";
import HistoricoSalarios from "../salarios/HistoricoSalarios";
import Alerta from "../ui/Alerta";
import ListaDados from "../ui/ListaDados";
import NivelCompetencia from "../ui/NivelCompetencia";
import FotoPerfil from "./FotoPerfil";

// A aba "O meu perfil", igual para o colaborador e para o company_admin:
// foto, dados da conta, competências e salário da própria pessoa.
// `conta` é o utilizador (com `profile`) que a página já carregou; `onAvatarAlterado(url)` devolve-lhe a foto nova.
export default function MeuPerfil({ userId, token, conta, carregandoConta = false, cargoPadrao, descricao, onAvatarAlterado }) {
  const tema = useTheme();
  const [competencias, setCompetencias] = useState({ carregando: Boolean(userId), lista: [], erro: "" });
  const [salario, setSalario] = useState({ carregando: Boolean(userId), historico: [], atual: null, erro: "" });

  // Competências e salário (só leitura: são definidos por quem administra a conta).
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

  const perfil = conta?.profile || null;
  const nomeDaConta = nomeCompleto(conta);
  const email = conta?.email || "E-mail não disponível";
  const cargo = perfil?.jobTitle || cargoPadrao;
  const valorConta = (valor) => (carregandoConta ? "A carregar…" : valor);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold sm:text-2xl">O meu perfil</h2>
        <p className={`mt-1 text-sm ${tema.muted}`}>{descricao}</p>
      </div>
      {userId && (
        <section className={`rounded-2xl border p-5 sm:p-6 ${tema.card}`}>
          <h3 className="mb-4 font-semibold">Foto de perfil</h3>
          <FotoPerfil userId={userId} url={perfil?.avatarUrl} nome={perfil?.firstName || email} token={token} onAlterada={onAvatarAlterado} />
        </section>
      )}
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
  );
}
