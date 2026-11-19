# Utilities and Miscellaneous

**Capability:** `utilities-and-misc`
**ID prefix:** `UTL`
**Paths:** `projects/medra/ui/src/lib/file-upload/**`, `projects/medra/ui/src/lib/editor/**`, `projects/medra/ui/src/lib/terminal/**`, `projects/medra/ui/src/lib/scroll-top/**`, `projects/medra/ui/src/lib/animate-on-scroll/**`, `projects/medra/ui/src/lib/auto-focus/**`, `projects/medra/ui/src/lib/defer/**`, `projects/medra/ui/src/lib/bind/**`, `projects/medra/ui/src/lib/fluid/**`

## Purpose

Provides standalone widgets (file upload, rich text editor, terminal, scroll-to-top button) and behavior directives (animate on scroll, auto focus, deferred rendering, safe attribute binding, fluid width). They cover interaction needs that do not belong to a specific form control or layout component.

## Requirements

### REQ UTL-001: File selection

`med-file-upload` SHALL let users pick files by clicking its dropzone (opening the native picker exactly once), pressing Enter or Space on the dropzone (a focusable `role="button"`), or dropping files, and SHALL list the pending files with a human-readable size. In single mode (default) a new selection SHALL replace the pending file; with `multiple` it SHALL append. While `disabled` it SHALL NOT open the picker or accept drops.

#### Scenario UTL-001.S1: Single replace

- **Given** a single-mode file upload with one pending file
- **When** the user selects another file
- **Then** only the new file is pending

#### Scenario UTL-001.S2: Multiple append

- **Given** a file upload with `multiple` and one pending file
- **When** the user selects another file
- **Then** both files are pending

#### Scenario UTL-001.S3: Keyboard

- **Given** a focused dropzone
- **When** the user presses Enter or Space
- **Then** the native file picker opens

#### Scenario UTL-001.S4: Disabled

- **Given** a disabled file upload
- **When** the user clicks the dropzone or drops a file
- **Then** nothing happens

### REQ UTL-002: File validation

`med-file-upload` SHALL reject a file whose type does not match `accept` or whose size exceeds `maxFileSize`, SHALL NOT add it to the pending list, and SHALL emit `rejected` with the rejected files and show the `invalidTypeLabel` or `invalidSizeLabel` message. In multiple mode valid files from the same selection SHALL still be accepted, and a later successful selection SHALL clear the earlier rejection message. It SHALL announce accepted and rejected counts in a polite status region and reflect `invalid` as `aria-invalid` on the dropzone.

#### Scenario UTL-002.S1: Wrong type

- **Given** `accept="image/*"`
- **When** the user selects a PDF
- **Then** the file is not added and `rejected` emits it

#### Scenario UTL-002.S2: Too large

- **Given** `maxFileSize` of 1000 bytes
- **When** the user selects a larger file
- **Then** it is rejected with the size message

#### Scenario UTL-002.S3: Mixed selection

- **Given** a file upload with `multiple`
- **When** the user selects one valid and one invalid file
- **Then** the valid file is pending and the invalid one is rejected

### REQ UTL-003: File upload requests

When `url` is set, `med-file-upload` SHALL show an Upload button (unless `auto`) that sends each pending file as multipart form data using `method` (`POST` default, or `PUT`), `fileFieldName` (default "file") and `withCredentials`, emitting `progress`, `uploaded` or `uploadError` and showing each file as uploading, done or failed. A failed file SHALL be retryable with Upload. With `auto` it SHALL start on selection. Cancelling an in-flight upload SHALL reset the file to pending, and removing a file SHALL cancel its request. It SHALL NOT send any request when `url` is unset.

#### Scenario UTL-003.S1: Successful upload

- **Given** a file upload with `url` and a pending file
- **When** the user clicks Upload
- **Then** a multipart request is sent, progress is reported, and the file shows Done

#### Scenario UTL-003.S2: Failure and retry

- **Given** an upload that fails
- **When** it completes
- **Then** the file shows Failed and Upload retries it

#### Scenario UTL-003.S3: Auto upload

- **Given** `auto` and `url`
- **When** the user selects a file
- **Then** the upload starts without an Upload button

### REQ UTL-004: File upload custom mode and form integration

With `customUpload`, `med-file-upload` SHALL emit `uploadHandler` with the selected files instead of sending HTTP requests, even when `url` or `auto` is set, and `mode="basic"` SHALL be supported as an alternative presentation to `advanced`. It SHALL work with Angular forms: the control value reflects the pending files, selection and removal update it, and writing null clears the list.

#### Scenario UTL-004.S1: Custom upload

- **Given** `customUpload`, `url` set and `auto` true
- **When** the user selects a file
- **Then** `uploadHandler` emits the files and no HTTP request is made

#### Scenario UTL-004.S2: Form control

