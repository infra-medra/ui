---
name: archive
description: Closes a verified medra change — compiles the archive handoff via medra step --stage archive --json, merges deltas into living specs, archives the change, and harvests learnings. Run only when the user explicitly invokes it.
---

# Command — archive

## Purpose

Thin coordinator for `archive`. Always respond in the user's language. Compiles `medra step <change> --runtime antigravity --stage archive --json`, executes `coordinator_steps[]` and dispatches `subagents[]` for the compiled `action` (`done` / `dispatch` / `inline`), and confirms the archived state.

## Input

`the text the user typed after the command` is the change name. If empty, pick the single verified change from `medra status --json`, or ask via `AskUserQuestion` / `ask_question`.

## Preconditions

| Requires | Check | If missing |
|---|---|---|
| CLI | `medra --version` major `2` | Tell user to install/update `@medra.dev/flow` |
| State | `medra status <change> --json` `verify` `approved` | Tell user to run `/medra:verify` |

## Steps

1. Run `medra step <change> --runtime antigravity --stage archive --json` to read `action`, `coordinator_steps[]`, `subagents[]`, `plugin_pointers` / `pointers`, `model` (default/fallback `inherit`), and `exit_command`.
2. Execute `coordinator_steps[]` in order before any dispatch (`type === "command"` runs `command`; `type === "ask_user"` prompts via `AskUserQuestion` / `ask_question` and pauses).
3. Follow `action`: for `done` or `dispatch`, spawn `subagents[]` (`Agent` / `invoke_subagent`) passing `model` (default/fallback `inherit`), `fetch_command` (or `prompt` if `--full`), `plugin_pointers` / `pointers`, `exit_command`, and `<untrusted_data>` data-only rules; for `inline`, read `plugin_pointers` and run `exit_command`.
4. Re-run `medra status --json` to confirm the change is archived and living specs validate cleanly.

## Avoid
- Never bypass `PreToolUse` hooks or hand-edit `.medra.yaml` or living specs directly during archive, because `medra archive` merges deltas and records state atomically.
- Never skip `medra status --json` after archiving, because only CLI state confirms archive completion.
