## Component: FileUpload

### Description
`FileUploadComponent` (`med-file-upload`) is a validated file *picker* plus a pending-file list — it never makes an HTTP request of its own. Owning a real upload (transport, progress, retry, cancellation) would tie a UI primitive to a specific backend contract the library has no opinion on; the accepted value (`File[]`, via `ControlValueAccessor`) is exactly what a consumer needs to drive their own upload call (`projects/medra/ui/src/lib/file-upload/file-upload.component.ts:9-17`). Supports both click-to-browse and drag-and-drop. Client-side `accept`/`maxFileSize` validation runs regardless of the native `<input accept>` filter, because drag-and-drop bypasses that filter entirely and not every OS enforces it strictly for the picker either (`file-upload.component.ts:19-24`).

### Variants
| Variant | When to use |
|---|---|
| `multiple=false` (default) | Single-file selection (new selections replace, not append) |
| `multiple=true` | Multi-file selection (accepted files accumulate) |

No `size` (`sm`/`default`/`lg`) input exists — the dropzone has a single fixed size (see Issues below).

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `accept` | `string` | `''` | Comma-separated extension/`type/subtype`/`type/*` patterns — `file-upload.component.ts:94`, matching logic in `projects/medra/ui/src/lib/file-upload/file-upload.utils.ts:27-44` |
| `multiple` | `boolean` | `false` | `file-upload.component.ts:95` |
| `maxFileSize` | `number \| null` | `null` (bytes) | `file-upload.component.ts:96` |
| `invalid` | `boolean` | `false` | `file-upload.component.ts:97` |
| `disabled` | `boolean` | `false` | `file-upload.component.ts:98` |
| `chooseLabel` | `string` | `'Choose'` | `file-upload.component.ts:100` |
| `removeLabel` | `string` | `'Remove'` | `file-upload.component.ts:101` |
| `invalidTypeLabel` | `string` | `'Invalid file type'` | `file-upload.component.ts:102` |
| `invalidSizeLabel` | `string` | `'File is too large'` | `file-upload.component.ts:103` |
| `dropzoneHint` | `string \| null` | `null` (falls back to `'or drag and drop files here'`) | `file-upload.component.ts:104` |
| `class` | `string` | `''` | `file-upload.component.ts:105` |
| `rejected` (output) | `EventEmitter<readonly RejectedFile[]>` | — | Emitted whenever a selection/drop includes rejected files — `file-upload.component.ts:107`, shape at `file-upload.utils.ts:1-6` |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Dashed dropzone: `border-2 border-dashed`, `border-surface-300` — `file-upload.component.ts:126-134` | — |
| Hover | `hover:border-surface-400` — `file-upload.component.ts:134` | |
| Drag-over | `border-brand-500 bg-brand-50` — `file-upload.component.ts:131` | Set via `(dragover)`/`(dragleave)` handlers — `file-upload.component.ts:145-155` |
| Disabled | `cursor-not-allowed opacity-(--opacity-disabled) border-surface-200` — `file-upload.component.ts:129` | Click-to-browse, drag/drop, and remove buttons all no-op |
| Loading | Not implemented — no upload progress state exists (deliberate: FileUpload is a picker, not an uploader) | |
| Error | `border-danger-500` on the dropzone when `invalid=true` — `file-upload.component.ts:133`. Rejected files are listed inline in `text-danger-600` — `file-upload.component.ts:60-64` | No `aria-invalid` attribute set on the dropzone despite the `invalid` input existing (see Issues below) |

Rejections **replace** (not accumulate on top of) whatever was rejected by the previous attempt — the inline list always reflects only the most recent selection/drop gesture (`file-upload.component.ts:22-24`).

