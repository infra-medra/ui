
# Template: Threat Model

## Purpose

The threat model shows where a security-relevant change can be attacked before any task is written, while fixing the design is still cheap. The security agent fills it from the proposal, the deltas, the draft plan and the code. The author then decides each mitigation in the Decision column and turns accepted ones into plan Decisions and tasks. The human approves it with the plan, and the security agent's audit in verify checks the implementation against it.

## Placement

| Item | Value |
|---|---|
| Path | `docs/changes/<change>/threat-model.md` |
| Exists only | on the full track, when the proposal says `**Security:** relevant` |
| Lifecycle | draft (security agent) → decided (author fills Decision) → approved with the plan gate → archived with the change |
| Hash | part of the `plan` gate; any edit after approval makes the gate stale |

## Structure

Fixed. Every section is mandatory and stays in order; a section with nothing to record says so in one line ("None."). Copy `.agents/plugins/medra/templates/threat-model/template.md` to the placement path, then fill it section by section.

## Sections

### Threat Model: change-name

The title, using the exact change name. The two lines below it record who wrote the model and the stack it was judged against, for example `**Stack:** ASP.NET Core 8 · EF Core 8 · SQL Server 2022 · Angular 18`. Take versions from the project's manifests (`*.csproj`, `package.json`, lockfiles), never from memory.

### Scope

**Why:** the plan-gate reader learns what was modeled and what was not, so an unmodeled area is a known gap, not a hidden one.

**Fill rules:** two bullets, In and Out. In names the components and flows this change adds or alters. Out names what was deliberately left unmodeled, with the reason. Example: "Out: the existing login flow — unchanged by this change; covered by the 2026-08 auth change."

### Assets

**Why:** a threat matters through what it endangers; severity cannot be judged without the asset.

**Fill rules:** one bullet per asset the change creates, stores, moves or protects, with its sensitivity (`public`, `internal`, `confidential`, `secret`). Example: "Reset tokens — `secret`: possession equals account takeover until expiry."

### Trust Boundaries

**Why:** most threats live where data crosses from less trusted to more trusted; the boundary IDs anchor every threat.

**Fill rules:** one row per boundary in a table `ID | Boundary | From → To`. IDs are `B-NN`. Example: `B-01 | Public API | Internet → API (unauthenticated)`.

### Entry Points

**Why:** the audit in verify walks these to confirm each one is defended in code.

**Fill rules:** one bullet per entry point the change adds or alters: endpoint, message consumer, file import, scheduled job, admin action. Name the path or route and the boundary it crosses. Example: "`POST /api/auth/reset` (B-01) — accepts an email address, anonymous."

### Threats

**Why:** the core of the document; each row is a risk the author must answer with a mitigation or an accepted residual risk.

**Fill rules:** a table `ID | STRIDE | Threat | Boundary | Severity | Likelihood | Mitigations`. Walk STRIDE (Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege) at each boundary and entry point, and keep only threats with a credible path in this design. Severity uses the scale in Writing Standards; Likelihood is `high`, `medium` or `low`. Mitigations lists `M-NN` IDs, or `—` when the threat is accepted as residual. Example:

| ID | STRIDE | Threat | Boundary | Severity | Likelihood | Mitigations |
|---|---|---|---|---|---|---|
| TM-01 | I | Reset endpoint reveals whether an email is registered through different responses | B-01 | medium | high | M-01 |
| TM-02 | S | Reset token guessed or reused after the password changes | B-01 | high | medium | M-02, M-03 |

### Mitigations

**Why:** the author decides here, and accepted mitigations become plan Decisions and tasks; the CLI checks every accepted one reaches a task.

**Fill rules:** a table `ID | Mitigation | Threats | Decision`. Each mitigation is a concrete control in this codebase, citing the source it follows (an OWASP cheat sheet, the vendor's documentation) in Sources. The security agent writes Decision as `pending`; the author replaces it with `accepted (D-NN)` or `declined (D-NN)`, where `D-NN` is the plan Decision that records the choice. Example: `M-02 | Generate tokens with a CSPRNG (≥ 128 bits), store only their hash, expire after 30 minutes, invalidate on use | TM-02 | accepted (D-04)`.

### Residual Risks

**Why:** the plan gate approves these explicitly, so an accepted risk is a decision with a name on it.

**Fill rules:** one bullet per threat with `—` or a declined mitigation, plus any risk a mitigation only reduces. Name the threat, why it remains, and what would change that. Write "None." only when every threat is fully mitigated.

### Sources

**Why:** the reader can tell verified guidance from the agent's recollection.

**Fill rules:** one bullet per source consulted, with its URL and what it supported. Mark a source that could not be reached as `unreachable`, together with the claim that rests on it. Example: "https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html — M-01, M-02."

## Writing Standards

- **Severity scale.** `critical` (credible path to systemic compromise or major data exposure) · `high` (significant impact, realistic exploit) · `medium` (limited or conditional exploit) · `low` (minor impact or hard to exploit) · `info` (hardening, no demonstrated threat).
- **Evidence over recollection.** Every threat names a boundary and an entry point in this design. Every mitigation cites a source in Sources, or says it has none.
- **Nothing fabricated.** No CVE, CWE, CVSS value or advisory appears unless it was read from its source during this run.
- **Stable IDs.** `B-NN`, `TM-NN` and `M-NN` are never renumbered; a dropped threat keeps its row, marked `withdrawn` in the Threat cell, with the reason.
- **Bounded.** Aim for under 120 lines. Detail belongs in the plan's Decisions and in contracts.
- **Language.** Prose follows `docs/config-flow.yaml`. Headings, table headers, IDs, STRIDE letters, severity and likelihood values, and Decision values stay in English.

## Quality Checklist

`medra validate` enforces this document's structure, IDs and cross-references. This list holds only what it cannot judge.

- [ ] Empty sections read "None."
- [ ] The Stack line names versions taken from the project's manifests.
- [ ] Every threat names a boundary that exists in Trust Boundaries.
- [ ] Every `—` in a threat's Mitigations appears in Residual Risks.
- [ ] Every mitigation cites a source in Sources, or says it has none.
- [ ] Every unreachable source is marked, together with the claim that rests on it.
- [ ] `medra validate <change> --stage plan` exits `0`.
