import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, booleanAttribute, computed, forwardRef, inject, input, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { OverlayHandle, OverlayService } from '../overlay/overlay.service';
import { SELECT_PANEL_CLASS, SelectSize, selectTriggerVariants } from '../select/select.styles';
import { TreeNode } from '../tree/tree.types';
import { mergeClasses } from '../utils/merge-classes';
import { TreeSelectPanelComponent } from './tree-select-panel.component';

let nextTreeSelectId = 0;

/**
 * TreeSelect primitive (Tier 4): a `Select`-style combobox trigger
 * (reuses `selectTriggerVariants`/`SelectSize` unchanged, same precedent
 * `CascadeSelectComponent` already established for its own trigger) opening
 * `TreeSelectPanelComponent` — a thin wrapper around `TreeComponent` itself
 * (see that file's doc). No manual `closeRequested` plumbing to the overlay,
 * unlike `SelectComponent`/`CascadeSelectComponent`: those need it because
 * their panels have submenu/nested-overlay mechanics of their own that can
 * request a close from deep inside; a flat `TreeComponent` picker has
 * nothing like that, so `OverlayService`'s own default Escape/outside-click
 * handling is already the whole story.
 *
 * **Single selection only for v1** — same scope cut `CascadeSelectComponent`
 * already made (no `multiple`/checkbox picking): the overlay + tree
 * rendering is already the hard part this component adds over a plain
 * `Select`; layering multi-pick on top doesn't change that shape and can
 * follow later without an API break.
 *
 * **`filterable`, reopening a documented cut**. Forwarded straight through
 * to `TreeSelectPanelComponent`/`TreeComponent`, which already own the
 * actual search box and match/force-expand logic — see either's doc.
 *
 * **`showClear`/`loading`**: same affordance/placement as
 * `SelectComponent`'s/`CascadeSelectComponent`'s own — `showClear` renders
 * an inline clear button (only once a value is actually selected and the
 * trigger isn't disabled) that stops the click from also opening the
 * panel; `loading`/`loadingLabel` forward straight through to
 * `TreeSelectPanelComponent`, same as `filterable` already does, since the
 * panel — not this trigger — is what actually needs to show a loading
 * state in place of the tree.
 */
@Component({
  selector: 'med-tree-select',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block w-full' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TreeSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div
      #trigger
      role="combobox"
      [attr.tabindex]="isDisabled() ? -1 : 0"
      aria-haspopup="tree"
      [attr.aria-expanded]="isOpen()"
      [attr.aria-disabled]="isDisabled() ? 'true' : null"
      [attr.aria-invalid]="invalid() ? 'true' : null"
      [class]="triggerClass()"
      (click)="onTriggerClick()"
      (keydown)="onTriggerKeydown($event)"
      (blur)="onTouched()"
    >
      @if (displayLabel(); as label) {
        <span class="truncate">{{ label }}</span>
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
            <med-icon name="x-mark" variant="mini" class="size-3.5" />
          </button>
        }
        <med-icon name="chevron-down" variant="mini" class="size-4 text-surface-400" />
      </span>
    </div>
  `,
})
export class TreeSelectComponent implements ControlValueAccessor, OnDestroy {
  private readonly overlayService = inject(OverlayService);
  private readonly instanceId = nextTreeSelectId++;

  readonly options = input<readonly TreeNode[]>([]);
  readonly size = input<SelectSize>('default');
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly placeholder = input('Select an item');
  readonly filterable = input(false, { transform: booleanAttribute });
  readonly filterPlaceholder = input('Search');
  readonly showClear = input(false, { transform: booleanAttribute });
  readonly clearLabel = input('Clear');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly loadingLabel = input('Loading...');
  readonly class = input('', { alias: 'class' });

  private readonly value = signal<TreeNode | null>(null);
  private readonly formsDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formsDisabled());
  protected readonly isOpen = signal(false);
  protected readonly displayLabel = computed(() => this.value()?.label ?? null);

  private readonly triggerRef = viewChild.required<ElementRef<HTMLElement>>('trigger');
  private handle: OverlayHandle<TreeSelectPanelComponent, void> | null = null;

  private onChange: (value: TreeNode | null) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly triggerClass = computed(() => mergeClasses(selectTriggerVariants({ size: this.size(), invalid: this.invalid() }), this.class()));

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

  protected clear(event: Event): void {
    event.stopPropagation();
    this.value.set(null);
    this.onChange(null);
  }

  ngOnDestroy(): void {
    this.handle?.close();
  }

  private toggle(): void {
    if (this.isOpen()) {
      this.handle?.close();
    } else {
      this.open();
    }
  }

  private open(): void {
    if (this.isOpen()) {
      return;
    }
    this.isOpen.set(true);

    const handle = this.overlayService.openConnected<TreeSelectPanelComponent, void>(this.triggerRef().nativeElement, TreeSelectPanelComponent, {
      panelClass: SELECT_PANEL_CLASS,
    });
    this.handle = handle;
    handle.overlayRef.overlayElement.style.minWidth = `${this.triggerRef().nativeElement.offsetWidth}px`;

    handle.componentRef.setInput('options', this.options());
    handle.componentRef.setInput('filterable', this.filterable());
    handle.componentRef.setInput('filterPlaceholder', this.filterPlaceholder());
    handle.componentRef.setInput('loading', this.loading());
    handle.componentRef.setInput('loadingLabel', this.loadingLabel());
    handle.componentRef.instance.nodeSelected.subscribe((node: TreeNode) => {
      this.onTouched();
      this.value.set(node);
      this.onChange(node);
      handle.close();
    });

    handle.closed$.subscribe(() => {
      this.isOpen.set(false);
      this.handle = null;
    });
  }

  writeValue(value: TreeNode | null | undefined): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: TreeNode | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formsDisabled.set(isDisabled);
  }
}
