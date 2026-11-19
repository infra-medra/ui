
# Template: Security Report

## Purpose

A security report records one round of the security agent's audit of a change's implementation, so that the implementer can fix what it found and the human at the verify gate can judge what remains. The security agent fills it in verify. The implementer fixes its findings in the same loop as the reviewer's. The verify gate presents it, and archive harvests its critical and high findings into learnings. It informs the gate and never blocks it; the CLI only checks that one exists.

## Placement

| Item | Value |
|---|---|
| Path | `docs/changes/<change>/reviews/<YYYY-MM-DD>-security-agent-r<round>.md`, with `<round>` from the handoff dispatch. It shares its round number with the reviewer's verify report of the same Check |
| Current report | The one with the highest round. A passing report stays current through later rounds where security is not re-dispatched |
| Lifecycle | Final when written. A later round is a new file; an earlier round is never rewritten, because archive harvests every round |

## Structure

Fixed. Every section is mandatory, in order; a section with nothing to record says so in one line ("None."). The three header lines `**Stage:**`, `**Verdict:**` and `**Counts:**` are the only lines the CLI reads, and their spelling is exact. Copy `.agents/plugins/medra/templates/security-report/template.md` to the dispatched `report_path`, then fill it section by section.

## Sections

### Security Report: change-name — round N

The title, then the header lines. `**Stage:**` is always `security`. `**Verdict:**` follows Writing Standards → Verdict. `**Counts:**` counts the findings whose status is `open` or `partially-remediated`, by severity. `**Origin mix:**` counts all findings by origin, so the reader sees at a glance how much was confirmed against how much is hypothesis.

### Summary

**Why:** the gate reader gets the verdict's reason before the detail.

**Fill rules:** two to four sentences: the verdict, the most severe open finding, and the biggest limitation of this audit. Write no reassurance such as "the change is secure"; the absence of findings is not proof of security. Example: "pass-with-findings: one medium finding remains (S-03, verbose errors on the reset endpoint). Token handling matches M-02 of the threat model. Dependency CVEs could not be checked against NVD (unreachable); `npm audit` ran instead."

### Scope and Method

**Why:** the reader knows what was examined, how, and with which tools, so a gap in coverage is visible.

**Fill rules:** three bullets. **Examined** names the diff base and the areas read, counted rather than listed (for example "14 files changed since `3f2a9c1`, 3 entry points, 2 dependency changes"). **Method** names the analyses performed: code, configuration, dependency, threat-model conformance. **Tools** names each scanner that actually ran, with its version and exit code, or "None run." Never name a tool that did not run.

### Findings

**Why:** each finding is a unit the implementer can fix and the reviewer of the next round can re-check.

**Fill rules:** one `### S-NN` block per finding, in the exact field order of the skeleton. Fill every field; write `unknown` or `n/a` instead of guessing. Location is `path:line` or the endpoint and its configuration key. Evidence quotes the code, the configuration line or the command output that shows the problem. Severity and Confidence follow Writing Standards. Origin is `tool` (a scanner reported it and you have not confirmed it), `verified` (a scanner or a source reported it and you confirmed it in this code), `manual` (you found it by reading), or `hypothesis` (a plausible weakness you could not confirm; Confidence is then `low`). Example:

```markdown
### S-02 [high] Reset token compared with a non-constant-time equality

**Status:** open
**Confidence:** high · **Origin:** manual
**CWE:** CWE-208 · **CVE:** n/a · **CVSS:** n/a
**Location:** `src/Auth/ResetService.cs:88` · M-02, TM-02
**Evidence:** `if (stored.TokenHash == Hash(token))` compares strings with `==`
**Attack scenario:** an attacker measures response times over many requests to recover the hash byte by byte.
**Impact:** account takeover for any user with a pending reset.
**Fix:** compare with `CryptographicOperations.FixedTimeEquals` on the byte arrays.
**Validation:** a unit test asserts `FixedTimeEquals` is used; re-run this audit on round 2.
**References:** https://learn.microsoft.com/dotnet/api/system.security.cryptography.cryptographicoperations.fixedtimeequals
**Residual risk:** none once fixed; rate limiting (M-05) further reduces the window.
```

