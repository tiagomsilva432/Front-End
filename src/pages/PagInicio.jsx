import { useState } from "react";
import logo from "../assets/logo.png";
import BotaoTema from "../components/ui/BotaoTema";
import Icone from "../components/ui/Icone";
import JanelaApp from "../components/inicio/JanelaApp";
import { EcraAusencias, EcraAvisos, EcraCalendario, EcraEquipa, EcraFinancas, EcraOrcamentos } from "../components/inicio/EcrasDemo";
import { useTheme } from "../theme/tema";

// Para onde vão os pedidos de demonstração (provisório, até haver um e-mail comercial).
const EMAIL_COMERCIAL = "filipeptprofi@gmail.com";

const NAV = [
  ["#funcionalidades", "Funcionalidades"],
  ["#ecras", "Ver a app"],
  ["#como-funciona", "Como funciona"],
  ["#perguntas", "Perguntas"],
];

const DESTAQUES = [
  ["6 módulos", "num só sítio"],
  ["3 perfis", "cada um vê o que lhe cabe"],
  ["Tempo real", "avisos sem recarregar"],
  ["Feriados de PT", "calculados sozinhos"],
];

const FUNCIONALIDADES = [
  ["pessoas", "Equipa e competências", "Convide pessoas por e-mail, guarde perfis e competências com nível, e saiba quem sabe o quê na hora de montar uma equipa."],
  ["pasta", "Projetos e alocações", "Gestor, equipa e percentagem de cada pessoa em cada projeto, com aviso quando alguém passa os 100% de carga."],
  ["moeda", "Finanças e orçamentos", "Despesas por projeto e da empresa, custo real dos salários e um painel mês a mês. Avisa quando um projeto passa os 80% do orçamento."],
  ["calendario", "Ausências e calendário", "Pedidos de férias e baixas com aprovação, dias úteis contados sozinhos e um calendário com quem está fora e os feriados."],
  ["avaliacao", "Avaliações entre colegas", "Ciclos de avaliação gerados a partir de quem trabalhou junto. Respostas anónimas para decidir aumentos com justiça."],
  ["megafone", "Anúncios e notificações", "Avisos para a empresa, para um projeto ou para todos, e notificações pessoais que chegam no momento."],
];

const ECRAS = [
  ["ausencias", "Ausências", "Ausências", "o-seu-erp/ausencias", "Os pedidos da equipa para aprovar ou recusar, com os dias úteis já contados.", EcraAusencias],
  ["orcamentos", "Orçamentos", "Projetos", "o-seu-erp/projetos", "Cada projeto com a percentagem do orçamento já gasta, com aviso aos 80% e alerta aos 100%.", EcraOrcamentos],
  ["equipa", "Equipa", "Colaboradores", "o-seu-erp/colaboradores", "O diretório da empresa, com cargos, competências e o estado de cada conta.", EcraEquipa],
  ["calendario", "Calendário", "Calendário", "o-seu-erp/calendario", "Quem está fora em cada dia, com os feriados nacionais e os da empresa.", EcraCalendario],
  ["avisos", "Avisos", "Anúncios", "o-seu-erp/notificacoes", "Anúncios em faixa e notificações pessoais em tempo real.", EcraAvisos],
  ["financas", "Finanças", "Finanças", "o-seu-erp/financas", "Salários, despesas de projeto e da empresa mês a mês. Clique na legenda para mostrar ou esconder cada linha.", EcraFinancas],
];

const PERFIS = [
  ["Administrador", "Tem a visão completa: equipa, projetos, ausências, avaliações e o painel de finanças da empresa."],
  ["Gestor de projeto", "Acompanha o orçamento do projeto, regista despesas e publica avisos para a equipa — sem ver salários."],
  ["Colaborador", "Vê os seus projetos e o seu salário, pede ausências e avalia os colegas, num ecrã simples."],
];

