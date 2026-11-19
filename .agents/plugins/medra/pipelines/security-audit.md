
# Pipeline: Audit

## Purpose

This pipeline produces one round's security report on a finished security-relevant change: evidence-backed findings, the status of every earlier finding, conformance to the threat model when there is one, and the audit's limitations. It runs single-shot when the implementer dispatches it under `.agents/plugins/medra/handoffs/implementer-security.md`, in parallel with the reviewer's check, as an isolated subagent (inline on runtimes without subagents), and returns without asking the user anything. It differs from the threat model by judging code that exists, so its findings become fixes rather than design decisions.

## Presentation

Phase headers for this pipeline:

| Phase | Header |
|---|---|
| Intake | `Security \| Intake` |
| Surface | `Security \| Surface` |
| Analysis | `Security \| Analysis` |
| Report | `Security \| Report` |
| Response | `Security \| Response` |

## Constraints

- **Change a finding's status only with evidence in the current code.** A finding is `remediated` when the code and, where possible, a test show it; the implementer's claim in `fixed_findings` is what to check, not what to record. A status changed on trust is how a vulnerability ships marked as fixed.

## Flow

Phases run Intake → Surface → Analysis → Report → Response. An invalid dispatch goes from Intake straight to Response.

## Phases

### Phase 1 — Intake

**Goal**
A validated dispatch, plus the bounded context the audit is built from.

**Actions**
- In one turn, read `.agents/plugins/medra/handoffs/implementer-security.md`, `.agents/plugins/medra/references/conventions.md` and `.agents/plugins/medra/templates/security-report/guide.md` in parallel tool calls, together with the `medra context` call below; then validate the dispatch against the handoff's receiver rules
- Run `medra context <change> --stage verify --md` for the requirements, the constitution, the matching learnings and the paths of the change's documents
- Read the proposal's Security rationale and, when `threat-model.md` exists, its entry points and accepted mitigations. On later rounds, read `previous_report`

**Avoid**
- Don't read the reviewer's report of this round — because the audit is independent; agreeing with another verdict is not evidence
- Don't write to `previous_report` or any earlier round's file — because each round's findings are the evidence archive harvests

**Exit when:**
- [ ] The dispatch passed the receiver validation, or the failing fields are recorded for an `invalid-dispatch` response
- [ ] The Security rationale, the threat model when present, and the previous report on later rounds have been read

---

### Phase 2 — Surface

**Goal**
A verified map of what the implementation exposes: the changed files, the entry points in code, and the stack with versions.

**Actions**
- Run `git diff --stat <diff_base>` (when `diff_base` is not `none`) to learn which files changed, then read the full diff of the security-relevant ones. On a later round whose dispatch carries `changed_since_previous`, read only the files in that list, plus the locations of the findings in `previous_report`
- Locate every entry point in the code (routes, consumers, jobs, file handlers) the diff adds or alters, and its authentication and authorization path on the server side
- Read the stack's versions and the dependency changes from the manifests and lockfiles
- Note every secret, key, connection string or token the diff touches, by location and kind only

**Avoid**
- Don't read the whole repository — because cost must track the change; follow a call path outside the diff only when a finding depends on it, and record what you did not read under Limitations

**Exit when:**
- [ ] Every entry point the diff adds or alters is located in the code, with its server-side authorization path
- [ ] The dependency changes and the stack versions are taken from manifests or lockfiles

---

### Phase 3 — Analysis

**Goal**
Evidence-backed findings for every security weakness in the changed code, and a status for every earlier finding and accepted mitigation.

**Actions**
- Analyze the changed code and configuration against Knowledge → Analysis Lens, checking each candidate against the authoritative source for the stack and version with `WebFetch`, and keep only what this code shows
- Check each dependency change against NVD, the GitHub Advisory Database and the CISA KEV catalog, comparing the pinned version to the advisory's affected range; run an installed scanner (`npm audit`, `dotnet list package --vulnerable`, `pip-audit`, `trivy`, `semgrep`, `gitleaks`) read-only when one is available, and record its version and exit code
- When `threat-model.md` exists, judge each accepted mitigation `implemented`, `partial`, `missing` or `unverified`, with the location that shows it
- On later rounds, re-check every finding of `previous_report`, starting with `fixed_findings`, and look for regressions the fixes introduced
- On a later round whose dispatch carries `changed_since_previous`, limit new analysis to the files in that list. Repeat the dependency and advisory lookups only when a manifest or lockfile is in it; otherwise carry the earlier round's results forward, and the status of each accepted mitigation whose location is outside the list, marked `carried from r<N>`

