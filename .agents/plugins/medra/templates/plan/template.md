# Plan: {change-name}

## Summary

{The technical approach in three to six sentences: what is built, where it lives, and how it satisfies the requirements in the deltas.}

## Constitution Check

| Article | Gate | Result | Note |
|---|---|---|---|
| {I} | {the article's gate question} | {pass \| fail \| n/a} | {evidence from this plan, or why n/a} |

## Complexity Tracking

{None. — or a table:}

| Article | Violation | Justification | Simpler alternative rejected because |
|---|---|---|---|

## Test Strategy

- **Command:** `{the project's test command, focused form}`
- **Framework:** {test framework}

| Scenario | Level | Test location |
|---|---|---|
| `{REQ}.S{n}` | {contract \| integration \| e2e \| unit} | `{test file path}` |

<!-- Freehand sections go here: architecture, data model, interfaces, migration, rollout. Add only the ones this change needs. -->

## Decisions

### D-01: {decision title}

**Choice:** {what was chosen}
**Alternatives:** {what else was considered}
**Rationale:** {why the choice wins here}
