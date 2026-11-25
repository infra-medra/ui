---
"@medra.dev/ui": minor
---

Add `<ng-template #header>` template projection to `TabComponent` (`headerTemplate`) rendered in `TabsComponent` tab buttons via `NgTemplateOutlet`, widen `TabComponent.header` from required to optional (`''` default), and exclude `#header` from lazy `contentTemplate` resolution.
