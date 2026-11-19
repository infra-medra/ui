import { Directive } from '@angular/core';

/**
 * Marker directives for Inplace's two named content-projection slots
 * (`<span medInplaceDisplay>`/`<div medInplaceContent>`) — same trivial
 * attribute-selector-only shape as Card's `medCardHeader`/`medCardFooter`
 * (see that file's doc), used only to route `<ng-content select="...">` to
 * the right one of the two mutually-exclusive views.
 */
@Directive({ selector: '[medInplaceDisplay]', standalone: true })
export class InplaceDisplayDirective {}

@Directive({ selector: '[medInplaceContent]', standalone: true })
export class InplaceContentDirective {}
