
# Template: Constitution

## Purpose

The constitution holds the few principles this project will not trade away: test discipline, architectural boundaries, simplicity limits, security floors. The author fills it during init from an interview with the user, and amends it at archive when a lesson has recurred often enough to be promoted. Each plan's Constitution Check answers every article's gate question, and the reviewer judges plans against it. The decision it enables is a pass or fail on each article for each plan, so every article must be checkable.

## Placement

| Item | Value |
|---|---|
| Path | `docs/constitution.md`, one per project |
| Lifecycle | `draft` → `ratified`. Each amendment bumps `vMAJOR.MINOR` |
| Owned by the CLI | the `Status` line, plus the `Version`, `Ratified` and `Last amended` lines and the Amendments rows, all written by `medra constitution ratify` |

## Structure

Fixed. Copy `.agents/plugins/medra/templates/constitution/template.md` to `docs/constitution.md` when the file holds only `**Status:** draft`, then fill it section by section.

## Sections

### Constitution

The title and status block. The author writes the title; the CLI writes every status line at ratification.

### Articles

**Why:** every plan is gated against these articles, and the reviewer cites them in findings.

**Fill rules:**
- Write 3 to 9 articles. More than 9 means preferences are being dressed up as principles, and every one costs a row in every plan.
- Number articles with Roman numerals in order and never reuse a number. To retire an article, replace its `**Gate:**` line with `**Retired:** v{version}` through an amendment.
- State each principle with MUST or MUST NOT, about something a plan can show.
- Write the Gate as a yes/no question where "yes" means the plan complies.
- Give each article a Rationale naming the failure it prevents in this project.

**Example:**

```markdown
### Article III: Test-first

Every behavior change MUST be covered by a test that is written and seen failing before the implementation.

**Gate:** Does every scenario in this change map to a test task ordered before its implementation task?
**Rationale:** Tests written after the code assert what the code does rather than what the spec requires.
```

### Amendments

**Why:** reviewers and future authors see when each principle entered the constitution, and which lesson caused it.

**Fill rules:** leave the table body empty. `medra constitution ratify` appends every row.

## Writing Standards

- **Checkable.** Write principles as observable properties of a plan or of code ("MUST expose every capability through the CLI"). "MUST be clean" and "SHOULD be fast" cannot be failed, so they make a gate that always passes.
- **Project-specific.** An article earns its place by preventing a failure this project has had, or is at real risk of having.
- **Language.** Prose follows `language` in `docs/config-flow.yaml`. The headings, `Article`, `**Gate:**`, `**Rationale:**`, `MUST` and `MUST NOT` stay in English.

## Quality Checklist

`medra validate` enforces this document's structure, IDs and cross-references. This list holds only what it cannot judge.

- [ ] There are 3 to 9 live articles.
- [ ] Every Gate is phrased as a yes/no question.
- [ ] Every principle uses MUST or MUST NOT and names something a plan or code can show.
- [ ] Every article has a Rationale tied to this project.
- [ ] No two articles overlap, so a plan could not pass one and fail the other for the same reason.
- [ ] `medra validate --project constitution` exits `0`.
