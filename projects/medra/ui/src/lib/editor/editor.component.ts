import { ChangeDetectionStrategy, Component, ElementRef, SecurityContext, afterRenderEffect, booleanAttribute, computed, forwardRef, inject, input, signal, viewChild, viewChildren } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ButtonDirective } from '../button/button.directive';
import { IconComponent } from '../icon/icon.component';
import { mergeClasses } from '../utils/merge-classes';
import { OverlayHandle, OverlayService } from '../overlay/overlay.service';
import { SELECT_PANEL_CLASS } from '../select/select.styles';
import { EditorLinkPanelComponent } from './editor-link-panel.component';

type ToolbarCommand = 'bold' | 'italic' | 'underline' | 'insertUnorderedList' | 'insertOrderedList' | 'undo' | 'redo';
type HeadingBlock = 'p' | 'h1' | 'h2' | 'h3';

/**
 * Editor primitive (Tier 4, last item — completes Tier 4): a minimal rich
 * text editor, a native `contenteditable` region plus a formatting
 * toolbar. Value is an HTML string.
 *
 * **Built on `document.execCommand`/`queryCommandState`, not a
 * third-party rich-text engine (Quill, ProseMirror, ...)**: both APIs are
 * formally deprecated, but there is still no standardized replacement for
 * driving `contenteditable` formatting commands, and every major browser
 * continues to ship them — the same pragmatic tradeoff other
 * `contenteditable`-based editors without a heavy dependency make. Not
 * load-bearing for anything security-sensitive (see below); a future
 * migration to the emerging `EditContext`/Trusted Types APIs, if they
 * mature into a real replacement, wouldn't need to change this
 * component's public API.
 *
 * **Sanitized on every write**, both directions: `writeValue` (an
 * external/programmatic value) and the `(input)` handler (the user's own
 * typing/pasting) both run the HTML through Angular's `DomSanitizer`
 * before it ever becomes the model value or gets written back into the
 * DOM — pasted content in particular can carry `<script>`, inline event
 * handler attributes, or `javascript:` URLs from arbitrary sources. This
 * is the "consumer-provided content must be sanitized" rule every
 * component accepting arbitrary HTML in this library already follows;
 * `bypassSecurityTrustHtml` is never used here.
 *
 * **Toolbar scope for v1**: Bold/Italic/Underline, bullet/numbered lists, undo/redo, headings, and
 * link insertion — the commands with reliable cross-browser `execCommand`/`queryCommandState`
 * behavior, plus the two additions below. Still no text color or font size (no clear
 * cross-browser-reliable `execCommand` path, and no UI precedent in this library for a color/size
 * picker yet). Not a dead end: the toolbar is a fixed template today, but the value is a plain HTML
 * string throughout, so richer commands can be added later without an API break.
 *
 * **Headings** (`formatBlock` via a plain `<select>` — Paragraph/H1/H2/H3):
 * deliberately outside the roving-tabindex group below (its own native Tab
 * stop), the one exception to "one Tab stop for the whole toolbar" — a
 * `<select>`'s own Arrow-key semantics conflict with the toolbar's
 * Arrow-key-moves-focus convention, so folding it into the shared roving
 * group isn't worth the ambiguity. Doesn't reflect current cursor
 * position either (same already-accepted imprecision as the list buttons
 * below `queryCommandState` for `formatBlock` is no more reliable across
 * browsers than for lists): applying a heading resets the `<select>` back
 * to its placeholder rather than displaying "Heading 1" as if it were
 * persistent state that tracked the caret.
 *
 * **Link insertion** opens `EditorLinkPanelComponent`, a small connected
 * overlay (own file, not the public API) anchored to the toolbar's Link
 * button — a real accessible URL `<input>` plus Insert/Cancel, not a
 * blocking native `window.prompt()`. The browser `Selection`/`Range` at
 * the moment the panel opens is captured and restored just before running
 * `createLink` on Insert: by the time the user finishes typing a URL and
 * clicks Insert, DOM focus has moved through the panel's own input, and a
 * live `contenteditable` selection doesn't reliably survive that trip on
 * its own — the same save/restore technique used by essentially every
 * `contenteditable` editor that opens a separate UI for link entry.
 *
 * **Active-state tracking (the pressed look on Bold/Italic/Underline)
 * only covers those three commands**: `queryCommandState` for the list
 * commands is unreliable across browsers, so the toolbar doesn't attempt
 * to show a pressed state for them — clicking still toggles the list
 * correctly, there's just no visual "is a list active here" indicator.
 *
 * **Toolbar roving-tabindex (Wave 2 fix)**: `role="toolbar"` implies the
 * ARIA APG toolbar pattern — one Tab stop for the whole toolbar, Arrow
 * keys moving between buttons — same model `DockComponent` already
 * established for its own `role="toolbar"`. Unlike Dock's items, every
 * toolbar button here shares one `isDisabled()` flag (there's no
 * per-button disabled state to skip over), so the roving logic is a
 * plain wrap-around cycle through all 7 buttons rather than Dock's
 * enabled-index filtering.
 *
 * **No `aria-live` region added**: the one piece of toolbar state that
 * changes as a result of a command — Bold/Italic/Underline's pressed
 * look — is already exposed natively via `aria-pressed` on each button,
 * which screen readers announce on their own when a toggle button's
 * pressed state changes; a live region echoing the same fact would be
 * redundant. The list/undo/redo commands have no persistent state to
 * announce at all (`queryCommandState` for lists is unreliable, as
 * above, and undo/redo are one-shot actions, not toggles).
 */
