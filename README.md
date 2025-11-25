# Config-Scan

A TypeScript-based CLI tool for scanning Docker, Kubernetes, and Nginx configuration files for security issues.

## Features

- 🔍 **Automatic Detection**: Discovers and classifies Docker, Kubernetes, and Nginx config files
- 🛡️ **25+ Security Rules**: Comprehensive rule set covering common misconfigurations
- 📊 **Risk Scoring**: Weighted severity-based scoring (LOW: 0.5, MEDIUM: 1, HIGH: 3, CRITICAL: 5)
- 📝 **Multiple Output Formats**: Console, JSON, and Markdown reports
- 🚀 **CI/CD Ready**: GitHub Actions integration with automated blocking on HIGH/CRITICAL findings

## Installation

```bash
cd server
npm install
npm run build
```

## Usage

### Basic Scan

```bash
# Scan current directory (console output)
npm start .

# Scan specific directory
npm start ./examples

# Scan with JSON output
npm start ./examples --format=json --out=./reports

# Generate all formats (console + JSON + Markdown)
npm start ./examples --format=all --out=./reports
```

### Command-Line Options

```
config-scan [path] [options]

Arguments:
  path                Root path to scan (default: ".")

Options:
  --format <format>   Output format: console | json | md | all (default: "console")
  --out <dir>         Output directory for reports (default: "./reports")
  --llm               Enrich report with AI insights using Google Gemini (NEW!)
  -h, --help          Display help
```

### 🤖 AI-Powered Insights (Phase 8 - NEW!)

Generate AI-enhanced reports with Google Gemini:

```bash
# 1. Set up your API key
cd server
echo "GOOGLE_API_KEY=your_key_here" > .env

# 2. Run scan with LLM enrichment
node server/dist/server.js . --llm --format=json --out=./reports  

# This generates report-llm.json with:
# - Executive summary of overall security posture
# - Per-file AI analysis and recommendations
# - Actionable remediation steps
```

**Note**: Get your free API key at https://aistudio.google.com/app/apikey

### 📊 Web Dashboard

Visualize scan results with the beautiful React dashboard:

```bash
cd client

# First time setup
npm install

# Sync latest report
npm run sync-report

# Start dashboard
npm run dev
```

Open http://localhost:3000 to explore:
- 🎯 Interactive filters (severity, config type, search)
- 📁 Visual file cards with risk indicators
- ✨ AI insights panel with smart recommendations
- 📈 Real-time statistics and trends

## Output Formats

### Console
Human-readable output with findings grouped by file:
```
File: examples/Dockerfile.bad
  Type: docker
  Overall risk: HIGH
  Overall score: 6
  Findings: 4
    - [HIGH] DOCKER_LATEST_TAG: Docker image uses the 'latest' tag.
      Line: 1
      Recommendation: Pin a specific version tag...
```

### JSON
Machine-readable format suitable for CI/CD integration:
```json
{
  "files": [
    {
      "path": "examples/Dockerfile.bad",
      "configType": "docker",
      "findings": [...],
      "overallScore": 6,
      "overallRisk": "HIGH"
    }
  ],
  "scannedAt": "2025-11-25T07:16:21.092Z"
}
```

### Markdown
Documentation-friendly format for reports and PR comments.

## Security Rules

### Docker (8 rules)
- `DOCKER_LATEST_TAG` (HIGH) - Detects `:latest` tag usage
- `DOCKER_MISSING_USER` (MEDIUM) - No USER instruction (runs as root)
- `DOCKER_MISSING_HEALTHCHECK` (MEDIUM) - No HEALTHCHECK configured
- `DOCKER_EXPOSE_SSH` (HIGH) - SSH port 22 exposed
- `DOCKER_COPY_DOT_DOT` (MEDIUM) - Broad COPY . . pattern
- `DOCKER_NO_CMD_OR_ENTRYPOINT` (LOW) - Missing CMD/ENTRYPOINT
- `DOCKER_BAD_BASE_IMAGE` (HIGH) - Outdated base images
- `DOCKER_PACKAGE_INSTALL_NO_CLEANUP` (LOW) - No cleanup after package install

