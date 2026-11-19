
# Template: Learnings

## Purpose

The learnings store makes each archived change improve the next one. Lessons capture what the project taught: pitfalls, recurring review findings, constraints of the code. Preferences capture how the user and the team want work done. The author harvests entries at archive and decides what to add, bump, merge, retire or promote. Every agent receives only the matching entries, through `medra context`. The store is bounded so that it keeps paying for its tokens.

## Placement

| Item | Value |
|---|---|
| Path | `docs/learnings.md`, one per project |
| Lifecycle per entry | active → promoted (to a constitution article), or retired (stale, merged into another `L-NNN`, or wrong) |
| Writer | `medra learn` only. The author supplies titles, statements and scopes as arguments |

## Structure

Fixed. `medra init` creates the file from `.agents/plugins/medra/templates/learnings/template.md`, and the CLI maintains its structure. Agents never edit the file directly.

## Sections

### Learnings

The title.

### Active

**Why:** these are the entries `medra context` filters into every agent's pack.

**Fill rules (as `medra learn add` arguments):**
- **Title:** under 80 characters, stating the rule rather than the incident.
- **Statement:** 1–2 imperative sentences that an agent can follow without knowing the original change.
- **Scope:** the narrowest set of capabilities, paths and stages where the entry changes behavior. A missing scope matches everything, so use it only for true project-wide preferences.

**Example:**

```
medra learn add --type lesson --change add-password-reset \
  --title "Freeze the clock in expiry tests" \
  --statement "Test time-based expiry by freezing the clock at the boundary ±1 minute; never mock the expiry check itself." \
  --capabilities auth --stages tasks,apply,verify
```

### Promoted

**Why:** this records which lessons became constitution articles, so they are not harvested again.

**Fill rules:** written by `medra learn promote` after the amendment gate approves.

### Retired

**Why:** this keeps retired IDs reserved and explains why each entry left the active set.

**Fill rules:** written by `medra learn retire` or `medra learn merge`.

## Writing Standards

**Harvest sources.** At archive, only these count as evidence: critical or major findings in this change's review and verify reports, `gate_notes` in `.medra.yaml`, resolved `blockers`, and `track_history`. An impression with no artifact behind it is not a learning.

**Add, bump or skip.**
- Bump when an active entry already states the same rule.
- Add when the rule is new and would change what an agent does next time.
- Skip anything that applies only to this change, or that a living spec or the constitution already states.

**Lesson or preference.**
- A **lesson** is about the project or its code ("the payments sandbox rejects amounts under 1.00").
- A **preference** is about how the team wants the work done ("keep proposals under 40 lines", "name tasks with the module first"). Gate change-request notes are the main source of preferences.

**Compaction.**
- When `medra learn status` reports the store over budget or holding stale entries, merge entries that state the same rule into the one with more occurrences.
- Retire stale entries unless they guard a rare but costly failure. In that case bump them, with the current change as evidence.

**Promotion.**
- A lesson listed by `medra learn candidates` becomes a proposed constitution article only when it is checkable as a plan gate.
- When it is not checkable that way, leave it active, because the constitution holds only gateable principles.

**Language.** Titles and statements follow `docs/config-flow.yaml`. Types, scope keys and IDs stay in English.

## Quality Checklist

- [ ] Every added entry traces to one of the harvest sources for this change.
- [ ] Every statement is imperative, stands alone, and is at most 2 sentences.
- [ ] Every scope is the narrowest that changes behavior, and only project-wide preferences are unscoped.
- [ ] No two active entries state the same rule.
- [ ] After compaction, `medra learn status` reports `over_budget: false`.
- [ ] `medra validate --project learnings` exits `0`.
