# Pattern: Form field with validation

## Components involved

Any of the 22 form components exposing an `invalid` input (`grep -rl "readonly invalid = input" lib/`, e.g. InputText, Textarea, InputNumber, Password, Select, MultiSelect, CascadeSelect, TreeSelect, AutoComplete, DatePicker — see each component's own page in `02-components/forms/` for its exact `invalid` signature), paired with `InlineMessage` (`02-components/feedback/inline-message.md`) for the validation hint text.

## The pattern

1. Bind the field's `invalid` input to a validation condition (typically `control.invalid && control.touched` in a Reactive Forms context, though `ControlValueAccessor` support was confirmed per-component rather than a specific validation-wiring convention — `[to confirm]` whether the library ships a shared directive for this wiring or leaves it to the consumer).
2. Field's shared `selectTriggerVariants`/CVA switches to a danger-colored border/ring when `invalid` is true (confirmed in Select, TreeSelect, CascadeSelect — `01-foundations/colors.md`'s danger ramp).
3. Place an `InlineMessage severity="danger"` immediately below or beside the field — `InlineMessageComponent`'s own doc comment describes exactly this use case: "meant to sit directly next to a form field (a validation hint)... unlike `MessageComponent`'s bordered/padded card" (`lib/inline-message/inline-message.component.ts:14-16`).

## What's NOT centralized (a gap, not a bug)

- No shared "field + label + hint + error" wrapper component was found — each form field and its `InlineMessage` are composed manually per usage site. `FloatLabel`/`IftaLabel` (`02-components/forms/`) handle label positioning specifically, not the validation-hint pairing.
- `InlineMessage`'s `role="status"`/`aria-live="polite"` (unconditional, `inline-message.component.ts:27`) is not wired to the paired field's `aria-describedby` anywhere found in source — a screen reader will hear the hint announced via the live region, but the field itself doesn't formally reference it. Worth a follow-up check once real consumer usage (not just the showcase) is auditable.

## Source

`projects/medra/ui/src/lib/inline-message/inline-message.component.ts`; the 22 components' own `invalid` inputs, documented individually in `02-components/forms/`.
