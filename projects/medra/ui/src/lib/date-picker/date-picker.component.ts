import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, TemplateRef, booleanAttribute, computed, contentChild, forwardRef, inject, input, numberAttribute, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MED_FLUID_CONTEXT } from '../fluid/fluid.directive';
import { IconComponent } from '../icon/icon.component';
import { OverlayHandle, OverlayService } from '../overlay/overlay.service';
import { mergeClasses } from '../utils/merge-classes';
import { FieldVariant, InputTextSize, inputTextVariants } from '../input-text/input-text.styles';
import { SELECT_PANEL_CLASS } from '../select/select.styles';
import { DATE_PICKER_TRAILING_PADDING_REM } from './date-picker.styles';
import { DatePickerPanelComponent } from './date-picker-panel.component';
import { formatDate, formatRange, formatTime, parseDate, startOfDay } from './date-format';
import { DatePickerDateTemplateContext, DatePickerSelectionMode, DatePickerValue, DatePickerView, DateRange } from './date-picker.types';

let nextDatePickerId = 0;

/**
 * DatePicker primitive (Tier 2). Real `<input role="combobox">` (like
 * Autocomplete, not Select's `<div>`) so a date can be typed directly, with
 * a calendar overlay for visual picking. Unlike Autocomplete, the calendar
 * panel takes real DOM focus once open (the Select model — see
 * `DatePickerPanelComponent`'s class doc): it's a composite grid widget
 * (WAI-ARIA APG "Date Picker Dialog"), not a simple reactive list.
 *
 * **Two independent formatting concerns**: `dateFormat` (a numeric
 * token string, e.g. `'mm/dd/yyyy'` — see `date-format.ts`) governs only
 * what's typed/displayed as the value. `locale` drives `Intl`-based
 * month/weekday *names* in the calendar chrome only. A consumer could type
 * `07/05/2026` while the calendar header reads "julho de 2026" if
 * `locale="pt-BR"` — these never interact.
 *
 * **`selectionMode` picks the value shape at runtime** (`'single'` → `Date |
 * null`, `'multiple'` → `readonly Date[]`, `'range'` → `DateRange`), not a
 * generic type parameter — see `date-picker.types.ts`. Range and multiple
 * mode's input is `readOnly` (still focusable/keyboard-openable, just not
 * free-typeable): parsing several dates or a two-endpoint range from text
 * reliably is materially harder than the single-date case and isn't needed
 * for the component's core value (same category of cut as Autocomplete's
 * `forceSelection`). Multiple mode never auto-closes the panel on pick —
 * unlike single/range, there's no natural "done" moment other than the user
 * dismissing it themselves (toggle/Escape/outside-click), same reasoning
 * MultiSelect's own panel already stays open across picks.
 *
 * **`view: 'month'`** turns the picker into a month-picker: the panel skips
 * the day grid entirely and terminates at the month grid, whose cells commit
 * directly instead of drilling further. Single mode only for v1 (same
 * documented-cut category as `showTime`) — the committed `Date` is always
 * the 1st of the chosen month. In `navigation="calendar"`, the month grid
 * gains its own prev/next chevrons that page by year (the day grid's
 * chevrons page by month) since there's no day view left to host them.
 *
 * Typed input is only ever committed live (on every keystroke) once it
 * parses into a real calendar date within `[minDate, maxDate]` — never a
 * partial/invalid one. On blur (or Enter), the displayed text is
 * reformatted from the last *committed* value, silently reverting any
 * leftover unparseable/out-of-range text.
 *
 * **`showTime`** (single mode only — a documented cut in range mode, same
 * category as `forceSelection`/free-text range) adds an hour/minute row to
 * the panel (`DatePickerPanelComponent`). The committed `Date` then carries
 * a real time-of-day instead of always midnight. Time is a *third*
 * independent formatting concern alongside `dateFormat`/`locale`:
 * `hourFormat` (`'12'`/`'24'`) governs a suffix appended to the displayed
 * text via `formatTime()`, never part of `dateFormat`'s own numeric-token
 * grammar and never typed/parsed back from free text — the field becomes
 * `readOnly` whenever `showTime()` is on (same treatment range mode already
 * gets), so date+time is always picked via the panel's calendar grid plus
 * hour/minute inputs, never typed as one string. Picking a day doesn't
 * auto-close the panel here (the user still needs to dial in a time); a
 * "Done" button in the panel's time row closes it explicitly, alongside the
 * existing toggle/Escape/outside-click paths.
 */
