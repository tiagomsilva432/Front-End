import { useEffect, useState } from "react";
import {
  CATEGORIAS_COMPETENCIA,
  atualizarCompetencia,
  criarCompetencia,
  listarCompetencias,
  listarPessoasComCompetencia,
} from "../../services/skillservice";
import { useTheme } from "../../theme/tema";
import { idDe, nomeCompleto } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import Campo from "../ui/Campo";
import Icone from "../ui/Icone";
import NivelCompetencia from "../ui/NivelCompetencia";

// Catálogo de competências (comum a todas as empresas).
// Com `podeEditar` (system_admin) cria e altera entradas; com `pessoas` (company_admin) mostra quem tem cada uma.
export default function CatalogoCompetencias({ token, podeEditar = false, pessoas }) {
  const tema = useTheme();
  const [competencias, setCompetencias] = useState([]);
  const [categoria, setCategoria] = useState("");
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [recarga, setRecarga] = useState(0);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [nova, setNova] = useState({ name: "", category: "other" });
  const [emEdicao, setEmEdicao] = useState(null); // { id, name, category }
  const [aGuardar, setAGuardar] = useState(false);
  const [aberta, setAberta] = useState(null); // id da competência com a lista de pessoas aberta
  const [titulares, setTitulares] = useState({ carregando: false, lista: [], erro: "" });

  useEffect(() => {
    let ativo = true;
    listarCompetencias(token, categoria)
      .then((lista) => {
        if (!ativo) return;
        setCompetencias(Array.isArray(lista) ? lista : []);
        setErro("");
      })
      .catch((err) => {
        if (ativo) setErro(err.message || "Não foi possível carregar o catálogo.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [token, categoria, recarga]);

  const recarregar = () => {
    setCarregando(true);
    setRecarga((n) => n + 1);
  };

  const guardar = async (acao, mensagem) => {
    setAGuardar(true);
    setErro("");
    setSucesso("");
    try {
      await acao();
      setSucesso(mensagem);
      setEmEdicao(null);
      recarregar();
      return true;
    } catch (err) {
      setErro(err.message || "Não foi possível guardar.");
      return false;
    } finally {
      setAGuardar(false);
    }
  };

  const criar = async (e) => {
    e.preventDefault();
    const name = nova.name.trim();
    if (!name) return;
    const ok = await guardar(() => criarCompetencia({ name, category: nova.category }, token), `${name} adicionada ao catálogo.`);
    if (ok) setNova((atual) => ({ ...atual, name: "" }));
  };

  const verTitulares = async (skill) => {
    if (aberta === skill.id) {
      setAberta(null);
      return;
    }
    setAberta(skill.id);
    setTitulares({ carregando: true, lista: [], erro: "" });
    try {
      const lista = await listarPessoasComCompetencia(skill.id, token);
      setTitulares({ carregando: false, lista: Array.isArray(lista) ? lista : [], erro: "" });
    } catch (err) {
      setTitulares({ carregando: false, lista: [], erro: err.message || "Não foi possível carregar." });
    }
  };

  const pessoaPorId = new Map((pessoas || []).map((p) => [idDe(p), p]));
  const filtradas = competencias.filter((s) => s.name.toLowerCase().includes(busca.trim().toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Competências</h1>
        <p className={`mt-1 text-xs ${tema.muted}`}>
          {podeEditar
            ? "Catálogo partilhado por todas as empresas. Os nomes são únicos, sem distinguir maiúsculas."
            : "Catálogo de competências. Veja quem as tem na sua empresa; atribuem-se no diretório de colaboradores."}
        </p>
      </div>

      {erro && <Alerta>{erro}</Alerta>}
      {sucesso && <Alerta tipo="sucesso">{sucesso}</Alerta>}

      {podeEditar && (
        <form onSubmit={criar} className={`grid gap-3 rounded-2xl border p-4 sm:grid-cols-[1fr_12rem_auto] sm:items-end ${tema.card}`}>
          <Campo
            id="nova-skill-nome"
            label="Nova competência"
            obrigatorio
            maxLength={100}
            placeholder="Ex.: Kotlin"
            value={nova.name}
            onChange={(e) => setNova((atual) => ({ ...atual, name: e.target.value }))}
            disabled={aGuardar}
          />
          <Campo
            id="nova-skill-categoria"
            label="Categoria"
            como="select"
            value={nova.category}
            onChange={(e) => setNova((atual) => ({ ...atual, category: e.target.value }))}
            disabled={aGuardar}
          >
            {Object.entries(CATEGORIAS_COMPETENCIA).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </Campo>
          <button
            type="submit"
            disabled={aGuardar || !nova.name.trim()}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-md transition disabled:opacity-50 ${tema.primaryBtn}`}
          >
            <Icone nome="mais" className="h-4 w-4" />
            Adicionar
          </button>
        </form>
      )}

      <div className={`flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between ${tema.card}`}>
        <div className="relative w-full md:w-80">
          <span className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 ${tema.muted}`}>
            <Icone nome="pesquisa" className="h-4 w-4" />
          </span>
          <input
            type="search"
            aria-label="Pesquisar competências"
            placeholder="Pesquisar competência..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={`w-full rounded-xl border py-2 pl-9 pr-4 text-xs outline-none transition focus:ring-4 ${tema.input}`}
          />
        </div>
        <select
          aria-label="Filtrar por categoria"
          value={categoria}
          onChange={(e) => {
            setCarregando(true);
            setCategoria(e.target.value);
          }}
          className={`rounded-xl border px-3 py-2 text-xs outline-none ${tema.input}`}
        >
          <option value="">Todas as categorias</option>
          {Object.entries(CATEGORIAS_COMPETENCIA).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          ))}
        </select>
      </div>

      {carregando || filtradas.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center text-xs ${tema.card} ${tema.muted}`}>
          {carregando ? "A carregar catálogo…" : busca ? "Nenhuma competência corresponde à pesquisa." : "O catálogo está vazio."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtradas.map((skill) => (
            <article key={skill.id} className={`space-y-3 rounded-2xl border p-4 ${tema.card}`}>
              {emEdicao?.id === skill.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const alteracoes = {};
                    if (emEdicao.name.trim() !== skill.name) alteracoes.name = emEdicao.name.trim();
                    if (emEdicao.category !== skill.category) alteracoes.category = emEdicao.category;
                    if (!Object.keys(alteracoes).length) return setEmEdicao(null);
                    guardar(() => atualizarCompetencia(skill.id, alteracoes, token), "Competência atualizada.");
                  }}
                  className="space-y-3"
                >
                  <Campo
                    id={`skill-nome-${skill.id}`}
                    label="Nome"
                    obrigatorio
                    maxLength={100}
                    value={emEdicao.name}
                    onChange={(e) => setEmEdicao((atual) => ({ ...atual, name: e.target.value }))}
                    disabled={aGuardar}
                  />
                  <Campo
                    id={`skill-categoria-${skill.id}`}
                    label="Categoria"
                    como="select"
                    value={emEdicao.category}
                    onChange={(e) => setEmEdicao((atual) => ({ ...atual, category: e.target.value }))}
                    disabled={aGuardar}
                  >
                    {Object.entries(CATEGORIAS_COMPETENCIA).map(([valor, rotulo]) => (
                      <option key={valor} value={valor}>
                        {rotulo}
                      </option>
                    ))}
                  </Campo>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={aGuardar}
                      onClick={() => setEmEdicao(null)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${tema.secondaryBtn}`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={aGuardar}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${tema.primaryBtn}`}
                    >
                      {aGuardar ? "A guardar…" : "Guardar"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words text-sm font-semibold">{skill.name}</h3>
                    <span className={`mt-2 inline-block rounded-md border px-2 py-0.5 text-[10px] font-semibold ${tema.chip}`}>
                      {CATEGORIAS_COMPETENCIA[skill.category] || skill.category}
                    </span>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {podeEditar && (
                      <button
                        type="button"
                        onClick={() => setEmEdicao({ id: skill.id, name: skill.name, category: skill.category })}
                        className={`text-xs font-semibold hover:underline ${tema.accent}`}
                      >
                        Editar
                      </button>
                    )}
                    {pessoas && (
                      <button
                        type="button"
                        aria-expanded={aberta === skill.id}
                        onClick={() => verTitulares(skill)}
                        className={`text-xs font-semibold hover:underline ${tema.accent}`}
                      >
                        {aberta === skill.id ? "Fechar" : "Quem tem"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {aberta === skill.id && (
                <div className={`space-y-2 border-t pt-3 ${tema.border}`}>
                  {titulares.erro && <Alerta>{titulares.erro}</Alerta>}
                  {titulares.carregando ? (
                    <p className={`text-xs ${tema.muted}`}>A carregar…</p>
                  ) : titulares.lista.length === 0 && !titulares.erro ? (
                    <p className={`text-xs ${tema.muted}`}>Ninguém na empresa tem esta competência.</p>
                  ) : (
                    titulares.lista.map((t) => {
                      const pessoa = pessoaPorId.get(t.userId);
                      return (
                        <div key={t.userId} className="flex items-center justify-between gap-2 text-xs">
                          <span className="min-w-0 truncate">
                            {nomeCompleto(pessoa) || pessoa?.email || "Colaborador"}
                            {t.yearsExperience ? <span className={tema.muted}> · {Number(t.yearsExperience)} anos</span> : null}
                          </span>
                          <NivelCompetencia nivel={t.proficiency} />
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