- **Given** a file upload bound to a form control
- **When** the user selects then removes a file
- **Then** the control value updates each time

### REQ UTL-005: Editor content and sanitization

`med-editor` SHALL render a `role="textbox"` multiline editable region labeled by `ariaLabel` (default "Rich text editor") that works as a form control: it SHALL display the written HTML and report typed content as HTML after sanitization. It SHALL strip dangerous markup such as `<script>` tags before reporting the value. When disabled (via `disabled` or the form control) the region SHALL be non-editable, the toolbar disabled, and commands inert.

#### Scenario UTL-005.S1: Write value

- **Given** an editor
- **When** the form control value is set to `<p>Hi</p>`
- **Then** the region shows "Hi"

#### Scenario UTL-005.S2: Script stripped

- **Given** an editor
- **When** the user types or pastes HTML containing a `<script>` tag
- **Then** the reported value contains no `<script>`

#### Scenario UTL-005.S3: Disabled

- **Given** a disabled editor
- **When** the user clicks a toolbar button
- **Then** no command runs

### REQ UTL-006: Editor toolbar

`med-editor` SHALL provide a labeled `role="toolbar"` with Bold, Italic, Underline, bullet list, numbered list, Undo and Redo buttons, a text-style (heading) selector and a link button. Bold, italic and underline SHALL reflect their active state through `aria-pressed`. The toolbar SHALL have one tab stop: only the first button is tabbable initially, ArrowLeft/ArrowRight move between buttons with wrapping, and Home/End jump to the first/last. Applying a heading SHALL format the block and reset the selector to its placeholder.

#### Scenario UTL-006.S1: Bold

- **Given** an editor with selected text
- **When** the user clicks Bold
- **Then** the bold command runs and the button shows `aria-pressed="true"`

#### Scenario UTL-006.S2: Roving focus

- **Given** focus on the last toolbar button
- **When** the user presses ArrowRight
- **Then** the first button is focused

#### Scenario UTL-006.S3: Heading

- **Given** an enabled editor
- **When** the user chooses a heading level
- **Then** the block is formatted and the selector resets

### REQ UTL-007: Editor link insertion

Clicking the link button SHALL open a panel with a focused URL input (label `urlLabel`, placeholder `urlPlaceholder`). Confirming SHALL create a link and close the panel; Cancel (or Escape) SHALL close it without creating a link. The link button SHALL do nothing while the editor is disabled.

#### Scenario UTL-007.S1: Insert

- **Given** the link panel is open
- **When** the user enters a URL and confirms
- **Then** a link is created and the panel closes

#### Scenario UTL-007.S2: Cancel

- **Given** the link panel is open
- **When** the user cancels
- **Then** the panel closes and no link is created

### REQ UTL-008: Terminal

`med-terminal` SHALL show an optional `welcomeMessage` above the history and a command input labeled by `inputAriaLabel`, preceded by `prompt` (default "$"). Pressing Enter SHALL append the command to the history, emit `commandSubmitted`, and clear the input, and SHALL do nothing for an empty or whitespace-only command. The history SHALL be a polite `role="log"` labeled by `ariaLabel`. The consumer's `respond(text)` SHALL append a response line, and `clear()` SHALL empty the history while keeping the welcome message. Clicking the terminal SHALL focus the input.

#### Scenario UTL-008.S1: Submit

- **Given** a terminal
- **When** the user types "ls" and presses Enter
- **Then** "ls" appears in the history, `commandSubmitted` emits "ls" and the input is empty

#### Scenario UTL-008.S2: Empty command

- **Given** a terminal
- **When** the user presses Enter with only whitespace
- **Then** no history line is added and nothing is emitted

#### Scenario UTL-008.S3: Respond and clear

- **Given** a terminal with history and a welcome message
- **When** the consumer calls `respond("ok")` and later `clear()`
- **Then** "ok" is appended and then only the welcome message remains

### REQ UTL-009: Scroll top

`med-scroll-top` SHALL render a button labeled by `ariaLabel` (default "Scroll to top") only after the scroll offset of its `target` (`window` by default, or the `parent` element) exceeds `threshold` (default 400), and SHALL hide it again below the threshold. Clicking it SHALL scroll the target to the top using `behavior` (default `smooth`). It SHALL NOT access window scroll or render the button during server rendering.

#### Scenario UTL-009.S1: Window

- **Given** the window scrolled beyond 400px
- **When** the button is clicked
- **Then** the window scrolls to the top

#### Scenario UTL-009.S2: Below threshold

- **Given** the window scrolled less than the threshold
- **When** it renders
- **Then** no button is shown

#### Scenario UTL-009.S3: Parent target

- **Given** `target="parent"` and its parent scrolled past the threshold
- **When** the button is clicked
- **Then** the parent element scrolls to the top

### REQ UTL-010: Animate on scroll