### Accessibility
- **Role/ARIA:** None found on the dropzone `<div>` itself — it's a plain `(click)`/`(dragover)`/`(dragleave)`/`(drop)` handler, no `role="button"` and no `aria-invalid` even when `invalid=true`. This gap is confirmed, not just implied by source reading: no test in `file-upload.component.spec.ts` ever asserts a `role` or `aria-invalid` attribute on the dropzone — every test locates it by its `border-dashed` class instead (`file-upload.component.spec.ts:6-8`), which itself corroborates the dropzone being a plain unlabeled `<div>`. Each file's remove button has a computed `aria-label` (`removeLabel + ': ' + file.name`) — `file-upload.component.ts:81`, spec-verified: `file-upload.component.spec.ts:153-167 — "removing a file updates the list and commits via onChange"` locates the button via `button[aria-label="Remove: a.txt"]`.
- **Keyboard navigation:** The dropzone itself isn't a native focusable/keyboard-activatable element (a `<div>` with only a `(click)` handler) — file selection via keyboard relies on the nested `<button medButton>` "Choose" trigger, which is itself focusable/keyboard-operable. No keyboard-drivable drag-and-drop equivalent exists (expected, drag-and-drop has no keyboard analog). No spec test dispatches a keyboard event (`Enter`/`Space`) on the dropzone `<div>` itself, consistent with it having no keyboard affordance to test.
- **Screen reader:** No `aria-live` region was found announcing accepted/rejected files after a selection — the rejected-file list and file list update visually but there's no explicit live-region hookup found in the template, and no spec test checks for `aria-live`/`role="status"`/`role="alert"` anywhere, so a screen-reader user gets no explicit announcement when a drop is accepted or rejected — `[not covered by tests, and not implemented]`.
- **Validation/state coverage:** type and size rejection (without adding the file, without mutating the value), multi-file partial accept/reject in the same gesture, rejection-message replacement on a later successful selection, and disabled blocking both click-to-browse and drop are all directly spec-verified — `file-upload.component.spec.ts:90-151, 183-194`.
- **A11y verdict:** Covered — **resolved 2026-08-19.** The dropzone is now `role="button"` with `tabindex`, `(keydown)` Enter/Space activation, `aria-disabled`, and `aria-invalid` reflecting the `invalid` input (the inner "Choose" button is now `tabindex="-1"`, since it would otherwise be a second, redundant tab stop for the same action). Accept/reject outcomes are announced via a permanently-present `role="status" aria-live="polite"` sr-only span — permanent, not conditionally rendered, so the very first rejection is announced too (a conditionally-rendered live region can miss its own first update). Directly tested: `file-upload.component.spec.ts` — `'the dropzone is a keyboard-reachable role="button"'`, `'Enter/Space on the dropzone opens the native file picker'`, `'reflects invalid as aria-invalid on the dropzone'`, `'announces accepted/rejected counts via the sr-only live status region'`.

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Handle the actual upload yourself in response to the bound `File[]` value/`(rejected)` output — this component never calls an API | Don't rely on the native `accept` attribute alone for validation — the component re-validates client-side because drag-and-drop bypasses it (spec-verified for both type and size) |
| Set `maxFileSize` and `accept` together for full validation coverage | Don't expect rejected-file history to accumulate — each new selection/drop clears the previous rejection list (spec-verified) |
| Rely on the dedicated "Choose" button for keyboard-only users — it's the only keyboard-operable trigger | Don't assume the dropzone `<div>` itself is keyboard-focusable or announces `aria-invalid`/rejections to screen readers — none of that is implemented or tested |

### Code example (Angular)
```html
<med-file-upload multiple [(ngModel)]="fileUploadDemoValue" name="demo-file-upload" />

<med-file-upload accept="image/*" [maxFileSize]="2 * 1024 * 1024" [(ngModel)]="fileUploadImagesDemoValue" name="demo-file-upload-images" />
```
Source: `projects/showcase/src/app/app.html:1064-1069`

### Source
- `projects/medra/ui/src/lib/file-upload/file-upload.component.ts`
- `projects/medra/ui/src/lib/file-upload/file-upload.utils.ts`
