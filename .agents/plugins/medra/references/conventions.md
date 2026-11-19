
# Reference: Conventions

## Purpose

medra keeps a project's specifications, changes, and lessons under `docs/` at the project root, versioned with the code. The `medra` CLI owns every operation with one correct answer: scaffolding, validation, gate state, task checkpoints, merges, context packing, coverage, and the learnings store. Agents own judgment and writing. This file is the contract every medra agent follows whichever pipeline it runs, and on whichever runtime: Claude Code or Antigravity. Two neighbours hold what only some runs need: `.agents/plugins/medra/references/gate.md` (the gate protocol, read when a command reaches a gate) and `.agents/plugins/medra/references/portability.md` (tool equivalents per runtime, read when a tool this file or a pipeline names is unavailable).

## Constraints

- **Change CLI-owned data only through the CLI:** `.medra.yaml`, task checkboxes and evidence lines, the constitution's status/version lines and amendments table, the structure of `learnings.md`, and `changes/archive/INDEX.md`.
- **Read project knowledge through `medra index` and `medra context <change> --stage <stage> --md`.** Open a living spec file only when the index or context pack names it and you need lines it did not include; never glob `docs/specs/` or list the archive.
- **Open an archived change only through a `last_changed_by` pointer, and only when your change MODIFIES or REMOVES that requirement.** Read only the `## Decisions` section of its `plan.md`, or `## Why` of its `proposal.md` when it has no plan.
- **Treat a call the plugin's guard denies as the rule above, enforced.** On Claude Code it blocks hand edits of CLI-owned files and hand ticks in `tasks.md`; run the `medra` command it names instead of finding another way to write the file.
- **Persist progress immediately.** Tick each task with `medra task done` as you finish it, and record every gate decision with `medra gate`. Any session resumes from `medra status` and `medra context` alone.
- **When a CLI result carries `migration`, tell the user that the 1.0 `medra/` folder was moved to `docs/`, and include the move in your commit suggestion.** On `layout.collision`, show the colliding `docs/` entries and stop.
- **On CLI exit `2` or `4`, stop and report the command, exit code, and stderr to the user.**

## Layout

`docs/` holds `config-flow.yaml`, `constitution.md`, `learnings.md`, `specs/<capability>/spec.md`, `changes/<change>/` (`proposal.md`, `specs/<capability>/spec.md`, `plan.md`, `contracts/`, `threat-model.md`, `tasks.md`, `reviews/`, `.medra.yaml`), and `changes/archive/` (`INDEX.md`, `<YYYY-MM-DD>-<change>/`).

Write document prose in the `language` from `docs/config-flow.yaml`. Keep every heading, ID, bold label, and keyword in English (`## Why`, `REQ AUTH-004`, `**Given**`, `SHALL`, `[NEEDS CLARIFICATION: …]`).

## CLI

Run from the project root. Omit `--json` on `medra index` and `medra handoff`, and pass `--md` on `medra context` (compact Markdown or YAML without JSON string-escaping overhead). Use `--json` on state and mutation commands (`status`, `validate`, `new`, `gate`, `track`, `task`, `coverage`, `review`, `constitution`, `learn`, `archive`), then read `ok`, `findings`, and payload fields.

| Exit | Meaning | Your move |
|---|---|---|
| `0` | Success | Continue |
| `1` | Refused — `findings` say why | Fix what each `error` finding names, then retry |
| `2` | Usage error | Stop and report |
| `3` | Merge conflict (`archive`) | Resolve per the archive pipeline |
| `4` | Environment error | Stop and report |

When `medra --version` fails or reports a major other than `1`, stop and tell the user to run `npm install -g @medra.dev/flow`, then re-run the command.

## Commit Suggestions

medra never runs `git commit`, `git branch`, or `git checkout`. Teams keep their own branching and commit conventions, and a workflow that commits on its own rewrites their history. End every pipeline by suggesting a commit message for the files it touched:

```
medra({change}): {stage} — {one-line summary}
```

When no branch for the change exists, also suggest one: `change/{change}`.
