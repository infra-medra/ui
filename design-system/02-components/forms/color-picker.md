## Component: ColorPicker

### Description
`ColorPickerComponent` (`med-color-picker`) is a swatch trigger button that opens `ColorPickerPanelComponent` — a saturation/brightness area plus a hue track and a hex text input (`projects/medra/ui/src/lib/color-picker/color-picker.component.ts:19-27`). Implements `ControlValueAccessor` with a hex string value (e.g. `"#3b82f6"`), not an HSB/RGB object — hex is the representation a consumer is most likely to already have on hand (design tokens, CSS custom properties, an `<input type="color">` fallback); HSB stays purely internal to the panel's math (`color-picker.component.ts:33-36`).

**Unlike other overlay pickers in this library, the panel never closes on interaction** — picking a color is a continuous drag, not a one-shot selection. The overlay's own default Escape/outside-click handling is the only close path, matching how a native `<input type="color">` popover behaves. `colorChange` updates the form value on every drag frame, so a consumer watching the value live-previews the color as the user drags (`color-picker.component.ts:24-31`).

**No `null` value**: a swatch always shows *some* color, so an unwritten value defaults to `#000000` rather than rendering blank (`color-picker.component.ts:38-40`, `16`). Raw hex values (the default `#000000` and the hex string value/preview) are expected domain behavior here, not a design-token violation — there is no preset-swatch palette input in the current implementation (no `preset`-related code found in the component).

### Variants
| Variant | When to use |
|---|---|
| `size="sm" \| "default" \| "lg"` | Own `ColorPickerSize` type, maps to fixed swatch diameters (`size-6`/`size-8`/`size-10`), **not** the shared `--spacing-field-*` tokens (expected — the trigger is a square swatch button, not a text field) |
| `invalid` | Error ring |

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `size` | `ColorPickerSize` | `'default'` | `color-picker.component.ts:73` |
| `disabled` | `boolean` | `false` | `color-picker.component.ts:74` |
| `invalid` | `boolean` | `false` | `color-picker.component.ts:75` |
| `ariaLabel` | `string` | `'Pick a color'` | `color-picker.component.ts:77` |
| `class` | `string` | `''` | `color-picker.component.ts:78` |

`ColorPickerPanelComponent` (internal, not part of the public API):
| Property | Type | Default | Description |
|---|---|---|---|
| `initialHsb` | `Hsb` | `{ h: 0, s: 100, b: 100 }` | Seed color when the panel opens — `projects/medra/ui/src/lib/color-picker/color-picker-panel.component.ts:96` |
| `colorChange` (output) | `EventEmitter<Hsb>` | — | Emitted on every drag frame — `color-picker-panel.component.ts:97` |

### States
| State | Visual | Behavior |
|---|---|---|
| Default | Square swatch button, `background` set to the current hex value — `color-picker.component.ts:59` | — |
| Focus | `focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-brand-500` — `color-picker.component.ts:98` | |
| Disabled | `disabled:pointer-events-none disabled:opacity-(--opacity-disabled)` — `color-picker.component.ts:99` | Real `[disabled]` on the `<button>` |
| Loading | Not implemented | |
| Error | `ring-2 ring-danger-500` when `invalid=true` — `color-picker.component.ts:100`; `aria-invalid="true"` — `color-picker.component.ts:63` | |
| Open/Closed | `aria-expanded` reflects `isOpen()`, `aria-haspopup="dialog"` — `color-picker.component.ts:61-62` | Panel stays open through drags/typing; only Escape/outside-click closes it (no close-on-select) |

Inside the panel: the saturation/brightness area and hue track are each pointer-draggable and keyboard-operable (`role="slider"` on both), with a draggable handle following the current `hsb()` value.

