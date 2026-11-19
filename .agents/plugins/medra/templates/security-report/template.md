# Security Report: {change-name} — round {N}

**Stage:** security
**Verdict:** {pass | pass-with-findings | fail}
**Counts:** critical {n} · high {n} · medium {n} · low {n} · info {n}
**Origin mix:** tool {n} · verified {n} · manual {n} · hypothesis {n}
**Reviewer:** security agent
**Date:** {YYYY-MM-DD}

## Summary

{The verdict, the most severe open finding, and the biggest limitation, in two to four sentences.}

## Scope and Method

- **Examined:** {diff base, and counts of files, entry points and dependency changes read}
- **Method:** {code · configuration · dependencies · threat-model conformance}
- **Tools:** {each scanner that ran, with version and exit code, or "None run."}

## Findings

### S-01 [{critical | high | medium | low | info}] {finding title}

**Status:** {open | remediated | partially-remediated | accepted-risk | false-positive | unable-to-verify}
**Confidence:** {confirmed | high | medium | low} · **Origin:** {tool | verified | manual | hypothesis}
**CWE:** {CWE-NNN or unknown} · **CVE:** {CVE-YYYY-NNNNN or n/a} · **CVSS:** {score and version, or n/a}
**Location:** `{path}:{line}` · {M-NN, TM-NN or REQ ID when one applies}
**Evidence:** {the code, configuration line or command output that shows it}
**Attack scenario:** {how an attacker exploits it}
**Impact:** {technical and business consequence}
**Fix:** {the concrete change that resolves it}
**Validation:** {how the fix will be shown to work}
**References:** {URLs consulted}
**Residual risk:** {what remains after the fix}

## Previous Findings

| ID | Previous status | Status | Evidence |
|---|---|---|---|
| {S-NN} | {status in previous_report} | {status now} | {what shows it} |

## Threat Model Conformance

| Mitigation | Status | Evidence |
|---|---|---|
| {M-NN} | {implemented \| partial \| missing \| unverified} | {path:line or test} |

## Limitations

- {what this audit could not establish, and why}
