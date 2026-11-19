## Component: Icon

### Description
A universal, lightweight icon wrapper around Heroicons, Font Awesome (`IconDefinition`), and custom SVG glyphs (`projects/medra/ui/src/lib/icon/icon.component.ts`). The SVGs/definitions themselves aren't bundled into the component — they're registered by the consuming app via `provideIcons()`, or passed directly via `[icon]`, importing only the icons actually used (regular ESM tree-shaking, `sideEffects: false` in the package). At render, the component dynamically resolves the viewBox, fill, stroke, and inner SVG markup. If the icon isn't registered or provided, it logs a `console.warn` and renders a visible dashed placeholder box instead of an empty SVG (`icon.component.ts`) — see States below.

### Variants
| Variant | viewBox | Fill/stroke | When to use |
|---|---|---|---|
| `outline` (default) | `0 0 24 24` | `fill: none`, `stroke: currentColor`, `stroke-width: 1.5` | Larger, outlined icons (24px grid) |
| `solid` | `0 0 24 24` | `fill: currentColor` | Larger, filled icons (24px grid) |
| `mini` | `0 0 20 20` | `fill: currentColor` | Compact filled icons (20px grid), e.g. inside buttons/inputs |
| `micro` | `0 0 16 16` | `fill: currentColor` | Smallest filled icons (16px grid) |

> [!NOTE]
> Font Awesome icons (`IconDefinition`) dynamically adapt their viewBox (e.g. `0 0 512 512`, `0 0 640 512`) regardless of the selected `variant`.

### Props (Angular Inputs/Outputs)
| Property | Type | Default | Description |
|---|---|---|---|
| `icon` | `IconValue \| null` | `null` | Direct icon definition (Font Awesome `IconDefinition`, `CustomIconData`, or SVG markup string). When provided, takes precedence over `name`. |
| `fontIcon` | `string \| null` | `null` | Direct CSS font icon class (e.g. `'fa-solid fa-coffee'`) for use when Font Awesome is loaded via CDN (renders an `<i>` tag). |
| `name` | `string` | `''` | Icon name: kebab-case (`grip-vertical`, `fa-coffee`) for SVG icons, or space-separated classes (`fa-solid fa-coffee`) for CDN font icons. |
| `variant` | `'outline' \| 'solid' \| 'mini' \| 'micro'` | `'outline'` | Icon style/size grid. For registered Font Awesome icons, auto-resolves seamlessly even if registered under `solid`. |
| `ariaLabel` | `string \| null` | `null` | Optional accessible label; without it the icon is treated as purely decorative. |
| `class` | `string` | `''` | Extra classes on the inner `<svg>` or `<i>` (`mergeClasses` with default `--icon-size`). |

### States
N/A — Icon is a static, non-interactive visual element. No hover/focus/active/disabled/loading/error states apply.

| State | Visual | Behavior |
|---|---|---|
| Registered icon / direct icon found | Renders the SVG markup with matching viewBox | — |
| Icon not registered | Renders a visible dashed placeholder box (`<rect>` at 10%/10%/80%/80% of the viewBox, `opacity: 0.6`) and logs `console.warn('[med-icon] Icon "<name>" (variant "<variant>") was not registered. Use provideIcons() to register it.')` | Missing icon is visible in the rendered page and logged to dev console |

### Font Awesome Usage
Medra UI natively supports Font Awesome icons in two ways without forcing heavy dependencies onto consumer projects:

1. **Direct input via `[icon]`:**
```ts
import { Component } from '@angular/core';
import { IconComponent } from '@medra/ui';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';

@Component({
  imports: [IconComponent],
  template: `<med-icon [icon]="faCoffee" class="size-5 text-amber-700" />`,
})
export class MyComponent {
  faCoffee = faCoffee;
}
```

2. **Global registration via `provideIcons()`:**
```ts
import { ApplicationConfig } from '@angular/core';
import { provideIcons } from '@medra/ui';
import { faCoffee, faUser } from '@fortawesome/free-solid-svg-icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideIcons({
      solid: {
        faCoffee,
        faUser,
      },
    }),
  ],
};
```
In template:
```html
<med-icon name="fa-coffee" />
<!-- or simply: -->
<med-icon name="coffee" />
```

3. **Via CDN (CSS / Webfonts):**
Adicione o link do CDN no `index.html` ou `@import` no seu CSS global:
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />
```
Depois utilize com classes normais no `<med-icon>` ou em componentes do Medra UI:
```html
<!-- Via name com classes do Font Awesome -->
<med-icon name="fa-solid fa-coffee" class="text-amber-700" />
<med-icon name="fa-brands fa-github" class="size-6" />

<!-- Ou explicitamente via fontIcon -->
<med-icon fontIcon="fa-regular fa-user" />

<!-- Em componentes como Tag, Chip ou SplitButton -->
<med-tag icon="fa-solid fa-check" label="Concluído" />
```

### Accessibility
- **Role/ARIA:** `[attr.role]="ariaLabel() ? 'img' : null"`, `[attr.aria-label]="ariaLabel()"`, `[attr.aria-hidden]="ariaLabel() ? null : 'true'"` — decorative by default, becomes an accessible `img` only when `ariaLabel` is supplied.
- **Keyboard navigation:** None — not a focusable element.
- **Screen reader:** Without `ariaLabel`, the icon is hidden from assistive tech (`aria-hidden="true"`); with it, it's announced as an image with that label.

### Source
- `projects/medra/ui/src/lib/icon/icon.component.ts`
- `projects/medra/ui/src/lib/icon/icon-registry.ts`
