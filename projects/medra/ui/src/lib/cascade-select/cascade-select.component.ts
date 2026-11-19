import { NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, TemplateRef, booleanAttribute, computed, contentChild, forwardRef, inject, input, output, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { OverlayHandle, OverlayService } from '../overlay/overlay.service';
import { ProgressSpinnerComponent } from '../progress-spinner/progress-spinner.component';
import { SELECT_PANEL_CLASS, SelectSize, selectTriggerVariants } from '../select/select.styles';
import { mergeClasses } from '../utils/merge-classes';
import { CascadeSelectPanelComponent } from './cascade-select-panel.component';
import { CascadeSelectMapping, normalizeOptions } from './cascade-select.normalize';
import { CascadeSelectGroupEvent, CascadeSelectOption, CascadeSelectOptionContext, CascadeSelectSelectEvent, CascadeSelectValueContext } from './cascade-select.types';

let nextCascadeSelectId = 0;

function findPath<T>(
  options: readonly CascadeSelectOption<T>[],
  matches: (candidate: T | undefined) => boolean,
  trail: readonly string[] = [],
): readonly string[] | null {
  for (const option of options) {
    const nextTrail = [...trail, option.label];
    if (option.children?.length) {
      const found = findPath(option.children, matches, nextTrail);
      if (found) {
        return found;
      }
    } else if (matches(option.value)) {
      return nextTrail;
    }
  }
  return null;
}

/**
 * CascadeSelect primitive (Tier 3): a `Select`-style combobox trigger
 * (reuses `selectTriggerVariants`/`SelectSize` unchanged, same "role of a
 * dropdown field" look Select already established) opening
 * `CascadeSelectPanelComponent`'s cascading side-panels instead of a flat
 * `role="listbox"` — picking a leaf resolves this control's value and
 * displays the full breadcrumb (`'USA / California / Los Angeles'`) in the
 * trigger.
 *
 * `writeValue` has to *search* the tree for a matching leaf to rebuild that
 * breadcrumb from a bare `value` — the value alone doesn't carry the path
 * that produced it, unlike `Select`, which only ever needs to find one
 * option in one flat list.
 *
 * **`showClear`**: same affordance/placement as `SelectComponent`'s own.
 *
 * **`breakpoint`** (default `'960px'`): below that viewport width, each level's flyout submenu
 * opens as a full-width overlay stacked below its parent row instead of a narrow side flyout — a
 * "drill down full-width" mobile behavior: this component's submenus are already a chain of
 * separately-opened connected overlays (one per nesting level, see `CascadeSelectPanelComponent`'s
 * class doc), and reworking that into a single-overlay inline accordion would be a materially
 * different mechanism for what's otherwise the same "narrow viewport, stack instead of flying out
 * sideways" goal. The breakpoint check is a one-time snapshot at open time, not reactive to a later
 * resize — same tradeoff already accepted for the equivalent checks in `DatePicker`.
 *
 * **Scope cut for v1**: no `filter` input, method, or template control.
 */
@Component({
  selector: 'med-cascade-select',
  standalone: true,
  imports: [IconComponent, ProgressSpinnerComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CascadeSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div
      #trigger
      role="combobox"
      [attr.id]="inputId()"
      [attr.tabindex]="isDisabled() ? -1 : tabindex()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-labelledby]="ariaLabelledBy()"
      [attr.aria-required]="required() ? 'true' : null"
      aria-haspopup="listbox"
      [attr.aria-expanded]="isOpen()"
      [attr.aria-disabled]="isDisabled() ? 'true' : null"
      [attr.aria-invalid]="invalid() ? 'true' : null"
      [attr.aria-busy]="loading() ? 'true' : null"
      [class]="triggerClass()"
      (click)="onTriggerClick()"
      (keydown)="onTriggerKeydown($event)"
      (focus)="onFocus($event)"
      (blur)="onBlur($event)"
    >
      @if (displayLabel(); as label) {
        @if (valueTemplate(); as tpl) {
          <span class="truncate"><ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="valueContext()" /></span>
        } @else {
          <span class="truncate">{{ label }}</span>
        }
      } @else {
        <span class="truncate text-surface-400 dark:text-surface-500">{{ placeholder() }}</span>
      }
      <span class="flex shrink-0 items-center gap-1">
        @if (showClear() && displayLabel() && !isDisabled()) {
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-sm p-0.5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
            [attr.aria-label]="clearLabel()"
            (click)="clear($event)"
          >
            @if (clearIconTemplate(); as tpl) {
              <ng-container [ngTemplateOutlet]="tpl" />
            } @else {
              <med-icon name="x-mark" variant="mini" class="size-3.5" />
            }
          </button>
        }
        @if (loading()) {
          @if (loadingIconTemplate(); as tpl) {
            <ng-container [ngTemplateOutlet]="tpl" />
          } @else {
            <med-progress-spinner size="sm" />
          }
        } @else if (triggerIconTemplate(); as tpl) {
          <ng-container [ngTemplateOutlet]="tpl" />
        } @else {
          <med-icon name="chevron-down" variant="mini" class="size-4 text-surface-400" />
        }
      </span>
    </div>
    @if (name(); as fieldName) {
      <input type="hidden" [name]="fieldName" [value]="hiddenValue()" />
    }
  `,
})
export class CascadeSelectComponent<T = unknown> implements ControlValueAccessor, AfterViewInit, OnDestroy {
  private readonly overlayService = inject(OverlayService);
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly instanceId = nextCascadeSelectId++;

  /**
   * The option tree. Nodes are `CascadeSelectOption<T>` (`label`, `value`, `disabled`, `children`) or the
   * consumer's own objects, read through `optionLabel`, `optionValue` and `optionGroupLabel`.
   */
  readonly options = input<readonly CascadeSelectOption<T>[] | readonly Record<string, any>[]>([]);
  /** Field of each node that holds its label. Default: `'label'`. */
  readonly optionLabel = input('label');
  /** Field of each leaf that holds its value. Default: `'value'`. */
  readonly optionValue = input('value');
  /** Field that holds the label of a node that has children. Default: `null` (uses `optionLabel`). */
  readonly optionGroupLabel = input<string | null>(null);
  /**
   * Field of each node that holds its children: one name for every level, or one name per level
   * (the last one repeats for deeper levels). Default: `'children'`.
   */
  readonly optionGroupChildren = input<string | readonly string[]>('children');
  /** Field of each node that flags it as disabled, or a function that returns `true` for a disabled node. Default: `'disabled'`. */
  readonly optionDisabled = input<string | ((option: any) => boolean)>('disabled');
  /** Field that identifies an object value, so a value written by a form matches a leaf with the same key instead of the same reference. Default: `null`. */
  readonly dataKey = input<string | null>(null);
  readonly size = input<SelectSize>('default');
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly placeholder = input('Select an option');
  /** Joins the breadcrumb labels in the trigger. Default: `' / '`. */
  readonly separator = input(' / ');
  /** Shows a loading spinner in place of the open icon and marks the field `aria-busy`. Default: `false`. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Name of the field in a native form; renders a hidden input that holds the picked value. Default: `null`. */
  readonly name = input<string | null>(null);
  /** `id` of the focusable field, so a `<label for>` can point to it. Default: `null`. */
  readonly inputId = input<string | null>(null);
  /** Tab order of the field. Default: `0`. */
  readonly tabindex = input(0);
  /** Accessible name of the field (`aria-label`). Default: `null`. */
  readonly ariaLabel = input<string | null>(null);
  /** `id` of the element that labels the field (`aria-labelledby`). Default: `null`. */
  readonly ariaLabelledBy = input<string | null>(null);
  /** Focuses the field after it is first rendered. Default: `false`. */
  readonly autofocus = input(false, { transform: booleanAttribute });
  /** Marks the field as required for assistive technology (`aria-required`). Default: `false`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Look of the field: `'outlined'` (default) or `'filled'`. */
  readonly variant = input<'outlined' | 'filled'>('outlined');
  /** Makes the field fill the width of its container; the host becomes `block` and the field `w-full`. Default: `false`. */
  readonly fluid = input(false, { transform: booleanAttribute });
  /** Extra class for the panel overlay. Default: `null`. */
  readonly panelStyleClass = input<string | null>(null);
  /**
   * Where the panel and its submenus are attached: `'body'` (default) keeps them in the overlay container of the CDK,
   * `'self'` moves them inside this component, and an `HTMLElement` moves them inside that element.
   */
  readonly appendTo = input<'body' | 'self' | HTMLElement>('body');
  readonly showClear = input(false, { transform: booleanAttribute });
  readonly clearLabel = input('Clear');
  /** Below this viewport width, each level's submenu opens full-width and stacked instead of as a narrow side flyout — see class doc. */
  readonly breakpoint = input('960px');
  readonly class = input('', { alias: 'class' });

  /** The consumer's data as the internal tree, so the panel and `writeValue` never read a mapped field. */
  private readonly tree = computed(() =>
    normalizeOptions<T>(this.options(), {
      label: this.optionLabel(),
      value: this.optionValue(),
      groupLabel: this.optionGroupLabel(),
      children: this.optionGroupChildren(),
      disabled: this.optionDisabled(),
    } satisfies CascadeSelectMapping),
  );

  /** Template for the displayed value, by named reference `#value` (context `CascadeSelectValueContext`), in place of the default path. */
  readonly valueTemplate = contentChild<TemplateRef<CascadeSelectValueContext<T>>>('value');
  /** Template for each panel row, by named reference `#option` (context `CascadeSelectOptionContext`); rows keep `role="option"`. */
  readonly optionTemplate = contentChild<TemplateRef<CascadeSelectOptionContext<T>>>('option');
  /** Template shown above the first-level list of the panel, by named reference `#header`. */
  readonly headerTemplate = contentChild<TemplateRef<void>>('header');
  /** Template shown below the first-level list of the panel, by named reference `#footer`. */
  readonly footerTemplate = contentChild<TemplateRef<void>>('footer');
  /** Template for the icon of panel rows with children, by named reference `#groupIcon`. */
  readonly groupIconTemplate = contentChild<TemplateRef<void>>('groupIcon');
  /** Template for the open icon, by named reference `#triggerIcon`. */
  readonly triggerIconTemplate = contentChild<TemplateRef<void>>('triggerIcon');
  /** Template for the loading indicator, by named reference `#loadingIcon`, shown while `loading` is on. */
  readonly loadingIconTemplate = contentChild<TemplateRef<void>>('loadingIcon');
  /** Template for the icon of the clear button, by named reference `#clearIcon`. */
  readonly clearIconTemplate = contentChild<TemplateRef<void>>('clearIcon');

  private readonly value = signal<T | null>(null);
  private readonly path = signal<readonly string[] | null>(null);
  private readonly formsDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formsDisabled());
  protected readonly isOpen = signal(false);
  protected readonly valueContext = computed<CascadeSelectValueContext<T>>(() => ({ $implicit: this.value() as T, path: this.path() ?? [] }));
  protected readonly hiddenValue = computed(() => {
    const value = this.value();
    const key = this.dataKey();
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object') {
      return key !== null ? String((value as Record<string, unknown>)[key] ?? '') : String(value);
    }
    return String(value);
  });
  protected readonly displayLabel = computed(() => this.path()?.join(this.separator()) ?? null);

  /** Emits when a leaf is picked, with its value and the labels of its path. */
  readonly optionSelected = output<CascadeSelectSelectEvent<T>>();
  /** Emits when a node with children is opened in the panel, with that node's value and path. */
  readonly groupOpened = output<CascadeSelectGroupEvent<T>>();
  /** Emits just before the panel opens. */
  readonly panelBeforeShow = output<void>();
  /** Emits after the panel has opened. */
  readonly panelShow = output<void>();
  /**
   * Emits just before the panel closes. When the overlay closes itself (Escape or an outside click) it is
   * emitted at the moment of closing, immediately followed by `panelHide`.
   */
  readonly panelBeforeHide = output<void>();
  /** Emits after the panel has closed. */
  readonly panelHide = output<void>();
  /** Emits when the clear button empties the value. */
  readonly cleared = output<void>();
  /** Emits when the field receives focus. */
  readonly inputFocus = output<FocusEvent>();
  /** Emits when the field loses focus. */
  readonly inputBlur = output<FocusEvent>();

  private readonly triggerRef = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private handle: OverlayHandle<CascadeSelectPanelComponent<T>, void> | null = null;

  private onChange: (value: T | null) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly hostClass = computed(() => (this.fluid() ? 'block w-full' : 'inline-block w-full'));

  protected readonly triggerClass = computed(() =>
    mergeClasses(selectTriggerVariants({ size: this.size(), invalid: this.invalid(), variant: this.variant() }), this.fluid() ? 'w-full' : '', this.class()),
  );

  protected onTriggerClick(): void {
    if (!this.isDisabled()) {
      this.toggle();
    }
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.open();
        break;
    }
  }

  protected onFocus(event: FocusEvent): void {
    if (!this.isDisabled()) {
      this.inputFocus.emit(event);
    }
  }

  protected onBlur(event: FocusEvent): void {
    this.onTouched();
    if (!this.isDisabled()) {
      this.inputBlur.emit(event);
    }
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.value.set(null);
    this.path.set(null);
    this.onChange(null);
    this.cleared.emit();
  }

  ngAfterViewInit(): void {
    if (this.autofocus() && !this.isDisabled()) {
      this.triggerRef().nativeElement.focus();
    }
  }

  ngOnDestroy(): void {
    this.handle?.close();
  }

  private toggle(): void {
    if (this.isOpen()) {
      this.closePanel();
    } else {
      this.open();
    }
  }

  private beforeHideEmitted = false;

  private emitBeforeHide(): void {
    if (!this.beforeHideEmitted) {
      this.beforeHideEmitted = true;
      this.panelBeforeHide.emit();
    }
  }

  /** Closes the panel from inside the component, announcing it first. */
  private closePanel(): void {
    this.emitBeforeHide();
    this.handle?.close();
  }

  private open(): void {
    if (this.isOpen()) {
      return;
    }
    this.panelBeforeShow.emit();
    this.beforeHideEmitted = false;
    this.isOpen.set(true);

    const handle = this.overlayService.openConnected<CascadeSelectPanelComponent<T>, void>(this.triggerRef().nativeElement, CascadeSelectPanelComponent, {
      panelClass: this.panelStyleClass() ? [...SELECT_PANEL_CLASS, this.panelStyleClass() as string] : SELECT_PANEL_CLASS,
    });
    this.handle = handle;
    handle.overlayRef.overlayElement.style.minWidth = `${this.triggerRef().nativeElement.offsetWidth}px`;

    const appendTo = this.appendTo();
    const target = appendTo === 'body' ? null : appendTo === 'self' ? this.hostRef.nativeElement : appendTo;
    if (target) {
      target.appendChild(handle.overlayRef.hostElement);
      handle.componentRef.setInput('appendTarget', target);
    }

    handle.componentRef.setInput('panelId', `med-cascade-select-${this.instanceId}-panel`);
    handle.componentRef.setInput('options', this.tree());
    handle.componentRef.setInput('path', []);
    handle.componentRef.setInput('mobile', window.innerWidth < parseInt(this.breakpoint(), 10));
    handle.componentRef.setInput('optionTemplate', this.optionTemplate());
    handle.componentRef.setInput('groupIconTemplate', this.groupIconTemplate());
    handle.componentRef.setInput('headerTemplate', this.headerTemplate());
    handle.componentRef.setInput('footerTemplate', this.footerTemplate());

    handle.componentRef.instance.optionSelected.subscribe(({ value, path }: { value: T; path: readonly string[] }) => {
      this.onTouched();
      this.value.set(value);
      this.path.set(path);
      this.onChange(value);
      this.optionSelected.emit({ value, path });
      this.closePanel();
    });
    handle.componentRef.instance.groupOpened.subscribe((opened: CascadeSelectGroupEvent<T>) => this.groupOpened.emit(opened));
    handle.componentRef.instance.closeRequested.subscribe(() => this.closePanel());

    handle.closed$.subscribe(() => {
      // Escape and outside clicks close the overlay without going through `closePanel()`.
      this.emitBeforeHide();
      this.isOpen.set(false);
      this.handle = null;
      this.panelHide.emit();
    });
    this.panelShow.emit();
  }

  private sameValue(candidate: T | undefined, value: T): boolean {
    const key = this.dataKey();
    if (key !== null && typeof candidate === 'object' && candidate !== null && typeof value === 'object' && value !== null) {
      return (candidate as Record<string, unknown>)[key] === (value as Record<string, unknown>)[key];
    }
    return candidate === value;
  }

  writeValue(value: T | null | undefined): void {
    this.value.set(value ?? null);
    this.path.set(value === null || value === undefined ? null : findPath(this.tree(), (candidate) => this.sameValue(candidate, value)));
  }

  registerOnChange(fn: (value: T | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formsDisabled.set(isDisabled);
  }
}
