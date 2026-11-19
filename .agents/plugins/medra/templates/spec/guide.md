
# Template: Living Spec

## Purpose

A living spec states what one capability does today, and it is the project's living documentation. The author fills it directly only when bootstrapping an existing codebase at init. From then on, only `medra archive` changes it, by merging approved deltas. Authors read it, through context packs, to write deltas against it. Reviewers judge implementations against it. Tests cite its scenario IDs, so `medra coverage` can show which behavior is proven.

## Placement

| Item | Value |
|---|---|
| Path | `docs/specs/<capability>/spec.md`. `<capability>` is kebab-case and names a user-facing area (`auth`, `billing-invoices`) |
| Lifecycle | Current, its only state. History lives in the archive |
| IDs | `<PREFIX>-<NNN>` requirements and `<REQ>.S<n>` scenarios. They are never renumbered; retired IDs are listed in a CLI-owned comment |

## Structure

Fixed. Copy `.agents/plugins/medra/templates/spec/template.md` to the placement path, then fill it section by section.

## Sections

### Capability title

**Why:** humans browsing `docs/specs/` and `medra index` show this name.

**Fill rules:** write a noun phrase naming the capability. Under it, write the `**Capability:**` line holding the folder name, the `**ID prefix:**` line holding 2–10 uppercase characters that are unique across the project, and optionally `**Paths:**` with comma-separated code globs (e.g. ``**Paths:** `src/auth/**`, `test/auth/**` ``) so `medra index` and `medra context` route path-scoped learnings and code locations without exploratory searches.

### Purpose

**Why:** `medra index` shows its first sentence, so authors can tell which capability a new intent belongs to.

**Fill rules:** write 1–3 sentences about what the capability does for its users. The first sentence must stand alone.

**Example:** "Lets account holders regain access without contacting support. Covers reset requests, token delivery and password replacement."

### Requirements

**Why:** this is the authoritative behavior. Deltas, tasks, tests and reviews all refer to it by ID.

**Fill rules:**
- Write one behavior per `### REQ` block. The statement contains SHALL (or SHALL NOT) and describes observable behavior, never implementation.
- Give every requirement at least one scenario. Each scenario is a list of `**Given**` / `**When**` / `**Then**` steps, with `**And**` and `**But**` for extra steps. `Given` comes before `When`, and there is at least one `When` and one `Then`.
- Number requirements from `-001` upward and scenarios from `.S1` upward within each requirement.

**Example:**

```markdown
### REQ AUTH-004: Reset link expiry

The system SHALL reject a password reset link used more than 30 minutes after it was issued.

#### Scenario AUTH-004.S1: Expired link

- **Given** a reset link issued 31 minutes ago
- **When** the user opens the link
- **Then** the reset form is not shown
- **And** the user is offered a new link
```

## Writing Standards

- **What, not how.** Name no frameworks, tables, classes or endpoints unless the endpoint itself is the contract users depend on. Implementation lives in plans.
- **Testable.** A behavior counts only if a test can observe it. "SHALL be user-friendly" has no scenario that can fail.
- **Bootstrap honesty.** During bootstrap, describe what the code does today, including behavior that looks wrong, and mark doubts `[NEEDS CLARIFICATION: …]` for the user to resolve at the bootstrap gate.
- **Language.** Prose follows `docs/config-flow.yaml`. `REQ`, `Scenario`, the step keywords and `SHALL` stay in English.

## Quality Checklist

`medra validate` enforces this document's structure, IDs and cross-references. This list holds only what it cannot judge.

- [ ] The Purpose's first sentence stands alone.
- [ ] Every requirement states observable behavior.
- [ ] IDs are sequential within the capability.
- [ ] No implementation detail appears that users do not depend on.
- [ ] `medra validate --project specs` exits `0`.
