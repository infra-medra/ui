import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  booleanAttribute,
  computed,
  contentChild,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { mergeClasses } from '../utils/merge-classes';

/**
 * Small pill representing an entity (Tier 2, sixth item of the
 * "InputNumber, Password, ConfirmDialog, Toolbar, Accordion, Chip, ..." batch).
 * Label content is projected (`<ng-content>`), same convention as Tag/Badge —
 * not a `label` string input — so consumers can put rich content inside it.
 * `image` (avatar-style, bleeds to the pill's edge) takes priority over
 * `icon` when both are set, same fallback order as Avatar — including
 * falling through to `icon()` (or nothing) once `image()` fails to load,
 * same `(error)` + "last URL that failed" signal pattern as Avatar's own
 * `onImageError`, instead of leaving the browser's broken-image glyph
 * sitting in a pill that was never built to make room for it.
 *
 * **Only the explicit remove `<button>` is interactive**, not the whole chip host — same
 * native-button-only pattern already used for Select's clear button and Message's close button. A
 * real `<button>` already gets Enter/Space-activates-click for free, so the only key this component
 * still has to handle itself is Backspace (`(keydown.backspace)`, with its own `preventDefault()`
 * so the behavior doesn't depend on some ancestor doing it) — emitted through the same `removed`
 * output as a click, now typed `MouseEvent | KeyboardEvent` accordingly. `InputChipsComponent`
 * branches on the event's runtime type to keep its own roving-focus Backspace/Delete model
 * (`onChipKeydown`) from double-removing the same chip: it still owns `Delete` and arrow-key
 * navigation (this component has no opinion on either), but no longer duplicates the `Backspace`
 * case now that this bubbles up through `removed` either way.
 *
 * **`#removeicon`**: a named `TemplateRef<void>` slot (exact same name, no
 * context), replacing the fixed `x-mark` icon when projected — same
 * named-`contentChild` idiom Carousel's `#previousicon`/`#nexticon`
 * already use.
 */
@Component({
  selector: 'med-chip',
  standalone: true,
  imports: [IconComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <span [class]="chipClass()">
      @if (showsImage()) {
        <img [src]="image()" [alt]="imageAlt()" class="size-6 shrink-0 rounded-full object-cover" (error)="onImageError()" />
      } @else if (icon()) {
        <med-icon [name]="icon()!" variant="mini" class="size-4 shrink-0" />
      }
      <span class="truncate">
        @if (label() !== null) {
          {{ label() }}
        } @else {
          <ng-content />
        }
      </span>
      @if (removable()) {
        <button
          #removeButton
          type="button"
          class="shrink-0 rounded-full p-0.5 text-surface-500 hover:bg-surface-200 hover:text-surface-700 focus-visible:outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-brand-500 dark:text-surface-400 dark:hover:bg-surface-700 dark:hover:text-surface-100"
          [attr.aria-label]="removeLabel()"
          (click)="removed.emit($event)"
          (keydown.backspace)="onRemoveBackspace($event)"
        >
          @if (removeIconTemplate(); as tpl) {
            <ng-container [ngTemplateOutlet]="tpl" />
          } @else {
            <med-icon name="x-mark" variant="mini" class="size-3.5" />
          }
        </button>
      }
    </span>
  `,
})
export class ChipComponent {
  readonly label = input<string | null>(null);
  readonly icon = input<string | null>(null);
  readonly image = input<string | null>(null);
  readonly imageAlt = input('');
  readonly removable = input(false, { transform: booleanAttribute });
  /** Default: `'Remove'` — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly removeLabel = input('Remove');
  readonly class = input('', { alias: 'class' });

  /** Emits the remove button's own click or Backspace keydown — `MultiSelectComponent`'s `display="chip"` mode needs `event.stopPropagation()` to keep removing a chip from also toggling its own trigger's dropdown (a real DOM click still bubbles through the chip into whatever contains it, independent of this output). Existing `(removed)="handler()"` consumers that ignore the payload (InputChips does) are unaffected. */
  readonly removed = output<MouseEvent | KeyboardEvent>();

  private readonly removeButtonRef = viewChild<ElementRef<HTMLButtonElement>>('removeButton');
  protected readonly removeIconTemplate = contentChild('removeicon', { read: TemplateRef });

  /** Focuses the remove button, if this chip is `removable` — a no-op otherwise. Lets a consumer (InputChips' roving keyboard model) move focus directly onto a chip without reaching into its internal DOM. */
  focusRemoveButton(): void {
    this.removeButtonRef()?.nativeElement.focus();
  }

  /** `Event`, not `KeyboardEvent`: Angular's template checker doesn't narrow `$event` from a `(keydown.backspace)` binding past the base `Event` type. */
  protected onRemoveBackspace(event: Event): void {
    event.preventDefault();
    this.removed.emit(event as KeyboardEvent);
  }

  private readonly failedImageUrl = signal<string | null>(null);
  /** True once `image()` fails to load — automatically resets if `image()` is later set to a different (or new attempt at the same) URL, same self-clearing signal shape as Avatar's `imageFailed`. */
  protected readonly imageFailed = computed(() => this.image() !== null && this.failedImageUrl() === this.image());
  protected readonly showsImage = computed(() => !!this.image() && !this.imageFailed());

  protected readonly chipClass = computed(() =>
    mergeClasses(
      'inline-flex items-center gap-1.5 rounded-full bg-surface-100 py-1 pr-2.5 text-sm font-medium text-surface-900 dark:bg-surface-800 dark:text-surface-50',
      this.showsImage() ? 'pl-1' : 'pl-2.5',
      this.class(),
    ),
  );

  protected onImageError(): void {
    this.failedImageUrl.set(this.image());
  }
}
