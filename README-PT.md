# Front-End

[English](README.md) · Português

> Este é um de dois repositórios: esta aplicação web e a API do
> [Back-End](https://github.com/tiagomsilva432/Back-End) foram feitas para
> trabalhar juntas. Clona os dois lado a lado.

A aplicação web do ERP: um painel por role (administrador do sistema,
administrador da empresa, colaborador) sobre a API do repositório
[Back-End](https://github.com/tiagomsilva432/Back-End). Pessoas, projetos com
quadro de tarefas, chat e ficheiros, ausências e calendário, avaliações entre
colegas, finanças, avisos e notificações em direto.

React 19 · Vite 8 · Tailwind CSS 4. JavaScript simples, sem biblioteca de rotas.

**Índice**

1. [Instalação](#instalação)
2. [Scripts](#scripts)
3. [Como funciona](#como-funciona)
4. [Build e deploy](#build-e-deploy)

---

## Instalação

**Precisas de:** Node.js 24 e a API a correr. A forma mais rápida de pôr a API a
correr é o arranque rápido com Docker do README do Back-End; acaba com uma conta
de administrador com que podes entrar.

Os comandos são os mesmos no zsh e no PowerShell (lá, o `cp` é um alias do
`Copy-Item`).

### 1. Clonar

Ao lado da pasta `Back-End`:

```bash
git clone https://github.com/tiagomsilva432/Front-End.git
cd Front-End
```

### 2. Apontar para a API

```bash
cp .env.example .env
```

O `VITE_API_URL=http://localhost:3000` é o endereço da API; sem `.env`, a
aplicação usa esse mesmo endereço. O `VITE_CONTACT_EMAIL`, opcional, é para onde
vão os pedidos de demonstração da página pública. O Vite lê os dois quando
arranca, por isso volta a correr o `npm run dev` depois de os mudares.

### 3. Instalar e correr

```bash
npm install
npm run dev
```

Abre http://localhost:5173 e entra com uma conta do backend.

A API só aceita pedidos das origens no seu `CORS_ORIGINS`, que no `.env.example`
dela é `http://localhost:5173`. Há duas coisas que estragam isso:

- **Outra porta.** Se a 5173 estiver ocupada, o Vite passa para a 5174 sem
  avisar muito. Liberta a porta, ou junta a origem nova ao `CORS_ORIGINS` do
  backend.
- **`127.0.0.1`** é uma origem diferente de `localhost`. Usa `localhost`.

Se a consola do browser mostrar erros de CORS, é uma destas.

**Emails.** Os emails de ativação e de redefinição da palavra-passe do backend
levam links para o seu `FE_URL`, que é esta aplicação (`http://localhost:5173`
por omissão). Sem SMTP, o backend escreve esses emails no log; abre o link a
partir daí.

---

## Scripts

| Script | |
| --- | --- |
| `npm run dev` | o servidor de desenvolvimento, com hot reload, em http://localhost:5173 |
| `npm run build` | o bundle de produção, em `dist/` |
| `npm run preview` | serve o `dist/` localmente |
| `npm run lint` | ESLint |

Não há testes automáticos; os testes do backend cobrem as regras de que a
aplicação depende.

---

## Como funciona

### Estrutura

```
src/
  pages/          um painel por role, mais as páginas públicas
    PagAdm.jsx       system_admin: as empresas e os seus administradores
    PagCompAdm.jsx   company_admin: a empresa toda
    PagTrab.jsx      employee: o seu trabalho, projetos, ausências, avaliações
    PagInicio.jsx    página pública · PagLogin, PagAtivacao, PagRedefinirSenha
  components/<área>/   os ecrãs de cada área (projeto, financas, ausencias, …)
  components/ui/       peças partilhadas: Modal, Campo, Alerta, Ficheiros, …
  services/       um ficheiro por recurso da API, sobre o api.js
  notificacoes/   a ligação em direto e o sino das notificações
  theme/          tema claro e escuro
  utils/          formatação (datas, dinheiro) e regras da palavra-passe
```

### Navegação

Não há router. O `src/routes/approutes.jsx` olha para o caminho e para a sessão:

| Caminho | Mostra |
| --- | --- |
| `/` | o painel do role com sessão iniciada, ou a página pública |
| `/entrar` | o login |
| `/auth/account/activate?token=…` | definir a palavra-passe de uma conta convidada (link do email) |
| `/auth/password/reset` | pedir a redefinição; com `?token=…` (link do email), definir a palavra-passe nova |

Dentro de um painel, as secções são estado dos componentes, não URLs.

### Sessão

O login guarda o token no `localStorage`. Sempre que a aplicação abre, confirma-o
com `GET /auth/me` antes de mostrar um painel, e termina a sessão num 401 ou
quando a conta deixou de estar ativa. Se o mesmo email existir em duas empresas,
o login responde com uma lista e a aplicação pergunta qual.

### Falar com a API

Todos os pedidos passam pelo `apiRequest` do `src/services/api.js`, que junta o
token e desembrulha o envelope do backend (`{ status, message, code, data }`).
Os erros passam a um `ApiError` com o `status`, a `message` a mostrar e, num
400, os erros por campo que os formulários mostram junto de cada campo. Os
uploads usam o `enviarFicheiro` (`multipart/form-data`, campo `file`).

### Atualizações em direto

O `NotificacoesProvider` mantém uma ligação Server-Sent Events por sessão: pede à
API um bilhete de uso único, abre o stream e volta a ligar-se sozinho, com uma
espera que vai crescendo (de 3 s até 30 s). Os eventos atualizam o sino, as
faixas dos avisos, o chat do projeto e o quadro de tarefas sem recarregar.

### Permissões

Quem decide é sempre o servidor. Alguns ecrãs copiam as regras dele só para
esconder ações que seriam recusadas, por exemplo o
`components/projeto/regrasTarefa.js`, para quem pode mover e alterar uma tarefa.
Se uma regra mudar no backend, atualiza também a cópia daqui.

---

## Build e deploy

Em produção, esta aplicação não é publicada sozinha. A stack de produção do
Back-End compila-a com o `deploy/web.Dockerfile`, com `VITE_API_URL=/api`, e
serve-a com o Caddy na mesma origem que a API. Vê a secção *Produção* do README
do Back-End.

Para a compilar para outro alojamento:

```bash
npm run build
```

- Define antes o `VITE_API_URL` com o endereço público da API; o valor fica
  dentro do bundle, e sem ele o bundle chama `http://localhost:3000`.
- O alojamento tem de mandar qualquer caminho desconhecido para o `index.html`
  (fallback de SPA), senão os links dos emails (`/auth/account/activate`,
  `/auth/password/reset`) dão 404.
- Junta a origem da aplicação ao `CORS_ORIGINS` da API.