### Kubernetes (9 rules)
- `K8S_PRIVILEGED_CONTAINER` (HIGH) - Privileged mode enabled
- `K8S_RUN_AS_ROOT` (HIGH) - Running as root user
- `K8S_MISSING_SECURITY_CONTEXT` (MEDIUM) - No securityContext
- `K8S_MISSING_RESOURCES` (MEDIUM) - No resource limits
- `K8S_MISSING_PROBES` (MEDIUM) - No health probes
- `K8S_HOSTPATH_VOLUME` (HIGH) - hostPath volumes used
- `K8S_HOSTNETWORK_TRUE` (HIGH) - hostNetwork enabled
- `K8S_IMAGE_LATEST_TAG` (MEDIUM) - Image uses :latest tag
- `K8S_MISSING_READONLY_ROOT_FS` (MEDIUM) - Mutable root filesystem

### Nginx (8 rules)
- `NGINX_SSL_PROTOCOLS_WEAK_OR_MISSING` (MEDIUM/CRITICAL) - Weak TLS protocols
- `NGINX_SERVER_TOKENS_ON` (MEDIUM) - Version disclosure enabled
- `NGINX_MISSING_X_CONTENT_TYPE_OPTIONS` (MEDIUM) - Missing security header
- `NGINX_MISSING_X_FRAME_OPTIONS` (MEDIUM) - Missing anti-clickjacking header
- `NGINX_AUTOINDEX_ON` (MEDIUM) - Directory listing enabled
- `NGINX_HTTP_NO_REDIRECT` (MEDIUM) - HTTP without HTTPS redirect
- `NGINX_CLIENT_MAX_BODY_SIZE` (LOW/MEDIUM) - Missing or excessive size limit
- `NGINX_MISSING_HSTS` (MEDIUM) - Missing Strict-Transport-Security header

## Risk Scoring

Scores are calculated by summing individual finding severities:

| Severity | Points | Description |
|----------|--------|-------------|
| LOW | 0.5 | Minor issues, cosmetic |
| MEDIUM | 1 | Best-practice violations |
| HIGH | 3 | Significant security risks |
| CRITICAL | 5 | Severe vulnerabilities |

**Score Interpretation:**
- 0-2: ✅ Low Risk
- 3-5: ⚠️ Medium Risk
- 6-10: 🔴 High Risk
- 10+: 🚨 Critical Risk

## CI/CD Integration

### GitHub Actions

The tool includes a GitHub Actions workflow that:
- Runs on every push and pull request
- Scans all config files in the repository
- **Blocks builds** if any file has HIGH or CRITICAL risk
- Uploads scan reports as artifacts

#### Setup

The workflow is automatically configured at `.github/workflows/config-scan.yml`.

To enable it:

1. Ensure the workflow file exists (created during Phase 7)
2. Push to your repository
3. The workflow will run automatically

#### Manual CI Check

You can manually run the CI check locally:

```bash
# Generate JSON report
npm start . --format=json --out=./reports

# Run CI check (exits with code 1 if HIGH/CRITICAL findings exist)
node dist/utils/ciCheck.js ./reports/report.json
```

#### CI Check Behavior

**Passing Build:**
```bash
✅ config-scan: No HIGH/CRITICAL findings. CI check passed.
```

**Failing Build:**
```bash
❌ config-scan: Blocking findings detected.

  - examples/Dockerfile.bad (type=docker, risk=HIGH, score=6)
    Findings: 4
      • [HIGH] DOCKER_LATEST_TAG
      • [MEDIUM] DOCKER_MISSING_USER
      ...

Total files with HIGH/CRITICAL risk: 2
```

