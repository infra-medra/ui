# Pattern: Ripple interaction feedback

Not a standalone component — `RippleDirective` (`lib/ripple/ripple.directive.ts`) is a shared behavioral primitive, applied via the `[medRipple]` attribute selector to an existing interactive element.

## What it does

On `pointerdown`, draws a circular wave effect expanding from the pointer's contact point, using the Web Animations API (`circle.animate(...)`, 450ms, `ease-out` — `ripple.directive.ts:52-58`). The ripple container is a self-managed absolutely-positioned `<span aria-hidden="true">` inserted as the host's first child (`ripple.directive.ts:73-78`), sized to `Math.hypot(width, height) * 2` so it always covers the host regardless of click position (`ripple.directive.ts:38`).

## Built-in guardrails (already correct, no action needed)

- **Respects `prefers-reduced-motion`**: `prefersReducedMotion()` (`ripple.directive.ts:7-9`) short-circuits `onPointerDown` before creating any DOM node, so reduced-motion users get no ripple at all rather than a suppressed-but-still-computed one.
- **Respects disabled state**: checks both its own `medRippleDisabled` input and the host's native `disabled` property (`ripple.directive.ts:33`) before firing.
- **`aria-hidden="true"`** on the ripple container so it's invisible to assistive tech (`ripple.directive.ts:75`).

## Adoption

**Resolved 2026-08-19.** A repo-wide search originally found `medRipple` applied only on `lib/button/button.directive.ts`, despite the directive's own doc comment describing it as "a shared primitive used by action components (Button, **etc.**)" (`ripple.directive.ts:11-16`). Extended to match that stated intent — `[medRipple]` is now also applied on:

- `SplitButtonComponent` — both the primary action button and the toggle button (`split-button.component.ts`)
- `SpeedDialComponent` — the main button and every per-item action button, `medRippleDisabled` bound to `item.disabled` (`speed-dial.component.ts`)
- `ToggleButtonComponent` (`toggle-button.component.ts`)
- `SelectButtonComponent` — each option button, `medRippleDisabled` bound to `isDisabled() || option.disabled` since these buttons never get a native `disabled` (aria-disabled convention only) (`select-button.component.ts`)

Each adoption reuses the directive's existing `medRippleDisabled` input and its built-in reduced-motion/disabled guardrails — no changes to `ripple.directive.ts` itself. Verified with a dedicated ripple test in each component's spec (pointerdown → `Element.animate` called, and *not* called when disabled).

## Motion token note

The ripple's 450ms duration (`RIPPLE_DURATION_MS`, `ripple.directive.ts:3`) is hardcoded and does not reference `--transition-duration-base` (0.2s, see `01-foundations/motion.md`). This is likely intentional — a ripple is a distinct, longer-lived "impact" animation, not a hover/focus color transition — but like the Carousel/Dock duration outliers already flagged in `00-audit-report.md`, it's an undocumented deviation rather than a named second duration token.

## Usage

```html
<button medButton medRipple [medRippleDisabled]="false">Click me</button>
```

## Source

`projects/medra/ui/src/lib/ripple/ripple.directive.ts` (full directive), `projects/medra/ui/src/lib/button/button.directive.ts` (only current consumer).
