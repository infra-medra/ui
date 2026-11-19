import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, booleanAttribute, computed, forwardRef, inject, input, signal, viewChild, viewChildren } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ChipComponent } from '../chip/chip.component';
import { mergeClasses } from '../utils/merge-classes';
import { InputChipsSize, inputChipsWrapperVariants } from './input-chips.styles';

/**
 * InputChips primitive (Tier 3): a text field that turns each committed
 * entry into a `ChipComponent` instead of holding one string — value is
 * `readonly string[]`, not the generic `T[]` MultiSelect uses, since there's
 * no option list here to resolve a richer type from (a scope cut, not a
 * dead end — MultiSelect already covers "pick many from a known set";
 * this is "type your own list", string only, for v1).
 *
 * **Only `Enter` commits the current text as a new chip** (`Backspace` on an
 * empty field removes the last one) — no comma/semicolon splitting of
 * pasted text into multiple chips at once, same kind of scope trim already
 * documented for AutoComplete's `forceSelection` and Chip's own "not a
 * focusable widget with Backspace/Enter handling" cut (which is exactly why
 * that handling lives here, on the real `<input>`, instead of on the chips
 * themselves).
 *
 * Each rendered chip reuses `ChipComponent` unchanged, `removable` with its
 * own `removeLabel` set per-chip (`'Remove ' + tag`) — no new removal
 * affordance invented here, just `ChipComponent`'s existing per-instance
 * `@Input()` used the way it was already designed to be used.
 *
 * The wrapper is a styled `<div>`, not the focusable element itself — real
 * `<input>` inside it (unstyled, flows with the chips) is what actually
 * takes focus and typing; `inputChipsWrapperVariants` drives its look off
 * `:focus-within` accordingly (see input-chips.styles.ts for why that isn't
 * just a reuse of `inputTextVariants`).
 *
 * **Keyboard path to remove a non-last chip (Wave 2 fix):** each chip's own
 * remove `<button>` (`ChipComponent`'s `removable` affordance) was already
 * Tab-reachable one at a time, but ArrowLeft from the input — ArrowRight
 * back — now moves focus directly between chips instead, and Delete/
 * Backspace removes whichever chip is currently focused, not just the last
 * one. This is `ChipComponent`'s own remove button being roved between
 * (`viewChildren(ChipComponent)` + `ChipComponent.focusRemoveButton()`), not
 * a parallel focus target invented here — same "reuse the existing
 * interactive affordance, just make it reachable a different way" shape
 * `DockComponent`'s own roving-tabindex fix used for its item buttons.
 *
 * **`aria-live` for chip changes (Wave 2 fix):** a visually-hidden
 * `aria-live="polite"` region announces each add/remove — without it, a
 * screen reader user committing or removing a chip gets no confirmation
 * beyond whatever incidental focus movement happens to land on, since the
 * chip list itself has no `role="list"`/live-region semantics of its own.
 */
@Component({
  selector: 'med-input-chips',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [ChipComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputChipsComponent),
      multi: true,
    },
  ],
  template: `
    <div [class]="wrapperClass()" (click)="focusInput()">
      @for (tag of value(); track tag + '-' + $index; let i = $index) {
        <med-chip removable [removeLabel]="'Remove ' + tag" (removed)="onChipRemoved($event, i)" (keydown)="onChipKeydown($event, i)">{{ tag }}</med-chip>
      }
      <input
        #input
        type="text"
        [value]="draft()"
        [placeholder]="value().length === 0 ? placeholder() : ''"
        [disabled]="isDisabled()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        class="min-w-16 flex-1 border-0 bg-transparent p-0 text-inherit text-surface-900 outline-none placeholder:text-surface-400 disabled:cursor-not-allowed dark:text-surface-50 dark:placeholder:text-surface-500"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
        (blur)="onTouched()"
      />
    </div>
    <span class="sr-only" aria-live="polite">{{ liveMessage() }}</span>
  `,
})
export class InputChipsComponent implements ControlValueAccessor {
  readonly placeholder = input('');
  readonly size = input<InputChipsSize>('default');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | null>(null);
  /** Default: `false` — a repeated exact entry is rejected (Enter becomes a no-op, text stays put so the user can edit or delete it). */
  readonly allowDuplicates = input(false, { transform: booleanAttribute });
  /** Default: `null` (no limit). Once reached, `Enter` is a no-op the same way a rejected duplicate is. */
  readonly max = input<number | null>(null);
  /** Default: `false`. When `true`, Tab also commits the current draft as a chip (same rules as Enter — a duplicate/over-max/empty draft is a no-op) *without* blocking Tab's own default focus-move; the browser moves focus on exactly as it would have anyway. */
  readonly addOnTab = input(false, { transform: booleanAttribute });
  readonly separator = input<string | RegExp | null>(null);
  readonly class = input('', { alias: 'class' });

  protected readonly value = signal<readonly string[]>([]);
  protected readonly draft = signal('');
  /** Visually-hidden `aria-live="polite"` announcement text for the most recent add/remove (Wave 2 fix). */
  protected readonly liveMessage = signal('');
  private readonly formsDisabled = signal(false);

  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('input');
  /** One entry per rendered chip, in the same order as `value()` — used to move roving keyboard focus onto a chip's own remove button (Wave 2 fix). */
  private readonly chipRefs = viewChildren(ChipComponent);
  private readonly cdr = inject(ChangeDetectorRef);

  private onChange: (value: readonly string[]) => void = () => {};
  protected onTouched: () => void = () => {};
  protected readonly isDisabled = computed(() => this.disabled() || this.formsDisabled());

  protected readonly wrapperClass = computed(() =>
    mergeClasses(inputChipsWrapperVariants({ size: this.size(), invalid: this.invalid(), disabled: this.isDisabled() }), this.class()),
  );