### Custom CI Integration

For other CI systems (GitLab CI, CircleCI, etc.):

```bash
# In your CI script:
cd server
npm install
npm run build

# Run scan and generate JSON report
node dist/server.js . --format=json --out=./reports

# Check for blocking findings
node dist/utils/ciCheck.js ./reports/report.json
```

The `ciCheck.js` script exits with:
- **Exit code 0**: No HIGH/CRITICAL findings (build passes)
- **Exit code 1**: HIGH/CRITICAL findings detected (build fails)

### 🔒 GitHub Branch Protection & Ruleset Enforcement

This repository uses GitHub Rulesets to enforce secure development practices and ensure that no insecure configuration changes are merged into main.

#### 🚧 Branch Protection Overview

The following protections are enforced on the main branch:

**Require Pull Request Before Merging**
- Direct pushes to main are blocked. All changes must come through PRs.

**Require Status Checks to Pass**
- The `config-scan` GitHub Actions workflow must succeed before a PR can be merged.
- Required Status Check: `config-scan` (GitHub Actions)

**Block Force Pushes**
- Prevents bypassing or overwriting protected history.

#### 🔄 How It Works in Practice

**1. Pushing to main is rejected**

Attempting a direct push results in:
```
remote: error: GH013: Repository rule violations found.
- Changes must be made through a pull request.
- Required status check "config-scan" is expected.
```

This ensures nothing hits production without scanning.

**2. Feature branches work normally**

Branches such as:
- `feature/new-rule`
- `fix-classifier`
- `bad-config`

can be pushed freely, because the ruleset targets only main.

**3. Opening a Pull Request triggers the scan**

When a PR is opened:
- GitHub automatically starts the `config-scan` workflow
- UI shows: "Some checks haven't completed yet"
- GitHub cannot disable the merge button while checks are running, but…

**4. ❌ If the scan fails → Merge is blocked**

Once the check completes and fails:
- "All checks have failed"
- The merge button is disabled
- PR cannot be merged until issues are fixed

This ensures insecure configuration changes can never reach main.

**5. ✅ If scan passes → Merge is allowed**

When the scan reports ZERO HIGH/CRITICAL findings:
- Check passes ✅
- PR becomes mergeable
- Ruleset validates both code integrity and configuration security

#### 📁 Example Recommended Workflow

1. Create a new branch
2. Commit changes
3. Push branch
4. Open PR to main
5. Wait for config-scan to finish
6. Fix issues if workflow fails
7. Merge only when scan is green ✅

## Development

```bash
# Install dependencies
cd server
npm install

# Run in development mode with watch
npm run dev -- ./examples

# Build for production
npm run build

# Run built version
npm start ./examples
```

## Project Structure

```
server/
├── handlers/
│   ├── rules/           # Security rule implementations
│   │   ├── dockerRules.ts
│   │   ├── kubernetesRules.ts
│   │   └── nginxRules.ts
│   ├── scanHandler.ts   # Main scanning logic
│   └── reportHandler.ts # Report formatting
├── models/
│   ├── rule.ts         # Rule type definitions
│   └── report.ts       # Report type definitions
├── utils/
│   ├── scoring.ts      # Risk scoring logic
│   ├── ciCheck.ts      # CI/CD check script
│   └── ...
├── routes/
│   └── cliRoutes.ts    # CLI interface
└── server.ts           # Entry point
```

## Examples

See the `examples/` directory for sample configurations that trigger various rules:
- `Dockerfile.bad` - Docker with multiple issues
- `deployment-bad.yaml` - Kubernetes with security problems
- `nginx-bad.conf` - Nginx with missing security headers

## License

ISC

## Contributing

Contributions welcome! Please ensure:
- All rules are deterministic (same input → same output)
- Rules include clear descriptions and actionable recommendations
- New rules are added to the appropriate rule file
- Tests pass: `npm run build` should complete without errors

