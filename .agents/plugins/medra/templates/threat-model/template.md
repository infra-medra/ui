# Threat Model: {change-name}

**Author:** security agent · {YYYY-MM-DD}
**Stack:** {framework and runtime versions read from the project's manifests}

## Scope

- **In:** {components and flows this change adds or alters}
- **Out:** {what was not modeled, and why}

## Assets

- {asset} — `{public | internal | confidential | secret}`: {what its compromise costs}

## Trust Boundaries

| ID | Boundary | From → To |
|---|---|---|
| B-01 | {boundary name} | {less trusted} → {more trusted} |

## Entry Points

- `{route, consumer or job}` ({B-NN}) — {what it accepts, and who can call it}

## Threats

| ID | STRIDE | Threat | Boundary | Severity | Likelihood | Mitigations |
|---|---|---|---|---|---|---|
| TM-01 | {S T R I D E} | {the attack, in one sentence} | {B-NN} | {critical \| high \| medium \| low \| info} | {high \| medium \| low} | {M-NN, … or —} |

## Mitigations

<!-- The security agent writes `pending`; the author replaces it with `accepted (D-NN)` or `declined (D-NN)` before the plan gate. -->

| ID | Mitigation | Threats | Decision |
|---|---|---|---|
| M-01 | {concrete control in this codebase} | {TM-NN, …} | pending |

## Residual Risks

- {TM-NN}: {why it remains, and what would change that}

## Sources

- {URL} — {the threats or mitigations it supports, or `unreachable` and the claim that rests on it}
