import { useEffect, useState } from "react";
import { criarCiclo, criarPedidoAvulso, listarCiclos } from "../../services/reviewservice";
import { useTheme } from "../../theme/tema";
import { formatarData, hojeISO, idDe, nomeCompleto } from "../../utils/formatar";
import Alerta from "../ui/Alerta";
import Campo from "../ui/Campo";
import Icone from "../ui/Icone";
import DetalheCiclo from "./DetalheCiclo";

const seisMesesAtras = () => {
  const data = new Date();
  data.setMonth(data.getMonth() - 6);
  return data.toISOString().slice(0, 10);
};

const cicloVazio = () => ({ name: "", deadline: "", since: seisMesesAtras() });
const pedidoVazio = { reviewerId: "", revieweeId: "", dueDate: "" };

// Ciclos de avaliação da empresa (company_admin): abrir, acompanhar, fechar e ver resultados.
export default function GestaoAvaliacoes({ token, pessoas }) {
  const tema = useTheme();
  const [ciclos, setCiclos] = useState([]);
  const [apenasAbertos, setApenasAbertos] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [recarga, setRecarga] = useState(0);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [aviso, setAviso] = useState("");
  const [painel, setPainel] = useState(null); // null | "ciclo" | "avulso"
  const [novoCiclo, setNovoCiclo] = useState(cicloVazio);
  const [novoPedido, setNovoPedido] = useState(pedidoVazio);
  const [aGuardar, setAGuardar] = useState(false);
  const [cicloAberto, setCicloAberto] = useState(null);

  useEffect(() => {
    let ativo = true;
    listarCiclos(token, apenasAbertos)
      .then((lista) => {
        if (!ativo) return;
        setCiclos(Array.isArray(lista) ? lista : []);
        setErro("");
      })
      .catch((err) => {
        if (ativo) setErro(err.message || "Não foi possível carregar os ciclos de avaliação.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [token, apenasAbertos, recarga]);

  const recarregar = () => {
    setCarregando(true);
    setRecarga((n) => n + 1);
  };

  const guardar = async (acao) => {
    setAGuardar(true);
    setErro("");
    setSucesso("");
    setAviso("");
    try {
      await acao();
      setPainel(null);
      recarregar();
    } catch (err) {
      setErro(err.message || "Não foi possível guardar.");
    } finally {
      setAGuardar(false);
    }
  };

  const abrirCiclo = (e) => {
    e.preventDefault();
    guardar(async () => {
      const ciclo = await criarCiclo(
        {
          name: novoCiclo.name.trim(),
          since: novoCiclo.since,
          ...(novoCiclo.deadline ? { deadline: novoCiclo.deadline } : {}),
        },
        token,
      );
      setNovoCiclo(cicloVazio());
      if (ciclo?.requestCount) {
        setSucesso(`Ciclo "${ciclo.name}" aberto com ${ciclo.requestCount} pedidos de avaliação.`);
      } else {
        setAviso(
          `O ciclo "${ciclo?.name}" foi aberto, mas não gerou nenhum pedido: só se avaliam pessoas ativas que ` +
            "estiveram alocadas ao mesmo projeto ao mesmo tempo, desde a data indicada. Aloque pelo menos duas " +
            "pessoas ao mesmo projeto e abra um novo ciclo, ou use um pedido avulso.",
        );
      }
    });
  };

  const pedirAvulso = (e) => {
    e.preventDefault();
    if (novoPedido.reviewerId === novoPedido.revieweeId) {
      setErro("Ninguém se avalia a si próprio.");
      return;
    }
    guardar(async () => {
      await criarPedidoAvulso(
        {
          reviewerId: novoPedido.reviewerId,
          revieweeId: novoPedido.revieweeId,
          ...(novoPedido.dueDate ? { dueDate: novoPedido.dueDate } : {}),
        },
        token,
      );
      setNovoPedido(pedidoVazio);
      setSucesso("Pedido de avaliação criado. A resposta aparece em “Resultados por pessoa”.");
    });
  };

  if (cicloAberto) {
    return (
      <DetalheCiclo
        ciclo={cicloAberto}
        pessoas={pessoas}
        token={token}
        onVoltar={() => {
          setCicloAberto(null);
          recarregar();
        }}
      />
    );
  }

  const ativos = pessoas.filter((p) => p.status === "active");
  const opcoesPessoas = ativos.map((p) => (
    <option key={idDe(p)} value={idDe(p)}>
      {nomeCompleto(p) || p.email}
    </option>
  ));

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Ciclos de avaliação</h1>
          <p className={`mt-1 text-xs ${tema.muted}`}>
            Ao abrir um ciclo, cada par de colegas que partilhou um projeto avalia-se mutuamente. Os resultados são anónimos.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPainel(painel === "avulso" ? null : "avulso")}
            className={`rounded-xl border px-4 py-2.5 text-xs font-semibold ${tema.secondaryBtn}`}
          >
            Pedido avulso
          </button>
          <button
            type="button"
            onClick={() => setPainel(painel === "ciclo" ? null : "ciclo")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-md transition ${tema.primaryBtn}`}
          >
            <Icone nome="mais" className="h-4 w-4" />
            Novo ciclo
          </button>
        </div>
      </div>

      {erro && <Alerta>{erro}</Alerta>}
      {sucesso && <Alerta tipo="sucesso">{sucesso}</Alerta>}
      {aviso && <Alerta tipo="aviso">{aviso}</Alerta>}

      {painel === "ciclo" && (
        <form onSubmit={abrirCiclo} className={`space-y-4 rounded-2xl border p-5 ${tema.card}`}>
          <h2 className="font-semibold">Abrir ciclo de avaliação</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Campo
              id="ciclo-nome"
              label="Nome"
              obrigatorio
              maxLength={100}
              placeholder="Ex.: Avaliação Q4 2026"
              value={novoCiclo.name}
              onChange={(e) => setNovoCiclo((c) => ({ ...c, name: e.target.value }))}
              disabled={aGuardar}
            />
            <Campo
              id="ciclo-prazo"
              label="Prazo (opcional)"
              type="date"
              min={hojeISO()}
              value={novoCiclo.deadline}
              onChange={(e) => setNovoCiclo((c) => ({ ...c, deadline: e.target.value }))}
              disabled={aGuardar}
            />
            <Campo
              id="ciclo-desde"
              label="Colegas desde"
              type="date"
              max={hojeISO()}
              value={novoCiclo.since}
              onChange={(e) => setNovoCiclo((c) => ({ ...c, since: e.target.value }))}
              disabled={aGuardar}
            />
          </div>
          <p className={`text-xs ${tema.muted}`}>
            “Colegas desde” define a janela: contam as pessoas ativas que estiveram no mesmo projeto ao mesmo tempo entre
            essa data e hoje. Sem prazo, os pedidos só expiram quando o ciclo for fechado.
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={aGuardar}
              onClick={() => setPainel(null)}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${tema.secondaryBtn}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={aGuardar || !novoCiclo.name.trim()}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60 ${tema.primaryBtn}`}
            >
              {aGuardar ? "A abrir…" : "Abrir ciclo"}
            </button>
          </div>
        </form>
      )}

      {painel === "avulso" && (
        <form onSubmit={pedirAvulso} className={`space-y-4 rounded-2xl border p-5 ${tema.card}`}>
          <div>
            <h2 className="font-semibold">Pedido avulso</h2>
            <p className={`mt-1 text-xs ${tema.muted}`}>Peça a uma pessoa que avalie outra, fora de qualquer ciclo.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Campo
              id="avulso-avaliador"
              label="Quem avalia"
              obrigatorio
              como="select"
              value={novoPedido.reviewerId}
              onChange={(e) => setNovoPedido((p) => ({ ...p, reviewerId: e.target.value }))}
              disabled={aGuardar}
            >
              <option value="">Selecione</option>
              {opcoesPessoas}
            </Campo>
            <Campo
              id="avulso-avaliado"
              label="Quem é avaliado"
              obrigatorio
              como="select"
              value={novoPedido.revieweeId}
              onChange={(e) => setNovoPedido((p) => ({ ...p, revieweeId: e.target.value }))}
              disabled={aGuardar}
            >
              <option value="">Selecione</option>
              {opcoesPessoas}
            </Campo>
            <Campo
              id="avulso-prazo"
              label="Prazo (opcional)"
              type="date"
              min={hojeISO()}
              value={novoPedido.dueDate}
              onChange={(e) => setNovoPedido((p) => ({ ...p, dueDate: e.target.value }))}
              disabled={aGuardar}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={aGuardar}
              onClick={() => setPainel(null)}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${tema.secondaryBtn}`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={aGuardar || !novoPedido.reviewerId || !novoPedido.revieweeId}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60 ${tema.primaryBtn}`}
            >
              {aGuardar ? "A criar…" : "Criar pedido"}
            </button>
          </div>
        </form>
      )}

      <div className={`flex items-center justify-between gap-3 rounded-2xl border p-4 ${tema.card}`}>
        <p className={`text-xs ${tema.muted}`}>
          {ciclos.length} {ciclos.length === 1 ? "ciclo" : "ciclos"}
        </p>
        <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold">
          <input
            type="checkbox"
            checked={apenasAbertos}
            onChange={(e) => {
              setCarregando(true);
              setApenasAbertos(e.target.checked);
            }}
          />
          Só ciclos abertos
        </label>
      </div>

      {carregando || ciclos.length === 0 ? (
        <div className={`rounded-2xl border p-10 text-center text-xs ${tema.card} ${tema.muted}`}>
          {carregando ? "A carregar ciclos…" : "Ainda não foi aberto nenhum ciclo de avaliação."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {ciclos.map((ciclo) => (
            <button
              key={ciclo.id}
              type="button"
              onClick={() => setCicloAberto(ciclo)}
              className={`space-y-3 rounded-2xl border p-5 text-left transition ${tema.card} ${tema.hover}`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 break-words font-bold">{ciclo.name}</h3>
                <span
                  className={`shrink-0 rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase ${
                    ciclo.closedAt ? tema.chip : tema.sucesso
                  }`}
                >
                  {ciclo.closedAt ? "Fechado" : "Aberto"}
                </span>
              </div>
              <p className={`text-xs ${tema.muted}`}>
                Aberto a {formatarData(ciclo.createdAt)}
                {ciclo.deadline ? ` · Prazo ${formatarData(ciclo.deadline)}` : " · Sem prazo"}
                {ciclo.closedAt ? ` · Fechado a ${formatarData(ciclo.closedAt)}` : ""}
              </p>
              <p className={`text-xs font-semibold ${tema.accent}`}>Ver progresso e resultados →</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
