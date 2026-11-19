import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChild,
  forwardRef,
  input,
  numberAttribute,
  signal,
  viewChildren,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { mergeClasses } from '../utils/merge-classes';
import { ACTIVE_STAR_CLASS, INACTIVE_STAR_CLASS, RatingSize, STAR_ICON_SIZE_CLASS, starButtonVariants } from './rating.styles';

/**
 * Rating primitive (Tier 3, first item). A row of stars acting as a single
 * discrete value (`number | null`, 1-based), not a free scalar — same
 * `role="radiogroup"` of `role="radio"` options + roving tabindex + arrow-key
 * automatic activation already established for SelectButton's single mode
 * (there is no official WAI-ARIA APG "Rating" pattern; a radiogroup of N
 * discrete choices is the closest fit, and this codebase already has that
 * model built out). Clicking the already-selected star is a no-op, same
 * radio semantics precedent as SelectButton/RadioButton — it never
 * "toggles off" on its own.
 *
 * `cancel` (default `true`, matching the common expectation that a rating
 * can be cleared) adds one more radio option *before* the stars — a small
 * clear affordance representing "no rating" (`null`) — instead of breaking
 * radio semantics by making a re-click on the selected star deselect it.
 * It participates in the exact same roving-tabindex/arrow-key group as the
 * stars, just one more position in the row.
 *
 * `readonly` renders a static, non-interactive summary instead (`role="img"`
 * with a text-equivalent `aria-label`, e.g. "4 out of 5 stars") — for
 * displaying an existing rating (a product card, a review list) that isn't
 * being edited, a row of fake-looking buttons nobody can activate is worse
 * than a plain image-like readout (same reasoning already used for
 * Skeleton's `aria-hidden`, applied to the opposite case: here there *is*
 * something worth announcing).
 *
 * `allowHalf` lets a star be half-filled by clicking/hovering its left half
 * (via the pointer's position within the star's own bounding rect) —
 * committing a `x.5` value. Half-star *rendering* itself isn't gated behind
 * this flag: any fractional value the component is given (via `writeValue`,
 * a bound `FormControl`, or a click) always renders as a half star, so a
 * readonly average-rating display (e.g. `4.5`) shows correctly even without
 * `allowHalf` — the input only controls whether *interactive* clicking can
 * *produce* a `.5` value. Keyboard navigation deliberately stays whole-star
 * (arrow keys still move the roving tabindex one star at a time, same as
 * before `allowHalf` existed): half-star selection is pointer/touch-only,
 * matching how this pattern is commonly built elsewhere — extending the
 * radiogroup's keyboard model to half-steps isn't a dead end, but doing it
 * without breaking the existing whole-star roving-tabindex semantics would
 * need its own widget model (closer to a slider than a radiogroup), not a
 * small addition on top of this one.
 */
