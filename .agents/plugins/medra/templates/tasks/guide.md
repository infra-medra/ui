
# Template: Tasks

## Purpose

The task list turns approved deltas (and, on the full track, the plan) into small, ordered steps the implementer executes one at a time, in any session. The author fills it. The implementer reads one task at a time through `medra context --stage apply`, and the reviewer checks that every requirement was delivered. `medra validate` enforces coverage and test-first ordering on it, and `medra task done` ticks it with evidence. A line the CLI cannot parse is a task nobody can complete.

## Placement

| Item | Value |
|---|---|
| Path | `docs/changes/<change>/tasks.md` |
| Lifecycle | draft → approved (the tasks gate, or the proposal gate on the fast track) → in progress → done |
| CLI-owned | `[x]` ticks and the nested `evidence` lines |

## Structure

Fixed. Copy `.agents/plugins/medra/templates/tasks/template.md` to the placement path, then replace the example phases with this change's phases.

## Sections

### Tasks: change-name

The title, using the exact change name.

### Phase sections

**Why:** phases group tasks into slices the implementer and reviewers can reason about. On the full track, the plan's structure decides them.

**Fill rules:**
- Begin with a Setup phase only when shared groundwork exists (a migration, configuration, a dependency).
- After that, write one phase per requirement or tightly coupled requirement group, titled `{REQ-ID} {requirement title}`.
- A fast-track bugfix has one phase whose first task is the reproducing `[TEST]`.

### Task lines

**Why:** each line is the unit of work, of checkpointing and of traceability.

**Fill rules:**
- Follow the grammar exactly: `- [ ] T<NNN> [P]? [TEST]? [REQ-IDs]? (after T<NNN>, …)? <action> in \`<path>\` — verify: <how>`.
- Number tasks from T001 in order. Never renumber; append new tasks with the next free number.
- Mark `[P]` only on a task with no dependency inside its phase.
- Size each task to one focused session of work touching one area of code.
- In `tdd` mode:
  - Every ADDED or MODIFIED requirement gets a `[TEST]` task that names its scenario IDs and verifies "tests fail (red)".
  - Every implementation task for that requirement declares `after` its test task and verifies "… pass (green)".
  - When a `[TEST]` task's coverage can grow (several scenarios, boundary or error cases, a table of inputs), word it so that it lists every case to write before the red checkpoint, and keep the template's note under the title that editing a locked test file afterwards needs the user's authorization. **Why:** the CLI locks the file at red, and a case added later stops the next implementation task until the user decides.
- In `test-after` mode, test tasks are still required per requirement, but need no ordering. Drop the template's note on locked test files.
- In `none` mode, every verify clause is a manual check that someone can actually perform.

**Example:**

```markdown
## Phase 2: AUTH-004 Reset link expiry

- [ ] T004 [TEST] [AUTH-004] Write tests for AUTH-004.S1, AUTH-004.S2 in `test/auth/reset-expiry.test.ts` — verify: tests fail (red)
- [ ] T005 [AUTH-004] after T004 Enforce the 15-minute expiry in `src/auth/reset.ts` — verify: T004 tests pass (green)
- [ ] T006 [P] [TEST] [AUTH-006] Write the test for AUTH-006.S1 in `test/web/reset-expired.test.tsx` — verify: test fails (red)
- [ ] T007 [AUTH-006] after T006 Add the "send a new link" action to `src/web/reset/Expired.tsx` — verify: T006 test passes (green)
```

## Writing Standards

- **Traceable.** Every ADDED or MODIFIED requirement is referenced by at least one task, and every task that delivers behavior names its requirement IDs. When the change has a `threat-model.md`, every `accepted` mitigation is cited by its `M-NN` in the description of at least one task, for example `` - [ ] T007 [AUTH-004] after T006 Store only the SHA-256 of reset tokens (M-02) in `src/auth/reset.ts` — verify: T006 tests pass (green) ``.
- **Grounded.** Every path is one that exists, or one the plan creates.
- **Inside the fence.** Write no task that delivers behavior outside the approved deltas.
- **Never tick by hand.** Leave every box `[ ]`. Only `medra task done` ticks a task, and it writes the evidence line at the same time.
- **Language.** Descriptions follow `docs/config-flow.yaml`. Task IDs, `[P]`, `[TEST]`, requirement IDs, `after`, `— verify:` and phase-title IDs stay in English.

## Quality Checklist

`medra validate` enforces this document's structure, IDs and cross-references. This list holds only what it cannot judge.

- [ ] Task IDs are sequential.
- [ ] Every task has a concrete verify clause.
- [ ] Every path exists in the codebase or is created by an earlier task or the plan.
- [ ] No box is ticked and no evidence line was written by hand.
- [ ] `medra validate <change> --stage tasks` exits `0`.
