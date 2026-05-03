import docStyles from "../components/shared/DocArticle/DocArticle.module.css";
import { CodeBlock } from "../components/shared/CodeBlock/CodeBlock";
import gsStyles from "./getting-started.module.css";

const REPO_BLOB = "https://github.com/MergeSignal/mergesignal/blob/main";
const README = `${REPO_BLOB}/README.md`;
const RELEASING = `${REPO_BLOB}/RELEASING.md`;
const WORKFLOW_SCAN = `${REPO_BLOB}/.github/workflows/mergesignal-scan.yml`;

const INSTALL_SNIPPET = `git clone https://github.com/MergeSignal/mergesignal.git
cd mergesignal
pnpm install`;

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

export default function GettingStartedPage() {
  return (
    <article className={docStyles.article}>
      <h1>Getting started</h1>
      <p className={gsStyles.subtitle}>
        MergeSignal detects dependency risks before merge so you catch issues
        early instead of in production.
      </p>
      <p>Start locally in seconds, then run it on every pull request.</p>

      <section
        id="quick-start"
        className={`${gsStyles.sectionBlock} ${gsStyles.anchorSection}`}
        aria-labelledby="quick-start-heading"
      >
        <h2 id="quick-start-heading">Quick start</h2>
        <p className={gsStyles.sectionLead}>
          Run a local scan to see potential risks before opening a pull request.
        </p>

        <div className={gsStyles.stepBlock}>
          <p className={gsStyles.stepLabel}>Install</p>
          <CodeBlock text={INSTALL_SNIPPET} copyLabel="Copy install commands" />
        </div>

        <div className={gsStyles.stepBlock}>
          <p className={gsStyles.stepLabel}>Run a scan</p>
          <p>
            Run the scan from your project directory, where MergeSignal is
            installed.
          </p>
          <CodeBlock text={RUN_SCAN_SAME_REPO} copyLabel="Copy scan command" />
        </div>

        {/* <p className={gsStyles.tierNote}>
          The open-source version provides a basic analysis.
        </p> */}

        <p className={gsStyles.sectionLead}>
          Locally you will see an overall score, a layer breakdown, and
          suggested actions in the terminal. More options (JSON export, failing
          a job above a score) are in the <a href={README}>repository README</a>
          .
        </p>

        <p>
          For deeper insights and automated pull request comments, continue
          below.
        </p>
        {/* <p>To run this on every pull request, continue below.</p> */}
      </section>

      <hr className={gsStyles.sectionDivider} />

      <section
        id="github-actions"
        className={`${gsStyles.sectionBlock} ${gsStyles.anchorSection}`}
        aria-labelledby="pr-product-heading"
      >
        <h2 id="pr-product-heading">Run on every Pull Request (recommended)</h2>
        <p className={gsStyles.sectionLead}>
          MergeSignal scans dependency changes on every pull request and adds a
          clear, actionable risk summary directly in your GitHub Actions
          workflow - no MergeSignal server to run yourself!
        </p>

        <div className={gsStyles.stepBlock}>
          <h3 className={gsStyles.subGuideHeading} id="gha-heading">
            GitHub Actions
          </h3>
          <p>
            Add a short workflow: check out your repository, then run the
            official MergeSignal action. On each run you get a{" "}
            <strong>Summary</strong> in GitHub Actions with an overall score,
            top recommendations, and a risk breakdown-right where your team
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
            <strong>Optional - fail the check on risk:</strong> add{" "}
            <code>with: fail_above: &quot;40&quot;</code> (use any 0-100
            threshold). The job <strong>fails</strong> when the total score is{" "}
            <strong>strictly higher</strong> than that value; the workflow{" "}
            <strong>Summary is still written first</strong>, so you keep the
            full picture in the Actions tab. Pull requests show a failed check;
            logs mark the threshold step as the failure.
          </p>
          <p className={gsStyles.stepNote}>
            First runs can take several minutes while the runner prepares
            MergeSignal-that is expected for now and will improve when the CLI
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

        <p className={gsStyles.sectionLead}>
          To automatically comment on pull requests via the MergeSignal GitHub
          App, webhook, and API configuration, see the{" "}
          <a href="#github-app">GitHub App</a> section below.
        </p>

        <h3 className={gsStyles.subGuideHeading} id="pr-example-heading">
          What you can see on pull requests
        </h3>
        <p className={gsStyles.exampleHint}>
          With the full hosted setup, comments on pull requests can look like
          the example below (illustrative).
        </p>
        <div className={gsStyles.exampleMarkdown}>
          <div className={gsStyles.prCommentExamplePanel}>
            <h2>MergeSignal</h2>
            <div className="markdown-alert markdown-alert-warning">
              <p className="markdown-alert-title">Warning</p>
              <p>
                <strong>Risky</strong> - elevated dependency merge risk - see
                signals below
              </p>
            </div>
            <p>
              <strong>RISKY</strong> -{" "}
              <strong>
                <code>express</code> can reorder hooks so validation runs after
                your handler-skipped checks.
              </strong>
            </p>
            <p>
              <strong>Mechanism:</strong> Auth middleware order shifts so guards
              run after handlers-skipped session checks on requests.
            </p>
            <p>
              <strong>Context:</strong> <code>express</code> participates in
              middleware chain during a normal request lifecycle.
            </p>
            <blockquote>
              <p>
                <strong>Action:</strong> Confirm middleware chain runs before
                route handlers and verify 401/403 on protected routes.
              </p>
            </blockquote>
            <p>
              <strong>RISKY</strong> -{" "}
              <strong>
                Transitive <code>semver</code> resolution changed-tests may not
                exercise the resolved graph.
              </strong>
            </p>
            <p>
              <strong>Mechanism:</strong> Minor version bumps reorder peer
              dependencies under pnpm’s strict layout.
            </p>
            <p>
              <strong>Context:</strong> Touches <code>packages/web</code> and{" "}
              <code>services/api</code> entrypoints in this workspace.
            </p>
            <blockquote>
              <p>
                <strong>Action:</strong> Run a clean <code>pnpm install</code>{" "}
                on CI and re-run integration tests before merge.
              </p>
            </blockquote>
          </div>
        </div>
      </section>

      <hr className={gsStyles.sectionDivider} />

      <section
        id="github-app"
        className={`${gsStyles.sectionBlock} ${gsStyles.anchorSection}`}
        aria-labelledby="github-app-heading"
      >
        <h2 id="github-app-heading">GitHub App</h2>
        <p className={gsStyles.sectionLead}>
          Optional: connect a GitHub App to your hosted API so repository events
          (for example lockfile changes on pull requests) can enqueue
          scans-useful when you want ingestion aligned with your deployment, not
          only GitHub Actions.
        </p>

        <h3>What you get</h3>
        <p>
          The <strong>MergeSignal GitHub App</strong> lets your{" "}
          <strong>hosted</strong> MergeSignal API receive repository events.
          When a <strong>lockfile changes</strong> on a pull request or push,
          MergeSignal can <strong>enqueue a scan</strong> so results stay fresh
          without relying on Actions alone-useful when you want ingestion and PR
          automation aligned with your deployment.
        </p>

        <h3>When to use this page</h3>
        <p>
          You already run or plan to run <strong>MergeSignal’s API</strong>{" "}
          (hosted or self-managed) and want <strong>GitHub-driven</strong> scans
          and optional <strong>PR feedback</strong> wired to that stack. This is{" "}
          <strong>optional</strong> and assumes you are comfortable with GitHub
          App permissions and API configuration.
        </p>

        <h3>Prerequisites</h3>
        <ul>
          <li>
            A running MergeSignal <strong>API</strong> reachable from GitHub
            (HTTPS).
          </li>
          <li>
            Ability to create a <strong>GitHub App</strong> in your org or
            account and install it on target repositories.
          </li>
        </ul>

        <h3>Setup</h3>
        <ol>
          <li>
            In GitHub, <strong>create a GitHub App</strong> (org-owned is fine).
          </li>
          <li>
            Set the <strong>webhook URL</strong> to your API’s webhook path-for
            example <code>{`https://<your-api-host>/github/webhook`}</code> (use
            the host where <code>apps/api</code> is deployed).
          </li>
          <li>
            Create a <strong>webhook secret</strong> and keep it for API
            configuration.
          </li>
          <li>
            Subscribe to <strong>Pull request</strong> and <strong>Push</strong>{" "}
            events.
          </li>
          <li>
            Under repository permissions, set <strong>Contents</strong> and{" "}
            <strong>Pull requests</strong> to read-only, and{" "}
            <strong>Issues</strong> to read and write if you need PR comments
            from the product.
          </li>
          <li>
            <strong>Install</strong> the App on the repositories (or all repos)
            that should send events.
          </li>
          <li>
            On the API, set <code>GITHUB_APP_ID</code>,{" "}
            <code>GITHUB_PRIVATE_KEY</code> (PEM; newlines may be escaped as{" "}
            <code>\n</code> in env), and <code>GITHUB_WEBHOOK_SECRET</code> to
            match the App.
          </li>
        </ol>
        <p>
          On pull request events (<code>opened</code>, <code>reopened</code>,{" "}
          <code>synchronize</code>), MergeSignal looks for lockfile changes at
          the PR head and enqueues a scan when appropriate. On{" "}
          <strong>push</strong>, it does the same for the pushed commits.
          Supported lockfiles include <code>pnpm-lock.yaml</code>,{" "}
          <code>package-lock.json</code>, and <code>yarn.lock</code> (including
          nested paths).
        </p>

        <h3>What happens next</h3>
        <p>
          Scans surface in the <strong>MergeSignal web app and API</strong> like
          any other run. If you have not yet added CI summaries for every PR,
          complete{" "}
          <a href="#github-actions">
            <strong>GitHub Actions</strong>
          </a>{" "}
          first, then return here when you are ready to wire the App to your
          API.
        </p>
        <p>
          For a <strong>local full stack</strong> (Docker, databases,
          migrations), use the repository’s contributor-oriented sections-
          <strong>not</strong> this product doc page.
        </p>
      </section>

      <hr className={gsStyles.sectionDivider} />

      <div className={`${gsStyles.stepBlock} ${gsStyles.troubleshootingPanel}`}>
        <h3 className={gsStyles.subGuideHeading} id="troubleshooting-heading">
          Having trouble?
        </h3>
        <ul className={gsStyles.compactHelpList}>
          <li>
            <strong>Node.js</strong> ≥ 20.19 and <strong>pnpm</strong> 9.x - see
            the <a href={README}>README</a> prerequisites.
          </li>
          <li>
            You need a lockfile at the project root you scan (for example{" "}
            <code>pnpm-lock.yaml</code> or <code>package-lock.json</code>).
          </li>
          <li>
            CLI options and common fixes:{" "}
            <a href={README}>README - Install from GitHub</a> and{" "}
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
