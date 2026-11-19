# Delta: {capability title}

**Capability:** `{capability-folder-name}`
<!-- New capability only: add the next two lines and the Purpose section, and use only ADDED. -->
**ID prefix:** `{PREFIX}`

## Purpose

{What the new capability does for its users, in one to three sentences.}

<!-- Keep only the operation sections that have entries, in this order. -->
## ADDED Requirements

### REQ {PREFIX}-{next free number}: {requirement title}

{The system SHALL {observable behavior}.}

#### Scenario {PREFIX}-{number}.S1: {scenario title}

- **Given** {the state before the action}
- **When** {the action or event}
- **Then** {the observable outcome}

## MODIFIED Requirements

### REQ {PREFIX}-{existing number}: {requirement title, new or unchanged}

{The full new statement. Repeat every scenario that remains: existing ones keep their IDs, new ones take the next free S number.}

## REMOVED Requirements

### REQ {PREFIX}-{existing number}: {requirement title}

**Reason:** {why the behavior goes away}
**Migration:** {what users or callers do instead, or "None"}
