import { Directive } from '@angular/core';

/**
 * Marker directive for `AccordionTabComponent`'s rich-header content-
 * projection slot (`<span medAccordionTabHeader>`) — same trivial marker-
 * directive convention as Card's `medCardTitle`/`medCardSubtitle` and
 * Fieldset's `medFieldsetLegend`: the selector both routes
 * `<ng-content select="[medAccordionTabHeader]">` and, via `contentChild()`
 * in `AccordionTabComponent`, detects whether a slot was actually
 * provided, so the plain-string `header()` fallback doesn't double-render
 * alongside it.
 */
@Directive({ selector: '[medAccordionTabHeader]', standalone: true })
export class AccordionTabHeaderDirective {}
