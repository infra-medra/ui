import { Directive } from '@angular/core';

/**
 * Marker directives for Toolbar's named content-projection slots
 * (`<div medToolbarStart>`/`<div medToolbarCenter>`/`<div medToolbarEnd>`) —
 * same trivial-marker pattern as Card's header/footer directives, used only
 * to route `<ng-content select="...">`.
 */
@Directive({ selector: '[medToolbarStart]', standalone: true })
export class ToolbarStartDirective {}

@Directive({ selector: '[medToolbarCenter]', standalone: true })
export class ToolbarCenterDirective {}

@Directive({ selector: '[medToolbarEnd]', standalone: true })
export class ToolbarEndDirective {}