`medAnimateOnScroll` SHALL add the classes in `enterClass` and remove those in `leaveClass` when the host intersects the viewport (observed with `threshold` default 0.5 and `rootMargin` default "0px"), and the reverse when it leaves. With `once` it SHALL stop observing after the first entry. Without IntersectionObserver in the browser it SHALL apply `enterClass` immediately, and it SHALL do nothing during server rendering.

#### Scenario UTL-010.S1: Enter and leave

- **Given** a host with `enterClass="fade-in"` and `leaveClass="fade-out"`
- **When** it enters and then leaves the viewport
- **Then** it gets `fade-in` (without `fade-out`) and then `fade-out` (without `fade-in`)

#### Scenario UTL-010.S2: Once

- **Given** `once` is set
- **When** the host intersects
- **Then** observation stops and later exits change nothing

#### Scenario UTL-010.S3: No observer

- **Given** a browser without IntersectionObserver
- **When** the directive initializes
- **Then** `enterClass` is applied

### REQ UTL-011: Auto focus

`medAutoFocus` SHALL focus its host when it is natively focusable, or otherwise its first focusable descendant, when the view initializes. `[medAutoFocus]="false"` SHALL disable the behavior, and it SHALL do nothing during server rendering.

#### Scenario UTL-011.S1: Focusable host

- **Given** an input with `medAutoFocus`
- **When** it renders
- **Then** the input has focus

#### Scenario UTL-011.S2: Container

- **Given** a non-focusable container with `medAutoFocus` holding a button
- **When** it renders
- **Then** the button has focus

#### Scenario UTL-011.S3: Disabled

- **Given** `[medAutoFocus]="false"`
- **When** it renders
- **Then** nothing is focused

### REQ UTL-012: Deferred rendering

`medDefer` on an `ng-template` SHALL render the template only once the template's parent element intersects the viewport, then emit `onLoad` exactly once. Without IntersectionObserver (or without a parent) in the browser it SHALL render immediately, and it SHALL NOT render the template during server rendering.

#### Scenario UTL-012.S1: Lazy render

- **Given** a deferred template whose parent is off screen
- **When** the parent scrolls into view
- **Then** the template renders and `onLoad` emits once

#### Scenario UTL-012.S2: Fallback

- **Given** a browser without IntersectionObserver
- **When** the directive initializes
- **Then** the template renders immediately

#### Scenario UTL-012.S3: Server rendering

- **Given** server-side rendering
- **When** the page renders
- **Then** the template content is absent

### REQ UTL-013: Safe attribute binding

`medBind` SHALL apply a map of attributes, `class` (string, array or object), `style` (object) and event listeners (`on*` keys with function values) to its host, replacing the previously applied set whenever the map changes and removing listeners on update and destroy. It SHALL skip attributes whose value is null, undefined or false (true yields an empty attribute). It SHALL NOT apply the keys `innerHTML`, `outerHTML`, `srcdoc`, `insertAdjacentHTML`, `__proto__`, `constructor` or `prototype` (case-insensitive), SHALL ignore string `on*` handlers, and SHALL drop `href`, `xlink:href`, `src`, `action` and `formaction` values that are empty, contain control characters, use a scheme other than http, https, mailto or tel, or fail sanitization.

#### Scenario UTL-013.S1: Apply and update

- **Given** a host with `[medBind]="{ title: 'a', class: 'x' }"`
- **When** the map changes to `{ title: 'b' }`
- **Then** the host has `title="b"` and no longer has class `x`

#### Scenario UTL-013.S2: Blocked keys

- **Given** a map with `innerHTML` and `onclick: "alert(1)"`
- **When** it is applied
- **Then** neither is set on the host

#### Scenario UTL-013.S3: Unsafe URL

- **Given** a map with `href: "javascript:alert(1)"`
- **When** it is applied
- **Then** the host has no `href`

#### Scenario UTL-013.S4: Listener cleanup

- **Given** a map with a function `onclick`
- **When** the host is destroyed
- **Then** the listener is removed

### REQ UTL-014: Fluid width

`med-fluid` and `[medFluid]` SHALL make their host block-level and full width and set `data-fluid="true"` when fluid (default true, also for a bare attribute). Setting the `fluid` input to false (which takes precedence over `medFluid`) SHALL remove the width classes and the attribute. It SHALL provide the fluid state to descendant controls, such as text inputs, so they can fill their container.

#### Scenario UTL-014.S1: Default fluid

- **Given** a `med-fluid` element
- **When** it renders
- **Then** it is full width and has `data-fluid="true"`

#### Scenario UTL-014.S2: Explicit off

- **Given** `[medFluid]` with `[fluid]="false"`
- **When** it renders
- **Then** it has no `data-fluid` attribute and no full-width class

#### Scenario UTL-014.S3: Descendant context

- **Given** a text input inside `med-fluid`
- **When** it renders
- **Then** the input uses the fluid layout