### Accessibility
- **Role/ARIA:** Trigger: `aria-haspopup="dialog"`, `aria-expanded`, `aria-invalid`, `aria-label` set to `"{ariaLabel}: {hex}"` (`color-picker.component.ts:61-64,92`) — spec-verified: `color-picker.component.spec.ts:51-55 — 'defaults to black when no value is written'` and `:57-63 — 'writeValue shows the given color without opening the panel'` both assert on the trigger's `aria-label` reflecting the current hex. Panel: `role="slider"` on both the saturation/brightness area and the hue track, each with `aria-label`/`aria-valuemin`/`aria-valuemax`/`aria-valuenow` (`color-picker-panel.component.ts:38-45,63-67`) — `aria-valuenow` is directly exercised throughout the keyboard-nav tests below. The saturation/brightness area's `role="slider"` is explicitly noted as informal, not a full APG pattern — it models two axes (saturation × brightness) via a combined `aria-valuetext`, since there's no standard two-axis widget role (`color-picker-panel.component.ts:13-20`).
- **Keyboard navigation:** Saturation/brightness area: `ArrowRight`/`ArrowLeft` nudge saturation ±1 — spec-verified: `color-picker-panel.component.spec.ts:82-92 — 'arrow keys on the saturation/brightness area nudge saturation and brightness by 1'`. Hue track: `ArrowRight` nudges hue +1, `Home`/`End` jump to 0/359 — spec-verified: `color-picker-panel.component.spec.ts:94-107 — 'arrow keys on the hue track nudge hue by 1, Home/End jump to 0/359'`. Hex input commits on `Enter` (`color-picker-panel.component.spec.ts:109-123`) and silently reverts an unparseable draft to the last valid color on blur, rather than committing garbage (`:125-136 — 'an unparseable hex draft is silently discarded on blur, reverting to the last valid color'`). Dragging (`pointerdown`) on either the SV area or the hue track also updates the respective HSB component and emits `colorChange` — `color-picker-panel.component.spec.ts:56-67, 69-80`.
- **Panel closing — clarification:** the trigger button itself toggles the panel open/closed on click (spec-verified: `color-picker.component.spec.ts:94-103 — 'clicking the trigger again closes the panel'`), in addition to Escape/outside-click. Dragging/typing inside the panel is confirmed **not** to close it — `color-picker.component.spec.ts:76-92 — 'dragging in the panel updates the trigger color and calls onChange, without closing the panel'` explicitly asserts the panel is still open after a drag. **Escape/outside-click dismissal — resolved 2026-08-19:** both were already handled for free by `OverlayService.openConnected()`'s own defaults (`closeOnEscape`/`closeOnOutsideClick`/`restoreFocus` all default `true` for a non-backdrop overlay, and `color-picker.component.ts:127` passes no options at all, so every default applies) — just untested at this level, same pattern as TreeSelect's identical gap. Now confirmed by `color-picker.component.spec.ts` under `describe('overlay dismissal (via OverlayService defaults)', ...)` — `'Escape closes the panel and returns focus to the trigger'` and `'a pointerdown+click outside the panel closes it and returns focus to the trigger'` (both assert focus lands back on the trigger, not just that the panel closed).
- **Disabled:** `setDisabledState(true)` blocks the trigger from opening the panel at all — `color-picker.component.spec.ts:105-112`.
- **Screen reader:** `aria-valuetext` on the saturation/brightness slider reads e.g. "Saturation 42%, brightness 87%" (`color-picker-panel.component.ts:113`) — not directly asserted by any spec test (only `aria-valuenow` is checked), so the exact `aria-valuetext` phrasing is `[not covered by tests]`. Hex input has its own `aria-label` (`hexInputLabel`, default `'Hex color'`).
- **A11y verdict:** Covered — **resolved 2026-08-19**: arrow-key nudging on both sliders (with Home/End on hue), hex-input commit/revert-on-invalid, drag-without-closing, and now Escape-to-close/outside-click dismissal with focus return are all directly spec-verified. `aria-valuetext`'s exact phrasing remains a minor, low-risk untested detail (the underlying `aria-valuenow` is covered).

### Do's and Don'ts
| ✅ Do | ❌ Avoid |
|---|---|
| Treat the value as always-present hex — there is no `null`/empty state to design for | Don't expect the panel to close after picking a color — only Escape/outside-click dismiss it (dragging is spec-confirmed to leave it open) |
| Rely on `colorChange`/form value updating live during drag for real-time previews | Don't expect a built-in preset-swatch palette — none exists in the current implementation |
| Trust that an invalid hex typed into the panel input reverts cleanly on blur (spec-verified), and that Escape/outside-click dismissal (with focus return to the trigger) is now regression-tested too (**resolved 2026-08-19**) | |
| Click the trigger again to close the panel — that toggle path is spec-verified | Don't rely on dragging or picking a color to close the panel — by design it stays open through interaction |

### Code example (Angular)
```html
<med-color-picker [(ngModel)]="colorPickerValue" />
<med-color-picker [(ngModel)]="colorPickerValue" size="sm" />
<med-color-picker [(ngModel)]="colorPickerValue" size="lg" />
```
Source: `projects/showcase/src/app/app.html:1326-1328`

### Source
- `projects/medra/ui/src/lib/color-picker/color-picker.component.ts`
- `projects/medra/ui/src/lib/color-picker/color-picker-panel.component.ts`
- `projects/medra/ui/src/lib/color-picker/color-picker.utils.ts`
