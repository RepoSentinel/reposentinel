# GitHub App setup (MergeSignal)

MergeSignal can ingest GitHub events and automatically enqueue scans when a lockfile changes.

For local development of the API and web app (Docker, env files, migrations), see the [README](../README.md) (“Web app and API locally”) and [DEPLOYMENT.md](../DEPLOYMENT.md).

## Create a GitHub App

In GitHub:

- Create a GitHub App (organization-owned is fine)
- **Webhook URL** (Fly.io): `https://mergesignal-api.fly.dev/github/webhook` (or `http(s)://<YOUR_API_HOST>/github/webhook` for other hosts)
- **Webhook secret**: generate a random string (you’ll set it as `GITHUB_WEBHOOK_SECRET`)
- Subscribe to events:
  - **Pull request**
  - **Push**
- Repository permissions:
  - **Contents**: Read-only
  - **Pull requests**: Read-only
  - **Issues**: Read & write (required to post PR comments)

Install the App on a repository (or “All repositories”) so it can receive events.

## API configuration

Set these env vars for `apps/api`:

- `GITHUB_APP_ID`: the App ID
- `GITHUB_PRIVATE_KEY`: the PEM private key contents (if you store it as one line, replace newlines with `\n`)
- `GITHUB_WEBHOOK_SECRET`: the webhook secret you configured in the App settings

## What happens on events

- On **pull request** (`opened`, `reopened`, `synchronize`), if a lockfile changed in the PR, MergeSignal fetches the lockfile at the PR head (and base when available), then enqueues a scan.
- On **push**, if a lockfile changed in the pushed commits, MergeSignal fetches the lockfile at that commit and enqueues a scan.

Supported lockfile paths include `pnpm-lock.yaml`, `package-lock.json`, and `yarn.lock` (including nested paths in the repo).

After a scan completes, results are available through the MergeSignal **API** and **web app**. **Automated pull request comments** on GitHub are part of the **full hosted MergeSignal** experience; wire your deployment accordingly if your team wants feedback directly on the PR.
