import { useEffect, useState } from "react";
import { TIPOS_AUSENCIA } from "../../services/absenceservice";
import { apagarFeriado, criarFeriado, listarFeriados, obterCalendario } from "../../services/calendarservice";
import { listarUsers } from "../../services/userservice";
import { useNotificacoes } from "../../notificacoes/notificacoes";
import { useTheme } from "../../theme/tema";
import { formatarData, formatarIntervalo, idDe, isoLocal, nomeCompleto } from "../../utils/formatar";
import { corDoTipo } from "../ausencias/estiloAusencia";
import Alerta from "../ui/Alerta";
import Campo from "../ui/Campo";

const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const MAX_NA_CELULA = 3;

// "dezembro de 2026" -> "Dezembro de 2026" (o capitalize do CSS punha "De" também).
const maiuscula = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

const primeiroDoMes = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const ultimoDoMes = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

// As 6 semanas (segunda a domingo) que mostram o mês inteiro.
function diasDaGrelha(mes) {
  const inicio = primeiroDoMes(mes);
  const recuo = (inicio.getDay() + 6) % 7; // segunda = 0
  return Array.from({ length: 42 }, (_, i) => new Date(inicio.getFullYear(), inicio.getMonth(), 1 - recuo + i));
}

// Calendário da empresa (GET /calendar): feriados e quem está fora, por mês.
// Os pedidos pendentes só aparecem à própria pessoa e aos admins; as baixas aparecem aos colegas como "ausente".
// Com `podeGerirFeriados` (company_admin), junta e apaga os feriados da empresa.
export default function CalendarioMes({ token, pessoas: pessoasDadas, podeGerirFeriados = false }) {
  const tema = useTheme();
  const { versaoDados } = useNotificacoes();
  const [mes, setMes] = useState(() => primeiroDoMes(new Date()));
  const [calendario, setCalendario] = useState(null);
  const [pessoasCarregadas, setPessoasCarregadas] = useState([]);
  const [diaEscolhido, setDiaEscolhido] = useState(() => isoLocal(new Date()));
  const [carregando, setCarregando] = useState(true);
  const [recarga, setRecarga] = useState(0);
  const [erro, setErro] = useState("");

  const de = isoLocal(primeiroDoMes(mes));
  const ate = isoLocal(ultimoDoMes(mes));

  useEffect(() => {
    let ativo = true;
    obterCalendario(de, ate, token)
      .then((c) => {
        if (!ativo) return;
        setCalendario(c);
        setErro("");
      })
      .catch((err) => ativo && setErro(err.message || "Não foi possível carregar o calendário."))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [de, ate, token, recarga, versaoDados]);

  useEffect(() => {
    if (pessoasDadas) return;
    let ativo = true;
    listarUsers({}, token)
      .then((lista) => ativo && Array.isArray(lista) && setPessoasCarregadas(lista))
      .catch((err) => console.error("Erro ao carregar os colegas:", err));
    return () => {
      ativo = false;
    };
  }, [pessoasDadas, token]);

  const pessoaPorId = new Map((pessoasDadas || pessoasCarregadas).map((p) => [idDe(p), p]));
  const nomeDe = (id) => nomeCompleto(pessoaPorId.get(id)) || pessoaPorId.get(id)?.email || "Colega";
  const primeiroNome = (id) => pessoaPorId.get(id)?.profile?.firstName || nomeDe(id).split(/[ @]/)[0];

  const feriadosDoDia = (dia) => (calendario?.holidays || []).filter((h) => h.date === dia);
  const ausenciasDoDia = (dia) => (calendario?.absences || []).filter((a) => a.startDate <= dia && a.endDate >= dia);

  const mudarMes = (delta) => {
    setCarregando(true);
    setMes((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
  };
  const irParaHoje = () => {
    setCarregando(true);
    setMes(primeiroDoMes(new Date()));
    setDiaEscolhido(isoLocal(new Date()));
  };

  const hoje = isoLocal(new Date());
  const titulo = maiuscula(mes.toLocaleDateString("pt-PT", { month: "long", year: "numeric" }));
  const feriadosEscolhido = feriadosDoDia(diaEscolhido);
  const ausenciasEscolhido = ausenciasDoDia(diaEscolhido);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Calendário</h1>
          <p className={`mt-1 text-xs ${tema.muted}`}>Feriados e ausências da empresa. Clique num dia para ver quem está fora.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Mês anterior"
            onClick={() => mudarMes(-1)}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold ${tema.secondaryBtn}`}
          >
            ‹
          </button>
          <p className="min-w-36 text-center text-sm font-semibold" aria-live="polite">
            {titulo}
          </p>
          <button
            type="button"
            aria-label="Mês seguinte"
            onClick={() => mudarMes(1)}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold ${tema.secondaryBtn}`}
          >
            ›
          </button>
          <button type="button" onClick={irParaHoje} className={`rounded-xl border px-3 py-2 text-xs font-semibold ${tema.secondaryBtn}`}>
            Hoje
          </button>
        </div>
      </div>

      {erro && <Alerta>{erro}</Alerta>}

      <div className={`overflow-hidden rounded-2xl border ${tema.card} ${carregando ? "opacity-60" : ""}`}>
        <div className={`grid grid-cols-7 border-b text-center text-[11px] font-semibold uppercase tracking-wider ${tema.tableHeader}`}>
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {diasDaGrelha(mes).map((data, i) => {
            const dia = isoLocal(data);
            const doMes = data.getMonth() === mes.getMonth();
            const fimDeSemana = i % 7 >= 5;
            const feriados = doMes ? feriadosDoDia(dia) : [];
            const ausencias = doMes ? ausenciasDoDia(dia) : [];
            const escolhido = dia === diaEscolhido;
            const descricao = [
              formatarData(dia),
              ...feriados.map((f) => `feriado: ${f.name}`),
              ausencias.length ? `${ausencias.length} ${ausencias.length === 1 ? "pessoa ausente" : "pessoas ausentes"}` : "",
            ]
              .filter(Boolean)
              .join(", ");
            return (
              <button
                key={dia}
                type="button"
                aria-label={descricao}
                aria-pressed={escolhido}
                onClick={() => setDiaEscolhido(dia)}
                className={`min-h-16 border-b border-r p-1.5 text-left align-top transition-colors sm:min-h-24 ${tema.border} ${tema.hover} ${
                  !doMes ? "opacity-35" : fimDeSemana || feriados.length ? tema.cardMuted : ""
                } ${escolhido ? "ring-2 ring-inset ring-emerald-500" : ""}`}
              >
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                    dia === hoje ? (tema.isDark ? "bg-emerald-500 text-slate-950" : "bg-emerald-600 text-white") : ""
                  } ${feriados.length ? "text-red-500" : ""}`}
                >
                  {data.getDate()}
                </span>
                {feriados.map((f) => (
                  <span key={f.date + f.name} className="mt-0.5 hidden truncate text-[10px] font-semibold text-red-500 sm:block">
                    {f.name}
                  </span>
                ))}
                {/* Ecrãs largos: nomes; telemóvel: pontos. */}
                <span className="mt-1 hidden space-y-0.5 sm:block">
                  {ausencias.slice(0, MAX_NA_CELULA).map((a) => (
                    <span
                      key={a.id}
                      className={`block truncate rounded border px-1 text-[10px] font-medium ${corDoTipo(tema, a.type)} ${
                        a.status === "pending" ? "border-dashed opacity-70" : ""
                      }`}
                    >
                      {primeiroNome(a.userId)}
                    </span>
                  ))}
                  {ausencias.length > MAX_NA_CELULA && (
                    <span className={`block text-[10px] ${tema.muted}`}>+{ausencias.length - MAX_NA_CELULA}</span>
                  )}
                </span>
                {ausencias.length > 0 && (
                  <span className="mt-1 flex flex-wrap gap-0.5 sm:hidden" aria-hidden="true">
                    {ausencias.slice(0, 4).map((a) => (
                      <span key={a.id} className={`h-1.5 w-1.5 rounded-full ${a.type === "vacation" ? "bg-emerald-500" : "bg-amber-500"}`} />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className={`flex flex-wrap gap-x-4 gap-y-1 text-[11px] ${tema.muted}`}>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" /> Férias
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden="true" /> Baixa / outra ausência
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded border border-dashed border-slate-400" aria-hidden="true" /> Pendente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="font-semibold text-red-500">12</span> Feriado
        </span>
      </div>

      <section className={`rounded-2xl border p-5 ${tema.card}`} aria-live="polite">
        <h2 className="font-semibold">
          {maiuscula(new Date(`${diaEscolhido}T00:00:00`).toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" }))}
        </h2>
        {feriadosEscolhido.map((f) => (
          <p key={f.name} className="mt-2 text-sm font-semibold text-red-500">
            Feriado: {f.name} {f.kind === "company" && <span className={`font-normal ${tema.muted}`}>(da empresa)</span>}
          </p>
        ))}
        {ausenciasEscolhido.length === 0 ? (
          <p className={`mt-2 text-sm ${tema.muted}`}>Ninguém está ausente neste dia.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {ausenciasEscolhido.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>
                  <span className="font-medium">{nomeDe(a.userId)}</span>
                  <span className={tema.muted}> · {formatarIntervalo(a.startDate, a.endDate)}</span>
                </span>
                <span className="flex items-center gap-2">
                  {a.status === "pending" && <span className={`text-[10px] font-semibold uppercase ${tema.muted}`}>Pendente</span>}
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase ${corDoTipo(tema, a.type)}`}>
                    {TIPOS_AUSENCIA[a.type] || a.type}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {podeGerirFeriados && (
        <FeriadosEmpresa
          ano={mes.getFullYear()}
          token={token}
          onAlterados={() => {
            setCarregando(true);
            setRecarga((n) => n + 1);
          }}
        />
      )}
    </div>
  );
}

// Lista dos feriados do ano e gestão dos da empresa (os nacionais vêm do país da empresa e não se apagam).
function FeriadosEmpresa({ ano, token, onAlterados }) {
  const tema = useTheme();
  const [feriados, setFeriados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [recarga, setRecarga] = useState(0);
  const [novo, setNovo] = useState({ date: "", name: "" });
  const [aGuardar, setAGuardar] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    listarFeriados(ano, token)
      .then((lista) => ativo && setFeriados(Array.isArray(lista) ? lista : []))
      .catch((err) => ativo && setErro(err.message || "Não foi possível carregar os feriados."))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [ano, token, recarga]);

  const executar = async (acao) => {
    setAGuardar(true);
    setErro("");
    try {
      await acao();
      setCarregando(true);
      setRecarga((n) => n + 1);
      onAlterados();
      return true;
    } catch (err) {
      setErro(err.message || "Não foi possível guardar o feriado.");
      return false;
    } finally {
      setAGuardar(false);
    }
  };

  const juntar = async (e) => {
    e.preventDefault();
    const ok = await executar(() => criarFeriado({ date: novo.date, name: novo.name.trim() }, token));
    if (ok) setNovo({ date: "", name: "" });
  };

  return (
    <section className={`space-y-4 rounded-2xl border p-5 ${tema.card}`}>
      <div>
        <h2 className="font-semibold">Feriados de {ano}</h2>
        <p className={`mt-1 text-xs ${tema.muted}`}>
          Os nacionais são calculados a partir do país da empresa. Junte os da empresa: municipal, Carnaval, fecho de fim de ano…
        </p>
      </div>

      {erro && <Alerta>{erro}</Alerta>}

      <form onSubmit={juntar} className="grid gap-3 sm:grid-cols-[10rem_1fr_auto] sm:items-end">
        <Campo
          id="feriado-data"
          label="Data"
          obrigatorio
          type="date"
          min={`${ano}-01-01`}
          max={`${ano}-12-31`}
          value={novo.date}
          onChange={(e) => setNovo((n) => ({ ...n, date: e.target.value }))}
          disabled={aGuardar}
        />
        <Campo
          id="feriado-nome"
          label="Nome"
          obrigatorio
          maxLength={150}
          placeholder="Ex.: Santo António"
          value={novo.name}
          onChange={(e) => setNovo((n) => ({ ...n, name: e.target.value }))}
          disabled={aGuardar}
        />
        <button
          type="submit"
          disabled={aGuardar || !novo.date || !novo.name.trim()}
          className={`rounded-xl px-4 py-2.5 text-xs font-bold disabled:opacity-50 ${tema.primaryBtn}`}
        >
          Juntar feriado
        </button>
      </form>

      {carregando ? (
        <p className={`text-xs ${tema.muted}`}>A carregar…</p>
      ) : (
        <ul className={`divide-y rounded-xl border ${tema.border}`}>
          {feriados.map((f) => (
            <li key={f.date + f.name} className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm ${tema.border}`}>
              <span>
                <span className="font-medium">{formatarData(f.date)}</span> · {f.name}
              </span>
              {f.kind === "company" ? (
                <button
                  type="button"
                  disabled={aGuardar}
                  onClick={() => executar(() => apagarFeriado(f.id, token))}
                  className="text-xs font-semibold text-red-500 hover:underline disabled:opacity-50"
                >
                  Apagar
                </button>
              ) : (
                <span className={`text-[10px] font-semibold uppercase ${tema.muted}`}>Nacional</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
