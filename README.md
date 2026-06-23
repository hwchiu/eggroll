# Eggroll — tMIC Workspace

A static Next.js prototype for designing API crawlers: build a request, inspect the response, infer an output schema, and save crawler/DAG settings from one Postman-style workspace.

## What you can do

- Organize API requests in collections and folders.
- Configure method, URL, query params, headers, auth, and JSON body.
- Send requests through the configured API proxy.
- View response status, headers, body, size, and timing.
- Infer a flat schema from JSON responses.
- Configure crawler metadata: schedule, output path, format, retries, timeout, and tags.
- Review mock crawler job runs.
- Use the app on desktop or mobile; mobile switches to a bottom tab bar.

## App routes

| Route | Purpose |
| --- | --- |
| `/` | Redirects to `/api-crawler` |
| `/api-crawler` | Main API crawler designer |
| `/jobs` | Mock crawler run history |
| `/settings` | Placeholder for future workspace settings |

> The deployed app uses the `/eggroll` base path.

## Tech stack

- Next.js 16 with static export
- React 19
- TypeScript
- Tailwind CSS 4 globals + inline component styles
- lucide-react icons
- Browser `localStorage` for user-created collections and requests

## Quick start

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js.

Useful commands:

```bash
npm run lint
npm run build
```

After `npm run build`, preview by serving the generated `out/` directory under the `/eggroll` path.

## Project structure

```text
app/                         Next.js app routes and global layout
components/api-crawler/      API crawler workspace UI
components/jobs/             Mock job list UI
components/layout/           Shell, top bar, sidebar, mobile bottom nav
data/                        Mock collections, requests, crawlers, and jobs
hooks/useCollections.ts      localStorage-backed user collections/requests
lib/apiClient.ts             Request execution through proxy
lib/schemaInfer.ts           JSON-to-schema inference
lib/types.ts                 Shared TypeScript types
docs/                        Specs, plans, and screenshots
backend/                     Spring Boot proxy backend (active source under backend/src/main/java)
```

## Data model

The app starts with static demo data from `data/mockCollections.ts`. User-created data is saved in browser storage:

| Key | Stores |
| --- | --- |
| `tmic-collections` | User-created collection tree nodes |
| `tmic-requests` | User-created request configs, schemas, and DAG settings |
| `tmic-theme` | Dark/light theme choice |
| `tmic-lang` | Selected language code |

Clearing browser storage resets user-created collections and requests.

## Request execution

`lib/apiClient.ts` posts request configs to:

```text
https://lego2.hwchiu.com/api/eggroll/proxy
```

Some bundled demo requests return mock responses directly for a smoother prototype flow.

## Deployment

This repo is configured for GitHub Pages:

- `next.config.ts` sets `output: "export"`, `basePath: "/eggroll"`, and `trailingSlash: true`.
- `.github/workflows/deploy.yml` builds with `npm run build` and deploys the generated `out/` directory.

## Current limitations

- This is a Phase 1 prototype, not a production crawler platform.
- Persistence is local to each browser.
- The Spring Boot backend only provides the proxy and health endpoints; real crawler execution is not implemented yet.
- Environments, history, full i18n, and real auth are not implemented yet.
- Some older API crawler components are intentionally unused after the Postman-style redesign.
