import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { mergeClasses } from '../utils/merge-classes';
import { ButtonSeverity, FILLED_SEVERITY_CLASSES } from '../button/button.styles';

/**
 * Small solid status label (Tier 1). Reuses Button's own filled/severity
 * color classes (`FILLED_SEVERITY_CLASSES`) — same solid look, just on a
 * non-interactive `<span>` instead of a `<button>`.
 *
 * `icon` is a leading Heroicons name, same convention `ChipComponent.icon` already uses. **No
 * `iconTemplate` slot**: a custom icon is already what `<ng-content>` is for (project any custom
 * icon markup directly instead of/alongside the label), so a second projection mechanism would just
 * duplicate it, same reasoning already documented for `ButtonDirective`'s dropped `badge` input.
 *
 * `value` is a plain-string alternative to `<ng-content>` for the label, for callers building tags
 * from data (`*ngFor` over `{ value, severity }`) where a bound `[value]` reads better than `>{{
 * item.value }}<`. Both render if both are supplied (this is a convenience input, not a
 * mutually-exclusive mode switch), though real usage picks one or the other.
 */
@Component({
  selector: 'med-tag',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <span [class]="tagClass()">
      @if (icon()) {
        <med-icon [name]="icon()!" variant="mini" class="size-3.5 shrink-0" />
      }
      <ng-content />
      {{ value() }}
    </span>
  `,
})
export class TagComponent {
  readonly severity = input<ButtonSeverity>('primary');
  readonly pill = input(false, { transform: booleanAttribute });
  readonly icon = input<string | null>(null);
  readonly value = input<string | null>(null);
  readonly class = input('', { alias: 'class' });

  protected readonly tagClass = computed(() =>
    mergeClasses(
      'inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium',
      this.pill() ? 'rounded-full' : '',
      FILLED_SEVERITY_CLASSES[this.severity()],
      this.class(),
    ),
  );
}