  protected focusInput(): void {
    this.inputRef().nativeElement.focus();
  }

  protected onInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const raw = inputEl.value;
    const sep = this.separator();
    if (sep && (typeof sep === 'string' ? raw.includes(sep) : sep.test(raw))) {
      const parts = raw.split(sep).map((s) => s.trim()).filter(Boolean);
      const trailing = typeof sep === 'string' ? !raw.endsWith(sep) : false;
      const toCommit = trailing ? parts : parts;
      if (toCommit.length > 0 && !this.isDisabled()) {
        const next = [...this.value()];
        const max = this.max();
        for (const token of toCommit) {
          if (max !== null && next.length >= max) break;
          if (!this.allowDuplicates() && next.includes(token)) continue;
          next.push(token);
        }
        this.value.set(next);
        this.onChange(next);
        this.onTouched();
        this.liveMessage.set(`Added ${toCommit[toCommit.length - 1]}. ${next.length} tag${next.length === 1 ? '' : 's'} total.`);
      }
      inputEl.value = '';
      this.draft.set('');
      return;
    }
    this.draft.set(raw);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.commitDraft();
    } else if (event.key === 'Backspace' && this.draft() === '' && this.value().length > 0) {
      this.removeAt(this.value().length - 1);
    } else if (event.key === 'ArrowLeft' && this.draft() === '' && this.value().length > 0) {
      // Same "empty draft" guard as Backspace above — with text still in the
      // input, ArrowLeft should move the caret, not jump focus off the field.
      event.preventDefault();
      this.focusChipAt(this.value().length - 1);
    } else if (event.key === 'Tab' && this.addOnTab() && this.draft() !== '') {
      // No preventDefault — Tab still moves focus on exactly as it would
      // have anyway, this only additionally commits first.
      this.commitDraft();
    }
  }

  /**
   * Roving focus between chips' own remove buttons, and Delete to remove
   * whichever chip is currently focused — not just the last one (Wave 2
   * fix). Reached via ArrowLeft from the input; ArrowRight off the last
   * chip returns focus to the input.
   *
   * **No `Backspace` case here anymore**: `ChipComponent` itself now
   * handles Backspace on its own remove button (emitting through
   * `removed`), so handling it a second time here — on the same bubbled
   * keydown — would remove the chip twice. `onChipRemoved` below branches
   * on the event type to still land on `removeFocused` (this method's own
   * roving-focus removal) for that keyboard-triggered case, same as before.
   */
  protected onChipKeydown(event: KeyboardEvent, index: number): void {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.focusChipAt(index - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (index + 1 < this.value().length) {
          this.focusChipAt(index + 1);
        } else {
          this.focusInput();
        }
        break;
      case 'Delete':
        event.preventDefault();
        this.removeFocused(index);
        break;
    }
  }

  /** A chip's own remove button, clicked or Backspace-ed. Click always returns focus to the text input (it already moved focus away from wherever it was; the input is the one predictable place to leave it) via `removeAt`; Backspace instead keeps the roving-focus model going via `removeFocused`, same as Delete/ArrowLeft/ArrowRight in `onChipKeydown`. */
  protected onChipRemoved(event: MouseEvent | KeyboardEvent, index: number): void {
    if (event instanceof KeyboardEvent) {
      this.removeFocused(index);
    } else {
      this.removeAt(index);
    }
  }

  protected removeAt(index: number): void {
    if (this.isDisabled()) {
      return;
    }
    this.remove(index);
    this.inputRef().nativeElement.focus();
  }

  /** Same removal as `removeAt`, but keeps focus among the chips (on whichever one now occupies the removed chip's slot, or the input if none remain) instead of always snapping back to the text input — the point of a roving keyboard model is that repeated Delete/Backspace can walk through several chips without detouring through the input each time. */
  private removeFocused(index: number): void {
    if (this.isDisabled()) {
      return;
    }
    this.remove(index);
    // `chipRefs()` still reflects the pre-removal `@for` list until Angular
    // actually re-renders it — forcing that refresh synchronously here
    // (rather than relying on whatever change-detection pass happens to
    // follow this handler) is what makes it safe to read an up-to-date
    // `chipRefs()` on the very next line, instead of focusing a stale,
    // about-to-be-removed chip.
    this.cdr.detectChanges();
    const remaining = this.value().length;
    if (remaining === 0) {
      this.focusInput();
    } else {
      this.focusChipAt(Math.min(index, remaining - 1));
    }
  }

  private focusChipAt(index: number): void {
    this.chipRefs()[index]?.focusRemoveButton();
  }

  private remove(index: number): void {
    const removedTag = this.value()[index];
    const next = this.value().filter((_, i) => i !== index);
    this.value.set(next);
    this.onChange(next);
    this.onTouched();
    if (removedTag !== undefined) {
      this.liveMessage.set(`Removed ${removedTag}. ${next.length} tag${next.length === 1 ? '' : 's'} remaining.`);
    }
  }

  private commitDraft(): void {
    if (this.isDisabled()) {
      return;
    }
    const text = this.draft().trim();
    if (!text) {
      return;
    }
    const max = this.max();
    if (max !== null && this.value().length >= max) {
      return;
    }
    if (!this.allowDuplicates() && this.value().includes(text)) {
      return;
    }
    const next = [...this.value(), text];
    this.value.set(next);
    this.onChange(next);
    this.onTouched();
    this.draft.set('');
    this.liveMessage.set(`Added ${text}. ${next.length} tag${next.length === 1 ? '' : 's'} total.`);
  }

  writeValue(value: readonly string[] | null | undefined): void {
    this.value.set(value ?? []);
  }

  registerOnChange(fn: (value: readonly string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formsDisabled.set(isDisabled);
  }
}
