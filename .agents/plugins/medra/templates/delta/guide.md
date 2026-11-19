
# Template: Delta Spec

## Purpose

A delta states how one change alters one capability's behavior. It is the reviewable diff of behavior that teams approve at the proposal gate. The author fills one delta per touched capability during propose. The author then plans and decomposes tasks from it, the reviewer checks the implementation against it, and `medra archive` merges it into the living spec mechanically. Because a parser merges it, its shape is a contract: a block the parser cannot read blocks the archive.

## Placement

| Item | Value |
|---|---|
| Path | `docs/changes/<change>/specs/<capability>/spec.md`. The capability folder name matches the living spec, or a new kebab-case name for a new capability |
| Lifecycle | draft → approved (proposal gate) → merged (archive) |
| Count | One file per capability in the proposal's Capabilities table |

## Structure

Fixed, with one exception: an operation section with no entries is omitted rather than left empty. Copy `.agents/plugins/medra/templates/delta/template.md` to the placement path, delete the operation sections and new-capability lines that do not apply, then fill in what remains.

## Sections

### Delta: capability title

**Why:** this tells the parser and the reviewer which capability the operations target.

**Fill rules:** use the living spec's title and capability name. For a new capability, also write the `**ID prefix:**` line (and optionally `**Paths:**` with comma-separated code globs). Add `**Retire capability:** yes` only when REMOVED removes every requirement and the capability should disappear.

### Purpose

**Why:** for a new capability, it seeds the living spec's Purpose.

**Fill rules:** write it only for a new capability, following the living-spec Purpose rules: 1–3 sentences, with a first sentence that stands alone.

### ADDED Requirements

**Why:** new behavior. Each block is appended to the living spec in ID order.

**Fill rules:**
- Start from the capability's `next_id` in `medra index` (it already skips retired IDs) and number further ADDED requirements upward from it.
- Write the full requirement block, with its statement and scenarios, exactly as in a living spec.

### MODIFIED Requirements

**Why:** changed behavior. The block replaces the living requirement whole.

**Fill rules:**
- Repeat the entire requirement: statement plus every scenario that remains. A living scenario left out is deleted, and its ID is retired.
- Keep the IDs of existing scenarios, and give new scenarios the next free `S<n>`.
- To rename a requirement, keep its ID and change its title.

**Example:**

```markdown
### REQ AUTH-004: Reset link expiry

The system SHALL reject a password reset link used more than 15 minutes after it was issued.

#### Scenario AUTH-004.S1: Expired link

- **Given** a reset link issued 16 minutes ago
- **When** the user opens the link
- **Then** the reset form is not shown
- **And** the user is offered a new link
```

### REMOVED Requirements

**Why:** behavior that goes away, with what replaces it.

**Fill rules:** write the heading with the existing ID and title, then a `**Reason:**` line and a `**Migration:**` line. Leave out the statement and the scenarios.

## Writing Standards

- **Grounded in the living spec.** Write MODIFIED and REMOVED only against IDs that the context pack shows in the living spec. A guessed ID is a merge conflict at archive.
- **Markers instead of guesses.** Where intent is unclear, write `[NEEDS CLARIFICATION: {specific question}]` inline. The proposal gate cannot pass while any marker remains.
- **Scenarios as tests in waiting.** Every scenario becomes a test that cites its ID, so write each one concrete enough to code directly.
- **Language.** Prose follows `docs/config-flow.yaml`. The operation headings, `REQ`, `Scenario`, the step keywords, `SHALL`, `**Reason:**` and `**Migration:**` stay in English.

## Quality Checklist

`medra validate` enforces this document's structure, IDs and cross-references. This list holds only what it cannot judge.

- [ ] Every MODIFIED block repeats the full statement and every scenario that remains.
- [ ] `medra validate <change> --stage proposal` reports no `delta.*` error.
