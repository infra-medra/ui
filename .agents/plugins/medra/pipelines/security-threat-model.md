
# Pipeline: Threat Model

## Purpose

This pipeline produces `threat-model.md` for a security-relevant full-track change: its assets, trust boundaries, entry points, STRIDE threats, the mitigations that answer them, and the residual risks. It runs single-shot when the author dispatches it under `.agents/plugins/medra/handoffs/author-security.md` after drafting the plan, as an isolated subagent (inline on runtimes without subagents), and returns without asking the user anything. It differs from the audit by judging a design before code exists, so that mitigations become plan decisions and tasks rather than fixes.

## Presentation

Phase headers for this pipeline:

| Phase | Header |
|---|---|
| Intake | `Security \| Intake` |
| Surface | `Security \| Surface` |
| Modeling | `Security \| Modeling` |
| Report | `Security \| Report` |
| Response | `Security \| Response` |

## Flow

Phases run Intake → Surface → Modeling → Report → Response. An invalid dispatch goes from Intake straight to Response.

## Phases

### Phase 1 — Intake

**Goal**
A validated dispatch, plus the bounded context the model is built from.

**Actions**
- In one turn, read `.agents/plugins/medra/handoffs/author-security.md`, `.agents/plugins/medra/references/conventions.md` and `.agents/plugins/medra/templates/threat-model/guide.md` in parallel tool calls, together with the `medra context` call below; then validate the dispatch against the handoff's receiver rules
- Run `medra context <change> --stage plan --md` for the requirements, the constitution and the matching learnings
- Read the proposal (Why, Scope, the Security rationale), the deltas, and the draft plan at `plan_path`; on a revision, also read the existing threat model at `threat_model_path`

**Avoid**
- Don't start modeling after a failed dispatch validation — because a model of the wrong change looks complete and misleads the plan gate

**Exit when:**
- [ ] The dispatch passed the receiver validation, or the failing fields are recorded for an `invalid-dispatch` response
- [ ] The proposal's Security rationale, the deltas and the draft plan have been read

---

### Phase 2 — Surface

**Goal**
A verified map of what this change exposes: the stack with versions, the assets, the trust boundaries and the entry points.

**Actions**
- Read the stack's versions from the project's manifests and lockfiles (`*.csproj`, `package.json`, `go.mod`, IaC files), never from the plan's prose alone
- Identify the assets the change creates, stores, moves or protects, and their sensitivity
- Trace each flow the plan describes to the code it touches or extends, and mark every point where data crosses a trust boundary
- List the entry points the change adds or alters, each with its boundary, verified in the code or named in the plan

**Avoid**
- Don't model the whole system — because the plan gate approves this change; an unchanged area goes under Scope → Out, with the reason
- Don't assume a private network or a frontend guard is a boundary control — because placement and client-side checks do not authorize anything on the server

**Exit when:**
- [ ] Every stack version is taken from a manifest or lockfile
- [ ] Every entry point names its boundary, and every boundary has an ID

---

### Phase 3 — Modeling

**Goal**
Threats with a credible path in this design, each answered by a source-backed mitigation or an explicit residual risk.

**Actions**
- Walk STRIDE at each boundary and entry point, and keep a threat only when this design gives it a credible path; rate its severity and likelihood with the template's scales
- For each threat, propose the smallest effective control in this codebase, and check it against the authoritative source for the stack and version: the matching OWASP Cheat Sheet or ASVS requirement, and the vendor's security documentation, fetched with `WebFetch`
- When the design adds or upgrades a dependency, check it against NVD, the GitHub Advisory Database and the CISA KEV catalog for the version the manifest pins
- Record each source that cannot be reached as `unreachable`, together with the claim that rests on it, and keep modeling

**Avoid**
- Don't list generic threats the design does not expose — because a padded model buries the real threats and trains the author to decline everything
- Don't recommend a control from recollection when its source is unreachable — because guidance that has changed since your training becomes a wrong plan decision; mark it unverified instead
- Don't redesign the feature — because the author owns the plan; propose controls, and leave the choice to the author's decision

**Exit when:**
- [ ] Every threat names a boundary, a severity and a likelihood, and lists mitigations or `—`
- [ ] Every mitigation cites a source consulted in this run, or is marked as having none
- [ ] Every unreachable source is recorded with the claim that rests on it

---

### Phase 4 — Report

**Goal**
`threat-model.md` at `threat_model_path`, passing the template's checklist except the author's Decision items.

**Actions**
- Copy the template to `threat_model_path` (or update the existing file on a revision, keeping every ID) and fill every section, with every Decision `pending` except those the author already decided
- Write each `—` threat and each partial mitigation into Residual Risks
- Read the file back and run the `.agents/plugins/medra/templates/threat-model/guide.md` Quality Checklist, skipping the item about pending Decisions, which the author completes

**Avoid**
- Don't fill the Decision column — because accepting or declining a mitigation is the author's design choice, approved by the human at the plan gate
- Don't edit plan.md or any other file — because the author integrates the model; a second writer in the plan makes the gate approve text nobody owns

**Exit when:**
- [ ] The file exists at `threat_model_path` with all nine headings, and the checklist passes except for the Decision items
- [ ] The Threats rows by severity and the Mitigations count are known for the response

---

### Phase 5 — Response

**Goal**
The handoff's response payload, as the final block of the final message.

**Actions**
- Compose the response exactly as the handoff's Response section defines it, with values counted from the file you wrote
- Precede it with at most three sentences: the most severe threat and the mitigation that answers it
- On an invalid dispatch or a needed decision, return the matching status as the handoff's Error Handling describes, naming the assumption or field in the `question`

**Avoid**
- Don't append prose after the YAML block — because the sender parses the final block; trailing text breaks the parse

**Exit when:**
- [ ] The final message ends with a YAML block that has every required response field
- [ ] Every value in the block equals the file on disk