### Previous Findings

**Why:** the implementer's claims are checked, not trusted, and every finding of the change keeps a final status.

**Fill rules:** on round 1 write "None.". On later rounds, one row per finding of `previous_report` in a table `ID | Previous status | Status | Evidence`, where Status follows Writing Standards → Finding status. A finding still open is repeated in full under Findings with the same ID. Example: `S-02 | open | remediated | ResetService.cs:88 now uses FixedTimeEquals; test ResetServiceTests.cs:41`.

### Threat Model Conformance

**Why:** the plan gate approved mitigations; this section shows whether the code delivers them.

**Fill rules:** on a fast-track change, write "No threat model (fast track).". Otherwise, one row per `accepted` mitigation in a table `Mitigation | Status | Evidence`, where Status is `implemented`, `partial`, `missing` or `unverified`. A `partial` or `missing` mitigation is also a finding.

### Limitations

**Why:** the gate reader knows what this audit could not establish, so accepted risk is decided knowingly.

**Fill rules:** one bullet per limitation: an unreachable source (with the claim that rests on it), a scanner unavailable, code outside the diff that was not read, a runtime behavior that only a dynamic test could show. Write "None." only when there was truly none.

## Writing Standards

- **Severity.** `critical` (credible path to systemic compromise or major data exposure) · `high` (significant impact, realistic exploit) · `medium` (limited or conditional exploit) · `low` (minor impact or hard to exploit) · `info` (hardening, no demonstrated vulnerability). CVSS informs severity and never decides it alone: weigh exposure, privileges required, data sensitivity, existing mitigations, and KEV and EPSS status when known.
- **Confidence.** `confirmed` (reproduced, or the evidence leaves no doubt) · `high` · `medium` · `low`. A `hypothesis` finding is `low`.
- **Verdict.** `fail` when any open finding is `critical`, or `high` with confidence `confirmed` or `high`. `pass-with-findings` when other findings are open. `pass` when none is open. The verdict drives the fix loop; it never blocks the gate.
- **Finding status.** `open` · `remediated` (evidence in code and, where possible, a test) · `partially-remediated` · `accepted-risk` (only when a verify gate note accepts it) · `false-positive` (with the evidence that clears it) · `unable-to-verify`. A status changes only with evidence; code that merely changed is not `remediated`.
- **Nothing fabricated.** No CVE, CWE, CVSS value, affected version or advisory appears unless it was read from its source during this run. A vulnerable dependency is reported only after its installed version is checked against the advisory's affected range.
- **No secrets.** When a finding concerns an exposed secret, Evidence gives the location and the secret's kind, masked (`sk_live_…4f2a`), never its value.
- **Stable IDs.** `S-NN` IDs are kept across rounds and never renumbered; a new finding takes the next free number.
- **Bounded.** Findings carry evidence, not file dumps: quote at most a few lines per finding.
- **Language.** Prose follows `docs/config-flow.yaml`. Headings, bold labels, IDs, severities, confidence, origin, status and verdict values stay in English.

## Quality Checklist

- [ ] The file is at the dispatched `report_path`, and the title's round matches it.
- [ ] `**Stage:** security`, the Verdict and the Counts lines are spelled exactly, and the Counts equal the `open` and `partially-remediated` findings by severity.
- [ ] The Verdict follows Writing Standards → Verdict.
- [ ] Every finding fills every field, with `unknown` or `n/a` instead of a guess, and has evidence from this code.
- [ ] Every CVE, CWE, CVSS value and advisory was read from its source in this run, and every reference URL was consulted.
- [ ] Every tool named under Tools actually ran, with its version and exit code.
- [ ] On later rounds, every finding of the previous report has a status with evidence.
- [ ] No secret value appears anywhere in the report.
- [ ] Limitations names every unreachable source and unavailable scanner.