@Component({
  selector: 'med-date-picker',
  standalone: true,
  imports: [IconComponent, DatePickerPanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative inline-block w-full',
    '[class.block]': 'isFluid()',
    '[class.inline-block]': '!isFluid()',
    '[class.med-date-picker-fluid]': 'isFluid()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
  template: `
    @if (inline()) {
      <div [class]="inlineWrapperClass()">
        <med-date-picker-panel
          [panelId]="panelElementId"
          [selectionMode]="selectionMode()"
          [pickerView]="view()"
          [navigation]="navigation()"
          [numberOfMonths]="numberOfMonths()"
          [initialViewDate]="inlineSeedDate()"
          [todayDate]="todayDate"
          [selectedValue]="selectionMode() === 'single' ? singleValue() : null"
          [selectedRange]="selectionMode() === 'range' ? rangeValue() : { start: null, end: null }"
          [selectedDates]="selectionMode() === 'multiple' ? multipleValue() : []"
          [minDate]="minDate()"
          [maxDate]="maxDate()"
          [disabledDates]="disabledDates()"
          [disabledDays]="disabledDays()"
          [locale]="locale()"
          [firstDayOfWeek]="firstDayOfWeek()"
          [startDateLabel]="startDateLabel()"
          [endDateLabel]="endDateLabel()"
          [previousMonthLabel]="previousMonthLabel()"
          [nextMonthLabel]="nextMonthLabel()"
          [previousYearLabel]="previousYearLabel()"
          [nextYearLabel]="nextYearLabel()"
          [previousDecadeLabel]="previousDecadeLabel()"
          [nextDecadeLabel]="nextDecadeLabel()"
          [yearFilterPlaceholder]="yearFilterPlaceholder()"
          [emptyLabel]="emptyLabel()"
          [showTime]="showTime()"
          [timeOnly]="timeOnly()"
          [hourFormat]="hourFormat()"
          [stepMinute]="stepMinute()"
          [hourLabel]="hourLabel()"
          [minuteLabel]="minuteLabel()"
          [doneLabel]="doneLabel()"
          [showButtonBar]="showButtonBar()"
          [todayLabel]="todayLabel()"
          [clearLabel]="clearLabel()"
          [dateTemplate]="dateTemplate() ?? null"
          [autoFocus]="false"
          [inline]="true"
          [disabled]="isDisabled()"
          (dateSelect)="onPanelDateSelect($event)"
          (rangeComplete)="onPanelRangeComplete($event)"
          (multipleSelect)="onPanelMultipleSelect($event)"
          (clearRequested)="onPanelClear()"
        />
      </div>
    } @else {
      <input
        #trigger
        type="text"
        role="combobox"
        autocomplete="off"
        [id]="inputId()"
        aria-haspopup="grid"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="isOpen() ? panelElementId : null"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [class]="inputClass()"
        [style.paddingInlineEnd]="trailingPaddingRem()"
        [readOnly]="isReadOnly()"
        [disabled]="isDisabled()"
        [value]="displayText()"
        [placeholder]="placeholder()"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
        (blur)="onBlur()"
        (click)="onInputClick()"
      />
      <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center gap-0.5 pr-(--spacing-field-x)">
        @if (showClear() && hasValue() && !isDisabled()) {
          <button
            type="button"
            class="pointer-events-auto inline-flex items-center justify-center rounded-sm p-0.5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
            [attr.aria-label]="clearLabel()"
            (click)="clear($event)"
          >
            <med-icon name="x-mark" variant="mini" class="size-3.5" />
          </button>
        }
        <button
          type="button"
          class="pointer-events-auto inline-flex items-center justify-center rounded-sm p-0.5 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300"
          [disabled]="isDisabled()"
          [attr.aria-label]="toggleLabel()"
          (click)="toggle($event)"
        >
          <med-icon name="calendar" variant="mini" class="size-4" />
        </button>
      </span>
    }
  `,
})
export class DatePickerComponent implements ControlValueAccessor, OnDestroy {
  private readonly overlayService = inject(OverlayService);
  private readonly fluidContext = inject(MED_FLUID_CONTEXT, { optional: true });
  private readonly instanceId = nextDatePickerId++;
  protected readonly panelElementId = `med-date-picker-panel-${this.instanceId}`;
  protected readonly todayDate = startOfDay(new Date());

  readonly selectionMode = input<DatePickerSelectionMode>('single');
  /** Single mode only — see class doc's "view: 'month'" section. */
  readonly view = input<DatePickerView>('date');
  readonly navigation = input<'calendar' | 'drilldown'>('calendar');
  readonly inline = input(false, { transform: booleanAttribute });
  readonly dateFormat = input('mm/dd/yyyy');
  readonly locale = input('en-US');
  readonly firstDayOfWeek = input(0, { transform: numberAttribute });
  readonly rangeSeparator = input(' - ');
  readonly multipleSeparator = input(', ');
  readonly minDate = input<Date | null>(null);
  readonly maxDate = input<Date | null>(null);
  /** Specific dates that can't be selected — checked in addition to `minDate`/`maxDate`. */
  readonly disabledDates = input<readonly Date[]>([]);
  /** Weekday indices (`0`=Sunday..`6`=Saturday) that can't be selected — e.g. `[0, 6]` disables all weekends. */
  readonly disabledDays = input<readonly number[]>([]);
  readonly size = input<InputTextSize>('default');
  readonly variant = input<FieldVariant>('outlined');
  readonly fluid = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly showClear = input(false, { transform: booleanAttribute });
  readonly showButtonBar = input(false, { transform: booleanAttribute });
  /** `null` (the default) falls back to a format-derived placeholder — see `placeholder` computed below. */
  readonly placeholderOverride = input<string | null>(null, { alias: 'placeholder' });
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly clearLabel = input('Clear');
  readonly todayLabel = input('Today');
  readonly toggleLabel = input('Toggle calendar');
  readonly previousMonthLabel = input('Previous month');
  readonly nextMonthLabel = input('Next month');
  /** Only used by `view="month"` in `navigation="calendar"` mode — pages by year instead of by month. */
  readonly previousYearLabel = input('Previous year');
  readonly nextYearLabel = input('Next year');
  /** Only used by `view="year"` in `navigation="calendar"` mode — pages by decade. */
  readonly previousDecadeLabel = input('Previous decade');
  readonly nextDecadeLabel = input('Next decade');
  readonly startDateLabel = input('Start date');
  readonly endDateLabel = input('End date');
  readonly yearFilterPlaceholder = input('Search year');
  readonly emptyLabel = input('No matching years');
  /** `null` (the default) shows 2 side-by-side months in range mode, 1 otherwise — see `numberOfMonths` computed below. Ignored in `navigation="drilldown"` (always 1 month there). */
  readonly numberOfMonthsOverride = input<number | null>(null, { alias: 'numberOfMonths' });
  /** Single mode only — see class doc's "showTime" section. */
  readonly showTime = input(false, { transform: booleanAttribute });
  readonly timeOnly = input(false, { transform: booleanAttribute });
  readonly hourFormat = input<'12' | '24'>('24');
  readonly stepMinute = input(1, { transform: numberAttribute });
  readonly hourLabel = input('Hour');
  readonly minuteLabel = input('Minute');
  readonly doneLabel = input('Done');
  readonly inputId = input<string | null>(null);
  readonly class = input('', { alias: 'class' });

  /** Optional custom template for day cells, by named reference `#date`. */
  readonly dateTemplate = contentChild<TemplateRef<DatePickerDateTemplateContext>>('date');

  private readonly value = signal<DatePickerValue>(null);
  private readonly rawText = signal('');
  private readonly editingText = signal(false);
  private readonly formsDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formsDisabled());
  protected readonly isFluid = computed(() => this.fluid() || (this.fluidContext?.() ?? false));
  protected readonly isOpen = signal(false);

  private readonly triggerRef = viewChild<ElementRef<HTMLInputElement>>('trigger');
  private handle: OverlayHandle<DatePickerPanelComponent, void> | null = null;

  private onChange: (value: DatePickerValue) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly inputClass = computed(() =>
    mergeClasses(
      inputTextVariants({ size: this.size(), invalid: this.invalid(), variant: this.variant() }),
      this.isFluid() ? 'w-full' : '',
      this.class(),
    ),
  );
  protected readonly inlineWrapperClass = computed(() =>
    mergeClasses(
      'rounded-lg border border-surface-200 bg-surface-0 dark:border-surface-700 dark:bg-surface-800',
      this.isFluid() ? 'block w-full' : 'inline-block',
      this.class(),
    ),
  );
  protected readonly trailingPaddingRem = computed(() => DATE_PICKER_TRAILING_PADDING_REM[this.size()]);

  protected readonly singleValue = computed<Date | null>(() => (this.selectionMode() === 'single' ? (this.value() as Date | null) : null));

  protected readonly rangeValue = computed<DateRange>(() => {
    const current = this.value();
    return current && typeof current === 'object' && 'start' in current ? (current as DateRange) : { start: null, end: null };
  });

  protected readonly multipleValue = computed<readonly Date[]>(() => {
    const current = this.value();
    return Array.isArray(current) ? (current as readonly Date[]) : [];
  });

  protected readonly inlineSeedDate = computed(() => this.seedDate());

  protected readonly isReadOnly = computed(
    () => this.selectionMode() !== 'single' || this.showTime() || this.timeOnly() || this.view() === 'month' || this.view() === 'year',
  );

  protected readonly hasValue = computed(() => {
    if (this.selectionMode() === 'range') {
      const range = this.rangeValue();
      return range.start !== null || range.end !== null;
    }
    if (this.selectionMode() === 'multiple') {
      return this.multipleValue().length > 0;
    }
    return this.value() !== null;
  });

  /**
   * Falls back to a format-derived hint (e.g. `'mm/dd/yyyy'`, or
   * `'mm/dd/yyyy - mm/dd/yyyy'` in range mode) when the consumer doesn't
   * supply one — so a typeable field never leaves the user guessing at the
   * expected pattern, without having to hardcode it redundantly alongside
   * `dateFormat` themselves.
   */
  protected readonly placeholder = computed(() => {
    const override = this.placeholderOverride();
    if (override !== null) {
      return override;
    }
    if (this.timeOnly()) {
      return this.hourFormat() === '12' ? 'hh:mm AM' : 'HH:mm';
    }
    if (this.selectionMode() === 'range') {
      return `${this.dateFormat()}${this.rangeSeparator()}${this.dateFormat()}`;
    }
    if (this.view() === 'year') {
      return 'yyyy';
    }
    if (this.view() === 'month') {
      return 'mm/yyyy';
    }
    return this.dateFormat();
  });

  /** `numberOfMonths` default is mode-aware: 2 for range (see both endpoints' months at once without navigating back and forth), 1 for single — overridable either way. */
  protected readonly numberOfMonths = computed(() => this.numberOfMonthsOverride() ?? (this.selectionMode() === 'range' ? 2 : 1));

  protected readonly displayText = computed(() => {
    if (this.selectionMode() === 'range') {
      return formatRange(this.rangeValue(), this.dateFormat(), this.rangeSeparator());
    }
    if (this.selectionMode() === 'multiple') {
      return this.multipleValue()
        .map((date) => formatDate(date, this.dateFormat()))
        .join(this.multipleSeparator());
    }
    if (this.timeOnly()) {
      const date = this.value() as Date | null;
      return date ? formatTime(date, this.hourFormat()) : '';
    }
    if (this.view() === 'year') {
      const date = this.value() as Date | null;
      return date ? String(date.getFullYear()) : '';
    }
    if (this.view() === 'month') {
      const date = this.value() as Date | null;
      return date ? new Intl.DateTimeFormat(this.locale(), { month: 'long', year: 'numeric' }).format(date) : '';
    }
    if (this.editingText()) {
      return this.rawText();
    }
    const date = this.value() as Date | null;
    if (!date) {
      return '';
    }
    const dateText = formatDate(date, this.dateFormat());
    return this.showTime() ? `${dateText} ${formatTime(date, this.hourFormat())}` : dateText;
  });

  protected onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.editingText.set(true);
    this.rawText.set(text);
    const parsed = parseDate(text, this.dateFormat());
    if (parsed && this.isWithinBounds(parsed)) {
      this.value.set(parsed);
      this.onChange(parsed);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) {
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.open();
        break;
      case 'Enter':
        if (!this.isReadOnly()) {
          this.reformatFromCommittedValue();
        } else {
          this.open();
        }
        break;
      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          this.handle?.close();
        }
        break;
    }
  }

  protected onBlur(): void {
    this.onTouched();
    if (!this.isReadOnly()) {
      this.reformatFromCommittedValue();
    }
    // Deliberately not closing the panel here: opening it moves real DOM
    // focus into it (see class doc), which itself fires this blur handler —
    // closing here would immediately undo the open. Dismissal is fully
    // delegated to OverlayService's own outside-click/Escape handling,
    // same as Select.
  }

  protected onInputClick(): void {
    if (this.isReadOnly()) {
      this.open();
    }
  }

  protected toggle(event: Event): void {
    event.stopPropagation();
    if (this.isDisabled()) {
      return;
    }
    if (this.isOpen()) {
      this.handle?.close();
    } else {
      this.open();
    }
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.clearValue();
    this.triggerRef()?.nativeElement.focus();
  }

  protected onPanelDateSelect(date: Date): void {
    this.setSingleValue(date);
    if (this.handle) {
      this.handle.componentRef.setInput('selectedValue', date);
      // With showTime/timeOnly on, picking a day or dialing time doesn't close
      // the panel — the user uses the Done button, toggle, Escape, or outside-click.
      if (!this.showTime() && !this.timeOnly()) {
        this.handle.close();
      }
    }
  }

  protected onPanelRangeComplete(range: DateRange): void {
    this.setRangeValue(range);
    this.handle?.close();
  }

  protected onPanelMultipleSelect(dates: readonly Date[]): void {
    this.setMultipleValue(dates);
    // Stays open across picks — same reasoning as MultiSelect's own panel.
    this.handle?.componentRef.setInput('selectedDates', dates);
  }

  protected onPanelClear(): void {
    this.clearValue();
    this.handle?.close();
  }

  ngOnDestroy(): void {
    this.handle?.close();
  }

  private clearValue(): void {
    if (this.selectionMode() === 'range') {
      this.setRangeValue({ start: null, end: null });
    } else if (this.selectionMode() === 'multiple') {
      this.setMultipleValue([]);
    } else {
      this.setSingleValue(null);
    }
  }

  private seedDate(): Date {
    if (this.selectionMode() === 'range') {
      return this.rangeValue().start ?? this.rangeValue().end ?? new Date();
    }
    if (this.selectionMode() === 'multiple') {
      return this.multipleValue()[0] ?? new Date();
    }
    return (this.value() as Date | null) ?? new Date();
  }

  /** Mirrors `DatePickerPanelComponent.isDayDisabled()` — a typed date is only committed if it's neither out of bounds nor individually disabled. */
  private isWithinBounds(date: Date): boolean {
    const min = this.minDate();
    const max = this.maxDate();
    const day = startOfDay(date);
    if (min && day < startOfDay(min)) {
      return false;
    }
    if (max && day > startOfDay(max)) {
      return false;
    }
    if (this.disabledDays().includes(day.getDay())) {
      return false;
    }
    return !this.disabledDates().some((disabledDate) => startOfDay(disabledDate).getTime() === day.getTime());
  }

  private reformatFromCommittedValue(): void {
    const date = this.value() as Date | null;
    this.rawText.set(date ? formatDate(date, this.dateFormat()) : '');
    this.editingText.set(false);
  }

  private setSingleValue(date: Date | null): void {
    this.value.set(date);
    this.rawText.set(date ? formatDate(date, this.dateFormat()) : '');
    this.editingText.set(false);
    this.onChange(date);
  }

  private setRangeValue(range: DateRange): void {
    this.value.set(range);
    this.onChange(range);
  }

  private setMultipleValue(dates: readonly Date[]): void {
    this.value.set(dates);
    this.onChange(dates);
  }

  private open(): void {
    if (this.inline() || this.isOpen() || this.isDisabled()) {
      return;
    }
    const triggerEl = this.triggerRef()?.nativeElement;
    if (!triggerEl) {
      return;
    }
    this.isOpen.set(true);

    const seed = this.seedDate();
    const handle = this.overlayService.openConnected<DatePickerPanelComponent, void>(triggerEl, DatePickerPanelComponent, {
      panelClass: SELECT_PANEL_CLASS,
    });
    this.handle = handle;
    if (!this.timeOnly()) {
      const belowSmBreakpoint = window.innerWidth < 640;
      const visibleMonths = this.navigation() === 'drilldown' || belowSmBreakpoint ? 1 : this.numberOfMonths();
      const desiredMinWidthPx = (19 * visibleMonths + 1.5 * (visibleMonths - 1)) * 16;
      const maxAvailableWidthPx = window.innerWidth - 32;
      handle.overlayRef.overlayElement.style.minWidth = `${Math.min(desiredMinWidthPx, maxAvailableWidthPx)}px`;
    }
    handle.overlayRef.overlayElement.style.width = `${triggerEl.offsetWidth}px`;

    handle.componentRef.setInput('panelId', this.panelElementId);
    handle.componentRef.setInput('selectionMode', this.selectionMode());
    handle.componentRef.setInput('pickerView', this.view());
    handle.componentRef.setInput('navigation', this.navigation());
    handle.componentRef.setInput('numberOfMonths', this.numberOfMonths());
    handle.componentRef.setInput('initialViewDate', seed);
    handle.componentRef.setInput('todayDate', startOfDay(new Date()));
    handle.componentRef.setInput('selectedValue', this.selectionMode() === 'single' ? (this.value() as Date | null) : null);
    handle.componentRef.setInput('selectedRange', this.selectionMode() === 'range' ? this.rangeValue() : { start: null, end: null });
    handle.componentRef.setInput('selectedDates', this.selectionMode() === 'multiple' ? this.multipleValue() : []);
    handle.componentRef.setInput('minDate', this.minDate());
    handle.componentRef.setInput('maxDate', this.maxDate());
    handle.componentRef.setInput('disabledDates', this.disabledDates());
    handle.componentRef.setInput('disabledDays', this.disabledDays());
    handle.componentRef.setInput('locale', this.locale());
    handle.componentRef.setInput('firstDayOfWeek', this.firstDayOfWeek());
    handle.componentRef.setInput('startDateLabel', this.startDateLabel());
    handle.componentRef.setInput('endDateLabel', this.endDateLabel());
    handle.componentRef.setInput('previousMonthLabel', this.previousMonthLabel());
    handle.componentRef.setInput('nextMonthLabel', this.nextMonthLabel());
    handle.componentRef.setInput('previousYearLabel', this.previousYearLabel());
    handle.componentRef.setInput('nextYearLabel', this.nextYearLabel());
    handle.componentRef.setInput('previousDecadeLabel', this.previousDecadeLabel());
    handle.componentRef.setInput('nextDecadeLabel', this.nextDecadeLabel());
    handle.componentRef.setInput('yearFilterPlaceholder', this.yearFilterPlaceholder());
    handle.componentRef.setInput('emptyLabel', this.emptyLabel());
    handle.componentRef.setInput('showTime', this.showTime());
    handle.componentRef.setInput('timeOnly', this.timeOnly());
    handle.componentRef.setInput('hourFormat', this.hourFormat());
    handle.componentRef.setInput('stepMinute', this.stepMinute());
    handle.componentRef.setInput('hourLabel', this.hourLabel());
    handle.componentRef.setInput('minuteLabel', this.minuteLabel());
    handle.componentRef.setInput('doneLabel', this.doneLabel());
    handle.componentRef.setInput('showButtonBar', this.showButtonBar());
    handle.componentRef.setInput('todayLabel', this.todayLabel());
    handle.componentRef.setInput('clearLabel', this.clearLabel());
    handle.componentRef.setInput('dateTemplate', this.dateTemplate() ?? null);
    handle.componentRef.setInput('autoFocus', true);
    handle.componentRef.setInput('inline', false);
    handle.componentRef.setInput('disabled', this.isDisabled());
    handle.componentRef.changeDetectorRef.detectChanges();

    handle.componentRef.instance.dateSelect.subscribe((date: Date) => this.onPanelDateSelect(date));
    handle.componentRef.instance.rangeComplete.subscribe((range: DateRange) => this.onPanelRangeComplete(range));
    handle.componentRef.instance.multipleSelect.subscribe((dates: readonly Date[]) => this.onPanelMultipleSelect(dates));
    handle.componentRef.instance.clearRequested.subscribe(() => this.onPanelClear());
    handle.componentRef.instance.closeRequested.subscribe(() => handle.close());

    handle.closed$.subscribe(() => {
      this.isOpen.set(false);
      this.handle = null;
    });
  }

  writeValue(value: DatePickerValue | undefined): void {
    if (this.selectionMode() === 'range') {
      this.value.set((value as DateRange) ?? { start: null, end: null });
    } else if (this.selectionMode() === 'multiple') {
      this.value.set((value as readonly Date[]) ?? []);
    } else {
      const date = (value as Date | null) ?? null;
      this.value.set(date);
      this.rawText.set(date ? formatDate(date, this.dateFormat()) : '');
      this.editingText.set(false);
    }
  }

  registerOnChange(fn: (value: DatePickerValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formsDisabled.set(isDisabled);
  }
}
