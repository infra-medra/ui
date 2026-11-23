
# Reference: Runtime Portability

medra runs from the same instructions on Claude Code and on Antigravity, where it is installed as the plugin `medra`. Where the runtimes differ, these rules apply:

| Need | Claude Code | Antigravity | Any runtime without the tool |
|---|---|---|---|
| Invocable command | `/medra:<command>` slash command | `/medra:<command>` slash command | Read `.agents/plugins/medra/skills/<name>/SKILL.md` |
| Read templates, handoffs, pipelines | Read `.agents/plugins/medra/...` | `read_file` on `.agents/plugins/medra/...` (workspace install) or `plugins/medra/...` (source repo) | Read file directly |
| Ask a structured question | `AskUserQuestion`, at most 4 questions per call | `ask_question` | Numbered options in chat; wait for an explicit reply |
| Delegate to another agent | `Agent` tool, under the handoff contract the pipeline names | `invoke_subagent` with the agent the handoff names, under the same contract | Run the receiver's pipeline yourself, in a separate section headed with the receiver's name. Apply its constraints for the duration, then return to your own role with only its response fields. When a pipeline dispatches two receivers in parallel, run them one after the other |
| Command arguments | Given to the command skill | The text the user typed after the command | Same as Antigravity |

## `plugin_pointers` Resolution

`medra step --json` separates project-relative `pointers` (change documents, specs, source files) from plugin-relative `plugin_pointers` (pipelines, templates, references):

- **Claude Code:** Resolve `plugin_pointers` under `.agents/plugins/medra/...`.
- **Antigravity:** Resolve `plugin_pointers` under `.agents/plugins/medra/...` when the plugin is installed locally in the workspace (`medra install --target antigravity`), or `plugins/medra/...` when working inside the medra source repository.
- **Project `pointers`:** Always resolve relative to the project root, independent of `plugin_pointers`.

## Subagent Gate Protection

- **Claude Code:** `PreToolUse` hooks (`hooks/guard.mjs`) enforce gate, fix-round, and CLI-owned file protection automatically by denying `medra gate ... --approve`, `medra gate ... --request-changes`, and `medra verify-fix` when `agent_id` is present, `process.env.MEDRA_SUBAGENT === '1'`, or a Bash command prefixes `medra` with `MEDRA_SUBAGENT=1`, and denying hand edits to `.medra.yaml`, `tasks.md` checkboxes/evidence lines, and `docs/changes/archive/`.
- **Antigravity:** Antigravity lacks native `PreToolUse` hooks, so `medra step` prefixes non-`inline` subagent `fetch_command` and `exit_command` strings with `MEDRA_SUBAGENT=1` and instructs subagents in compiled `--md` / `--full` prompts to run every `medra` command with `MEDRA_SUBAGENT=1` (while leaving `coordinator_steps[]` and `inline` `exit_command` unprefixed). Inside the CLI, `medra verify-fix` and `medra gate ... --approve|--request-changes` refuse execution (`subagent.forbidden`, exit `1`) whenever `MEDRA_SUBAGENT=1` is set. `MEDRA_SUBAGENT=1` applies only to the `medra` command invoked by the subagent; the CLI strips it from the environment of child test and check commands it executes (`medra task done --run`, `testing.checks`, and `medra suite`). Because Antigravity has no runtime hook intercepting shell commands or file writes, `MEDRA_SUBAGENT=1` is an envelope-imposed convention rather than a hard runtime boundary: a subagent can omit the `MEDRA_SUBAGENT=1` prefix or manually edit `.medra.yaml` or `tasks.md`, leaving CLI SHA-256 test-file hashes and gate/state re-validation as the remaining safeguards.

## Subagent Model Selection

- **`inline` stages:** Stages compiled with `action: "inline"` (`propose`, `plan`, `tasks`, and small `fast`-track `apply`) execute in the main session model, ignoring `models.<stage>` and `models.author` overrides.
- **`dispatch` subagents:** `docs/config-flow.yaml` supports flat `models:` keys and per-runtime `models.claude` / `models.antigravity` mappings. `medra step` selects `runtime` via `--runtime <claude|antigravity>`, `MEDRA_RUNTIME`, runtime environment detection (`CLAUDECODE` / `CLAUDE_CODE_ENTRYPOINT` vs `ANTIGRAVITY_AGENT` / `GEMINI_CLI`), or single-integration fallback, and resolves each subagent's `model` in order `models[runtime][role] -> models[runtime][stage] -> models[runtime].default -> models[role] -> models[stage] -> models.default -> inherit`.
- **Claude Code:** Pass `subagent.model.tier` to `Agent` when it is not `inherit`, falling back to `inherit` if the tier is unavailable.
- **Antigravity:** A subagent model tier applies only if `invoke_subagent` supports model selection; otherwise, inherit the conversation/session model.
