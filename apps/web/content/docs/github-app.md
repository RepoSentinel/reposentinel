# GitHub App

## What you get

The **MergeSignal GitHub App** lets your **hosted** MergeSignal API receive repository events. When a **lockfile changes** on a pull request or push, MergeSignal can **enqueue a scan** so results stay fresh without relying on Actions alone—useful when you want ingestion and PR automation aligned with your deployment.

## When to use this page

You already run or plan to run **MergeSignal’s API** (hosted or self-managed) and want **GitHub-driven** scans and optional **PR feedback** wired to that stack. This is **optional** and assumes you are comfortable with GitHub App permissions and API configuration.

## Prerequisites

- A running MergeSignal **API** reachable from GitHub (HTTPS).
- Ability to create a **GitHub App** in your org or account and install it on target repositories.

## Setup

1. In GitHub, **create a GitHub App** (org-owned is fine).
2. Set the **webhook URL** to your API’s webhook path—for example `https://<your-api-host>/github/webhook` (use the host where `apps/api` is deployed).
3. Create a **webhook secret** and keep it for API configuration.
4. Subscribe to **Pull request** and **Push** events.
5. Under repository permissions, set **Contents** and **Pull requests** to read-only, and **Issues** to read and write if you need PR comments from the product.
6. **Install** the App on the repositories (or all repos) that should send events.
7. On the API, set **`GITHUB_APP_ID`**, **`GITHUB_PRIVATE_KEY`** (PEM; newlines may be escaped as `\n` in env), and **`GITHUB_WEBHOOK_SECRET`** to match the App.

On pull request events (`opened`, `reopened`, `synchronize`), MergeSignal looks for lockfile changes at the PR head and enqueues a scan when appropriate. On **push**, it does the same for the pushed commits. Supported lockfiles include `pnpm-lock.yaml`, `package-lock.json`, and `yarn.lock` (including nested paths).

## What happens next

Scans surface in the **MergeSignal web app and API** like any other run. If you have not yet added CI summaries for every PR, complete **[GitHub Actions](#github-actions)** first, then return here when you are ready to wire the App to your API.

For a **local full stack** (Docker, databases, migrations), use the repository’s contributor-oriented sections—**not** this product doc page.
