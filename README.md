# LinkedIn Profile Search — Frontend

A standalone React application (no Vite) that lets you search millions of LinkedIn profiles by **skills** and **designation**. Results are ranked by relevance using PostgreSQL full-text scoring from the backend API.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18 + TypeScript |
| State management | Redux Toolkit (`configureStore`, `createSlice`) |
| API calls | RTK Query (`createApi` / `fetchBaseQuery`) |
| Bundler | Webpack 5 + Babel |
| Styling | Tailwind CSS (CDN — no build step needed) |

---

## Features

- **Skills** input (wider) and **Designation** input — fill one or both, then press Search
- Runs a **count query** first → shows total profiles found + how many 1 000-profile subsets exist
- **Subset selector** — click any subset pill to load that chunk of results
- **Profile cards** — avatar, headline, current role & company, location, relevance score
- **20 profiles per page** — Previous / Next pagination within each subset
- **Profile detail modal** — full experience timeline, education, skills, LinkedIn link
- Keyboard shortcut: `Escape` closes the profile modal

---

## Prerequisites

- **Node.js ≥ 18** ([download](https://nodejs.org))
- The **backend API server** running locally (see [linkedin-search-backend](https://github.com/Sudhakaran98/linkedin-search-backend))

---

## Installation & Run

### 1 — Clone the repo

```bash
git clone https://github.com/Sudhakaran98/linkedin-search-frontend.git
cd linkedin-search-frontend
```

### 2 — Install dependencies

```bash
npm install
```

### 3 — Start the backend

Make sure the backend API server is running on **port 8080** before starting the frontend.  
See the [backend README](https://github.com/Sudhakaran98/linkedin-search-backend#readme) for setup.

```bash
# In the backend repo:
npm install
LINKEDIN_PASSWORD=<your-password> PORT=8080 npm run dev
```

### 4 — Start the frontend dev server

```bash
npm start
```

Opens at **http://localhost:3000** automatically.  
All `/api` requests are automatically proxied to `http://localhost:8080`.

---

## Production Build

```bash
npm run build
```

Output goes to `dist/`. Serve it with any static file server:

```bash
npx serve dist
```

> **Note:** In production you must configure your web server (nginx, Apache, etc.) to proxy `/api` requests to the backend server.

---

## Project Structure

```
linkedin-search-frontend/
├── public/
│   └── index.html              ← HTML shell, loads Tailwind CSS CDN
├── src/
│   ├── store/
│   │   ├── store.ts            ← Redux configureStore
│   │   ├── searchApi.ts        ← RTK Query — 3 API endpoints
│   │   ├── searchSlice.ts      ← UI state (inputs, pagination, modal)
│   │   └── hooks.ts            ← Typed useAppDispatch / useAppSelector
│   ├── components/
│   │   ├── ProfileCard.tsx     ← Single profile card
│   │   └── ProfileDetailModal.tsx ← Full profile detail modal
│   ├── pages/
│   │   └── Home.tsx            ← Search page (all logic wired here)
│   ├── App.tsx
│   ├── index.tsx               ← Entry — wraps app in Redux <Provider>
│   └── styles.css
├── webpack.config.js           ← Webpack 5 config + /api proxy
├── .babelrc                    ← Babel presets (env, react, typescript)
├── tsconfig.json
└── package.json
```

---

## API Endpoints (consumed by this frontend)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/search/count?skills=...&designation=...` | Total match count + subset info |
| `GET` | `/api/search/profiles?skills=...&designation=...&subset=N&page=P` | Ranked profiles |
| `GET` | `/api/search/profile/:id` | Full profile details |

---

## Environment

By default the dev server proxies `/api` to `http://localhost:8080`.  
To point to a different backend URL, set `API_URL` before starting:

```bash
API_URL=http://your-backend-host:8080 npm start
```
