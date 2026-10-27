import { useState } from "react";
import { useTheme } from "../../theme/tema";
import { idDe, nomeCompleto } from "../../utils/formatar";
import BotaoReenviarConvite from "../ui/BotaoReenviarConvite";
import EstadoConta from "../ui/EstadoConta";
import Icone from "../ui/Icone";
import Avatar from "../ui/Avatar";

// Diretório de colaboradores: pesquisa, cartões (telemóvel/tablet) e tabela (ecrãs largos).
export default function ListaColaboradores({ colaboradores, carregando, onNovo, onAlocacoes, onCompetencias, onSalario, onEditar }) {
  const tema = useTheme();
  const [busca, setBusca] = useState("");

  const filtrados = colaboradores.filter((item) =>
    `${nomeCompleto(item)} ${item.email || ""}`.toLowerCase().includes(busca.toLowerCase()),
  );
  const mensagemVazia = busca
    ? "Nenhum colaborador corresponde à pesquisa."
    : "Ainda não há colaboradores registados nesta empresa.";

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Diretório de colaboradores</h1>
          <p className={`mt-1 text-xs ${tema.muted}`}>Gira as contas e os acessos da equipa.</p>
        </div>
        <button
          type="button"
          onClick={onNovo}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold shadow-md transition ${tema.primaryBtn}`}
        >
          <Icone nome="mais" className="h-4 w-4" />
          Novo colaborador
        </button>
      </div>

      <div className={`flex flex-col items-center justify-between gap-4 rounded-2xl border p-4 md:flex-row ${tema.card}`}>
        <div className="relative w-full md:w-80">
          <span className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 ${tema.muted}`}>
            <Icone nome="pesquisa" className="h-4 w-4" />
          </span>
          <input
            type="search"
            aria-label="Pesquisar colaboradores"
            placeholder="Pesquisar por nome ou e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={`w-full rounded-xl border py-2 pl-9 pr-4 text-xs outline-none transition focus:ring-4 ${tema.input}`}
          />
        </div>
        <p className={`w-full text-left text-xs md:w-auto ${tema.muted}`}>
          A mostrar {filtrados.length} de {colaboradores.length} colaboradores
        </p>
      </div>

      {/* Cartões em tablets/telemóveis */}
      <div className="space-y-3 xl:hidden">
        {carregando || filtrados.length === 0 ? (
          <div className={`rounded-2xl border p-8 text-center text-sm ${tema.card} ${tema.muted}`}>
            {carregando ? "A carregar colaboradores…" : mensagemVazia}
          </div>
        ) : (
          filtrados.map((colab) => (
            <article key={idDe(colab)} className={`rounded-2xl border p-4 ${tema.card}`}>
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar url={colab.profile?.avatarUrl} nome={colab.profile?.firstName || colab.email} />
                  <div className="min-w-0">
                    <h3 className="break-words text-sm font-semibold">{nomeCompleto(colab) || "Nome não registado"}</h3>
                    <p className={`mt-1 break-all text-xs ${tema.muted}`}>{colab.email || "E-mail não disponível"}</p>
                  </div>
                </div>
                <EstadoConta estado={colab.status} />
              </div>
              <div className={`mt-4 grid grid-cols-2 gap-2 border-t pt-3 text-xs ${tema.border}`}>
                <button
                  type="button"
                  onClick={() => onAlocacoes(colab)}
                  className={`rounded-lg border px-3 py-2.5 font-semibold ${tema.secondaryBtn}`}
                >
                  Alocações
                </button>
                <button
                  type="button"
                  onClick={() => onCompetencias(colab)}
                  className={`rounded-lg border px-3 py-2.5 font-semibold ${tema.secondaryBtn}`}
                >
                  Competências
                </button>
                <button
                  type="button"
                  onClick={() => onSalario(colab)}
                  className={`rounded-lg border px-3 py-2.5 font-semibold ${tema.secondaryBtn}`}
                >
                  Salário
                </button>
                <button
                  type="button"
                  onClick={() => onEditar(colab)}
                  className={`rounded-lg border px-3 py-2.5 font-semibold ${tema.border} ${tema.accent}`}
                >
                  Editar perfil
                </button>
              </div>
              {colab.status === "invited" && (
                <div className="mt-3 text-center">
                  <BotaoReenviarConvite userId={colab.id} />
                </div>
              )}
            </article>
          ))
        )}
      </div>

      {/* Tabela em monitores largos */}
      <div className={`hidden overflow-hidden rounded-2xl border xl:block ${tema.card}`}>
        <table className="w-full text-left text-sm">
          <thead className={`border-b text-[11px] font-semibold uppercase tracking-wider ${tema.tableHeader}`}>
            <tr>
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">E-mail</th>
              <th className="px-6 py-4">Cargo</th>
              <th className="px-6 py-4">Estado da conta</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${tema.border}`}>
            {carregando || filtrados.length === 0 ? (
              <tr>
                <td colSpan="5" className={`px-6 py-12 text-center text-xs ${tema.muted}`}>
                  {carregando ? "A carregar dados do servidor..." : mensagemVazia}
                </td>
              </tr>
            ) : (
              filtrados.map((colab) => (
                <tr key={idDe(colab)} className={`transition-colors ${tema.tableRowHover}`}>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-3 break-words font-semibold">
                      <Avatar url={colab.profile?.avatarUrl} nome={colab.profile?.firstName || colab.email} tamanho="sm" />
                      {nomeCompleto(colab) || "Nome não registado"}
                    </span>
                  </td>
                  <td className={`break-all px-6 py-4 font-mono text-xs ${tema.muted}`}>{colab.email || "—"}</td>
                  <td className="px-6 py-4">{colab.profile?.jobTitle || "Colaborador"}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-start gap-1.5">
                      <EstadoConta estado={colab.status} />
                      {colab.status === "invited" && <BotaoReenviarConvite userId={colab.id} />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-4 whitespace-nowrap text-xs font-bold">
                      <button type="button" onClick={() => onAlocacoes(colab)} className={`hover:underline ${tema.strong}`}>
                        Alocações
                      </button>
                      <button type="button" onClick={() => onCompetencias(colab)} className={`hover:underline ${tema.strong}`}>
                        Competências
                      </button>
                      <button type="button" onClick={() => onSalario(colab)} className={`hover:underline ${tema.strong}`}>
                        Salário
                      </button>
                      <button type="button" onClick={() => onEditar(colab)} className={`hover:underline ${tema.accent}`}>
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
