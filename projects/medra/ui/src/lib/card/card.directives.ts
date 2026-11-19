import { Directive } from '@angular/core';

/**
 * Marker directives for Card's named content-projection slots
 * (`<div medCardHeader>`/`<div medCardFooter>`/`<div medCardTitle>`/
 * `<div medCardSubtitle>`). Deliberately trivial — the same attribute
 * selector is used both to route `<ng-content select="...">` and, via
 * `contentChild()` in `CardComponent`, to detect whether a slot was
 * actually provided (so the footer's border/padding isn't drawn for a
 * footer-less card, and the plain-string `title()`/`subtitle()` fallback
 * doesn't double-render alongside a rich slot).
 */
@Directive({ selector: '[medCardHeader]', standalone: true })
export class CardHeaderDirective {}

@Directive({ selector: '[medCardFooter]', standalone: true })
export class CardFooterDirective {}

/** Rich alternative to the plain-string `title` input — an icon, a Badge, a link, whatever the card needs; unstyled, same as `medCardHeader`/`medCardFooter`. */
@Directive({ selector: '[medCardTitle]', standalone: true })
export class CardTitleDirective {}

/** Rich alternative to the plain-string `subtitle` input, same idea as `medCardTitle`. */
@Directive({ selector: '[medCardSubtitle]', standalone: true })
export class CardSubtitleDirective {}