const PASSOS = [
  ["1", "Criamos a sua empresa", "Configuramos a conta da empresa e o primeiro administrador."],
  ["2", "Convide a equipa", "Cada pessoa recebe um e-mail para ativar a conta e definir a senha."],
  ["3", "Comece a usar", "Projetos, alocações, ausências e despesas ficam num só sítio, a partir do primeiro dia."],
];

const PRIVACIDADE = [
  "Os salários só são vistos pela própria pessoa e pela administração.",
  "Uma baixa médica aparece aos colegas apenas como “ausente”.",
  "As avaliações são anónimas: ninguém sabe quem escreveu o quê.",
  "Cada conta entra por convite e pode ser suspensa a qualquer momento.",
];

const PERGUNTAS = [
  ["Preciso de instalar alguma coisa?", "Não. Funciona no browser, no computador e no telemóvel, com modo claro e escuro."],
  ["Quem vê os salários da equipa?", "Só a própria pessoa e os administradores. Os gestores de projeto acompanham o orçamento sem verem o custo de cada pessoa."],
  ["Os feriados contam nas férias?", "Não. Os feriados nacionais de Portugal são calculados automaticamente e a empresa pode juntar os seus; os pedidos contam só os dias úteis."],
  ["Posso experimentar antes de decidir?", "Sim. Peça uma demonstração e mostramos a aplicação com dados de exemplo da sua área."],
];

