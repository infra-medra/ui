
# Template: Review Report

## Purpose

A review report records one reviewer's judgment of one stage of a change, so that the judgment survives the session. The reviewer fills it, both in an interactive review and in the single-shot check during verify. Humans read it at gates and in pull requests. The implementer fixes from its findings, `medra review` records its verdict, and the author harvests lessons from it at archive. The decision it enables is whether this stage can advance.

## Placement

| Item | Value |
|---|---|
| Path | `docs/changes/<change>/reviews/<YYYY-MM-DD>-<stage>-<reviewer>.md`. `<reviewer>` is the human's name in kebab-case, or `agent` for the check |
| Verify rounds | The check adds the round: `<YYYY-MM-DD>-verify-agent-r<round>.md`, with `<round>` from the handoff dispatch. Rounds often fall on the same day, and the suffix keeps each one; the highest round is the current report for the gate, and archive harvests all of them |
| Lifecycle | Final when written. A re-review, or a later verify round, is a new file; never rewrite an earlier one |

## Structure

Fixed. Copy `.agents/plugins/medra/templates/review/template.md` to the placement path, then fill it section by section.

## Sections

### Review: change-name — stage

**Why:** `medra review` and the verify gate read the status block, and humans read the rest.

**Fill rules:**
- Stage is one of `proposal`, `plan`, `tasks` or `verify`.
- For `proposal`, `plan` and `tasks`, the Verdict is `approve`, `request-changes` or `comment`. For `verify` it is `pass`, `pass-with-findings` or `fail`.
- Counts must equal the findings below.

### Summary

**Why:** the reader decides in seconds whether to read further.

**Fill rules:** write 2–4 sentences: the verdict's reason, and the single most important finding.

### Findings

**Why:** each finding is a fix the author or implementer can act on without asking.

**Fill rules:**
- Write one `### F-NN [severity] title` per problem, with Where (path:line, plus the REQ or task ID), Problem (with its evidence) and Fix (the concrete change).
- **critical:** blocks the stage. The requirement is violated, a test was weakened, or a constitution article fails without justification.
- **major:** must be fixed before archive.
- **minor:** an improvement.
- When there are no findings, write "None."

**Example:**

```markdown
### F-02 [critical] Expiry test asserts the implementation, not the scenario

**Where:** `test/auth/reset-expiry.test.ts:41` · AUTH-004.S1
**Problem:** The test mocks `isExpired()` to return true, so it passes whatever the expiry window is.
**Fix:** Freeze the clock at issue time + 16 minutes and assert the form is not rendered.
```

### Coverage

**Why:** every requirement in the change gets a visible status, so nothing is silently unchecked.

**Fill rules:**
- Write one row per ADDED or MODIFIED requirement in the change.
- For `verify`, the evidence comes from `medra coverage` and the task evidence lines. For the document stages, it names the documents that satisfy the requirement.
- Use `unverified` when no evidence was found. Never use `met` without evidence.

## Writing Standards

- **Evidence, not impression.** Every finding cites a path, a line, or an ID.
- **Fix, not only fault.** Every finding states the change that resolves it.
- **Judge against the contract.** Findings are measured against the deltas, the constitution, the plan and the templates, never against your own preferred design.
- **Language.** Prose follows `docs/config-flow.yaml`. The status-block labels, verdict values and severities stay in English.

## Quality Checklist

- [ ] The Stage, Verdict, Counts, Reviewer and Date lines are present, with values from the allowed sets.
- [ ] Counts equal the number of findings at each severity.
- [ ] Every finding has Where, Problem with evidence, and Fix.
- [ ] The Coverage section has one row per ADDED or MODIFIED requirement in the change.
- [ ] No requirement is marked `met` without cited evidence.
- [ ] The verdict follows from the findings: any critical finding means `request-changes` or `fail`.