@Component({
  selector: 'med-rating',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block' },
  imports: [IconComponent, NgTemplateOutlet],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingComponent),
      multi: true,
    },
  ],
  template: `
    <div [class]="groupClass()" [attr.role]="readonly() ? 'img' : 'radiogroup'" [attr.aria-label]="groupAriaLabel()">
      @if (readonly()) {
        @for (star of starIndexes(); track star) {
          @switch (starState(star)) {
            @case ('full') {
              @if (oniconTemplate(); as tpl) {
                <ng-container [ngTemplateOutlet]="tpl" />
              } @else {
                <med-icon name="star" variant="solid" [class]="starIconClass(true)" />
              }
            }
            @case ('half') {
              <span class="relative inline-flex">
                @if (officonTemplate(); as tpl) {
                  <ng-container [ngTemplateOutlet]="tpl" />
                } @else {
                  <med-icon name="star" variant="outline" [class]="starIconClass(false)" />
                }
                <span class="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
                  @if (oniconTemplate(); as tpl) {
                    <ng-container [ngTemplateOutlet]="tpl" />
                  } @else {
                    <med-icon name="star" variant="solid" [class]="starIconClass(true)" />
                  }
                </span>
              </span>
            }
            @default {
              @if (officonTemplate(); as tpl) {
                <ng-container [ngTemplateOutlet]="tpl" />
              } @else {
                <med-icon name="star" variant="outline" [class]="starIconClass(false)" />
              }
            }
          }
        }
      } @else {
        @if (cancel()) {
          <button
            #optionButton
            type="button"
            role="radio"
            [attr.aria-checked]="isSelected(null)"
            [attr.aria-label]="clearLabel()"
            [attr.aria-disabled]="isDisabled() ? 'true' : null"
            [tabIndex]="tabIndexFor(0)"
            [class]="buttonClass()"
            (click)="select(null)"
            (mouseenter)="setHoverClear()"
            (mouseleave)="clearHover()"
            (keydown)="onKeydown($event, 0)"
          >
            @if (canceliconTemplate(); as tpl) {
              <ng-container [ngTemplateOutlet]="tpl" />
            } @else {
              <med-icon name="x-mark" variant="mini" [class]="clearIconClass()" />
            }
          </button>
        }
        @for (star of starIndexes(); track star) {
          <button
            #optionButton
            type="button"
            role="radio"
            [attr.aria-checked]="isChecked(star)"
            [attr.aria-label]="starLabel(star)"
            [attr.aria-disabled]="isDisabled() ? 'true' : null"
            [tabIndex]="tabIndexFor(indexFor(star))"
            [class]="buttonClass()"
            (click)="select(starValueFromEvent(star, $event))"
            (mouseenter)="setHoverStar(star, $event)"
            (mousemove)="setHoverStar(star, $event)"
            (mouseleave)="clearHover()"
            (keydown)="onKeydown($event, indexFor(star))"
          >
            @switch (starState(star)) {
              @case ('full') {
                @if (oniconTemplate(); as tpl) {
                  <ng-container [ngTemplateOutlet]="tpl" />
                } @else {
                  <med-icon name="star" variant="solid" [class]="starIconClass(true)" />
                }
              }
              @case ('half') {
                <span class="relative inline-flex">
                  @if (officonTemplate(); as tpl) {
                    <ng-container [ngTemplateOutlet]="tpl" />
                  } @else {
                    <med-icon name="star" variant="outline" [class]="starIconClass(false)" />
                  }
                  <span class="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
                    @if (oniconTemplate(); as tpl) {
                      <ng-container [ngTemplateOutlet]="tpl" />
                    } @else {
                      <med-icon name="star" variant="solid" [class]="starIconClass(true)" />
                    }
                  </span>
                </span>
              }
              @default {
                @if (officonTemplate(); as tpl) {
                  <ng-container [ngTemplateOutlet]="tpl" />
                } @else {
                  <med-icon name="star" variant="outline" [class]="starIconClass(false)" />
                }
              }
            }
          </button>
        }
      }
    </div>
  `,
})
export class RatingComponent implements ControlValueAccessor {
  readonly stars = input(5, { transform: numberAttribute });
  readonly cancel = input(true, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly size = input<RatingSize>('default');
  readonly ariaLabel = input<string | null>(null);
  readonly clearLabel = input('Clear rating');
  readonly allowHalf = input(false, { transform: booleanAttribute });
  readonly class = input('', { alias: 'class' });

  protected readonly oniconTemplate = contentChild<TemplateRef<unknown>>('onicon');
  protected readonly officonTemplate = contentChild<TemplateRef<unknown>>('officon');
  protected readonly canceliconTemplate = contentChild<TemplateRef<unknown>>('cancelicon');

  private readonly value = signal<number | null>(null);
  private readonly formsDisabled = signal(false);
  /** `undefined` = not hovering (fall back to the committed value); `null` = hovering the clear option (preview zero stars). */
  private readonly hoverValue = signal<number | null | undefined>(undefined);
  protected readonly isDisabled = computed(() => this.disabled() || this.formsDisabled());
  protected readonly starIndexes = computed(() => Array.from({ length: this.stars() }, (_, i) => i + 1));

  private readonly optionButtons = viewChildren<ElementRef<HTMLButtonElement>>('optionButton');

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly groupClass = computed(() => mergeClasses('inline-flex items-center gap-0.5', this.class()));
  protected readonly buttonClass = computed(() => starButtonVariants({ size: this.size() }));
  protected readonly clearIconClass = computed(() => mergeClasses(STAR_ICON_SIZE_CLASS[this.size()], 'text-surface-400 dark:text-surface-500'));

  protected readonly groupAriaLabel = computed(() => {
    if (!this.readonly()) {
      return this.ariaLabel();
    }
    return this.ariaLabel() ?? `${this.value() ?? 0} out of ${this.stars()} stars`;
  });

  protected isSelected(position: number | null): boolean {
    return this.value() === position;
  }

  /** `Math.ceil` maps a half value (e.g. `3.5`) onto the star that visually "owns" it (star 4). Reduces to plain equality for whole values, so this is a no-op change when `allowHalf` is never used. */
  protected isChecked(star: number): boolean {
    const value = this.value();
    return value !== null && Math.ceil(value) === star;
  }

  /**
   * Whether `star` renders full, half, or empty. Reads from the hover preview
   * when present, otherwise the committed value. Not gated behind
   * `allowHalf()` — any fractional value the component is given renders as a
   * half star regardless of that input (see the class doc comment).
   */
  protected starState(star: number): 'full' | 'half' | 'empty' {
    const hover = this.hoverValue();
    const current = hover === undefined ? this.value() : hover;
    if (current === null) {
      return 'empty';
    }
    if (current >= star) {
      return 'full';
    }
    if (current > star - 1) {
      return 'half';
    }
    return 'empty';
  }

  protected starIconClass(active: boolean): string {
    return mergeClasses(STAR_ICON_SIZE_CLASS[this.size()], active ? ACTIVE_STAR_CLASS : INACTIVE_STAR_CLASS);
  }

  /** Announces the actual half value on the star that owns it (e.g. "3.5 stars" on star 4's button) instead of always the whole star number. */
  protected starLabel(star: number): string {
    const value = this.value();
    if (value !== null && !Number.isInteger(value) && Math.ceil(value) === star) {
      return `${value} star${value === 1 ? '' : 's'}`;
    }
    return `${star} star${star === 1 ? '' : 's'}`;
  }

  /** Position of `star` in the roving-tabindex row: the clear option (if any) always sits at index 0. */
  protected indexFor(star: number): number {
    return this.cancel() ? star : star - 1;
  }

  /** Half-aware value a pointer event on `star`'s button represents: its left half when `allowHalf()`, else always the whole star. */
  protected starValueFromEvent(star: number, event: MouseEvent): number {
    if (!this.allowHalf()) {
      return star;
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const isLeftHalf = rect.width > 0 && event.clientX - rect.left < rect.width / 2;
    return isLeftHalf ? star - 0.5 : star;
  }

  protected setHoverStar(star: number, event: MouseEvent): void {
    if (this.isDisabled()) {
      return;
    }
    this.hoverValue.set(this.starValueFromEvent(star, event));
  }

  protected setHoverClear(): void {
    if (this.isDisabled()) {
      return;
    }
    this.hoverValue.set(null);
  }

  protected clearHover(): void {
    this.hoverValue.set(undefined);
  }

  protected tabIndexFor(index: number): number {
    if (this.isDisabled()) {
      return -1;
    }
    const total = this.stars() + (this.cancel() ? 1 : 0);
    const value = this.value();
    // Math.ceil maps a half value (e.g. 3.5) onto the star that owns it (star 4), same as isChecked().
    const selectedIndex = value === null ? (this.cancel() ? 0 : -1) : this.indexFor(Math.ceil(value));
    const activeIndex = selectedIndex >= 0 && selectedIndex < total ? selectedIndex : 0;
    return index === activeIndex ? 0 : -1;
  }

  protected select(position: number | null): void {
    if (this.isDisabled()) {
      return;
    }
    this.onTouched();
    if (this.value() === position) {
      return;
    }
    this.value.set(position);
    this.onChange(position);
  }

  protected onKeydown(event: KeyboardEvent, currentIndex: number): void {
    const total = this.stars() + (this.cancel() ? 1 : 0);
    let targetIndex: number | null = null;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        targetIndex = (currentIndex + 1) % total;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        targetIndex = (currentIndex - 1 + total) % total;
        break;
      case 'Home':
        event.preventDefault();
        targetIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        targetIndex = total - 1;
        break;
    }

    if (targetIndex === null) {
      return;
    }
    const position = this.cancel() ? (targetIndex === 0 ? null : targetIndex) : targetIndex + 1;
    this.select(position);
    this.optionButtons()[targetIndex]?.nativeElement.focus();
  }

  writeValue(value: number | null | undefined): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formsDisabled.set(isDisabled);
  }
}
