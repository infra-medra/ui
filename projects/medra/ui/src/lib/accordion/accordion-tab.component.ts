import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, computed, contentChild, inject, input, signal, viewChild } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { mergeClasses } from '../utils/merge-classes';
import { AccordionHost } from './accordion.tokens';
import { AccordionTabHeaderDirective } from './accordion-tab.directives';

/**
 * One panel of a `<med-accordion>` group:
 * `<med-accordion><med-accordion-tab header="...">content</med-accordion-tab></med-accordion>`.
 * Unlike `TabComponent` (header rendered centrally by `TabsComponent`, only
 * one panel ever visible), this renders its *own* header button and body —
 * Accordion panels can be visible simultaneously (`multiple` mode), so each
 * one's content has to sit directly under its own header in the DOM.
 * `expanded`/`panelId`/`headerButtonId`/`expandIcon`/`collapseIcon` are
 * pushed in by the parent `AccordionComponent` (same one-directional
 * convention as `TabComponent`);
 * header interaction goes back up through `AccordionHost` instead (see its
 * doc for why). **Not meant to be set directly by consumers.**
 *
 * **`medAccordionTabHeader` slot**: a rich header is free projected markup, not just a string
 * `@Input()`. This component combines header + body into one (`<ng-content>` already covers the
 * body), so a *second* projection mechanism for the header specifically is needed instead of
 * reusing `<ng-content>` — the same rich-alternative-to-a-plain-string-input marker-directive
 * convention Card's `medCardTitle` and Fieldset's `medFieldsetLegend` already established
 * component-with-bare-ng-content shape (this library's Accordion doesn't split header/content into
 * sibling components). `header()` becomes optional as a result — a rich header fully replaces it,
 * same as Fieldset's `legend()`.
 */
@Component({
  selector: 'med-accordion-tab',
  standalone: true,
  imports: [IconComponent, AccordionTabHeaderDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block border-b border-surface-200 last:border-b-0 dark:border-surface-700' },
  template: `
    <h3>
      <button
        #headerButton
        type="button"
        [id]="headerButtonId()"
        [attr.aria-expanded]="expanded()"
        [attr.aria-controls]="panelId()"
        [attr.aria-disabled]="disabled() ? 'true' : null"
        [class]="headerButtonClass()"
        (click)="onClick()"
        (keydown)="onKeydown($event)"
      >
        <med-icon [name]="iconName()" variant="mini" [class]="chevronClass()" />
        <ng-content select="[medAccordionTabHeader]" />
        @if (!hasHeaderSlot() && header()) {
          {{ header() }}
        }
      </button>
    </h3>
    <div [id]="panelId()" [hidden]="!expanded()" [attr.aria-labelledby]="headerButtonId()" class="p-4 text-sm text-surface-700 dark:text-surface-200">
      <ng-content />
    </div>
  `,
})
export class AccordionTabComponent {
  private readonly host = inject(AccordionHost);
  private readonly headerButtonRef = viewChild.required<ElementRef<HTMLButtonElement>>('headerButton');

  readonly header = input('');
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly headerSlot = contentChild(AccordionTabHeaderDirective);
  protected readonly hasHeaderSlot = computed(() => !!this.headerSlot());

  readonly expanded = signal(false);
  readonly panelId = signal('');
  readonly headerButtonId = signal('');
  readonly expandIcon = signal('chevron-down');
  readonly collapseIcon = signal('chevron-down');

  protected readonly headerButtonClass = computed(() =>
    mergeClasses(
      'flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-surface-900 transition-colors duration-(--transition-duration-base) dark:text-surface-50',
      this.disabled() ? 'cursor-not-allowed opacity-(--opacity-disabled)' : 'cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-700/50',
    ),
  );
  protected readonly iconName = computed(() => (this.expanded() ? this.collapseIcon() : this.expandIcon()));
  protected readonly chevronClass = computed(() => {
    const rotates = this.expandIcon() === this.collapseIcon();
    return mergeClasses(
      'size-4 shrink-0 transition-transform duration-(--transition-duration-base)',
      rotates && !this.expanded() ? '-rotate-90' : '',
    );
  });

  protected onClick(): void {
    this.host.requestToggle(this);
  }

  protected onKeydown(event: KeyboardEvent): void {
    this.host.requestFocusMove(event, this);
  }

  /** Called by `AccordionComponent` to move real DOM focus here during arrow-key cross-header navigation. */
  focus(): void {
    this.headerButtonRef().nativeElement.focus();
  }
}
