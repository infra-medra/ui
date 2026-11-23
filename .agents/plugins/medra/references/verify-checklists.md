# Reference: Verify & Security Checklists

Read this reference on demand when `reviewer-check.md`, `security-audit.md`, or `security-threat-model.md` runs incremental rounds, advisory/scanner checks, STRIDE modeling, or error/verdict edge cases.

## 1. Reviewer (`reviewer-check.md`)

### Incremental Later Rounds (`changed_since_previous`)

When `changed_since_previous` is present:
- Inspect only requirements whose implementing code or covering tests appear in (or call into) `changed_since_previous`, open findings from `previous_report`, and listed test files for test-weakening.
- Carry all untouched requirements forward from `previous_report` with their status and evidence marked `carried from r<N>`.
- An empty `changed_since_previous` list means no code changed: re-check only open findings. Without the field, inspect everything.

### Invalid Dispatch & `needs-decision`

On failed dispatch validation, skip Inspection and go straight to Response with `invalid-dispatch`. When an ambiguous requirement or CLI environment failure blocks verification, mark affected requirements `unverified` and return `status: needs-decision` naming affected fields or REQ IDs in `question`.

## 2. Security Audit (`security-audit.md`)

### Analysis Lens

| Class | Look for | Verify against |
|---|---|---|
| Access control | Missing/client-only authz, BOLA/BFLA, mass assignment, tenant isolation | OWASP A01, API Top 10, ASVS V4 |
| Auth & sessions | Token generation/storage/comparison, expiry/revocation, JWT alg/aud/iss, OAuth/OIDC | ASVS V2–V3, OWASP JWT/Session cheat sheets |
| Injection & input | SQL/NoSQL, command, path traversal, SSRF, deserialization, upload, XSS/sanitizer bypass | OWASP A03/A10, Injection/SSRF/Upload cheat sheets |
| Data protection | Sensitive data in logs/errors/responses, TLS/at-rest crypto, password hashing, key mgmt | ASVS V6/V8–V9, Crypto/Password cheat sheets |
| Configuration | CORS, headers, CSP, debug/verbose errors, default creds, cloud role scope, exposure | OWASP A05, vendor security baseline |
| Secrets | Secrets in code/config/CI, pipeline secret scope | OWASP Secrets Mgmt, GitHub code-security docs |
| Dependencies & supply chain | Vulnerable/unmaintained packages, unpinned CI actions | NVD, GitHub Advisory DB, CISA KEV, EPSS |
| Abuse & availability | Missing rate limits on costly/anon endpoints, enumeration, unbounded resource use | API Top 10 API4, API6 |

### Scanners, Advisories & Incremental Rules

- Check dependency changes against NVD, GitHub Advisory Database, and CISA KEV comparing pinned version to affected range (avoid false-positive CVE findings).
- Run installed read-only scanners (`npm audit`, `dotnet list package --vulnerable`, `pip-audit`, `trivy`, `semgrep`, `gitleaks`) if available, recording version and exit code; never install packages, write to the project, or hit live environments.
- Record unconfirmed theoretical weaknesses with `Origin: hypothesis` and `Confidence: low`.
- When `changed_since_previous` is present: limit new analysis to listed files and `previous_report` finding locations; repeat advisory lookups only if a manifest/lockfile changed; carry unchanged accepted mitigations forward as `carried from r<N>`.

## 3. Security Threat Model (`security-threat-model.md`)

- **Surface:** Take stack versions from manifests/lockfiles (`*.csproj`, `package.json`, `go.mod`, IaC), never plan prose alone; trust only server-side controls as boundary controls.
- **STRIDE & Sources:** Walk STRIDE at each boundary/entry point for credible paths only. Verify mitigations via `WebFetch` against OWASP/ASVS/vendor docs and dependencies against NVD/GHSA/KEV. If a source cannot be reached, record it as `unreachable` with the dependent claim and never fabricate from memory.
- **Report boundaries:** Copy template to `threat_model_path`, keep IDs on revisions, leave `Decision` as `pending` (except already-decided revisions), record `—` threats and partial mitigations in Residual Risks, and never edit `plan.md`.
