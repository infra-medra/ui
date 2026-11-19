import { Directive, computed, input } from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';

/** The small, always-visible top label inside `<med-ifta-label>` — `<label medIftaLabelText for="...">`. */
@Directive({
  selector: '[medIftaLabelText]',
  standalone: true,
  host: { '[class]': 'hostClass()' },
})
export class IftaLabelTextDirective {
  readonly class = input('', { alias: 'class' });

  protected readonly hostClass = computed(() => mergeClasses('text-xs text-surface-500 dark:text-surface-400', this.class()));
}
