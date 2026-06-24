# accenture-takehome

[![CI](https://github.com/195048/accenture-takehome/actions/workflows/ci.yml/badge.svg)](https://github.com/195048/accenture-takehome/actions/workflows/ci.yml)

A small full-stack app that proxies and enriches data from the public
[JSONPlaceholder](https://jsonplaceholder.typicode.com) API. A REST API (Express)
fetches, caches and joins the upstream data; a React front-end consumes it.

- **Backend** — [`/backend`](./backend), runs on http://localhost:3001
- **Frontend** — [`/frontend`](./frontend), runs on http://localhost:5173

## Architecture

```
Browser (React SPA)  ──HTTP──▶  API (Express + cache)  ──HTTP──▶  JSONPlaceholder
   TanStack Query                 node-cache · zod                  (upstream)
```

The **API** proxies the upstream, validates input, caches each collection, and
*enriches* two endpoints by joining related resources server-side — so the client
makes one request instead of three. The **frontend** is a thin SPA that consumes
the API through TanStack Query, which handles caching and loading/error states.

## Data model

```
User ──< Post ──< Comment
```

A user has many posts; a post has many comments.

---

## Backend

A REST API built with Node 22+, TypeScript and Express. It sits in front of
JSONPlaceholder and adds three things the upstream API doesn't give you directly:
a short-lived cache, input validation, and two "enriched" endpoints that join
related resources server-side — so the client makes one call instead of three.

### Stack

- Node 22+ and TypeScript
- Express 5
- `node-cache` — in-memory TTL cache
- `zod` — route/query validation
- Vitest + supertest — tests

### Running it

From `/backend`:

```bash
npm install        # once
npm run dev        # watch mode on http://localhost:3001
npm test           # run the test suite (npm run test:watch for watch mode)
npm run build      # type-check + compile to dist/
npm start          # run the compiled build
```

> Built and tested on Node 24; the project needs **Node 22 or newer** (declared via `engines` in each `package.json`).

### Endpoints

| Method & path | Description |
| --- | --- |
| `GET /api/health` | liveness check |
| `GET /api/users` | list all users |
| `GET /api/users/:id` | a single user, **with their posts** |
| `GET /api/posts` | paginated list of posts, filterable by `userId` |
| `GET /api/posts/:id` | a single post, **with its author and comments** |

`GET /api/posts` query params:

| Param | Type | Default | Notes |
| --- | --- | --- | --- |
| `userId` | int > 0 | – | filter to one author |
| `page` | int > 0 | 1 | page number |
| `pageSize` | int 1–100 | 10 | items per page |

The list response is wrapped in a small envelope:

```jsonc
{
  "data": [ /* posts for this page */ ],
  "page": 1,
  "pageSize": 10,
  "total": 100,
  "totalPages": 10
}
```

`GET /api/posts/:id` is the enriched one — the post plus its author and comments
in a single payload (abbreviated):

```jsonc
{
  "userId": 1,
  "id": 1,
  "title": "...",
  "body": "...",
  "author": { "id": 1, "name": "Leanne Graham" },
  "comments": [ { "postId": 1, "id": 1, "name": "...", "body": "..." } ]
}
```

### Errors

Every error comes back in the same shape:

```json
{ "error": { "code": "NOT_FOUND", "message": "user 99999 not found" } }
```

| Status | When |
| --- | --- |
| `400` | invalid param (non-numeric `:id`, bad query, …) |
| `404` | resource or route not found |
| `502` | upstream returned an error |
| `504` | upstream timed out |

A single error-handling middleware renders these. Any unexpected error becomes a
generic `500` — the details are logged server-side, never sent to the client.

### How it's put together

```
src/
  config.ts        configuration (port, upstream URL, cache TTL, timeout)
  types.ts         upstream + enriched response types
  errors.ts        HttpError + helpers (notFound, badGateway, …)
  cache.ts         read-through cache wrapper around node-cache
  upstream.ts      JSONPlaceholder client (fetch + timeout + cache)
  routes/          users.ts, posts.ts
  middleware/      errorHandler.ts
  app.ts           builds the Express app (no listen)
  index.ts         starts the server
```

A few decisions worth calling out:

- **Caching.** Each upstream collection (`users`, `posts`, `comments`) is fetched
  once and cached for 60s under its own key. Pagination, filtering and joins run
  in memory against the cached lists, so a page of posts costs at most one
  upstream call — usually zero.
- **One error type.** Routes `throw notFound(...)` / `throw badRequest(...)` and
  the middleware maps an `HttpError` to the right status and JSON. Network and
  timeout failures are translated to `502` / `504` inside the upstream client, so
  routes never see a raw `fetch` failure.
- **`app` / `server` split.** `app.ts` builds the app and `index.ts` starts it.
  Keeping them apart lets the tests drive the app in-process with supertest — no
  real port, no real network.

### Tests

`npm test` runs the Vitest + supertest suite in [`tests/api.test.ts`](./backend/tests/api.test.ts).
It covers the happy path of every endpoint, the error cases (400/404), the
upstream-failure mapping (→ 502) and the cache (a single upstream call for
repeated requests). `fetch` is mocked, so the suite is fast and runs offline.

---

## Frontend

A React single-page app (Vite) that consumes the backend.

### Stack

- React 19 + TypeScript
- Vite
- React Router — routing
- TanStack Query — data fetching, caching, loading/error states
- Tailwind CSS v4 — styling, with class-based dark mode
- Vitest + React Testing Library — tests

### Running it

From `/frontend`:

```bash
npm install        # once
npm run dev        # http://localhost:5173
npm test           # run the test suite (npm run test:watch for watch mode)
npm run lint       # eslint
npm run build      # type-check + production build
```

> The API base URL defaults to `http://localhost:3001`. Override it with the
> `VITE_API_URL` env var (e.g. when the API is deployed elsewhere).

### Pages & features

- **Feed** (`/`) — paginated list of posts (title, excerpt, author) with **title
  search** and an **author filter** (a searchable combobox). The selected author
  lives in the URL (`?userId=`), so it's shareable and the Users page links
  pre-filter the feed.
- **Users** (`/users`) — the authors with a short summary; each links to their posts.
- **Post detail** (`/posts/:id`) — full post, author info and comments, fetched in
  one call from the enriched endpoint.
- **Dark mode** — header toggle, remembered across reloads (no flash on load).
- **Responsive** — works down to mobile widths.

### How it's put together

```
src/
  lib/         api.ts (typed client) · types.ts · theme.ts (dark mode)
  hooks/       useUsers · usePosts · usePost   (TanStack Query)
  components/  Layout · AuthorFilter · PostCard · Pagination · Loading · ErrorMessage
  pages/       FeedPage · UsersPage · PostDetailPage
  main.tsx     providers (QueryClient + Router)
  App.tsx      routes
```

### Tests

`npm test` runs the Vitest + React Testing Library suite. It renders pages against
a mocked API and asserts behaviour — the users list and its error state, and the
feed listing + title-search filtering. No network, so it's fast and offline.

---

## Tradeoffs & decisions

- **Client-side feed search / filter / pagination.** The feed fetches the full
  posts list once and does search, author-filtering and pagination in memory. With
  ~100 posts this gives instant interactions and simpler code. The backend still
  supports server-side pagination + `userId` filtering for larger datasets. **At
  real scale** I'd switch the feed to server-side pagination, add a `?q=`
  title-search param and a `GET /users?search=` endpoint, turn the author filter
  into a debounced server-backed typeahead, and virtualize long lists — so the
  client only ever loads what it shows.
- **Whole-collection cache, short TTL.** Caching each upstream collection whole
  (then paginating/joining in memory) keeps the cache trivial and correct for this
  data size. A larger or more volatile dataset would want per-resource keys or
  stale-while-revalidate.
- **`app` / `server` split** in the backend exists purely to make the API testable
  in-process with supertest.
- **Node 22+.** Developed on Node 24; the code only uses features stable since
  Node 22, pinned via `engines`.

## Continuous integration

GitHub Actions ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)) runs on
every push to `main` and on every pull request: it installs, type-checks, builds
and tests **both** the backend and the frontend, on **Node 22 and 24**.