**Avoid**
- Don't report a dependency as vulnerable without checking the installed version against the affected range — because a CVE that does not apply is a false positive that costs the implementer a round
- Don't run a scanner that writes to the project, installs packages or calls a live environment — because the audit's only output is its report; an unauthorized side effect makes the audit itself an incident
- Don't repeat on a later round the source lookups and file reads whose inputs did not change — because the CLI hashed those files at both rounds and they are identical; a second fetch of the same advisory for the same pinned version returns what the previous report already cites
- Don't report a theoretical weakness as a confirmed vulnerability — because severity without an exploit path in this code misdirects the fix loop; record it with Origin `hypothesis` and Confidence `low`

**Exit when:**
- [ ] Every candidate finding has evidence from this code, an origin, a confidence and, when cited, a source read in this run
- [ ] Every accepted mitigation and every finding of `previous_report` has a status with evidence
- [ ] Every scanner that ran is recorded with its version and exit code, and every unreachable source is noted

---

### Phase 4 — Report

**Goal**
The round's security report at `report_path`, with a verdict set by the template's rules.

**Actions**
- Copy the template to `report_path` (a new file, distinct from every earlier round) and fill every section, keeping earlier findings' `S-NN` IDs and numbering new ones from the next free ID
- Set the Verdict and the Counts by `.agents/plugins/medra/templates/security-report/guide.md` → Writing Standards
- Read the file back and run the `.agents/plugins/medra/templates/security-report/guide.md` Quality Checklist

**Avoid**
- Don't write that the change is secure — because the absence of findings is not proof; state what was examined and what was not

**Exit when:**
- [ ] The report exists at `report_path` and passes the template checklist
- [ ] The Verdict and the Counts follow the template's rules

---

### Phase 5 — Response

**Goal**
The handoff's response payload, as the final block of the final message.

**Actions**
- Compose the response exactly as the handoff's Response section defines it, with values read from the report you wrote
- Precede it with at most three sentences: the verdict and the most severe open finding
- On an invalid dispatch or a needed decision, return the matching status as the handoff's Error Handling describes, naming the affected finding or field in the `question`

**Avoid**
- Don't append prose after the YAML block — because the sender parses the final block; trailing text breaks the parse

**Exit when:**
- [ ] The final message ends with a YAML block that has every required response field
- [ ] Every value in the block equals the report on disk

## Knowledge

### Analysis Lens

Analysis reads the changed code through the classes below and keeps only what applies to this change. The references are where to verify, per stack and version.

| Class | Look for | Verify against |
|---|---|---|
| Access control | Missing or client-only authorization, object-level access by ID (BOLA), function-level access (BFLA), mass assignment, tenant isolation | OWASP Top 10 A01, API Security Top 10, ASVS V4 |
| Authentication and sessions | Token generation, storage and comparison; expiry and revocation; JWT validation (algorithm, audience, issuer); OAuth/OIDC flows | ASVS V2–V3, OWASP JWT and Session Management cheat sheets |
| Injection and input | SQL/NoSQL, command, path traversal, SSRF, deserialization, file upload, XSS and unsafe sanitizer bypasses | OWASP Top 10 A03, A10; Injection, SSRF and File Upload cheat sheets |
| Data protection | Sensitive data in logs, errors or responses; encryption in transit and at rest; password hashing; key management | ASVS V6, V8–V9; Cryptographic Storage and Password Storage cheat sheets |
| Configuration | CORS, security headers, CSP, debug or verbose errors, default credentials, cloud role scope, network exposure | OWASP Top 10 A05; the vendor's security baseline |
| Secrets | Secrets in code, config or CI; secret scope in pipelines | OWASP Secrets Management cheat sheet; GitHub code-security docs |
| Dependencies and supply chain | Added or upgraded packages with known vulnerabilities, unmaintained packages, unpinned CI actions | NVD, GitHub Advisory Database, CISA KEV, EPSS when available |
| Abuse and availability | Missing rate limits on anonymous or costly endpoints, enumeration through differing responses, unbounded resource use | API Security Top 10 API4, API6 |
