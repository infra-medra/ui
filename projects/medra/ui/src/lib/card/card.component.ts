import { ChangeDetectionStrategy, Component, computed, contentChild, input } from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';
import { CardFooterDirective, CardSubtitleDirective, CardTitleDirective } from './card.directives';

/**
 * Container primitive (Tier 1): rounded surface + optional title/subtitle +
 * default body content, with four named projection slots
 * (`<div medCardHeader>`, typically a full-bleed image banner — deliberately
 * unstyled/full-bleed, not padded like the body; `<div medCardFooter>`, an
 * actions row; `<div medCardTitle>`/`<div medCardSubtitle>`, rich
 * alternatives to the plain-string `title()`/`subtitle()` inputs, for a
 * heading that needs an icon, a Badge, or a link — same unstyled,
 * consumer-owns-the-markup philosophy as the header/footer slots, not a
 * `TemplateRef`/`ng-template` input; matches this component's own existing
 * projection-slot convention instead of introducing a second content
 * mechanism for just these two spots). The footer's border/padding, and
 * each string fallback, only render when their slot isn't actually
 * projected (see card.directives.ts) — otherwise a footer-less card would
 * draw an empty divider bar, and a rich `medCardTitle` would double up with
 * the plain `title()` heading underneath it.
 */
@Component({
  selector: 'med-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div [class]="cardClass()">
      <ng-content select="[medCardHeader]" />
      <div class="p-4">
        <ng-content select="[medCardTitle]" />
        @if (!hasTitleSlot() && title()) {
          <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-50">{{ title() }}</h3>
        }
        <ng-content select="[medCardSubtitle]" />
        @if (!hasSubtitleSlot() && subtitle()) {
          <p class="mt-1 text-sm text-surface-500 dark:text-surface-400">{{ subtitle() }}</p>
        }
        <div class="text-sm text-surface-700 dark:text-surface-200" [class.mt-3]="title() || subtitle() || hasTitleSlot() || hasSubtitleSlot()">
          <ng-content />
        </div>
      </div>
      <div [class]="footerClass()">
        <ng-content select="[medCardFooter]" />
      </div>
    </div>
  `,
})
export class CardComponent {
  readonly title = input<string | null>(null);
  readonly subtitle = input<string | null>(null);
  readonly class = input('', { alias: 'class' });

  private readonly footerContent = contentChild(CardFooterDirective);
  protected readonly hasFooter = computed(() => !!this.footerContent());
  private readonly titleContent = contentChild(CardTitleDirective);
  protected readonly hasTitleSlot = computed(() => !!this.titleContent());
  private readonly subtitleContent = contentChild(CardSubtitleDirective);
  protected readonly hasSubtitleSlot = computed(() => !!this.subtitleContent());

  protected readonly cardClass = computed(() =>
    mergeClasses(
      'overflow-hidden rounded-lg border border-surface-200 bg-surface-0 shadow-overlay-sm dark:border-surface-700 dark:bg-surface-800',
      this.class(),
    ),
  );
  protected readonly footerClass = computed(() =>
    this.hasFooter() ? 'border-t border-surface-200 px-4 py-3 dark:border-surface-700' : '',
  );
}
