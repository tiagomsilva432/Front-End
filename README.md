# Front-End

English · [Português](README-PT.md)

> This is one half of a pair: this web app and the API in
> [Back-End](https://github.com/tiagomsilva432/Back-End) are designed to work
> together. Clone both side by side.

The web app of the ERP: one panel per role (system admin, company admin,
employee) over the API in the
[Back-End](https://github.com/tiagomsilva432/Back-End) repository. People,
projects with a task board, chat and files, absences and calendar, peer reviews,
finances, announcements and live notifications.

React 19 · Vite 8 · Tailwind CSS 4. Plain JavaScript, no router library.

**Contents**

1. [Setup](#setup)
2. [Scripts](#scripts)
3. [How it works](#how-it-works)
4. [Build and deploy](#build-and-deploy)

---

## Setup

**You need:** Node.js 24 and the API running. The quickest way to run the API is
the Docker quick start in the Back-End README; it ends with an admin account you
can log in with.

The commands are the same in zsh and PowerShell (`cp` is an alias of
`Copy-Item` there).

### 1. Clone

Next to the `Back-End` folder:

```bash
git clone https://github.com/tiagomsilva432/Front-End.git
cd Front-End
```

### 2. Point it at the API

```bash
cp .env.example .env
```

`VITE_API_URL=http://localhost:3000` is the address of the API; without a
`.env` the app uses that same address. `VITE_CONTACT_EMAIL`, optional, is where
the public home page's demo requests go. Vite reads both when it starts, so
restart `npm run dev` after changing them.

### 3. Install and run

```bash
npm install
npm run dev
```

Open http://localhost:5173 and log in with an account from the backend.

The API only accepts requests from the origins in its `CORS_ORIGINS`, which is
`http://localhost:5173` in its `.env.example`. Two things break that:

- **Another port.** If 5173 is busy, Vite quietly picks 5174. Free the port, or
  add the new origin to the backend's `CORS_ORIGINS`.
- **`127.0.0.1`** is a different origin from `localhost`. Use `localhost`.

If the browser console shows CORS errors, it is one of these.

**Emails.** The backend's activation and password-reset emails link to its
`FE_URL`, which is this app (`http://localhost:5173` by default). Without SMTP,
the backend prints those emails to its log; open the link from there.

---

## Scripts

| Script | |
| --- | --- |
| `npm run dev` | the dev server with hot reload, on http://localhost:5173 |
| `npm run build` | the production bundle in `dist/` |
| `npm run preview` | serve `dist/` locally |
| `npm run lint` | ESLint |

There are no automated tests; the backend's test suite covers the rules the app
relies on.

---

## How it works

### Layout

```
src/
  pages/          one panel per role, plus the public pages
    PagAdm.jsx       system_admin: companies and their admins
    PagCompAdm.jsx   company_admin: the whole company
    PagTrab.jsx      employee: own work, projects, absences, reviews
    PagInicio.jsx    public home · PagLogin, PagAtivacao, PagRedefinirSenha
  components/<area>/   the screens of each area (projeto, financas, ausencias, …)
  components/ui/       shared pieces: Modal, Campo, Alerta, Ficheiros, …
  services/       one file per API resource, on top of api.js
  notificacoes/   the live connection and the notification bell
  theme/          light and dark theme
  utils/          formatting (dates, money) and password rules
```

### Navigation

There is no router. `src/routes/approutes.jsx` looks at the path and the session:

| Path | Shows |
| --- | --- |
| `/` | the panel for the logged-in role, or the public home |
| `/entrar` | login |
| `/auth/account/activate?token=…` | set the password of an invited account (link from the email) |
| `/auth/password/reset` | request a reset; with `?token=…` (link from the email), set the new password |

Inside a panel, sections are component state, not URLs.

### Session

Login stores the token in `localStorage`. On every load the app confirms it with
`GET /auth/me` before showing a panel, and logs out on a 401 or when the account
is no longer active. If the same email exists in two companies, login answers
with a list and the app asks which company.

### Talking to the API

Every request goes through `apiRequest` in `src/services/api.js`, which adds the
token and unwraps the backend's envelope (`{ status, message, code, data }`).
Errors become an `ApiError` with the `status`, the `message` to show, and on a
400 the per-field errors that forms display next to each input. Uploads use
`enviarFicheiro` (`multipart/form-data`, field `file`).

### Live updates

`NotificacoesProvider` keeps one Server-Sent Events connection per session: it
asks the API for a single-use ticket, opens the stream, and reconnects on its own
with a growing delay (3 s up to 30 s). Its events update the bell, announcement
banners, the project chat and the task board without reloading.

### Permissions

The server decides everything. Some screens mirror its rules only to hide
actions that would be refused, e.g. `components/projeto/regrasTarefa.js` for who
can move and edit a card. If a rule changes in the backend, update its mirror
here too.

---

## Build and deploy

In production this app is not deployed on its own. The Back-End's production
stack builds it with `deploy/web.Dockerfile`, using `VITE_API_URL=/api`, and
serves it with Caddy on the same origin as the API. See *Production* in the
Back-End README.

To build it for another host:

```bash
npm run build
```

- Set `VITE_API_URL` to the public address of the API first; the value is baked
  into the bundle, and without it the bundle calls `http://localhost:3000`.
- The host must send every unknown path to `index.html` (SPA fallback), or the
  email links (`/auth/account/activate`, `/auth/password/reset`) answer 404.
- Add the app's origin to the API's `CORS_ORIGINS`.
