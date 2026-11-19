import { ChangeDetectionStrategy, Component, TemplateRef, booleanAttribute, contentChild, input, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

/**
 * One panel of a `<med-tabs>` group: `<med-tabs><med-tab header="...">
 * content</med-tab></med-tabs>`. Visibility, ARIA linking (`id`/
 * `aria-labelledby`) are pushed in by the parent `TabsComponent` (via its
 * `contentChildren(TabComponent)` query calling `.set()` on the signals
 * below) rather than `TabComponent` looking up its parent — one-directional
 * data flow, and it avoids a circular import between the two files.
 * **Not meant to be set directly by consumers.**
 *
 * **Lazy content (added 2026-09-08)**: plain projected
 * content (`<med-tab header="...">actual content</med-tab>`, the default
 * shown above) is instantiated by the *consumer's* template the moment
 * `<med-tabs>` itself renders — content projection has no concept of
 * deferred instantiation, wrapping `<ng-content>` in an `@if` here only
 * controls whether *already-created* content gets inserted into the DOM,
 * not whether creating it (and running its own change detection) was
 * skipped. Genuine lazy rendering needs the content to be a `TemplateRef`
 * instead, which Angular never instantiates until something explicitly
 * asks it to: wrap a tab's content in a plain `<ng-template>` —
 * `<med-tab header="Reports"><ng-template>...expensive content...
 * </ng-template></med-tab>` — and this component picks it up via
 * `contentChild(TemplateRef)`, rendering it through `NgTemplateOutlet`
 * only once `active()` has been `true` at least once (`everActive()`, which
 * latches via a plain mutated field rather than a signal/`effect()` — a
 * method invoked directly from a template `@if` runs synchronously within
 * the same change-detection pass that flips `active()`, whereas a second
 * `effect()` reacting to it would only flush on Angular's own microtask
 * scheduler, one tick later than this component's own template update;
 * switching away and back never re-creates it, once latched). No separate
 * `lazy` boolean input: the `<ng-template>` wrapper *is* the opt-in, and a
 * `<med-tab>` that never uses one keeps today's eager-projection behavior
 * completely unchanged.
 */
@Component({
  selector: 'med-tab',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'tabpanel',
    tabindex: '0',
    '[hidden]': '!active()',
    '[id]': 'panelId()',
    '[attr.aria-labelledby]': 'tabButtonId()',
  },
  template: `
    @if (contentTemplate(); as template) {
      @if (everActive()) {
        <ng-container [ngTemplateOutlet]="template" />
      }
    } @else {
      <ng-content />
    }
  `,
})
export class TabComponent {
  readonly header = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly active = signal(false);
  readonly panelId = signal('');
  readonly tabButtonId = signal('');

  protected readonly contentTemplate = contentChild(TemplateRef);
  private hasBeenActive = false;

  /** Plain mutated field, not a signal — see the class doc comment for why this needs to run synchronously inside the template read instead of a separate `effect()`. */
  protected everActive(): boolean {
    if (this.active()) {
      this.hasBeenActive = true;
    }
    return this.hasBeenActive;
  }
}
