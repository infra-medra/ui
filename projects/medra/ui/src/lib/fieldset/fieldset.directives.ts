import { Directive } from '@angular/core';

/**
 * Marker directive for Fieldset's rich-legend content-projection slot
 * (`<span medFieldsetLegend>`) — same trivial marker-directive convention
 * as Card's `medCardTitle`/`medCardSubtitle`: the selector both routes
 * `<ng-content select="[medFieldsetLegend]">` and, via `contentChild()` in
 * `FieldsetComponent`, detects whether a slot was actually provided, so
 * the plain-string `legend()` fallback doesn't double-render alongside it.
 */
@Directive({ selector: '[medFieldsetLegend]', standalone: true })
export class FieldsetLegendDirective {}
