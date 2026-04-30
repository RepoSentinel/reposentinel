import type { Metadata } from "next";

import docStyles from "../../components/features/LegalMarkdown/LegalDoc.module.css";
import { CodeBlock } from "../../components/shared/CodeBlock/CodeBlock";
import { MarkdownContent } from "../../components/shared/MarkdownContent/MarkdownContent";
import gsStyles from "./getting-started.module.css";

export const metadata: Metadata = {
  title: "Getting started — MergeSignal",
  description:
    "Spot dependency risk before merge: quick local scan, then GitHub Actions summary on every PR—no server required.",
};

const REPO_BLOB = "https://github.com/MergeSignal/mergesignal/blob/main";
const README = `${REPO_BLOB}/README.md`;
const DOCS_GITHUB_APP = `${REPO_BLOB}/docs/github-app.md`;
const RELEASING = `${REPO_BLOB}/RELEASING.md`;
const WORKFLOW_SCAN = `${REPO_BLOB}/.github/workflows/mergesignal-scan.yml`;

const INSTALL_SNIPPET = `git clone https://github.com/MergeSignal/mergesignal.git
cd mergesignal
pnpm install`;

//const RUN_SCAN_FROM_PROJECT = `pnpm --dir <path-to-mergesignal> ms scan`;

const RUN_SCAN_SAME_REPO = `pnpm ms scan`;

const GHA_RECOMMENDED_SNIPPET = `name: MergeSignal
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
      - uses: MergeSignal/mergesignal/.github/actions/merge-signal-scan@main`;

/** Illustrative PR comment (full hosted setup); not tied to a specific implementation. */
const HOSTED_PR_COMMENT_EXAMPLE = `
## MergeSignal

> [!WARNING]
> **Risky** — elevated dependency merge risk — see signals below

**RISKY** — **\`express\` can reorder hooks so validation runs after your handler—skipped checks.**
**Mechanism:** Auth middleware order shifts so guards run after handlers—skipped session checks on requests.
**Context:** \`express\` participates in middleware chain during a normal request lifecycle.
> **Action:** Confirm middleware chain runs before route handlers and verify 401/403 on protected routes.

**RISKY** — **Transitive \`semver\` resolution changed—tests may not exercise the resolved graph.**
**Mechanism:** Minor version bumps reorder peer dependencies under pnpm’s strict layout.
**Context:** Touches \`packages/web\` and \`services/api\` entrypoints in this workspace.
> **Action:** Run a clean \`pnpm install\` on CI and re-run integration tests before merge.
`;

