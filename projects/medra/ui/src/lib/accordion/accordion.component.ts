import { ChangeDetectionStrategy, Component, booleanAttribute, computed, contentChildren, effect, input, model, output } from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';
import { AccordionTabComponent } from './accordion-tab.component';
import { AccordionHost, AccordionTabLike } from './accordion.tokens';

let nextAccordionId = 0;

/**
 * Accordion primitive (Tier 2). Panels are declared as real content
 * children (`<med-accordion><med-accordion-tab header="...">...</med-accordion-tab></med-accordion>`) —
 * see `AccordionTabComponent`'s doc for why each panel renders its own
 * header+body rather than this component centrally rendering headers the
 * way `TabsComponent` does, and `AccordionHost`'s doc for how a tab's
 * header click/keydown reaches back up to this component via DI instead of
 * a template event binding.
 *
 * `activeIndex` picks its value shape at runtime off `multiple()` (single:
 * `number | null`; multiple: `readonly number[]`) — same runtime-branching
 * choice DatePicker's `selectionMode` already established, rather than a
 * generic type parameter.
 *
 * Keyboard model follows the WAI-ARIA APG "Accordion" pattern: unlike Tabs'
 * roving-tabindex (only the active tab reachable via Tab), every header
 * here keeps its normal `tabindex="0"` — arrow keys (Up/Down/Home/End) are
 * an *additional* way to move focus between headers, not a replacement for
 * Tab, since multiple panels' content can be visible/relevant at once.
 *
 * **`opened`/`closed` and `expandIcon`/`collapseIcon`**, . These emit this library's own
 * bare-primitive payload (just the toggled index), the same convention already applied to
 * Fieldset's `beforeToggle`/`afterToggle`. Both only fire from an actual header interaction
 * (`requestToggle`), never from a programmatic `[(activeIndex)]` write — matches the reference
 * library's own real behavior (its `onOpen`/`onClose` only fire from the header's click handler
 * too, not from any `value` setter).
 *
 * The default (no `expandIcon`/`collapseIcon` set) rotates a single `chevron-down` glyph -90°,
 * matching the rotated-chevron convention Panel/Fieldset/Tabs already use. Passing different
 * `expandIcon`/`collapseIcon` values opts out of the rotation (swapping to two distinct icons and
 * rotating one of them rarely makes visual sense) and swaps the actual icon name per state instead.
 * Icons use this library's own icon system, an `IconComponent` `name` string, the same
 * plain-string-with-a-sane-default convention `DataViewComponent`'s `loadingIcon` already
 * established.
 */
@Component({
  selector: 'med-accordion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
  providers: [{ provide: AccordionHost, useExisting: AccordionComponent }],
  template: `<ng-content />`,
})
export class AccordionComponent implements AccordionHost {
  readonly multiple = input(false, { transform: booleanAttribute });
  readonly activeIndex = model<number | readonly number[] | null>(null);
  readonly class = input('', { alias: 'class' });
  readonly expandIcon = input('chevron-down');
  readonly collapseIcon = input('chevron-down');
  readonly opened = output<number>();
  readonly closed = output<number>();

  private readonly instanceId = nextAccordionId++;
  protected readonly tabs = contentChildren(AccordionTabComponent);

  protected readonly hostClass = computed(() =>
    mergeClasses('block overflow-hidden rounded-lg border border-surface-200 dark:border-surface-700', this.class()),
  );

  constructor() {
    effect(() => {
      const tabs = this.tabs();
      tabs.forEach((tab, i) => {
        tab.panelId.set(this.panelId(i));
        tab.headerButtonId.set(this.headerButtonId(i));
        tab.expanded.set(this.isExpanded(i));
        tab.expandIcon.set(this.expandIcon());
        tab.collapseIcon.set(this.collapseIcon());
      });
    });
  }

  requestToggle(tab: AccordionTabLike): void {
    const tabs = this.tabs();
    const index = tabs.indexOf(tab as AccordionTabComponent);
    if (index === -1 || tab.disabled()) {
      return;
    }
    const wasExpanded = this.isExpanded(index);
    if (this.multiple()) {
      const active = (this.activeIndex() as readonly number[] | null) ?? [];
      this.activeIndex.set(active.includes(index) ? active.filter((i) => i !== index) : [...active, index]);
    } else {
      const active = this.activeIndex() as number | null;
      this.activeIndex.set(active === index ? null : index);
    }
    (wasExpanded ? this.closed : this.opened).emit(index);
  }

  requestFocusMove(event: KeyboardEvent, tab: AccordionTabLike): void {
    const tabs = this.tabs();
    const currentIndex = tabs.indexOf(tab as AccordionTabComponent);
    const enabled = tabs.map((t, i) => (t.disabled() ? -1 : i)).filter((i) => i !== -1);
    if (enabled.length === 0) {
      return;
    }

    const position = enabled.indexOf(currentIndex);
    let targetIndex: number | null = null;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        targetIndex = enabled[(position + 1 + enabled.length) % enabled.length];
        break;
      case 'ArrowUp':
        event.preventDefault();
        targetIndex = enabled[(position - 1 + enabled.length) % enabled.length];
        break;
      case 'Home':
        event.preventDefault();
        targetIndex = enabled[0];
        break;
      case 'End':
        event.preventDefault();
        targetIndex = enabled[enabled.length - 1];
        break;
    }

    if (targetIndex !== null) {
      tabs[targetIndex]?.focus();
    }
  }

  private panelId(index: number): string {
    return `med-accordion-${this.instanceId}-panel-${index}`;
  }

  private headerButtonId(index: number): string {
    return `med-accordion-${this.instanceId}-header-${index}`;
  }

  private isExpanded(index: number): boolean {
    const active = this.activeIndex();
    return this.multiple() ? Array.isArray(active) && active.includes(index) : active === index;
  }
}
