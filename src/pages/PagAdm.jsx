import { useState, useEffect } from "react";
import { listarEmpresas } from "../services/companyservice";
import { authService } from "../services/authservice";
import { listarAdminsEmpresa } from "../services/userservice";
import PainelLayout from "../components/layout/PainelLayout";
import Alerta from "../components/ui/Alerta";
import Icone from "../components/ui/Icone";
import CartaoEmpresa from "../components/admin/CartaoEmpresa";
import ResumoEmpresa from "../components/admin/ResumoEmpresa";
import ModalCriarEmpresa from "../components/admin/ModalCriarEmpresa";
import ModalConvidarAdmin from "../components/admin/ModalConvidarAdmin";
import CatalogoCompetencias from "../components/competencias/CatalogoCompetencias";
import PaginaAnuncios from "../components/anuncios/PaginaAnuncios";
import { useTheme } from "../theme/tema";

const MENU = [
  { id: "empresas", label: "Empresas", icone: "empresa" },
  { id: "competencias", label: "Competências", icone: "estrela" },
  { id: "anuncios", label: "Anúncios", icone: "megafone" },
];

export default function PainelGeralAdmin({ Usuario, onLogout }) {
  const tema = useTheme();
  const token = authService.obterToken();

  const [companias, setCompanias] = useState([]);
  const [carregandoEmpresas, setCarregandoEmpresas] = useState(Boolean(token));
  const [erroEmpresas, setErroEmpresas] = useState(token ? "" : "Inicie sessão para consultar as empresas.");
  const [adminsPorEmpresa, setAdminsPorEmpresa] = useState({});
  const [chaveAdminsCarregados, setChaveAdminsCarregados] = useState("");
  const [erroAdmins, setErroAdmins] = useState(false);
  const [companiaSelecionada, setCompaniaSelecionada] = useState(null);
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [empresaParaConvidar, setEmpresaParaConvidar] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("empresas");

  // Lista de empresas.
  useEffect(() => {
    if (!token) return;
    let ativo = true;
    listarEmpresas(token)
      .then((dados) => {
        if (ativo) setCompanias(Array.isArray(dados) ? dados : []);
      })
      .catch((err) => {
        if (ativo) setErroEmpresas(err.message || "Não foi possível carregar as empresas.");
      })
      .finally(() => {
        if (ativo) setCarregandoEmpresas(false);
      });
    return () => {
      ativo = false;
    };
  }, [token]);

  // Administrador de cada empresa (volta a carregar quando a lista de empresas muda).
  const chaveEmpresas = companias.map((empresa) => empresa.id).join(",");
  const carregandoAdmins = Boolean(chaveEmpresas) && chaveAdminsCarregados !== chaveEmpresas;

  useEffect(() => {
    if (!token || !chaveEmpresas) return;
    let ativo = true;
    const ids = chaveEmpresas.split(",");

    Promise.all(
      ids.map(async (id) => {
        const users = await listarAdminsEmpresa(id, token);
        if (!Array.isArray(users)) throw new Error("Não foi possível carregar os administradores.");
        return [id, users[0] || null];
      }),
    )
      .then((resultados) => {
        if (!ativo) return;
        setAdminsPorEmpresa(Object.fromEntries(resultados));
        setErroAdmins(false);
      })
      .catch(() => {
        if (ativo) setErroAdmins(true);
      })
      .finally(() => {
        if (ativo) setChaveAdminsCarregados(chaveEmpresas);
      });

    return () => {
      ativo = false;
    };
  }, [chaveEmpresas, token]);

  return (
    <PainelLayout
      titulo="Administração"
      menuItems={MENU}
      abaSelecionada={abaAtiva}
      onMudarAba={(aba) => {
        setAbaAtiva(aba);
        setCompaniaSelecionada(null);
      }}
      email={Usuario?.email}
      papel="Administrador do sistema"
      onLogout={onLogout}
    >
      {abaAtiva === "competencias" ? (
        <CatalogoCompetencias token={token} podeEditar />
      ) : abaAtiva === "anuncios" ? (
        <PaginaAnuncios token={token} ambitos={["system", "company"]} empresas={companias} />
      ) : companiaSelecionada ? (
        <ResumoEmpresa
          empresa={companiaSelecionada}
          admin={adminsPorEmpresa[companiaSelecionada.id]}
          token={token}
          onVoltar={() => setCompaniaSelecionada(null)}
          onEmpresaAtualizada={(atualizada) => {
            setCompaniaSelecionada(atualizada);
            setCompanias((atuais) => atuais.map((e) => (e.id === atualizada.id ? atualizada : e)));
          }}
          onAdminAtualizado={(conta) =>
            setAdminsPorEmpresa((atuais) => ({ ...atuais, [companiaSelecionada.id]: conta }))
          }
        />
      ) : (
        <>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Painel geral de empresas</h1>
              <p className={`mt-1 text-xs ${tema.muted}`}>Consulte os dados das empresas e registe novas entidades.</p>
            </div>
            <button
              type="button"
              onClick={() => setModalCriarAberto(true)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-md transition ${tema.primaryBtn}`}
            >
              <Icone nome="mais" className="h-4 w-4" />
              Criar nova empresa
            </button>
          </div>

          {erroEmpresas && <Alerta>{erroEmpresas}</Alerta>}

          {carregandoEmpresas ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="A carregar empresas">
              {[1, 2, 3].map((item) => (
                <div key={item} className={`h-52 animate-pulse rounded-2xl border ${tema.card}`} />
              ))}
            </div>
          ) : companias.length === 0 ? (
            <div className={`rounded-2xl border p-8 text-center ${tema.card}`}>
              <h2 className="font-semibold">Ainda não há empresas registadas</h2>
              <p className={`mt-2 text-sm ${tema.muted}`}>Quando criar uma empresa, ela aparecerá nesta lista.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {companias.map((empresa) => (
                <CartaoEmpresa
                  key={empresa.id}
                  empresa={empresa}
                  admin={adminsPorEmpresa[empresa.id]}
                  carregandoAdmin={carregandoAdmins}
                  erroAdmin={erroAdmins}
                  onVer={() => setCompaniaSelecionada(empresa)}
                  onConvidar={() => setEmpresaParaConvidar(empresa)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {modalCriarAberto && (
        <ModalCriarEmpresa
          token={token}
          onFechar={() => setModalCriarAberto(false)}
          onCriada={(empresa) => setCompanias((atuais) => [empresa, ...atuais])}
        />
      )}

      {empresaParaConvidar && (
        <ModalConvidarAdmin
          empresa={empresaParaConvidar}
          onFechar={() => setEmpresaParaConvidar(null)}
          onConvidado={(conta) =>
            setAdminsPorEmpresa((atuais) => ({ ...atuais, [empresaParaConvidar.id]: conta }))
          }
        />
      )}
    </PainelLayout>
  );
}
