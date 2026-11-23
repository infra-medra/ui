# Tasks: {change-name}

> {In `tdd` mode:} A `[TEST]` task locks its test files when it is checkpointed red. Write every case of its scenarios before that checkpoint; editing a locked file afterwards needs the user's explicit authorization (`medra task done … --allow-test-edit --reason`).

## Phase 1: {Setup | first slice name}

- [ ] T001 {[P]} {Imperative action} in `{path}` — verify: {command or observable result}

## Phase 2: {REQ-ID} {requirement title}

- [ ] T002 [TEST] [{REQ-ID}] Write tests for {REQ-ID}.S1, {REQ-ID}.S2 in `{test path}` — verify: tests fail (red)
- [ ] T003 [{REQ-ID}] after T002 {Imperative action} in `{path}` — verify: T002 tests pass (green)
