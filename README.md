# MergeSignal

MergeSignal helps teams **see and reason about risk in npm dependencies** before it becomes an incident. It turns lockfiles and dependency graphs into **actionable, explainable scores** you can inspect, and supports **upgrade simulation**, **org-level views** (dashboards, alerts, policies, benchmarks), and an optional **GitHub App** that reacts when lockfiles change on PRs or pushes.

This repository lets you run the **public web experience**, **HTTP API**, **BullMQ worker**, and **command-line scanner** locally or in your own environment. The in-repo worker (`apps/worker`) consumes the same queue the API enqueues; you can also run a proprietary worker from **mergesignal-engine** by swapping the container image and `MERGESIGNAL_ENGINE_IMPL`. See [DEPLOYMENT.md](./DEPLOYMENT.md). For analysis on your machine without the full stack, use the CLI (see below).

---

## Install from GitHub

### Prerequisites

- **Node.js** ≥ 20.19 — pinned **22.15.1** in [`.nvmrc`](./.nvmrc), [`.node-version`](./.node-version), and Volta in `package.json`. Install [Volta](https://volta.sh/) (recommended) or [fnm](https://github.com/Schniz/fnm) with `eval "$(fnm env --use-on-cd)"` in your shell so the correct Node is selected automatically; plain **nvm** does not read `.nvmrc` on `cd` unless you add a hook.
- **pnpm** 9.x (see root `packageManager` in `package.json`)
- **Docker** — only if you run the API and databases locally

### Clone and install

```bash
git clone https://github.com/MergeSignal/mergesignal.git
cd mergesignal
# nvm only (no Volta/fnm hook): nvm install && nvm use
pnpm install
```

### Command-line scanner (no Docker)

Run the scan from **your** project directory (the folder that contains your lockfile).

If MergeSignal is cloned elsewhere, use `pnpm`’s `--dir` flag so the CLI runs from the MergeSignal install while using your current directory for the lockfile:

```bash
cd /path/to/your-project
pnpm --dir /path/to/mergesignal ms scan
```

If you are working **inside** the cloned `mergesignal` repository, from the repo root after `pnpm install`:

```bash
pnpm ms scan
```

Common options: `--json`, `--out mergesignal-result.json`, `--lockfile pnpm-lock.yaml`, `--fail-above <score>`.

---

## Web app and API locally

1. Start databases and worker: `docker compose up -d` (starts Postgres, Redis, and `worker`).
2. Copy `apps/api/.env.example` to `apps/api/.env` (defaults match the repo’s `docker-compose.yml`).
3. Create an API key: `pnpm -C apps/api migrate` then `pnpm -C apps/api generate-api-key <owner> "<description>"`. Store the `ms_…` value once. The `owner` string must match the GitHub org or user that prefixes your `repoId` values (e.g. `acme` for `acme/my-repo`).
4. Create `apps/web/.env.local` (see `apps/web/.env.example`). For **local** stacks use `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000` and OAuth callback `http://localhost:3000/api/auth/callback/github`. For the **Fly.io** deployment, use `NEXT_PUBLIC_API_BASE_URL=https://mergesignal-api.fly.dev` and callback `https://mergesignal-web.fly.dev/api/auth/callback/github`. Always set **`MERGESIGNAL_API_KEY`**, **`MERGESIGNAL_LINKED_GITHUB_OWNER`**, **`AUTH_SECRET`**, and **`AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`**. For local iteration without OAuth, set `MERGESIGNAL_DEV_AUTH_BYPASS=1` in `apps/web/.env.local` (development only).
5. Run `pnpm -C apps/api dev` and `pnpm -C apps/web dev` in two terminals (or run the worker locally with `pnpm -C apps/worker dev` instead of the compose worker).

**Deployed (Fly.io):** Web — [https://mergesignal-web.fly.dev/](https://mergesignal-web.fly.dev/) · API — [https://mergesignal-api.fly.dev](https://mergesignal-api.fly.dev) · OpenAPI — [https://mergesignal-api.fly.dev/openapi.json](https://mergesignal-api.fly.dev/openapi.json) · Health — `GET https://mergesignal-api.fly.dev/health` (no auth).

**Local:** Web — http://localhost:3000 · API — http://localhost:4000 · OpenAPI — http://localhost:4000/openapi.json · Health — `GET /health` (no auth).

The web app proxies **SSE** live scan updates via `GET /api/scan/:id/events` so browsers never send `Authorization` to the API directly.

---

## CI on GitHub Actions

**MergeSignal scans dependency changes on every pull request (or push) and adds a clear, actionable risk summary to your GitHub Actions workflow**—scores, top recommendations, and a layer breakdown in the run **Summary**, with no MergeSignal server to host.

The integration is **one short workflow**: check out your repo, run the official action, done. You do not configure how MergeSignal is built inside the runner.

**CI time:** the first run may take several minutes while the runner prepares MergeSignal; that is normal for v1 and will get faster when the CLI is published to npm (Phase 2) without changing how you reference the action.

### Recommended (official action)

```yaml
name: MergeSignal
on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: MergeSignal/mergesignal/.github/actions/merge-signal-scan@main
```

Examples use **`@main`** so you always pick up the latest action from the default branch. Optional version tags are described in [RELEASING.md](./RELEASING.md).

**Optional gate — `fail_above`:** set `with: fail_above: "40"` (for example) to **fail the job** when the scan’s total score is **strictly greater** than that number. The **Summary is still written** before the gate runs, so you keep the full picture even when the check goes red. On a pull request, a failed gate shows as a **failed check**; in logs, the failing step is the threshold step. See [.github/actions/merge-signal-scan/README.md](./.github/actions/merge-signal-scan/README.md) for the full contract.

```yaml
- uses: MergeSignal/mergesignal/.github/actions/merge-signal-scan@main
  with:
    fail_above: "40"
```

### Advanced (full template)

This repository includes [`.github/workflows/mergesignal-scan.yml`](./.github/workflows/mergesignal-scan.yml), which uses the same action and adds an artifact upload. Fork or adapt it if you need caching, matrices, or extra steps.

---

## Troubleshooting

- **`pnpm ms scan` not found** — The `ms` script is defined on the MergeSignal repo root. Use `pnpm --dir /path/to/mergesignal ms scan` from your project, or `cd` into the clone and run `pnpm ms scan` there.
- **No lockfile** — Run from the package root that contains `pnpm-lock.yaml` or `package-lock.json`, or pass `--lockfile` with a path. Yarn lockfiles are supported when passed explicitly.
- **Node version** — Use Node ≥ 20.19 (see `.nvmrc`). With plain nvm, run `nvm install && nvm use` before `pnpm install` if your shell does not auto-read `.nvmrc`.
- **GitHub Actions** — Use the [official action README](./.github/actions/merge-signal-scan/README.md). The dogfood workflow uploads the scan JSON artifact from the runner temp path used by the action.

For the full stack (Docker, Postgres, Redis, API, web, worker), environment variables, and deployment, see **Web app and API locally** above and [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## Optional: GitHub App

See [`docs/github-app.md`](./docs/github-app.md).

---

## Legal and trust

MergeSignal software in this repository is licensed under **[Apache License 2.0](./LICENSE)**; see also [NOTICE](./NOTICE).

**Data and responsibility:** We publish clear rules for **what we collect, what we do not do with your content, and what remains your responsibility**—including that automated risk output is **informational** and must be validated for your context. The canonical legal pages ship with the **web app** (same routes on your deployment, e.g. the public Fly build: **[Privacy Policy](https://mergesignal-web.fly.dev/privacy)** (Customer Content restrictions), **[Terms of Service](https://mergesignal-web.fly.dev/terms)**, **[API Terms](https://mergesignal-web.fly.dev/api-terms)**, and **[Contact](https://mergesignal-web.fly.dev/contact)**). **These documents are not legal advice for your company**; consult counsel where you need certainty for regulated or high-risk use.

---

## Further reading

**Getting started (product guide):** on a deployed web build, open `/getting-started` (for example [mergesignal-web.fly.dev/getting-started](https://mergesignal-web.fly.dev/getting-started)). GitHub Actions: [action README](./.github/actions/merge-signal-scan/README.md) and [RELEASING.md](./RELEASING.md).

Operations and infrastructure: [DEPLOYMENT.md](./DEPLOYMENT.md). Results are designed to stay interpretable (scores, reasons, and supporting detail where the product exposes them); treat methodology as guidance, not a guarantee.