export default function GettingStartedPage() {
  return (
    <article className={docStyles.article}>
      <h1>Getting started</h1>
      <p className={gsStyles.subtitle}>
        MergeSignal helps you spot dependency risk before merge—locally in your
        terminal, or automatically on every pull request in GitHub Actions.
      </p>

      {/* Guide A — Quick start (local scan) */}
      <section
        className={gsStyles.sectionBlock}
        aria-labelledby="quick-start-heading"
      >
        <h2 id="quick-start-heading">Quick start (local scan)</h2>
        <p className={gsStyles.sectionLead}>
          Run a quick local scan to see what might break before opening or
          merging a dependency change.
        </p>

        <div className={gsStyles.stepBlock}>
          <p className={gsStyles.stepLabel}>Step 1 — Install</p>
          <CodeBlock text={INSTALL_SNIPPET} copyLabel="Copy install commands" />
        </div>

        <div className={gsStyles.stepBlock}>
          <p className={gsStyles.stepLabel}>Step 2 — Run a scan</p>
          <p>
            Run the scan from your project directory, where MergeSignal is
            installed.
          </p>
          {/* <p>If MergeSignal is installed in a different location, use:</p>
          <CodeBlock
            text={RUN_SCAN_FROM_PROJECT}
            copyLabel="Copy scan command"
          />
          <p className={gsStyles.stepNote}>
            Working only inside the cloned repository? After{" "}
            <code>pnpm install</code>, from the repository root you can run:
          </p> */}
          <CodeBlock text={RUN_SCAN_SAME_REPO} copyLabel="Copy scan command" />
        </div>

        <p className={gsStyles.tierNote}>
          The open-source version provides a basic analysis.
        </p>
        <p className={gsStyles.tierNote}>
          For deeper insights and automated pull request comments, use the full
          hosted setup.
        </p>

        <p className={gsStyles.sectionLead}>
          Locally you will see an overall score, a layer breakdown, and
          suggested actions in the terminal. More options (JSON export, failing
          a job above a score) are in the <a href={README}>repository README</a>
          .
        </p>

        <p>To run this on every pull request, continue below.</p>
      </section>

      <hr className={gsStyles.sectionDivider} />

      {/* Guide B — Run on every PR */}
      <section
        className={gsStyles.sectionBlock}
        aria-labelledby="pr-product-heading"
      >
        <h2 id="pr-product-heading">Run on every PR (recommended)</h2>
        <p className={gsStyles.sectionLead}>
          MergeSignal scans dependency changes on every pull request and adds a
          clear, actionable risk summary directly in your GitHub Actions
          workflow—no MergeSignal server to run yourself.
        </p>

        <div className={gsStyles.stepBlock}>
          <h3 className={gsStyles.subGuideHeading} id="gha-heading">
            GitHub Actions (recommended)
          </h3>
          <p>
            Add a short workflow: check out your repository, then run the
            official MergeSignal action. On each run you get a{" "}
            <strong>Summary</strong> in GitHub Actions with an overall score,
            top recommendations, and a risk breakdown—right where your team
            already reviews CI.
          </p>
          <CodeBlock
            text={GHA_RECOMMENDED_SNIPPET}
            copyLabel="Copy workflow YAML"
          />
          <p className={gsStyles.stepNote}>
            This example uses <code>@main</code> so you always use the latest
            action from the default branch. Optional version pins are described
            in <a href={RELEASING}>RELEASING.md</a>.
          </p>
          <p className={gsStyles.stepNote}>
            <strong>Optional — fail the check on risk:</strong> add{" "}
            <code>with: fail_above: &quot;40&quot;</code> (use any 0–100
            threshold). The job <strong>fails</strong> when the total score is{" "}
            <strong>strictly higher</strong> than that value; the workflow{" "}
            <strong>Summary is still written first</strong>, so you keep the
            full picture in the Actions tab. Pull requests show a failed check;
            logs mark the threshold step as the failure.
          </p>
          <p className={gsStyles.stepNote}>
            First runs can take several minutes while the runner prepares
            MergeSignal—that is expected for now and will improve when the CLI
            ships as a smaller install (Phase 2).
          </p>
          <p>
            <strong>Advanced.</strong> For a full template you can fork (for
            example uploading artifacts), see{" "}
            <a href={WORKFLOW_SCAN}>
              <code>mergesignal-scan.yml</code>
            </a>
            . Operator details:{" "}
            <a
              href={`${REPO_BLOB}/.github/actions/merge-signal-scan/README.md`}
            >
              action README
            </a>
            .
          </p>
        </div>

        <div className={gsStyles.stepBlock}>
          <h3 className={gsStyles.subGuideHeading} id="hosted-heading">
            Connect GitHub (hosted setup)
          </h3>
          <p>
            To automatically comment on pull requests, use the hosted setup
            described below.
          </p>
          <p>
            Install the MergeSignal GitHub App, point the webhook at your API,
            and subscribe to pull request and push events. Full setup steps,
            permissions, and environment variables are in{" "}
            <a href={DOCS_GITHUB_APP}>GitHub App setup</a>.
          </p>
        </div>

        <h3 className={gsStyles.subGuideHeading} id="pr-example-heading">
          What you can see on pull requests
        </h3>
        <p className={gsStyles.exampleHint}>
          With the full hosted setup, comments on pull requests can look like
          the example below (illustrative).
        </p>
        <div className={gsStyles.exampleMarkdown}>
          <div className={gsStyles.exampleMarkdownProse}>
            <MarkdownContent githubAlertCallouts>
              {HOSTED_PR_COMMENT_EXAMPLE}
            </MarkdownContent>
          </div>
        </div>
      </section>

      <hr className={gsStyles.sectionDivider} />

      <div className={gsStyles.stepBlock}>
        <h3 className={gsStyles.subGuideHeading} id="troubleshooting-heading">
          Having trouble?
        </h3>
        <ul className={gsStyles.compactHelpList}>
          <li>
            <strong>Node.js</strong> ≥ 20.19 and <strong>pnpm</strong> 9.x — see
            the <a href={README}>README</a> prerequisites.
          </li>
          <li>
            You need a lockfile at the project root you scan (for example{" "}
            <code>pnpm-lock.yaml</code> or <code>package-lock.json</code>).
          </li>
          <li>
            CLI options and common fixes:{" "}
            <a href={README}>README — Install from GitHub</a> and{" "}
            <strong>Troubleshooting</strong> there.
          </li>
          <li>
            Local API, web, and Docker: <a href={README}>README</a> and{" "}
            <a href={`${REPO_BLOB}/DEPLOYMENT.md`}>DEPLOYMENT.md</a>.
          </li>
        </ul>
      </div>
    </article>
  );
}