@Component({
  selector: 'med-editor',
  standalone: true,
  imports: [ButtonDirective, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditorComponent),
      multi: true,
    },
  ],
  template: `
    <div role="toolbar" [attr.aria-label]="toolbarLabel()" class="flex flex-wrap items-center gap-1 border-b border-surface-200 p-1 dark:border-surface-700">
      <select
        class="rounded-sm border border-transparent bg-transparent px-1 py-1 text-xs text-surface-700 hover:bg-surface-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-(--opacity-disabled) dark:text-surface-200 dark:hover:bg-surface-700"
        [disabled]="isDisabled()"
        [attr.aria-label]="headingLabel()"
        (change)="onHeadingChange($event)"
      >
        <option value="" selected>Format</option>
        <option value="p">Paragraph</option>
        <option value="h1">Heading 1</option>
        <option value="h2">Heading 2</option>
        <option value="h3">Heading 3</option>
      </select>

      <span class="mx-1 h-5 w-px bg-surface-200 dark:bg-surface-700" aria-hidden="true"></span>

      <button #toolbarBtn medButton type="button" variant="text" severity="secondary" size="sm" iconOnly [class]="toolbarButtonClass(activeBold())" [disabled]="isDisabled()" [tabIndex]="tabIndexFor(0)" [attr.aria-pressed]="activeBold()" [attr.aria-label]="boldLabel()" (click)="exec('bold')" (focus)="rovingIndex.set(0)" (keydown)="onToolbarKeydown($event, 0)">
        <med-icon name="bold" variant="mini" class="size-4" />
      </button>
      <button #toolbarBtn medButton type="button" variant="text" severity="secondary" size="sm" iconOnly [class]="toolbarButtonClass(activeItalic())" [disabled]="isDisabled()" [tabIndex]="tabIndexFor(1)" [attr.aria-pressed]="activeItalic()" [attr.aria-label]="italicLabel()" (click)="exec('italic')" (focus)="rovingIndex.set(1)" (keydown)="onToolbarKeydown($event, 1)">
        <med-icon name="italic" variant="mini" class="size-4" />
      </button>
      <button #toolbarBtn medButton type="button" variant="text" severity="secondary" size="sm" iconOnly [class]="toolbarButtonClass(activeUnderline())" [disabled]="isDisabled()" [tabIndex]="tabIndexFor(2)" [attr.aria-pressed]="activeUnderline()" [attr.aria-label]="underlineLabel()" (click)="exec('underline')" (focus)="rovingIndex.set(2)" (keydown)="onToolbarKeydown($event, 2)">
        <med-icon name="underline" variant="mini" class="size-4" />
      </button>
      <button #toolbarBtn medButton type="button" variant="text" severity="secondary" size="sm" iconOnly [disabled]="isDisabled()" [tabIndex]="tabIndexFor(3)" [attr.aria-label]="linkButtonLabel()" (click)="openLinkPanel()" (focus)="rovingIndex.set(3)" (keydown)="onToolbarKeydown($event, 3)">
        <med-icon name="link" variant="mini" class="size-4" />
      </button>

      <span class="mx-1 h-5 w-px bg-surface-200 dark:bg-surface-700" aria-hidden="true"></span>

      <button #toolbarBtn medButton type="button" variant="text" severity="secondary" size="sm" iconOnly [disabled]="isDisabled()" [tabIndex]="tabIndexFor(4)" [attr.aria-label]="bulletListLabel()" (click)="exec('insertUnorderedList')" (focus)="rovingIndex.set(4)" (keydown)="onToolbarKeydown($event, 4)">
        <med-icon name="list-bullet" variant="mini" class="size-4" />
      </button>
      <button #toolbarBtn medButton type="button" variant="text" severity="secondary" size="sm" iconOnly [disabled]="isDisabled()" [tabIndex]="tabIndexFor(5)" [attr.aria-label]="numberedListLabel()" (click)="exec('insertOrderedList')" (focus)="rovingIndex.set(5)" (keydown)="onToolbarKeydown($event, 5)">
        <med-icon name="numbered-list" variant="mini" class="size-4" />
      </button>

      <span class="mx-1 h-5 w-px bg-surface-200 dark:bg-surface-700" aria-hidden="true"></span>

      <button #toolbarBtn medButton type="button" variant="text" severity="secondary" size="sm" iconOnly [disabled]="isDisabled()" [tabIndex]="tabIndexFor(6)" [attr.aria-label]="undoLabel()" (click)="exec('undo')" (focus)="rovingIndex.set(6)" (keydown)="onToolbarKeydown($event, 6)">
        <med-icon name="arrow-uturn-left" variant="mini" class="size-4" />
      </button>
      <button #toolbarBtn medButton type="button" variant="text" severity="secondary" size="sm" iconOnly [disabled]="isDisabled()" [tabIndex]="tabIndexFor(7)" [attr.aria-label]="redoLabel()" (click)="exec('redo')" (focus)="rovingIndex.set(7)" (keydown)="onToolbarKeydown($event, 7)">
        <med-icon name="arrow-uturn-right" variant="mini" class="size-4" />
      </button>
    </div>

    <div
      #editor
      role="textbox"
      aria-multiline="true"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-disabled]="isDisabled() ? 'true' : null"
      [attr.contenteditable]="isDisabled() ? 'false' : 'true'"
      [attr.data-placeholder]="placeholder()"
      class="min-h-32 p-3 text-sm text-surface-900 empty:before:pointer-events-none empty:before:text-surface-400 empty:before:content-[attr(data-placeholder)] focus-visible:outline-none dark:text-surface-50 dark:empty:before:text-surface-500"
      (input)="onInput()"
      (mouseup)="refreshActiveStates()"
      (keyup)="refreshActiveStates()"
      (blur)="onTouched()"
    ></div>
  `,
})
export class EditorComponent implements ControlValueAccessor {
  private readonly sanitizer = inject(DomSanitizer);

