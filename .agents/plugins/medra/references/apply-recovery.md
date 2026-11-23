# Reference: Apply Recovery & Edge Cases

Read this reference on demand when `implementer-apply.md` encounters `task.test-tampered`, scope growth, `blocked` tasks, `legacy_fallback` / mode `none` checkpoints, or `[P]` batching edge cases.

## 1. `task.test-tampered` Recovery (Escalation)

`medra task done` hashes test files at `red` and refuses `green` if modified. Never weaken, skip, or delete a test, and never edit a test file already checkpointed `red` (even additively).

1. **Stop immediately:** Do not retry `medra task done`, do not edit the test file again, and do not start remaining tasks in a `batch`.
2. **Escalate (`needs-decision`):** Report the CLI finding's `classification` (`additive`, `weakening`, or `other`) and diff summary (lines/test names added or removed) to the coordinator with two explicit options:
   - Authorize `--allow-test-edit` (user must provide an explicit reason).
   - Revert the extra test lines back to the `red` snapshot.
3. **Never infer consent:** Even `additive` requires the user's explicit authorization via the coordinator. Only run `medra task done <change> <T> --run "<cmd>" --allow-test-edit --reason "<user's exact reason>"` after authorization is relayed.

## 2. Scope Growth Escalation

When a task requires work outside approved delta specs or `plan.md` (new capability, data/interface change, new dependency, security change, or >8 tasks):
- Do **not** implement unapproved behavior ahead of a decision.
- Run `medra task block <change> <T> --note "<scope gap>"` if leaving apply, and return `needs-decision` with options: narrower implementation inside scope, switch to full track (`/medra:plan`), or revise behavior (`/medra:propose`).

## 3. Blocked Tasks, Mode `none`, and `legacy_fallback`

- **`blocked` (missing access, unclear spec, external failure):** Run `medra task block <change> <T> --note "<cause>"`. In `batch` mode, stop immediately and return `needs-decision` without starting remaining batch tasks; otherwise continue with the next ready task.
- **Mode `none` or non-requirement/non-mitigation tasks (setup, docs):** Run the verify check and record `--evidence "<what was checked and observed>" --kind manual`. Tasks tied to a `REQ` or `M-NN` accept only `--run` (`task.evidence` refuses written `red`/`green` text).
- **`legacy_fallback` (1.x `tasks.md` without `REQ`/path pointers):** Dispatch/execute one task at a time (`granularity: "task"`), inspecting the full requirements slice in the compiled prompt.

## 4. `[P]` Batching

- **Same-session `[P]`:** When `medra context` (`## Parallel batch`) or `medra task done` lists multiple `[P]` tasks from the same phase and kind (`[TEST]` or implementation), edit their files in parallel tool calls, then checkpoint each task individually with `medra task done`.
