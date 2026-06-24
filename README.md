# accenture-takehome

A small full-stack app that proxies and enriches data from the public
[JSONPlaceholder](https://jsonplaceholder.typicode.com) API. A REST API (Express)
fetches, caches and joins the upstream data; a React front-end consumes it.

- **Backend** — [`/backend`](./backend), runs on http://localhost:3001
- **Frontend** — [`/frontend`](./frontend), runs on http://localhost:5173 _(in progress)_

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

_In progress (Phase 2)._
