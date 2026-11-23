# Reference: Author Edge Cases & Checklists

Read this reference on demand when an `author-*` pipeline triggers track/security classification, clarification markers, fast-track tasks, threat-model integration, archive conflicts, learnings compaction/promotion, or init bootstrap.

## 1. Propose (`author-propose.md`)

### Track Criteria (`full` if any row fires; otherwise `fast`)

| Criterion | Fires when |
|---|---|
| New capability | A delta creates a capability with no living spec |
| Breadth | More than 2 capabilities are touched |
| Data | Persistent data shape changes: migration, schema, or stored format |
| Interface | Public API, event, CLI, or file format consumed externally changes |
| Dependency | New external service or runtime dependency is introduced |
| Security | Authentication, authorization, secrets, or personal data handling changes |
| Constitution | An article's gate cannot be answered without a design decision |
| Size | More than 8 tasks are expected |
| Learnings | An active lesson scoped to touched capabilities requires a plan |

### Security Relevance Criteria (`**Security:** relevant` when any applies)

- Authentication, session handling, tokens, or credentials
- Authorization, access control, roles, or tenant isolation
- Untrusted input parsing, path/command/SQL construction, or HTML/template rendering
- Secrets, encryption, hashing, keys, or personal/sensitive data storage or logging
- Network exposure, CORS, headers, file uploads, or external dependencies/supply chain
- Gate enforcement, privilege boundaries, or audit trails

### Clarification, Revisions & Fast-Track Tasks

- **Clarification:** Scan `proposal.md` and deltas for `[NEEDS CLARIFICATION`. Return unanswerable markers (ordered by scope/behavior impact, with concrete options + recommended default) to the coordinator; never guess. Once resolved, replace markers, update scenarios, and set `## Open Questions` to `None.`.
- **Revisions:** Apply pending gate notes and `request-changes` review findings; run `medra track <change> <fast|full>` only if Track Criteria changed.
- **Fast Tasks (`fast` track):** Read `templates/tasks/guide.md`, `templates/tasks/template.md`, and `testing.mode`/`testing.command` in `docs/config-flow.yaml`. For defect fixes, write a regression-first `[TEST]` task first. Run `medra validate <change> --stage tasks --json` and fix all `tasks.*` errors.

## 2. Plan (`author-plan.md`) — Threat Model Integration

When `security` is `relevant`, integrate `threat-model.md` (produced via `security-threat-model.md`):
- Verify `Threats` and `Mitigations` rows. Never edit the security agent's threats or mitigations directly.
- Decide each mitigation: `accepted (D-NN)` (update affected plan sections + add `D-NN`) or `declined (D-NN)` (name open threats and residual-risk rationale).
- Never decline a `critical` or `high` mitigation on your own: return `needs-decision` so the user's answer becomes the Decision rationale.
- If accepting a mitigation changes observable behavior, stop and route through `/medra:propose <change>`.

## 3. Tasks (`author-tasks.md`) — Detailed Drafting & Self-Review

- For multi-scenario or edge-case `[TEST]` tasks, list every case to write before its `red` checkpoint and note in `tasks.md` that post-`red` edits require user authorization (`--allow-test-edit`).
- When `threat-model.md` exists, cite each `accepted` `M-NN` in at least one task description with a verify clause proving the control works.
- Adversarial self-review (up to 2 rounds): check for implementation before test, hidden dependencies inside `[P]`, missing paths not created earlier, or partial requirement coverage.

## 4. Archive (`author-archive.md`) — Conflicts, Compaction & Promotion

### Merge Conflict Resolution (`medra archive` exit `3`)

| Problem | Resolution |
|---|---|
| `missing-target` | Another change removed/renamed the requirement. Read current living spec block, rewrite delta against it, and stop for coordinator `verify` re-gate. |
| `added-collision` | Another change took the ID. Pick the next free ID, update delta, `tasks.md`, and test scenario citations, re-run `medra coverage`, and stop for `verify` re-gate. |
| `post-merge-invalid` | Fix the named delta block so the merged living spec validates, then stop for `verify` re-gate. |

### Learnings Compact & Constitution Promotion

- **Compact (`over_budget: true` or stale):** Merge duplicates with `medra learn merge` (into higher-occurrence entry). Retire stale entries with `medra learn retire --reason stale`, unless guarding a rare costly failure (bump with current change instead). Repeat `medra learn status --json` until `over_budget: false`.
- **Promote (`medra learn candidates --json`):** Read `templates/constitution/guide.md`. Draft gateable `MUST` + yes/no Gate candidates as proposed amendments and return to coordinator for user gating (never run `medra constitution ratify` or `medra learn promote` without approval).

## 5. Init (`author-init.md`) — Missing Inputs & Bootstrap

- Never overwrite existing `docs/` files or guess `testing.command`; return `needs-decision` for missing setup settings.
- Ask constitution principles in `needs-decision` batches of at most 4; write 3–9 codebase-grounded articles (`MUST`/`MUST NOT`, yes/no Gate, Rationale).
- For Bootstrap: confirm capability map (names, ID prefixes, one-line purposes) with the coordinator before writing `docs/specs/<cap>/spec.md`.
