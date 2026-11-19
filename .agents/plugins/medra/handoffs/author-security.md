
# Handoff: Author ↔ Security

## Purpose

This handoff gets the author an independent threat model of a security-relevant full-track change while the design can still change cheaply. The author dispatches it from the plan pipeline once `plan.md` is drafted. The security agent reads the proposal, the deltas, the draft plan and the code, writes `threat-model.md` with every mitigation `pending`, and returns its counts. The author then decides each mitigation.

## Participants

| Role | Agent | Responsibility |
|---|---|---|
| Sender | `author` (the `/medra:plan` command) | Confirms the change is security-relevant and the plan drafted, dispatches with pointers only, parses the response, then decides each mitigation in the plan |
| Receiver | `security` (`.agents/plugins/medra/pipelines/security-threat-model.md`) | Validates the dispatch, models the design against its stack's authoritative sources, writes `threat-model_path`, and returns the counts. Writes no other file |

## Dispatch

On Claude Code, the sender passes this payload to the Agent tool, with `subagent_type: medra-security`, after the line `Contract: `.agents/plugins/medra/handoffs/author-security.md``. On Antigravity, it passes the same text to `invoke_subagent` for that agent. On a runtime without subagents, the sender runs the receiver's pipeline itself, using this payload as its input (see `.agents/plugins/medra/references/portability.md`).

`medra handoff <change> threat-model --focus "<text>"` prints this payload, with every field below filled from the change's state.

| Field | Type | Required | Source |
|---|---|---|---|
| change | string | yes | The change name, from `medra status` |
| change_path | path | yes | `docs/changes/<change>` |
| plan_path | path | yes | `docs/changes/<change>/plan.md`, the drafted plan |
| threat_model_path | path | yes | `docs/changes/<change>/threat-model.md` |
| focus | string | no | Areas the author wants examined closely, in one or two sentences, from the plan's design choices (`--focus`) |
| revision | boolean | no | `true` whenever a threat model already exists at `threat_model_path`, as on a re-dispatch after the plan gate requested changes to the design; the receiver then updates it, keeping its IDs |

```yaml
change: add-password-reset
change_path: docs/changes/add-password-reset
plan_path: docs/changes/add-password-reset/plan.md
threat_model_path: docs/changes/add-password-reset/threat-model.md
focus: Token generation and storage (D-02), and the anonymous reset endpoint's rate limiting.
```

The proposal, the deltas, the plan and the code never appear in the payload. The receiver reads them from disk through `medra context` and the paths.

## Response

The receiver's final message ends with this block:

| Field | Type | Description |
|---|---|---|
| status | enum | `done`, `invalid-dispatch` or `needs-decision` |
| threat_model_path | path | The file written. It equals the dispatched `threat_model_path` |
| counts | map | Threats by severity: `critical`, `high`, `medium`, `low`, `info` |
| mitigations | integer | The number of mitigations proposed, all `pending` |
| unverified_sources | integer | The number of sources marked `unreachable` |
| question | string | Present only with `needs-decision`: the decision needed, with the options |

```yaml
status: done
threat_model_path: docs/changes/add-password-reset/threat-model.md
counts: { critical: 0, high: 1, medium: 2, low: 1, info: 0 }
mitigations: 4
unverified_sources: 0
```

## Validation

**`medra handoff <change> threat-model` checks before printing the payload,** and exits `1` naming what failed:
- The change is on the full track, and the proposal says `**Security:** relevant`.
- `plan_path` exists, and the `proposal` stage validates.

**The receiver checks on receipt:**
- `change_path` exists and contains `.medra.yaml`, and `plan_path` exists inside it.
- `threat_model_path` is `<change_path>/threat-model.md`.
- When `revision` is not `true`, no file exists at `threat_model_path`; when it is `true`, one does.

**The sender checks the response:**
- The file at `threat_model_path` exists and has the nine headings of `.agents/plugins/medra/templates/threat-model/guide.md`.
- The Threats rows by severity equal `counts`, and the Mitigations rows equal `mitigations`, every one `pending` (or, on a revision, unchanged for those the author already decided).

## Error Handling

| Failure | Action |
|---|---|
| `medra handoff` exits `1` | Do not dispatch. A change that is not `relevant` gets no threat model; a fast-track change gets none either, and its security work happens at verify |
| The receiver gets an invalid dispatch | Write nothing. Return `status: invalid-dispatch`, naming each failing field |
| The receiver hits a decision it cannot make (for example, the deployment exposure is not stated anywhere) | Finish the model on the stated assumption, record the assumption in Scope, and return `status: needs-decision` with the question. The sender puts it to the user and re-dispatches with `revision: true` when the answer changes the model |
| A source cannot be reached | Not a failure. The receiver marks it `unreachable` in Sources and counts it in `unverified_sources`; the sender presents that count at the plan gate |
| The work fails partway (a CLI exit `2` or `4`) | Return `status: needs-decision`, with the command, its exit code and stderr as the question |
| The sender gets an invalid response | Re-dispatch once with the same payload and `revision: true`. If the second response is also invalid, read the file directly when it exists and present it at the gate, noting that the response failed validation |