// Página pública de apresentação do produto. "Entrar" leva ao login (/entrar) dos clientes.
export default function PagInicio({ onEntrar }) {
  const tema = useTheme();
  const [ecra, setEcra] = useState("ausencias");
  const [contacto, setContacto] = useState({ nome: "", empresa: "", email: "", mensagem: "" });
  const atual = ECRAS.find(([id]) => id === ecra);
  const Ecra = atual[5];

  const entrar = (e) => {
    e.preventDefault();
    onEntrar();
  };

  const pedirDemo = (e) => {
    e.preventDefault();
    const assunto = `Pedido de demonstração — ${contacto.empresa || contacto.nome}`;
    const corpo = `Nome: ${contacto.nome}\nEmpresa: ${contacto.empresa}\nE-mail: ${contacto.email}\n\n${contacto.mensagem}`;
    window.location.href = `mailto:${EMAIL_COMERCIAL}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  };

  const botaoDemo = (texto, extra = "") => (
    <a href="#contacto" className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold shadow-lg transition ${tema.primaryBtn} ${extra}`}>
      {texto}
    </a>
  );
  const seccao = "mx-auto max-w-6xl px-4 sm:px-8";
  const sobretitulo = `text-xs font-semibold uppercase tracking-widest ${tema.accent}`;

  return (
    <div className={`min-h-screen overflow-x-clip font-sans transition-colors duration-300 ${tema.page}`}>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-[44rem] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${
          tema.isDark ? "from-emerald-900/30 via-[#070b14] to-[#070b14]" : "from-emerald-100 via-slate-100 to-slate-100"
        }`}
      />

      {/* Cabeçalho */}
      <header className={`sticky top-0 z-30 border-b backdrop-blur ${tema.isDark ? "border-slate-800/70 bg-[#070b14]/80" : "border-slate-200/70 bg-slate-100/80"}`}>
        <div className={`${seccao} flex items-center justify-between gap-3 py-3`}>
          <a href="#topo" className="flex items-center gap-2.5">
            <img src={logo} alt="" className="h-9 w-9 rounded-full object-cover shadow-sm" />
            <span className="text-sm font-bold tracking-wide">ERP Os Silvas</span>
          </a>
          <nav aria-label="Secções" className="hidden items-center gap-6 text-sm lg:flex">
            {NAV.map(([href, rotulo]) => (
              <a key={href} href={href} className={`${tema.muted} transition ${tema.isDark ? "hover:text-white" : "hover:text-slate-900"}`}>
                {rotulo}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <BotaoTema compacto />
            <a href="/entrar" onClick={entrar} className={`hidden rounded-xl border px-4 py-2 text-sm font-semibold sm:inline-flex ${tema.secondaryBtn}`}>
              Entrar
            </a>
            <a href="#contacto" className={`rounded-xl px-4 py-2 text-sm font-bold shadow-md ${tema.primaryBtn}`}>
              Pedir demo
            </a>
          </div>
        </div>
      </header>

      <main id="topo" className="relative z-0">
        {/* Hero */}
        <section className={`${seccao} grid items-center gap-12 pb-20 pt-14 lg:grid-cols-[1fr_1.15fr] lg:pt-20`}>
          <div className="text-center lg:text-left">
            <p className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${tema.active}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Notificações em tempo real
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Pessoas, projetos e finanças.{" "}
              <span className={tema.isDark ? "text-emerald-400" : "text-emerald-600"}>Tudo num só ERP.</span>
            </h1>
            <p className={`mx-auto mt-6 max-w-xl text-lg leading-8 lg:mx-0 ${tema.muted}`}>
              Deixe as folhas de cálculo. Saiba quem está em cada projeto, quanto cada projeto já gastou e quem está de férias —
              com cada pessoa a ver só o que lhe cabe.
            </p>
            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start sm:justify-center">
              {botaoDemo("Pedir demonstração", "w-full sm:w-auto")}
              <a href="#ecras" className={`inline-flex w-full items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold sm:w-auto ${tema.secondaryBtn}`}>
                Ver a aplicação
              </a>
            </div>
            <p className={`mt-4 text-xs ${tema.muted}`}>
              Já é cliente?{" "}
              <a href="/entrar" onClick={entrar} className={`font-semibold hover:underline ${tema.accent}`}>
                Entre na sua conta
              </a>
            </p>
          </div>
          <div className="relative">
            <div aria-hidden="true" className="absolute -inset-6 rounded-[2rem] bg-emerald-500/10 blur-3xl" />
            <div className="relative">
              <JanelaApp ativo="Finanças" endereco="o-seu-erp/financas" barraLateral="xl">
                <EcraFinancas />
              </JanelaApp>
            </div>
          </div>
        </section>

        {/* Destaques */}
        <section className={`${seccao} pb-20`}>
          <ul className={`grid grid-cols-2 gap-px overflow-hidden rounded-2xl border lg:grid-cols-4 ${tema.border} ${tema.isDark ? "bg-slate-800" : "bg-slate-200"}`}>
            {DESTAQUES.map(([valor, texto]) => (
              <li key={valor} className={`p-6 text-center ${tema.isDark ? "bg-[#0b0f19]" : "bg-white"}`}>
                <p className="text-2xl font-extrabold">{valor}</p>
                <p className={`mt-1 text-sm ${tema.muted}`}>{texto}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Problema -> solução */}
        <section className={`${seccao} pb-24`}>
          <div className="grid gap-6 md:grid-cols-2">
            <div className={`rounded-3xl border p-8 ${tema.card}`}>
              <p className={`text-xs font-semibold uppercase tracking-widest ${tema.muted}`}>Sem ERP</p>
              <ul className={`mt-4 space-y-3 text-sm ${tema.muted}`}>
                {["Férias num e-mail, alocações numa folha, despesas noutra.", "Ninguém sabe ao certo quanto um projeto já custou.", "Avaliações de desempenho feitas de memória.", "Avisos importantes perdidos em grupos de mensagens."].map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <span className="text-red-500" aria-hidden="true">✕</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className={`rounded-3xl border p-8 ${tema.active}`}>
              <p className="text-xs font-semibold uppercase tracking-widest">Com o ERP Os Silvas</p>
              <ul className="mt-4 space-y-3 text-sm">
                {["Um só sítio para pessoas, projetos, ausências e despesas.", "Orçamento de cada projeto ao minuto, com o custo real das pessoas.", "Avaliações anónimas entre colegas que trabalharam juntos.", "Anúncios e notificações que chegam na hora."].map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <span aria-hidden="true">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Funcionalidades */}
        <section id="funcionalidades" className={`${seccao} scroll-mt-24 pb-24`}>
          <div className="mx-auto max-w-2xl text-center">
            <p className={sobretitulo}>Funcionalidades</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Tudo o que a gestão do dia a dia precisa</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FUNCIONALIDADES.map(([icone, titulo, texto]) => (
              <article key={titulo} className={`group rounded-2xl border p-6 transition hover:-translate-y-0.5 ${tema.card}`}>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${tema.iconBox}`}>
                  <Icone nome={icone} className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-bold">{titulo}</h3>
                <p className={`mt-2 text-sm leading-6 ${tema.muted}`}>{texto}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Ecrãs ("prints") */}
        <section id="ecras" className={`scroll-mt-24 border-y py-24 ${tema.border} ${tema.isDark ? "bg-[#0b0f19]/60" : "bg-white/60"}`}>
          <div className={seccao}>
            <div className="mx-auto max-w-2xl text-center">
              <p className={sobretitulo}>Veja a app por dentro</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Ecrãs simples para trabalho a sério</h2>
              <p className={`mt-4 ${tema.muted}`}>Dados de exemplo. É exatamente assim que a sua equipa vai ver a aplicação.</p>
            </div>
            <div role="tablist" aria-label="Ecrãs da aplicação" className="mt-10 flex flex-wrap justify-center gap-2">
              {ECRAS.map(([id, rotulo]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  id={`tab-${id}`}
                  aria-selected={ecra === id}
                  aria-controls="painel-ecra"
                  onClick={() => setEcra(id)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${ecra === id ? tema.active : tema.secondaryBtn}`}
                >
                  {rotulo}
                </button>
              ))}
            </div>
            <div id="painel-ecra" role="tabpanel" aria-labelledby={`tab-${ecra}`} className="mx-auto mt-8 max-w-4xl">
              <JanelaApp ativo={atual[2]} endereco={atual[3]}>
                <Ecra />
              </JanelaApp>
              <p className={`mt-4 text-center text-sm ${tema.muted}`}>{atual[4]}</p>
            </div>
          </div>
        </section>

        {/* Perfis */}
        <section className={`${seccao} py-24`}>
          <div className="mx-auto max-w-2xl text-center">
            <p className={sobretitulo}>Para toda a empresa</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Cada pessoa vê o que lhe cabe</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {PERFIS.map(([perfil, texto], i) => (
              <div key={perfil} className={`rounded-2xl border p-6 ${i === 0 ? tema.active : tema.card}`}>
                <h3 className="font-bold">{perfil}</h3>
                <p className={`mt-2 text-sm leading-6 ${i === 0 ? "" : tema.muted}`}>{texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Como funciona */}
        <section id="como-funciona" className={`${seccao} scroll-mt-24 pb-24`}>
          <div className={`rounded-3xl border p-8 sm:p-12 ${tema.card}`}>
            <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
              <div>
                <p className={sobretitulo}>Como funciona</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight">A funcionar no primeiro dia</h2>
                <p className={`mt-4 ${tema.muted}`}>Sem instalações nem servidores para gerir: a aplicação corre no browser.</p>
              </div>
              <ol className="space-y-6">
                {PASSOS.map(([n, titulo, texto]) => (
                  <li key={n} className="flex gap-4">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${tema.iconBox}`}>{n}</span>
                    <div>
                      <h3 className="font-bold">{titulo}</h3>
                      <p className={`mt-1 text-sm ${tema.muted}`}>{texto}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Privacidade */}
        <section className={`${seccao} pb-24`}>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className={sobretitulo}>Privacidade por defeito</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight">Os dados sensíveis ficam com quem os deve ver</h2>
              <ul className="mt-6 space-y-3">
                {PRIVACIDADE.map((t) => (
                  <li key={t} className="flex gap-3 text-sm">
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${tema.iconBox}`} aria-hidden="true">
                      ✓
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <JanelaApp ativo="Calendário" endereco="o-seu-erp/calendario" compacta>
              <EcraCalendario />
            </JanelaApp>
          </div>
        </section>

        {/* Perguntas */}
        <section id="perguntas" className={`${seccao} scroll-mt-24 pb-24`}>
          <h2 className="text-center text-3xl font-extrabold tracking-tight">Perguntas frequentes</h2>
          <div className="mx-auto mt-10 max-w-3xl space-y-3">
            {PERGUNTAS.map(([pergunta, resposta]) => (
              <details key={pergunta} className={`group rounded-2xl border p-5 ${tema.card}`}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {pergunta}
                  <span className={`text-xl transition group-open:rotate-45 ${tema.accent}`} aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className={`mt-3 text-sm leading-6 ${tema.muted}`}>{resposta}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Contacto */}
        <section id="contacto" className={`${seccao} scroll-mt-24 pb-24`}>
          <div className={`overflow-hidden rounded-3xl border ${tema.isDark ? "border-emerald-500/20 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50"}`}>
            <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Veja o ERP a funcionar na sua empresa</h2>
                <p className={`mt-4 ${tema.muted}`}>
                  Diga-nos quem é e mostramos a aplicação com dados de exemplo, sem compromisso.
                </p>
                <ul className="mt-6 space-y-2 text-sm">
                  {["Demonstração guiada", "Configuração da empresa incluída", "Acesso a partir do browser e do telemóvel"].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <span className={tema.accent} aria-hidden="true">✓</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <form onSubmit={pedirDemo} className={`space-y-3 rounded-2xl border p-6 ${tema.card}`}>
                {[
                  ["nome", "O seu nome", "text"],
                  ["empresa", "Empresa", "text"],
                  ["email", "E-mail", "email"],
                ].map(([campo, rotulo, tipo]) => (
                  <label key={campo} className="block text-xs font-semibold">
                    <span className={tema.label}>{rotulo}</span>
                    <input
                      required
                      type={tipo}
                      value={contacto[campo]}
                      onChange={(e) => setContacto((c) => ({ ...c, [campo]: e.target.value }))}
                      className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-sm font-normal outline-none focus:ring-4 ${tema.input}`}
                    />
                  </label>
                ))}
                <label className="block text-xs font-semibold">
                  <span className={tema.label}>Mensagem (opcional)</span>
                  <textarea
                    rows={3}
                    value={contacto.mensagem}
                    onChange={(e) => setContacto((c) => ({ ...c, mensagem: e.target.value }))}
                    placeholder="Quantas pessoas tem a equipa? O que gostava de resolver?"
                    className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-sm font-normal outline-none focus:ring-4 ${tema.input}`}
                  />
                </label>
                <button type="submit" className={`w-full rounded-xl py-3 text-sm font-bold shadow-lg ${tema.primaryBtn}`}>
                  Pedir demonstração
                </button>
                <p className={`text-center text-[11px] ${tema.muted}`}>Abre o seu programa de e-mail com o pedido preenchido.</p>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className={`border-t ${tema.border}`}>
        <div className={`${seccao} flex flex-col items-center justify-between gap-4 py-8 text-sm sm:flex-row`}>
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="" className="h-7 w-7 rounded-full object-cover" />
            <span className={tema.muted}>© {new Date().getFullYear()} Grupo Os Silvas</span>
          </div>
          <div className={`flex gap-5 ${tema.muted}`}>
            <a href="#funcionalidades" className="hover:underline">
              Funcionalidades
            </a>
            <a href="#contacto" className="hover:underline">
              Contacto
            </a>
            <a href="/entrar" onClick={entrar} className="hover:underline">
              Entrar
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
