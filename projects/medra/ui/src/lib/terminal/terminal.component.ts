import { ChangeDetectionStrategy, Component, ElementRef, afterRenderEffect, computed, input, output, signal, viewChild } from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';
import { TerminalLine } from './terminal.types';

/**
 * Terminal primitive (Tier 4): a fake console — command history + a prompt
 * input — that emits `commandSubmitted` when the user presses Enter, and
 * exposes a public `respond()`/`clear()` API the consumer calls back
 * (typically via `viewChild(TerminalComponent)`) to push a response line
 * into the visible history or reset it.
 *
 * **No shared injectable service between this component and the
 * consumer** (a root-provided singleton service would make two
 * terminal instances on the same page silently broadcast to and receive
 * from each other, a real cross-instance bug). A plain `@Output()` +
 * public methods is both simpler and correct for what's fundamentally a
 * parent-child interaction: each `<med-terminal>` instance is independent,
 * with no shared state to leak between them.
 *
 * **Fixed dark "console" styling regardless of the host app's light/dark
 * mode** — a deliberate exception to this library's usual `dark:` variant
 * pairing: a terminal emulator is conventionally always dark, the same way
 * a code editor's own syntax-highlighted pane doesn't flip to a white
 * background just because the surrounding app is in light mode.
 *
 * **Scope cut for v1**: no ArrowUp/ArrowDown command-history recall — real,
 * but secondary, polish; layers on top of the existing `lines` state
 * without an API change.
 *
 * **The host itself is the console box** (no separate wrapper `<div>`):
 * Angular applies a consumer's *static* `class="..."` attribute to a
 * component's host natively, in addition to whatever the component does
 * with its own aliased `class` input — see `ScrollPanel`'s own doc for the
 * full reasoning, and why folding the visible box into the host (rather
 * than a bare host wrapping a separately-styled inner div) is the fix.
 */
@Component({
  selector: 'med-terminal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'containerClass()', '(click)': 'focusInput()' },
  template: `
    <div #log [class]="logClass" role="log" [attr.aria-label]="ariaLabel()" aria-live="polite">
      @if (welcomeMessage(); as welcome) {
        <div class="whitespace-pre-wrap">{{ welcome }}</div>
      }
      @for (line of lines(); track $index) {
        <div class="flex gap-2 whitespace-pre-wrap" data-terminal-line>
          @if (line.type === 'command') {
            <span class="shrink-0 text-brand-400">{{ prompt() }}</span>
          }
          <span [class]="line.type === 'response' ? 'text-surface-300' : ''">{{ line.text }}</span>
        </div>
      }
    </div>
    <div class="flex items-center gap-2 pt-1">
      <span class="shrink-0 text-brand-400">{{ prompt() }}</span>
      <input
        #input
        type="text"
        class="min-w-0 flex-1 bg-transparent outline-none focus-visible:ring-(--focus-ring-width) focus-visible:ring-offset-(--focus-ring-offset) focus-visible:ring-brand-400 rounded-sm"
        [value]="draft()"
        [attr.aria-label]="inputAriaLabel()"
        autocomplete="off"
        spellcheck="false"
        (input)="onDraftInput($event)"
        (keydown)="onInputKeydown($event)"
      />
    </div>
  `,
})
export class TerminalComponent {
  readonly prompt = input('$');
  readonly welcomeMessage = input<string | null>(null);
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly ariaLabel = input('Terminal');
  readonly inputAriaLabel = input('Terminal command input');
  readonly class = input('', { alias: 'class' });

  readonly commandSubmitted = output<string>();

  protected readonly lines = signal<readonly TerminalLine[]>([]);
  protected readonly draft = signal('');

  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('input');
  private readonly logRef = viewChild<ElementRef<HTMLElement>>('log');

  protected readonly containerClass = computed(() =>
    mergeClasses('block rounded-lg bg-surface-950 p-3 font-mono text-sm text-surface-100 dark:bg-surface-950', this.class()),
  );
  protected readonly logClass = 'mb-1 max-h-72 overflow-y-auto';

  constructor() {
    // `afterRenderEffect`, not a plain `effect()`: scrolling to the newest
    // line has to happen after the DOM actually reflects the new `lines`
    // value, not during change detection — same DOM-timing reasoning
    // `DrawerComponent` already documents for its own `afterRenderEffect` use.
    afterRenderEffect(() => {
      this.lines();
      const el = this.logRef()?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }

  protected onDraftInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
  }

  protected onInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.submit();
    }
  }

  protected submit(): void {
    const command = this.draft().trim();
    if (!command) {
      return;
    }
    this.lines.update((current) => [...current, { type: 'command', text: command }]);
    this.draft.set('');
    this.commandSubmitted.emit(command);
  }

  protected focusInput(): void {
    this.inputRef()?.nativeElement.focus();
  }

  /** Appends a response line — call after handling a `commandSubmitted` event. */
  respond(text: string): void {
    this.lines.update((current) => [...current, { type: 'response', text }]);
  }

  /** Clears the command/response history (the `welcomeMessage`, if any, still shows — it's a separate input, not stored history). */
  clear(): void {
    this.lines.set([]);
  }
}
