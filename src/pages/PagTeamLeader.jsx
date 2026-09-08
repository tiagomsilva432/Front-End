import { useState } from "react";
import PagRegistro from "./Pagregistro";

export default function TeamHome({ onLogout }) {
  const [telaAdmin, setTelaAdmin] = useState("dashboard");

  const infos = [
    { titulo: "Total Colaboradores", valor: "12", det: "+2 este mês" },
    { titulo: "Projetos Ativos", valor: "5", det: "2 em andamento" },
    { titulo: "Horas Registradas", valor: "1.240h", det: "Mês atual" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex justify-between items-center text-xs">
        <div className="flex gap-4">
          <button
            onClick={() => setTelaAdmin("dashboard")}
            className={`font-semibold ${
              telaAdmin === "dashboard" ? "text-blue-400" : "text-slate-400"
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setTelaAdmin("registro")}
            className={`font-semibold ${
              telaAdmin === "registro" ? "text-blue-400" : "text-slate-400"
            }`}
          >
            + Cadastrar Colaborador
          </button>
        </div>
        <button onClick={onLogout} className="text-red-400 hover:underline">
          Sair
        </button>
      </nav>

      {/* Conteúdo Dinâmico */}
      {telaAdmin === "dashboard" ? (
        <div className="p-8 max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Painel Administrativo</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {infos.map((info, chave) => (
              <div
                key={chave}
                className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  {info.titulo}
                </p>
                <h2 className="text-2xl font-bold mt-2 mb-1">{info.valor}</h2>
                <p className="text-xs text-emerald-400">{info.det}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <PagRegistro />
      )}
    </div>
  );
}
