
# Template: Proposal

## Purpose

The proposal states why a change is worth making and draws its boundary before any design. The author fills it during propose, together with the deltas. Humans approve it at the proposal gate and in pull requests. The author's plan and tasks stay inside its scope fence, and the reviewer checks scope creep against it. Its track decides whether a plan is written at all.

## Placement

| Item | Value |
|---|---|
| Path | `docs/changes/<change>/proposal.md` |
| Lifecycle | draft → approved (proposal gate) → archived with the change |
| Naming | The change name is kebab-case and starts with a verb (`add-password-reset`), validated by `medra new` |

## Structure

Fixed. Copy `.agents/plugins/medra/templates/proposal/template.md` to the placement path, then fill it section by section. A section that does not apply says so in one line.

## Sections

### Proposal: change-name

The title, using the exact change name.

### Why

**Why:** reviewers approve the problem before the solution, and the archive index keeps the first sentence forever.

**Fill rules:** write 2–5 sentences: who has the problem, what it costs them, and why now. The first sentence must stand alone. Leave the solution to What Changes.

**Example:** "Locked-out users can only regain access by emailing support, which takes 2 days on average. Support handles about 40 such tickets a week."

### What Changes

**Why:** the behavior summary a non-author reads before opening the deltas.

**Fill rules:** write one bullet per behavior change, from the user's point of view. Implementation belongs in the plan.

### Scope

**Why:** the fence that the plan, the tasks and every review hold the change to.

**Fill rules:** write both In scope and Out of scope. Give every out-of-scope item its reason, and name adjacent work a reviewer might expect to see.

### In scope

The deliverables, one bullet each.

### Out of scope

The exclusions, one bullet each with its reason. Example: "SMS delivery of reset links — email covers 98% of users; revisit with the 2FA work."

### Track

**Why:** it decides whether a plan and separate tasks gate follow.

**Fill rules:** write `fast` or `full`, matching `.medra.yaml`. The Rationale names which classification criteria fired, or that none did.

Then classify security relevance. It decides whether the security agent threat-models the plan (full track) and audits the implementation (both tracks). Write `relevant` when the change touches any of:

| Criterion | Examples |
|---|---|
| Authentication, authorization, sessions or identity | login, roles, tokens, route permissions, tenant isolation |
| Sensitive data | personal, financial or health data; credentials; data crossing a tenant or service boundary |
| New or changed external input | endpoints, file uploads, webhooks, query parameters, deserialization, user-rendered content |
| Secrets, keys or cryptography | connection strings, key storage, hashing, signing, TLS settings |
| Infrastructure, deployment or CI | network exposure, containers, IaC, pipeline permissions, cloud roles |
| Dependencies | a package added, removed or upgraded |

The Security rationale names the criteria that fired and where, for example "External input: new `POST /reset` endpoint; Sensitive data: reset tokens stored in `reset_tokens`." For `not-relevant`, it says why none fired, for example "Copy change in the settings page; no input, data or permission change." When unsure, write `relevant`: the human can lower it at the proposal gate, and an unaudited security change is the costlier mistake.

### Capabilities

**Why:** it binds the proposal to its delta files. The CLI cross-checks this table against them.

**Fill rules:** write one row per delta file. Operation is `new`, `modified` or `removed`, and Requirements lists the IDs, or `—` for a new capability.

### Impact

**Why:** reviewers spot blast radius before approving.

**Fill rules:** fill all four lines (code, interfaces, data, dependencies). Write "None." where nothing changes, and never delete a line.

### Open Questions

**Why:** the readiness gate. Validation fails while any marker remains in the proposal or its deltas.

**Fill rules:** list each open `[NEEDS CLARIFICATION: …]` marker while drafting. At the gate the section reads "None."

## Writing Standards

- **Markers instead of guesses.** Write `[NEEDS CLARIFICATION: {specific question}]` wherever the intent leaves a behavior open, and resolve every marker with the user before the gate.
- **Stands alone.** A teammate who missed the conversation must be able to judge the proposal. Write nothing like "as discussed".
- **Bounded.** The whole proposal fits on one screen: about 60 lines. Detail goes in the deltas and the plan.
- **Language.** Prose follows `docs/config-flow.yaml`. Headings, `**Track:**`, `**Rationale:**`, `**Security:**`, `**Security rationale:**`, the Security values and the marker syntax stay in English.

## Quality Checklist

`medra validate` enforces this document's structure, IDs and cross-references. This list holds only what it cannot judge.

- [ ] The first sentence of Why stands alone and names who has the problem.
- [ ] Every Out of scope item carries a reason.
- [ ] The Rationale names the track criteria that fired.
- [ ] The Security rationale names the criteria that fired and where, or why none did.
- [ ] `medra validate <change> --stage proposal` exits `0`.