  readonly disabled = input(false, { transform: booleanAttribute });
  readonly placeholder = input('');
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly ariaLabel = input('Rich text editor');
  readonly toolbarLabel = input('Text formatting');
  readonly boldLabel = input('Bold');
  readonly italicLabel = input('Italic');
  readonly underlineLabel = input('Underline');
  readonly bulletListLabel = input('Bullet list');
  readonly numberedListLabel = input('Numbered list');
  readonly undoLabel = input('Undo');
  readonly redoLabel = input('Redo');
  readonly headingLabel = input('Text style');
  readonly linkButtonLabel = input('Insert link');
  readonly linkUrlLabel = input('Link URL');
  readonly linkInsertLabel = input('Insert');
  readonly linkCancelLabel = input('Cancel');
  readonly class = input('', { alias: 'class' });

  private readonly rawValue = signal('');
  private readonly formsDisabled = signal(false);

  protected readonly activeBold = signal(false);
  protected readonly activeItalic = signal(false);
  protected readonly activeUnderline = signal(false);

  private readonly editorRef = viewChild<ElementRef<HTMLElement>>('editor');

  /** ARIA APG toolbar pattern: one tab stop for the whole `role="toolbar"`, Arrow keys roving-focus between the 7 buttons (Wave 2 fix). */
  protected readonly rovingIndex = signal(0);
  private readonly toolbarButtons = viewChildren<ElementRef<HTMLButtonElement>>('toolbarBtn');
  private static readonly TOOLBAR_BUTTON_COUNT = 8;
  /** Index into `toolbarButtons()` — the toolbar template order is heading select, Bold, Italic, Underline, Link, ... */
  private static readonly LINK_BUTTON_INDEX = 3;

