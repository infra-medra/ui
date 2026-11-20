# @medra.dev/ui

Angular UI components built with signals and standalone APIs. No NgModules and no
zone.js requirement. Styling uses design tokens and Tailwind CSS, with a dark theme
under the `dark` class.

## Install

```bash
npm install @medra.dev/ui @angular/cdk
```

Add the stylesheet to your application's styles in `angular.json`:

```json
"styles": [
  "node_modules/@medra.dev/ui/styles.css",
  "src/styles.css"
]
```

## Use

Components and directives are standalone: import what you use.

```ts
import { Component } from '@angular/core';
import { ButtonDirective } from '@medra.dev/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonDirective],
  template: `<button medButton>Save</button>`,
})
export class Example {}
```

## Versioning

The major version of `@medra.dev/ui` always equals the Angular major it supports, so
`21.x` targets Angular 21. Older Angular lines are maintained on `release/<major>`
branches. Release notes are in [CHANGELOG.md](CHANGELOG.md).

## Peer dependencies

Required: `@angular/core`, `@angular/common`, `@angular/platform-browser` and
`@angular/cdk` (`^21.2.0`). Optional: `@angular/router` (router-aware menu links) and
`chart.js` (the chart component).

## License

[MIT](LICENSE)
