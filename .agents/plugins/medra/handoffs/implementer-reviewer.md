
# Handoff: Implementer ↔ Reviewer

## Purpose

This handoff gets the implementer an independent verdict on a finished change before the verify gate. A reviewer whose context holds none of the implementation's reasoning checks the code against the deltas, the plan, the tasks and the constitution. The implementer dispatches it from the verify pipeline once every task is done. The reviewer writes a verification report and returns its verdict and counts.

## Participants

| Role | Agent | Responsibility |
|---|---|---|
| Sender | `implementer` (the `/medra:verify` command) | Confirms the change is ready, dispatches with pointers only, parses the response, and presents the report at the verify gate |
| Receiver | `reviewer` (`.agents/plugins/medra/pipelines/reviewer-check.md`) | Loads the context pack, checks the implementation and the cross-document consistency, writes the report at `report_path`, and returns the verdict |

## Dispatch

On Claude Code, the sender passes this payload to the Agent tool, with `subagent_type: medra-reviewer`, after the line `Contract: `.agents/plugins/medra/handoffs/implementer-reviewer.md``. On Antigravity, it passes the same text to `invoke_subagent` for that agent. On a runtime without subagents, the sender runs the receiver's pipeline itself, using this payload as its input (see `.agents/plugins/medra/references/portability.md`).

`medra handoff <change> check` prints this payload, with every field below filled from the change's state. The sender adds nothing to it except `--fixed <F-NN,…>` on later rounds.

| Field | Type | Required | Source |
|---|---|---|---|
| change | string | yes | The change name, from `medra status` |
| change_path | path | yes | `docs/changes/<change>` |
| diff_base | string | yes | The `diff_base` value from `.medra.yaml` (a git ref, or `none`) |
| report_path | path | yes | `docs/changes/<change>/reviews/<YYYY-MM-DD>-verify-agent-r<round>.md`, using today's date and this dispatch's `round`. Each round gets its own file, so no round overwrites another |
| round | integer | yes | `1` for the first check. Increment it on every re-check, including a re-check after a Request changes at the verify gate |
| previous_report | path | no | Required on rounds after the first: the `report_path` of round `round - 1`, which may carry an earlier date |
| fixed_findings | list | no | On rounds after the first: the finding IDs from `previous_report` that the implementer claims are fixed (`--fixed`) |
| suite | string | no | `green` when the project configures a test command: `medra suite` passed on the code as it is at dispatch. Absent otherwise |
| changed_since_previous | list | no | On rounds after the first: the files outside `docs/` whose content differs from what the receiver's previous round saw. Absent when the CLI holds no snapshot of that round, or `diff_base` is `none`; the receiver then inspects everything |

```yaml
change: add-password-reset
change_path: docs/changes/add-password-reset
diff_base: 3f2a9c1
report_path: docs/changes/add-password-reset/reviews/2026-10-31-verify-agent-r1.md
round: 1
```

A later round points at the report it follows up on:

```yaml
change: add-password-reset
change_path: docs/changes/add-password-reset
diff_base: 3f2a9c1
report_path: docs/changes/add-password-reset/reviews/2026-10-31-verify-agent-r2.md
round: 2
previous_report: docs/changes/add-password-reset/reviews/2026-10-31-verify-agent-r1.md
fixed_findings: [F-01, F-03]
changed_since_previous: [src/auth/reset.js, test/auth/reset.test.js]
```

The code, the deltas and the task list never appear in the payload. The receiver reads them from disk through `medra context` and git.

## Response

The receiver's final message ends with this block:

| Field | Type | Description |
|---|---|---|
| status | enum | `done`, `invalid-dispatch` or `needs-decision` |
| verdict | enum | `pass`, `pass-with-findings` or `fail`. Present when `status: done` |
| report_path | path | The report written. It equals the dispatched `report_path` |
| counts | map | `critical`, `major` and `minor` finding counts |
| unverified | integer | The number of requirements whose Coverage status is `unverified` |
| question | string | Present only with `needs-decision`: the decision needed, with the options |

```yaml
status: done
verdict: fail
report_path: docs/changes/add-password-reset/reviews/2026-10-31-verify-agent-r1.md
counts: { critical: 1, major: 2, minor: 1 }
unverified: 0
```

## Validation

**`medra handoff <change> check` checks before printing the payload,** and exits `1` naming what failed:
- Every task is done, and the `tasks` stage validates.
- When a test command is configured, `medra suite` passed on the current code (`verify.suite`), and the deltas still merge into the living specs (`verify.merge`).
- Every `--fixed` ID is a finding of `previous_report`.
- `report_path` is a new file in `reviews/`, one round above the highest round on disk.

**The receiver checks on receipt:**
- `change_path` exists and contains `.medra.yaml`.
- `diff_base` is `none` or resolves with `git rev-parse`.
- `report_path` ends in `-r<round>.md`.
- On rounds after the first, `previous_report` exists, ends in `-r<round - 1>.md`, and every ID in `fixed_findings` is a finding in it.

**The sender checks the response:**
- The file at `report_path` exists, and its `**Verdict:**` and `**Counts:**` lines equal `verdict` and `counts`.
- `verdict: pass` comes with `counts.critical == 0`, `counts.major == 0` and `unverified == 0`.
- `verdict: fail` comes with `counts.critical > 0` or `unverified > 0`.

## Error Handling

| Failure point | Action |
|---|---|
| `medra handoff` exits `1` | Do not dispatch. Return to apply for the unfinished tasks, or fix the task-list findings first |
| The receiver gets an invalid dispatch | Write no report. Return `status: invalid-dispatch`, naming each failing field |
| The receiver hits a decision it cannot make (for example, a requirement that is ambiguous in the spec) | Finish everything else, mark the affected requirement `unverified` in the report, and return `status: needs-decision` with the question. The sender puts the question to the user |
| The work fails partway (a CLI exit `2` or `4`) | Return `status: needs-decision`, with the command, its exit code and stderr as the question |
| The sender gets an invalid response | Re-dispatch once with the same payload; the receiver rewrites that same round's report, never an earlier one. If the second response is also invalid, read the report file directly when it exists and present it to the user, noting that the response failed validation |