  private readonly overlayService = inject(OverlayService);
  private linkHandle: OverlayHandle<EditorLinkPanelComponent, string> | null = null;
  /** Captured when the link panel opens, restored just before `createLink` runs — see class doc's "Link insertion" section. */
  private savedRange: Range | null = null;

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};
  protected readonly isDisabled = computed(() => this.disabled() || this.formsDisabled());
  protected readonly hostClass = computed(() => mergeClasses('block overflow-hidden rounded-lg border border-surface-200 dark:border-surface-700', this.class()));

  constructor() {
    // Only pushes into the DOM when it's actually out of sync (external
    // `writeValue`) — after a user-driven `(input)`, `rawValue` and the
    // live DOM content already match, so this is a no-op and never fights
    // an in-progress edit or resets the cursor mid-typing.
    afterRenderEffect(() => {
      const html = this.rawValue();
      const el = this.editorRef()?.nativeElement;
      if (el && el.innerHTML !== html) {
        el.innerHTML = html;
      }
    });
  }

  protected toolbarButtonClass(active: boolean): string {
    return active ? 'bg-surface-200 dark:bg-surface-700' : '';
  }

  /** ARIA APG toolbar roving tabindex: only `rovingIndex()` is in the Tab order (`0`); every other button is `-1` and reachable via Arrow/Home/End instead. */
  protected tabIndexFor(index: number): number {
    return this.rovingIndex() === index ? 0 : -1;
  }

  protected onToolbarKeydown(event: KeyboardEvent, index: number): void {
    const count = EditorComponent.TOOLBAR_BUTTON_COUNT;
    let target: number | null = null;
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        target = (index + 1) % count;
        break;
      case 'ArrowLeft':
        event.preventDefault();
        target = (index - 1 + count) % count;
        break;
      case 'Home':
        event.preventDefault();
        target = 0;
        break;
      case 'End':
        event.preventDefault();
        target = count - 1;
        break;
    }

    if (target !== null) {
      this.rovingIndex.set(target);
      this.toolbarButtons()[target]?.nativeElement.focus();
    }
  }

  protected exec(command: ToolbarCommand): void {
    if (this.isDisabled()) {
      return;
    }
    this.editorRef()!.nativeElement.focus();
    document.execCommand(command);
    this.onTouched();
    this.syncFromDom();
    this.refreshActiveStates();
  }

  protected onInput(): void {
    this.onTouched();
    this.syncFromDom();
  }

  /** Resets the `<select>` back to its placeholder afterward — see class doc's "Headings" section on why this never reflects the caret's actual block. */
  protected onHeadingChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value as HeadingBlock | '';
    select.value = '';
    if (!value || this.isDisabled()) {
      return;
    }
    this.editorRef()!.nativeElement.focus();
    document.execCommand('formatBlock', false, `<${value}>`);
    this.onTouched();
    this.syncFromDom();
  }

  protected openLinkPanel(): void {
    if (this.isDisabled() || this.linkHandle) {
      return;
    }
    const selection = document.getSelection();
    this.savedRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;

    const anchor = this.toolbarButtons()[EditorComponent.LINK_BUTTON_INDEX]?.nativeElement;
    if (!anchor) {
      return;
    }
    const handle = this.overlayService.openConnected<EditorLinkPanelComponent, string>(anchor, EditorLinkPanelComponent, {
      panelClass: SELECT_PANEL_CLASS,
    });
    this.linkHandle = handle;
    handle.componentRef.setInput('urlLabel', this.linkUrlLabel());
    handle.componentRef.setInput('insertLabel', this.linkInsertLabel());
    handle.componentRef.setInput('cancelLabel', this.linkCancelLabel());

    handle.componentRef.instance.confirmed.subscribe((url: string) => {
      this.insertLink(url);
      handle.close();
    });
    handle.componentRef.instance.cancelled.subscribe(() => handle.close());

    handle.closed$.subscribe(() => {
      this.linkHandle = null;
      this.savedRange = null;
    });
  }

  private insertLink(url: string): void {
    const el = this.editorRef()!.nativeElement;
    el.focus();
    const selection = document.getSelection();
    if (selection && this.savedRange) {
      selection.removeAllRanges();
      selection.addRange(this.savedRange);
    }
    document.execCommand('createLink', false, url);
    this.onTouched();
    this.syncFromDom();
  }

  protected refreshActiveStates(): void {
    this.activeBold.set(document.queryCommandState('bold'));
    this.activeItalic.set(document.queryCommandState('italic'));
    this.activeUnderline.set(document.queryCommandState('underline'));
  }

  private syncFromDom(): void {
    const el = this.editorRef()!.nativeElement;
    const raw = el.innerHTML;
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, raw) ?? '';
    if (sanitized !== raw) {
      el.innerHTML = sanitized;
    }
    if (this.rawValue() !== sanitized) {
      this.rawValue.set(sanitized);
      this.onChange(sanitized);
    }
  }

  writeValue(value: string | null | undefined): void {
    this.rawValue.set(this.sanitizer.sanitize(SecurityContext.HTML, value ?? '') ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formsDisabled.set(isDisabled);
  }
}
