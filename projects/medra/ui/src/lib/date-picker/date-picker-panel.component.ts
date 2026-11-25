import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, TemplateRef, booleanAttribute, computed, effect, inject, input, numberAttribute, output, signal, viewChild, viewChildren } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { selectOptionVariants } from '../select/select.styles';
import { startOfDay } from './date-format';
import { dayCellVariants, monthCellVariants } from './date-picker.styles';
import { DatePickerDateTemplateContext, DatePickerSelectionMode, DatePickerView, DateRange } from './date-picker.types';

export interface DateGridCell {
  readonly date: Date;
  readonly outsideMonth: boolean;
  readonly disabled: boolean;
}

function isSameDay(a: Date | null, b: Date | null): boolean {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/**
 * Builds a `Date` from a month count "absolute" since year 0 (`year * 12 +
 * month`) — used throughout this file for sliding-window month arithmetic
 * (`viewYear() * 12 + viewMonth() + offset`, etc.). Deliberately NOT
 * `new Date(0, absoluteMonth, day)`: the `Date` constructor special-cases a
 * two-digit year argument (`0`-`99`) by adding 1900 to it *before*
 * normalizing an out-of-range month, so `new Date(0, 24312, 1)` doesn't mean
 * "year 0, month 24312 (normalizes to year 2026)" — it means "year 1900,
 * month 24312", landing almost 1900 years off. Computing year/month via
 * `Math.floor`/modulo first and only ever passing a real (already in-range,
 * always > 99 for any date this component deals with) year avoids the
 * special case entirely.
 */
function dateFromAbsoluteMonth(absoluteMonth: number, day: number): Date {
  const year = Math.floor(absoluteMonth / 12);
  const month = ((absoluteMonth % 12) + 12) % 12;
  return new Date(year, month, day);
}

const YEAR_LIST_WINDOW = 100;

/**
 * Internal overlay content for `DatePickerComponent` (not part of the public
 * API). Owns three views (`view` signal: `'year' | 'month' | 'day'`) — see
 * `DatePickerComponent`'s class doc and the plan's "Navigation modes"
 * section for the full design. `navigation() === 'calendar'` only ever
 * renders `'day'`; `navigation() === 'drilldown'` starts every fresh pick at
 * `'year'` and moves forward one level per selection, with the header label
 * at each level going back exactly one (no prev/next chevrons in that mode).
 *
 * Follows the activedescendant pattern for all three views (same as
 * `SelectPanelComponent`, not real roving `tabindex`): DOM focus lives on
 * whichever view's `role="grid"`/`role="listbox"` container, and
 * `aria-activedescendant` plus the `active` CVA variant substitute for a
 * native focus ring on the "virtually active" cell/row.
 */
@Component({
  selector: 'med-date-picker-panel',
  standalone: true,
  imports: [IconComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // `w-full`, not just `block`: `.cdk-overlay-pane` is a flex container, so a
  // plain block child sizes to shrink-to-fit content instead of the pane's
  // width — same underlying CDK behavior already documented (and fixed the
  // same way) on `SelectPanelComponent`. Without it, the year list (whose
  // content has no natural width pushing past the `min-width` floor the way
  // the day grid usually does) visibly shrinks to that floor regardless of
  // how wide the pane itself actually is.
  host: { class: 'block w-full' },
  template: `
    <div
      [class]="outerPanelClass()"
      [style.--dp-panel-min-width]="timeOnly() ? null : outerMinWidthRem()"
      [attr.aria-disabled]="disabled() ? 'true' : null"
      [id]="panelId()"
    >
      @if (!timeOnly()) {
        @if (selectionMode() === 'range') {
          <p class="mb-2 text-xs font-medium text-surface-500 dark:text-surface-400">
            {{ rangeStage() === 'start' ? startDateLabel() : endDateLabel() }}
          </p>
        }

        @switch (view()) {
          @case ('year') {
            @if (navigation() === 'drilldown') {
              <div class="mb-2 flex items-center gap-2 border-b border-surface-200 px-1 pb-2 dark:border-surface-700">
                <med-icon name="magnifying-glass" variant="mini" class="size-4 shrink-0 text-surface-400" />
                <input
                  #yearFilterInput
                  type="text"
                  inputmode="numeric"
                  class="w-full bg-transparent text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none dark:text-surface-50 dark:placeholder:text-surface-500"
                  [disabled]="disabled()"
                  [placeholder]="yearFilterPlaceholder()"
                  [attr.aria-label]="yearFilterPlaceholder()"
                  [value]="yearFilterText()"
                  (input)="onYearFilterInput($event)"
                  (keydown)="onKeydown($event)"
                />
              </div>
              <div
                #yearContainer
                [id]="containerId('year')"
                role="listbox"
                tabindex="-1"
                class="max-h-60 overflow-y-auto outline-none [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-surface-300 dark:[&::-webkit-scrollbar-thumb]:bg-surface-600"
                [attr.aria-activedescendant]="activeYearId()"
                (keydown)="onKeydown($event)"
              >
                @if (yearListItems().length === 0) {
                  <p class="px-3 py-2 text-sm text-surface-400 dark:text-surface-500">{{ emptyLabel() }}</p>
                } @else {
                  @for (year of yearListItems(); track year) {
                    <div
                      [id]="yearRowId(year)"
                      role="option"
                      [attr.aria-selected]="isYearRelevant(year)"
                      [attr.aria-disabled]="isYearDisabled(year) ? 'true' : null"
                      [class]="yearRowClass(year)"
                      (pointerdown)="onYearPointerDown($event, year)"
                      (pointerenter)="focusedYear.set(year)"
                    >
                      <span class="flex-1">{{ year }}</span>
                      @if (isYearRelevant(year)) {
                        <med-icon name="check" variant="mini" class="size-4 shrink-0 text-brand-500 dark:text-brand-400" />
                      }
                    </div>
                  }
                }
              </div>
            } @else {
              <div class="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  class="rounded-sm p-1 hover:bg-surface-100 disabled:pointer-events-none disabled:opacity-(--opacity-disabled) dark:hover:bg-surface-700"
                  [disabled]="disabled() || !canGoPreviousDecade()"
                  [attr.aria-label]="previousDecadeLabel()"
                  (click)="previousDecade()"
                >
                  <med-icon name="chevron-left" variant="mini" class="size-4" />
                </button>
                <span class="text-sm font-semibold">{{ decadeStart() }} - {{ decadeStart() + 11 }}</span>
                <button
                  type="button"
                  class="rounded-sm p-1 hover:bg-surface-100 disabled:pointer-events-none disabled:opacity-(--opacity-disabled) dark:hover:bg-surface-700"
                  [disabled]="disabled() || !canGoNextDecade()"
                  [attr.aria-label]="nextDecadeLabel()"
                  (click)="nextDecade()"
                >
                  <med-icon name="chevron-right" variant="mini" class="size-4" />
                </button>
              </div>
              <div
                #yearGridContainer
                [id]="containerId('year')"
                role="grid"
                tabindex="-1"
                class="grid grid-cols-4 gap-1 outline-none"
                [attr.aria-label]="decadeStart() + ' - ' + (decadeStart() + 11)"
                [attr.aria-activedescendant]="activeYearGridId()"
                (keydown)="onKeydown($event)"
              >
                @for (year of decadeYears(); track year) {
                  <div
                    [id]="yearRowId(year)"
                    role="gridcell"
                    [attr.aria-selected]="isYearRelevant(year)"
                    [attr.aria-disabled]="isYearDisabled(year) ? 'true' : null"
                    [class]="yearCellClass(year)"
                    (pointerdown)="onYearPointerDown($event, year)"
                    (pointerenter)="onYearPointerEnter(year)"
                  >
                    {{ year }}
                  </div>
                }
              </div>
            }
          }
          @case ('month') {
            <div class="mb-2 flex items-center justify-between">
              @if (navigation() === 'calendar') {
                <button
                  type="button"
                  class="rounded-sm p-1 hover:bg-surface-100 disabled:pointer-events-none disabled:opacity-(--opacity-disabled) dark:hover:bg-surface-700"
                  [disabled]="disabled() || !canGoPreviousYear()"
                  [attr.aria-label]="previousYearLabel()"
                  (click)="previousYear()"
                >
                  <med-icon name="chevron-left" variant="mini" class="size-4" />
                </button>
              } @else {
                <span class="w-6"></span>
              }
              @if (navigation() === 'drilldown') {
                <button type="button" [disabled]="disabled()" class="rounded-sm px-2 py-1 text-sm font-semibold hover:bg-surface-100 dark:hover:bg-surface-700" (click)="goToYearView()">
                  {{ viewYear() }}
                </button>
              } @else {
                <span class="text-sm font-semibold">{{ viewYear() }}</span>
              }
              @if (navigation() === 'calendar') {
                <button
                  type="button"
                  class="rounded-sm p-1 hover:bg-surface-100 disabled:pointer-events-none disabled:opacity-(--opacity-disabled) dark:hover:bg-surface-700"
                  [disabled]="disabled() || !canGoNextYear()"
                  [attr.aria-label]="nextYearLabel()"
                  (click)="nextYear()"
                >
                  <med-icon name="chevron-right" variant="mini" class="size-4" />
                </button>
              } @else {
                <span class="w-6"></span>
              }
            </div>
            <div
              #monthContainer
              [id]="containerId('month')"
              role="grid"
              tabindex="-1"
              class="grid grid-cols-4 gap-1 outline-none"
              [attr.aria-label]="viewYear()"
              [attr.aria-activedescendant]="activeMonthId()"
              (keydown)="onKeydown($event)"
            >
              @for (label of monthLabels(); track $index) {
                <div
                  [id]="monthCellId($index)"
                  role="gridcell"
                  [attr.aria-selected]="isMonthSelected($index)"
                  [attr.aria-disabled]="isMonthDisabled(viewYear(), $index) ? 'true' : null"
                  [class]="monthCellClass($index)"
                  (pointerdown)="onMonthPointerDown($event, $index)"
                  (pointerenter)="onMonthPointerEnter($index)"
                >
                  {{ label }}
                </div>
              }
            </div>
          }
          @case ('day') {
            <div class="flex gap-6">
              @for (offset of monthOffsets(); track offset) {
                <div [class]="offset === 0 ? 'flex-1' : 'hidden flex-1 sm:block'">
                  <div class="mb-2 flex items-center justify-between">
                    @if (navigation() === 'calendar' && offset === 0) {
                      <button
                        type="button"
                        class="rounded-sm p-1 hover:bg-surface-100 disabled:pointer-events-none disabled:opacity-(--opacity-disabled) dark:hover:bg-surface-700"
                        [disabled]="disabled() || !canGoPreviousMonth()"
                        [attr.aria-label]="previousMonthLabel()"
                        (click)="previousMonth()"
                      >
                        <med-icon name="chevron-left" variant="mini" class="size-4" />
                      </button>
                    } @else {
                      <span class="w-6"></span>
                    }

                    @if (navigation() === 'drilldown' && offset === 0) {
                      <button type="button" [disabled]="disabled()" class="rounded-sm px-2 py-1 text-sm font-semibold hover:bg-surface-100 dark:hover:bg-surface-700" (click)="goToMonthView()">
                        {{ monthYearLabelForOffset(offset) }}
                      </button>
                    } @else {
                      <span class="text-sm font-semibold">{{ monthYearLabelForOffset(offset) }}</span>
                    }

                    @if (navigation() === 'calendar' && offset === monthOffsets().length - 1) {
                      <button
                        type="button"
                        class="rounded-sm p-1 hover:bg-surface-100 disabled:pointer-events-none disabled:opacity-(--opacity-disabled) dark:hover:bg-surface-700"
                        [disabled]="disabled() || !canGoNextMonth()"
                        [attr.aria-label]="nextMonthLabel()"
                        (click)="nextMonth()"
                      >
                        <med-icon name="chevron-right" variant="mini" class="size-4" />
                      </button>
                    } @else if (navigation() === 'calendar' && offset === 0) {
                      <button
                        type="button"
                        class="rounded-sm p-1 hover:bg-surface-100 disabled:pointer-events-none disabled:opacity-(--opacity-disabled) dark:hover:bg-surface-700 sm:invisible"
                        [disabled]="disabled() || !canGoNextMonth()"
                        [attr.aria-label]="nextMonthLabel()"
                        (click)="nextMonth()"
                      >
                        <med-icon name="chevron-right" variant="mini" class="size-4" />
                      </button>
                    } @else {
                      <span class="w-6"></span>
                    }
                  </div>
                  <div
                    #dayContainer
                    [id]="containerId('day') + '-' + offset"
                    role="grid"
                    tabindex="-1"
                    class="outline-none"
                    [attr.aria-label]="monthYearLabelForOffset(offset)"
                    [attr.aria-activedescendant]="offset === focusedMonthOffset() ? activeDayId() : null"
                    (keydown)="onKeydown($event)"
                  >
                    <div role="row" class="grid grid-cols-7">
                      @for (label of weekdayLabels(); track $index) {
                        <span role="columnheader" [attr.abbr]="label.full" class="flex h-8 items-center justify-center text-xs text-surface-500 dark:text-surface-400">{{ label.short }}</span>
                      }
                    </div>
                    @for (week of weeksForOffset(offset); track $index) {
                      <div role="row" class="grid grid-cols-7">
                        @for (cell of week; track cell.date.getTime()) {
                          @if (cell.outsideMonth && effectiveNumberOfMonths() > 1) {
                            <div class="size-9" aria-hidden="true"></div>
                          } @else {
                            <div
                              [id]="dayCellId(cell.date)"
                              role="gridcell"
                              [attr.aria-selected]="isDaySelected(cell) || null"
                              [attr.aria-current]="isToday(cell.date) ? 'date' : null"
                              [attr.aria-disabled]="cell.disabled ? 'true' : null"
                              [class]="dayCellClass(cell)"
                              (pointerdown)="onDayPointerDown($event, cell)"
                              (pointerenter)="onDayPointerEnter(cell)"
                            >
                              @if (dateTemplate(); as tpl) {
                                <ng-container [ngTemplateOutlet]="tpl" [ngTemplateOutletContext]="dateCellContext(cell)" />
                              } @else {
                                {{ cell.date.getDate() }}
                              }
                            </div>
                          }
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }
        }
      }

      @if (timeOnly() || (showTime() && selectionMode() === 'single' && pickerView() !== 'month' && pickerView() !== 'year')) {
        <div
          [class]="timeOnly() ? 'flex items-center justify-center gap-3' : 'mt-3 flex items-center justify-center gap-3 border-t border-surface-200 pt-3 dark:border-surface-700'"
          (keydown.escape)="onTimeEscape($event)"
        >
          <div class="flex items-center gap-1">
            <input
              #hourInput
              type="number"
              inputmode="numeric"
              class="w-11 rounded-sm border border-surface-300 bg-transparent px-1 py-1 text-center text-sm tabular-nums text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-surface-600 dark:text-surface-50"
              [disabled]="disabled()"
              [attr.aria-label]="hourLabel()"
              [attr.min]="hourFormat() === '24' ? 0 : 1"
              [attr.max]="hourFormat() === '24' ? 23 : 12"
              [value]="displayHour()"
              (input)="onHourInput($event)"
            />
            <span aria-hidden="true" class="text-sm text-surface-500 dark:text-surface-400">:</span>
            <input
              type="number"
              inputmode="numeric"
              class="w-11 rounded-sm border border-surface-300 bg-transparent px-1 py-1 text-center text-sm tabular-nums text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-surface-600 dark:text-surface-50"
              [disabled]="disabled()"
              [attr.aria-label]="minuteLabel()"
              min="0"
              max="59"
              [attr.step]="stepMinute()"
              [value]="paddedMinute()"
              (input)="onMinuteInput($event)"
            />
            @if (hourFormat() === '12') {
              <button
                type="button"
                class="rounded-sm px-1.5 py-1 text-xs font-medium text-surface-600 hover:bg-surface-100 disabled:pointer-events-none disabled:opacity-(--opacity-disabled) dark:text-surface-300 dark:hover:bg-surface-700"
                [disabled]="disabled()"
                (click)="togglePeriod()"
              >
                {{ period() }}
              </button>
            }
          </div>
          @if (!inline()) {
            <button
              type="button"
              class="rounded-sm px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 disabled:pointer-events-none disabled:opacity-(--opacity-disabled) dark:text-brand-400 dark:hover:bg-brand-950"
              [disabled]="disabled()"
              (click)="closeRequested.emit()"
            >
              {{ doneLabel() }}
            </button>
          }
        </div>
      }

      @if (showButtonBar()) {
        <div class="mt-3 flex items-center justify-between border-t border-surface-200 pt-3 dark:border-surface-700">
          <button
            type="button"
            class="rounded-sm px-2 py-1 text-xs font-medium text-surface-700 hover:bg-surface-100 disabled:pointer-events-none disabled:opacity-(--opacity-disabled) dark:text-surface-200 dark:hover:bg-surface-700"
            [disabled]="disabled() || isTodayDisabled()"
            (click)="onTodayClick()"
          >
            {{ todayLabel() }}
          </button>
          <button
            type="button"
            class="rounded-sm px-2 py-1 text-xs font-medium text-surface-700 hover:bg-surface-100 disabled:pointer-events-none disabled:opacity-(--opacity-disabled) dark:text-surface-200 dark:hover:bg-surface-700"
            [disabled]="disabled()"
            (click)="onClearClick()"
          >
            {{ clearLabel() }}
          </button>
        </div>
      }
    </div>
  `,
})
export class DatePickerPanelComponent implements OnInit {
  readonly panelId = input.required<string>();
  readonly selectionMode = input<DatePickerSelectionMode>('single');
  /** Named differently from the internal `view` signal (`'year'|'month'|'day'`, the *current* rendered level) — this is the *terminal* level the picker settles at. Single mode only, see `DatePickerComponent`'s class doc. */
  readonly pickerView = input<DatePickerView>('date');
  readonly navigation = input<'calendar' | 'drilldown'>('calendar');
  readonly initialViewDate = input.required<Date>();
  readonly todayDate = input.required<Date>();
  readonly selectedValue = input<Date | null>(null);
  readonly selectedRange = input<DateRange>({ start: null, end: null });
  readonly selectedDates = input<readonly Date[]>([]);
  readonly minDate = input<Date | null>(null);
  readonly maxDate = input<Date | null>(null);
  /** Specific dates that can't be selected — checked in addition to `minDate`/`maxDate`, see `isDayDisabled()`. */
  readonly disabledDates = input<readonly Date[]>([]);
  /** Weekday indices (`0`=Sunday..`6`=Saturday) that can't be selected — e.g. `[0, 6]` disables all weekends. */
  readonly disabledDays = input<readonly number[]>([]);
  readonly locale = input('en-US');
  readonly firstDayOfWeek = input(0, { transform: numberAttribute });
  readonly startDateLabel = input('Start date');
  readonly endDateLabel = input('End date');
  readonly previousMonthLabel = input('Previous month');
  readonly nextMonthLabel = input('Next month');
  /** Only used by `pickerView="month"` in `navigation="calendar"` mode — pages by year instead of by month. */
  readonly previousYearLabel = input('Previous year');
  readonly nextYearLabel = input('Next year');
  /** Only used by `pickerView="year"` in `navigation="calendar"` mode — pages by decade. */
  readonly previousDecadeLabel = input('Previous decade');
  readonly nextDecadeLabel = input('Next decade');
  readonly yearFilterPlaceholder = input('Search year');
  readonly emptyLabel = input('No matching years');
  /**
   * How many consecutive months to show side by side in the day view.
   * Forced to `1` in `navigation="drilldown"` mode regardless of this input
   * — see `effectiveNumberOfMonths`. Below the `sm` Tailwind breakpoint,
   * only the first month renders (`hidden sm:block` on the rest) so a
   * multi-month layout never gets cramped on a narrow viewport — checked
   * against the *viewport*, not the panel's own available space (a true
   * container-query-based check would need more setup than this warrants).
   */
  readonly numberOfMonths = input(1, { transform: numberAttribute });
  /** Adds an hour/minute row below the day grid — see `DatePickerComponent`'s class doc for the datetime design. Ignored in `selectionMode="range"` (documented cut, same category as free-text range typing). */
  readonly showTime = input(false, { transform: booleanAttribute });
  readonly timeOnly = input(false, { transform: booleanAttribute });
  readonly hourFormat = input<'12' | '24'>('24');
  readonly stepMinute = input(1, { transform: numberAttribute });
  readonly hourLabel = input('Hour');
  readonly minuteLabel = input('Minute');
  readonly doneLabel = input('Done');
  readonly showButtonBar = input(false, { transform: booleanAttribute });
  readonly todayLabel = input('Today');
  readonly clearLabel = input('Clear');
  readonly dateTemplate = input<TemplateRef<DatePickerDateTemplateContext> | null>(null);
  readonly autoFocus = input(true, { transform: booleanAttribute });
  readonly inline = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly dateSelect = output<Date>();
  readonly rangeComplete = output<DateRange>();
  readonly multipleSelect = output<readonly Date[]>();
  readonly clearRequested = output<void>();
  readonly closeRequested = output<void>();

  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly view = signal<'year' | 'month' | 'day'>('day');
  protected readonly viewYear = signal(0);
  protected readonly viewMonth = signal(0);
  protected readonly focusedDate = signal(new Date(0));
  protected readonly focusedMonth = signal(0);
  protected readonly focusedYear = signal(0);
  protected readonly rangeAnchor = signal<Date | null>(null);
  protected readonly previewEnd = signal<Date | null>(null);
  protected readonly yearFilterText = signal('');
  /** Seeded from `selectedValue()`'s own time-of-day if present, else the moment the panel opened — see `ngAfterViewInit`. */
  protected readonly selectedHour24 = signal(0);
  protected readonly selectedMinute = signal(0);

  protected readonly displayHour = computed(() => {
    if (this.hourFormat() === '24') {
      return this.selectedHour24();
    }
    const hour12 = this.selectedHour24() % 12;
    return hour12 === 0 ? 12 : hour12;
  });
  protected readonly paddedMinute = computed(() => String(this.selectedMinute()).padStart(2, '0'));
  protected readonly period = computed<'AM' | 'PM'>(() => (this.selectedHour24() < 12 ? 'AM' : 'PM'));

  protected readonly rangeStage = computed<'start' | 'end'>(() => (this.rangeAnchor() === null ? 'start' : 'end'));

  private readonly minDateNormalized = computed(() => {
    const value = this.minDate();
    return value ? startOfDay(value) : null;
  });
  private readonly maxDateNormalized = computed(() => {
    const value = this.maxDate();
    return value ? startOfDay(value) : null;
  });

  /**
   * The range currently being *displayed*: while a first endpoint is picked
   * (`rangeAnchor` set), this previews live against `previewEnd` (hover/
   * keyboard move) instead of the last committed `selectedRange` — swapping
   * automatically if the preview lands before the anchor.
   */
  protected readonly effectiveRange = computed<DateRange>(() => {
    if (this.selectionMode() !== 'range') {
      return { start: null, end: null };
    }
    const anchor = this.rangeAnchor();
    if (anchor === null) {
      return this.selectedRange();
    }
    const preview = this.previewEnd() ?? anchor;
    return anchor <= preview ? { start: anchor, end: preview } : { start: preview, end: anchor };
  });

  /** `navigation="drilldown"` always shows exactly one month — see the `numberOfMonths` input doc. */
  protected readonly effectiveNumberOfMonths = computed(() => (this.navigation() === 'drilldown' ? 1 : Math.max(1, this.numberOfMonths())));

  protected readonly monthOffsets = computed(() => Array.from({ length: this.effectiveNumberOfMonths() }, (_, i) => i));

  /**
   * Width floor for the outer panel from the `sm` breakpoint up: one month's
   * worth of space per visible month, plus the `gap-6` (1.5rem) between them.
   * Below `sm`, the template's static `min-w-[19rem]` (a single month's
   * width) applies instead, regardless of this value — matching the
   * per-column `hidden sm:block` collapse above, so the panel never reserves
   * space for months that aren't actually rendered on a narrow viewport.
   *
   * Both the static floor and this value are further wrapped in
   * `min(…, calc(100vw - 2rem))` in the template: on a 320px phone, 19rem
   * (304px) leaves only 16px of slack against the viewport once the page's
   * own edge padding is accounted for — not enough for
   * `OverlayService`'s connected-position strategy to actually center the
   * panel with a margin on both sides (with that little slack, it ends up
   * flush against one edge instead of splitting the difference). Reserving
   * a full 2rem keeps the ask comfortably inside what any phone-sized
   * viewport can spare, so the overlay always has real slack to distribute.
   */
  protected readonly outerMinWidthRem = computed(() => {
    const count = this.effectiveNumberOfMonths();
    return `${19 * count + 1.5 * (count - 1)}rem`;
  });

  /** Which of the visible months (0-indexed from `viewYear`/`viewMonth`) currently contains `focusedDate` — the one grid that gets real DOM focus/`aria-activedescendant`. */
  protected readonly focusedMonthOffset = computed(() => {
    const base = this.viewYear() * 12 + this.viewMonth();
    const focused = this.focusedDate().getFullYear() * 12 + this.focusedDate().getMonth();
    const span = this.effectiveNumberOfMonths();
    return Math.max(0, Math.min(span - 1, focused - base));
  });

  protected weeksForOffset(offset: number): DateGridCell[][] {
    const absoluteMonth = this.viewYear() * 12 + this.viewMonth() + offset;
    return this.computeWeeksFor(dateFromAbsoluteMonth(absoluteMonth, 1));
  }

  private computeWeeksFor(monthStart: Date): DateGridCell[][] {
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    const offset = (monthStart.getDay() - this.firstDayOfWeek() + 7) % 7;
    const gridStart = new Date(year, month, 1 - offset);
    const cells: DateGridCell[] = Array.from({ length: 42 }, (_, i) => {
      const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
      return { date, outsideMonth: date.getMonth() !== month, disabled: this.isDayDisabled(date) };
    });
    return Array.from({ length: 6 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  }

  protected readonly weekdayLabels = computed(() => {
    const shortFormatter = new Intl.DateTimeFormat(this.locale(), { weekday: 'short' });
    const longFormatter = new Intl.DateTimeFormat(this.locale(), { weekday: 'long' });
    const referenceSunday = new Date(2023, 0, 1); // a known Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(referenceSunday.getFullYear(), referenceSunday.getMonth(), referenceSunday.getDate() + ((this.firstDayOfWeek() + i) % 7));
      return { short: shortFormatter.format(date), full: longFormatter.format(date) };
    });
  });

  protected readonly monthYearLabel = computed(() => this.monthYearLabelForOffset(0));

  protected monthYearLabelForOffset(offset: number): string {
    const absoluteMonth = this.viewYear() * 12 + this.viewMonth() + offset;
    return new Intl.DateTimeFormat(this.locale(), { month: 'long', year: 'numeric' }).format(dateFromAbsoluteMonth(absoluteMonth, 1));
  }

  protected readonly monthLabels = computed(() => {
    const formatter = new Intl.DateTimeFormat(this.locale(), { month: 'short' });
    return Array.from({ length: 12 }, (_, i) => formatter.format(new Date(this.viewYear(), i, 1)));
  });

  protected readonly yearListItems = computed(() => {
    const min = this.minDateNormalized();
    const max = this.maxDateNormalized();
    const centerYear = this.todayDate().getFullYear();
    const startYear = min ? min.getFullYear() : centerYear - YEAR_LIST_WINDOW;
    const endYear = max ? max.getFullYear() : centerYear + YEAR_LIST_WINDOW;
    const allYears = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    const filterText = this.yearFilterText().trim();
    return filterText ? allYears.filter((year) => String(year).includes(filterText)) : allYears;
  });

  protected readonly decadeStart = computed(() => Math.floor(this.viewYear() / 10) * 10);
  protected readonly decadeYears = computed(() => Array.from({ length: 12 }, (_, i) => this.decadeStart() + i));
  protected readonly outerPanelClass = computed(() => {
    const base = this.timeOnly()
      ? 'w-full p-3'
      : 'w-full min-w-[min(19rem,calc(100vw-2rem))] p-3 sm:[min-width:min(var(--dp-panel-min-width),calc(100vw-2rem))]';
    return this.disabled() ? `${base} pointer-events-none select-none opacity-(--opacity-disabled)` : base;
  });

  protected readonly activeDayId = computed(() => (this.view() === 'day' ? this.dayCellId(this.focusedDate()) : null));
  protected readonly activeMonthId = computed(() => (this.view() === 'month' ? this.monthCellId(this.focusedMonth()) : null));
  protected readonly activeYearId = computed(() => (this.view() === 'year' && this.navigation() === 'drilldown' ? this.yearRowId(this.focusedYear()) : null));
  protected readonly activeYearGridId = computed(() => (this.view() === 'year' && this.navigation() === 'calendar' ? this.yearRowId(this.focusedYear()) : null));

  private readonly yearFilterInputRef = viewChild<ElementRef<HTMLInputElement>>('yearFilterInput');
  private readonly yearContainerRef = viewChild<ElementRef<HTMLElement>>('yearContainer');
  private readonly yearGridContainerRef = viewChild<ElementRef<HTMLElement>>('yearGridContainer');
  private readonly monthContainerRef = viewChild<ElementRef<HTMLElement>>('monthContainer');
  private readonly hourInputRef = viewChild<ElementRef<HTMLInputElement>>('hourInput');
  /** One per visible month (see `numberOfMonths`) — `focusedMonthOffset()` picks which one actually gets focus. */
  private readonly dayContainerRefs = viewChildren<ElementRef<HTMLElement>>('dayContainer');

  /**
   * Grabs real DOM focus onto whichever view's container is current — same
   * intent as `SelectPanelComponent.ngAfterViewInit()`'s single `.focus()`
   * call, but this component switches between three different containers
   * over its lifetime (year list -> month grid -> day grid), so a plain
   * `ngAfterViewInit()` call only covers the very first one. Reading these
   * as `viewChild()` signals (rather than `document.getElementById` inside
   * the effect) matters: a `viewChild()` signal only flips from `undefined`
   * to the real `ElementRef` once Angular has actually rendered that
   * `@switch` case, so the effect is guaranteed to fire again exactly when
   * the new container exists — a raw `document.getElementById` re-read
   * inside the same effect would still only be reactive to `view()`
   * changing, and would find nothing on the very first run for any view
   * whose container isn't in the DOM yet at that instant.
   *
   * When the year view is active, the filter `<input>` (not the listbox
   * `<div>`) gets real focus — same precedent as `SelectPanelComponent`'s
   * `(this.filterInputRef()?.nativeElement ?? this.listRef().nativeElement)
   * .focus()`, so the user can start typing immediately. `aria-activedescendant`
   * still lives on the listbox regardless (matching `SelectPanelComponent`'s
   * own filterable case, where it's likewise never moved onto the filter
   * input itself).
   */
  private readonly focusActiveContainer = effect(() => {
    if (!this.autoFocus()) {
      return;
    }
    if (this.timeOnly()) {
      this.hourInputRef()?.nativeElement.focus();
      return;
    }
    const yearContainer = this.yearContainerRef()?.nativeElement;
    const dayContainers = this.dayContainerRefs();
    const relevantDayContainer = (dayContainers[this.focusedMonthOffset()] ?? dayContainers[0])?.nativeElement;
    const element =
      this.yearFilterInputRef()?.nativeElement ??
      yearContainer ??
      this.yearGridContainerRef()?.nativeElement ??
      this.monthContainerRef()?.nativeElement ??
      relevantDayContainer;
    element?.focus();
    if (yearContainer) {
      // The year list can hold ~200 rows in a scrollable `max-h-60` box —
      // unlike the day/month grids (always fully visible), it needs an
      // explicit scroll to bring the relevant year into view, both on
      // first entering this view and on every keyboard move afterward
      // (`focusedYear()` is read here specifically so this effect re-runs
      // on `ArrowUp`/`ArrowDown`/`PageUp`/`PageDown`/`Home`/`End` too, not
      // just once).
      document.getElementById(this.yearRowId(this.focusedYear()))?.scrollIntoView({ block: 'center' });
    }
  });

  ngOnInit(): void {
    this.beginFreshPick(this.initialViewDate());
    if (this.showTime() || this.timeOnly()) {
      const seedTime = this.selectedValue() ?? new Date();
      this.selectedHour24.set(seedTime.getHours());
      this.selectedMinute.set(seedTime.getMinutes());
    }
  }

  protected containerId(view: 'year' | 'month' | 'day'): string {
    return `${this.panelId()}-${view}-container`;
  }

  protected dayCellId(date: Date): string {
    return `${this.panelId()}-day-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  protected monthCellId(month: number): string {
    return `${this.panelId()}-month-${this.viewYear()}-${month}`;
  }

  protected yearRowId(year: number): string {
    return `${this.panelId()}-year-${year}`;
  }

  protected isToday(date: Date): boolean {
    return isSameDay(date, this.todayDate());
  }

  protected isDaySelected(cell: DateGridCell): boolean {
    if (this.selectionMode() === 'single') {
      return isSameDay(cell.date, this.selectedValue());
    }
    if (this.selectionMode() === 'multiple') {
      return this.selectedDates().some((date) => isSameDay(date, cell.date));
    }
    const range = this.effectiveRange();
    return isSameDay(cell.date, range.start) || isSameDay(cell.date, range.end);
  }

  protected dayCellClass(cell: DateGridCell): string {
    const range = this.effectiveRange();
    const isStart = isSameDay(cell.date, range.start);
    const isEnd = isSameDay(cell.date, range.end);
    const isSingleDayRange = isStart && isEnd;
    const inRange = !!range.start && !!range.end && cell.date > range.start && cell.date < range.end;
    const isMultipleSelected = this.selectionMode() === 'multiple' && this.selectedDates().some((date) => isSameDay(date, cell.date));
    return dayCellVariants({
      active: isSameDay(cell.date, this.focusedDate()),
      today: this.isToday(cell.date),
      selected: (this.selectionMode() === 'single' && isSameDay(cell.date, this.selectedValue())) || isSingleDayRange || isMultipleSelected,
      inRange,
      rangeStart: isStart && !isSingleDayRange,
      rangeEnd: isEnd && !isSingleDayRange,
      outsideMonth: cell.outsideMonth,
      disabled: cell.disabled,
    });
  }

  protected isMonthSelected(month: number): boolean {
    const year = this.viewYear();
    if (this.selectionMode() === 'single') {
      const value = this.selectedValue();
      return !!value && value.getFullYear() === year && value.getMonth() === month;
    }
    if (this.selectionMode() === 'multiple') {
      return this.selectedDates().some((date) => date.getFullYear() === year && date.getMonth() === month);
    }
    const anchor = this.rangeAnchor();
    if (anchor) {
      return anchor.getFullYear() === year && anchor.getMonth() === month;
    }
    const range = this.selectedRange();
    return (
      (!!range.start && range.start.getFullYear() === year && range.start.getMonth() === month) ||
      (!!range.end && range.end.getFullYear() === year && range.end.getMonth() === month)
    );
  }

  protected isMonthDisabled(year: number, month: number): boolean {
    const min = this.minDateNormalized();
    const max = this.maxDateNormalized();
    const lastDay = new Date(year, month + 1, 0);
    const firstDay = new Date(year, month, 1);
    if (min && lastDay < min) {
      return true;
    }
    if (max && firstDay > max) {
      return true;
    }
    return false;
  }

  protected monthCellClass(month: number): string {
    return monthCellVariants({
      active: month === this.focusedMonth(),
      current: this.viewYear() === this.todayDate().getFullYear() && month === this.todayDate().getMonth(),
      selected: this.isMonthSelected(month),
      disabled: this.isMonthDisabled(this.viewYear(), month),
    });
  }

  protected isYearRelevant(year: number): boolean {
    if (this.selectionMode() === 'single') {
      const value = this.selectedValue();
      return !!value && value.getFullYear() === year;
    }
    if (this.selectionMode() === 'multiple') {
      return this.selectedDates().some((date) => date.getFullYear() === year);
    }
    const anchor = this.rangeAnchor();
    if (anchor) {
      return anchor.getFullYear() === year;
    }
    const range = this.selectedRange();
    return range.start?.getFullYear() === year || range.end?.getFullYear() === year;
  }

  protected dateCellContext(cell: DateGridCell): DatePickerDateTemplateContext {
    return {
      $implicit: cell.date,
      date: cell.date.getDate(),
      month: cell.date.getMonth(),
      year: cell.date.getFullYear(),
      today: this.isToday(cell.date),
      selected: this.isDaySelected(cell),
      disabled: cell.disabled,
      selectable: !cell.disabled,
      outsideMonth: cell.outsideMonth,
    };
  }

  protected isYearDisabled(year: number): boolean {
    const min = this.minDateNormalized();
    const max = this.maxDateNormalized();
    if (min && new Date(year, 11, 31) < min) {
      return true;
    }
    if (max && new Date(year, 0, 1) > max) {
      return true;
    }
    return false;
  }

  protected yearCellClass(year: number): string {
    return monthCellVariants({
      active: year === this.focusedYear(),
      current: year === this.todayDate().getFullYear(),
      selected: this.isYearRelevant(year),
      disabled: this.isYearDisabled(year),
    });
  }

  protected yearRowClass(year: number): string {
    return selectOptionVariants({ active: year === this.focusedYear(), disabled: this.isYearDisabled(year) });
  }

  /** Checks against the *first* visible month — the "next" chevron always shifts the whole window by one month, regardless of `effectiveNumberOfMonths()`. */
  protected canGoPreviousMonth(): boolean {
    const min = this.minDateNormalized();
    if (!min) {
      return true;
    }
    return dateFromAbsoluteMonth(this.viewYear() * 12 + this.viewMonth(), 0) >= min;
  }

  /** Checks against the *last* visible month (`viewMonth + effectiveNumberOfMonths - 1`), not just the first. */
  protected canGoNextMonth(): boolean {
    const max = this.maxDateNormalized();
    if (!max) {
      return true;
    }
    return dateFromAbsoluteMonth(this.viewYear() * 12 + this.viewMonth() + this.effectiveNumberOfMonths(), 1) <= max;
  }

  protected previousMonth(): void {
    if (this.disabled() || !this.canGoPreviousMonth()) {
      return;
    }
    this.setViewMonth(dateFromAbsoluteMonth(this.viewYear() * 12 + this.viewMonth() - 1, 1));
  }

  protected nextMonth(): void {
    if (this.disabled() || !this.canGoNextMonth()) {
      return;
    }
    this.setViewMonth(dateFromAbsoluteMonth(this.viewYear() * 12 + this.viewMonth() + 1, 1));
  }

  /** Year-granularity equivalents of `canGoPreviousMonth`/`previousMonth`, used only by the `pickerView="month"` grid — a whole year is either navigable or not, no need for the month grid's finer edge-of-bounds precision since `isMonthDisabled` already greys out individual out-of-range months within a navigable year. */
  protected canGoPreviousYear(): boolean {
    const min = this.minDateNormalized();
    return !min || min.getFullYear() < this.viewYear();
  }

  protected canGoNextYear(): boolean {
    const max = this.maxDateNormalized();
    return !max || max.getFullYear() > this.viewYear();
  }

  protected previousYear(): void {
    if (!this.disabled() && this.canGoPreviousYear()) {
      this.viewYear.update((year) => year - 1);
    }
  }

  protected nextYear(): void {
    if (!this.disabled() && this.canGoNextYear()) {
      this.viewYear.update((year) => year + 1);
    }
  }

  protected canGoPreviousDecade(): boolean {
    const min = this.minDateNormalized();
    return !min || min.getFullYear() < this.decadeStart();
  }

  protected canGoNextDecade(): boolean {
    const max = this.maxDateNormalized();
    return !max || max.getFullYear() > this.decadeStart() + 11;
  }

  protected previousDecade(): void {
    if (!this.disabled() && this.canGoPreviousDecade()) {
      this.viewYear.update((year) => year - 10);
      this.focusedYear.set(this.decadeStart());
      this.cdr.detectChanges();
    }
  }

  protected nextDecade(): void {
    if (!this.disabled() && this.canGoNextDecade()) {
      this.viewYear.update((year) => year + 10);
      this.focusedYear.set(this.decadeStart());
      this.cdr.detectChanges();
    }
  }

  protected goToMonthView(): void {
    if (!this.disabled() && this.navigation() === 'drilldown') {
      this.view.set('month');
    }
  }

  protected goToYearView(): void {
    if (!this.disabled() && this.navigation() === 'drilldown') {
      this.view.set('year');
    }
  }

  protected onDayPointerDown(event: Event, cell: DateGridCell): void {
    event.preventDefault(); // keep focus on the grid container, not the (non-focusable) cell
    if (!this.disabled() && !cell.disabled) {
      this.focusedDate.set(cell.date);
      this.activateDate(cell.date);
    }
  }

  protected onDayPointerEnter(cell: DateGridCell): void {
    if (this.disabled() || cell.disabled) {
      return;
    }
    this.focusedDate.set(cell.date);
    if (this.rangeAnchor() !== null) {
      this.previewEnd.set(cell.date);
    }
  }

  protected onMonthPointerDown(event: Event, month: number): void {
    event.preventDefault();
    if (!this.disabled() && !this.isMonthDisabled(this.viewYear(), month)) {
      this.selectMonth(month);
    }
  }

  protected onMonthPointerEnter(month: number): void {
    if (!this.disabled() && !this.isMonthDisabled(this.viewYear(), month)) {
      this.focusedMonth.set(month);
    }
  }

  protected onYearPointerDown(event: Event, year: number): void {
    event.preventDefault();
    if (!this.disabled() && !this.isYearDisabled(year)) {
      this.selectYear(year);
    }
  }

  protected onYearPointerEnter(year: number): void {
    if (!this.disabled() && !this.isYearDisabled(year)) {
      this.focusedYear.set(year);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }
    switch (this.view()) {
      case 'day':
        this.onDayKeydown(event);
        break;
      case 'month':
        this.onMonthKeydown(event);
        break;
      case 'year':
        this.onYearKeydown(event);
        break;
    }
  }

  private onDayKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        this.moveFocusedDateBy(1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.moveFocusedDateBy(-1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.moveFocusedDateBy(7);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveFocusedDateBy(-7);
        break;
      case 'Home':
        event.preventDefault();
        this.moveFocusedDateTo(this.nearestEnabledDate(this.startOfWeek(this.focusedDate()), 1));
        break;
      case 'End':
        event.preventDefault();
        this.moveFocusedDateTo(this.nearestEnabledDate(this.endOfWeek(this.focusedDate()), -1));
        break;
      case 'PageUp':
        if (this.navigation() === 'calendar') {
          event.preventDefault();
          const naive = event.shiftKey ? this.addYearsClamped(this.focusedDate(), -1) : this.addMonthsClamped(this.focusedDate(), -1);
          this.moveFocusedDateTo(this.nearestEnabledDate(naive, -1));
        }
        break;
      case 'PageDown':
        if (this.navigation() === 'calendar') {
          event.preventDefault();
          const naive = event.shiftKey ? this.addYearsClamped(this.focusedDate(), 1) : this.addMonthsClamped(this.focusedDate(), 1);
          this.moveFocusedDateTo(this.nearestEnabledDate(naive, 1));
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.isDayDisabled(this.focusedDate())) {
          this.activateDate(this.focusedDate());
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.closeRequested.emit();
        break;
      case 'Tab':
        // No preventDefault — see SelectPanelComponent's identical Tab handling.
        this.closeRequested.emit();
        break;
    }
  }

  private onMonthKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        this.moveFocusedMonthBy(1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.moveFocusedMonthBy(-1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.moveFocusedMonthBy(4);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveFocusedMonthBy(-4);
        break;
      case 'Home':
        event.preventDefault();
        this.focusedMonth.set(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusedMonth.set(11);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.isMonthDisabled(this.viewYear(), this.focusedMonth())) {
          this.selectMonth(this.focusedMonth());
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.closeRequested.emit();
        break;
      case 'Tab':
        this.closeRequested.emit();
        break;
    }
  }

  private onYearKeydown(event: KeyboardEvent): void {
    if (this.navigation() === 'calendar') {
      const years = this.decadeYears();
      const index = Math.max(0, years.indexOf(this.focusedYear()));
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          this.focusedYear.set(years[Math.min(index + 1, years.length - 1)]);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          this.focusedYear.set(years[Math.max(index - 1, 0)]);
          break;
        case 'ArrowDown':
          event.preventDefault();
          this.focusedYear.set(years[Math.min(index + 4, years.length - 1)]);
          break;
        case 'ArrowUp':
          event.preventDefault();
          this.focusedYear.set(years[Math.max(index - 4, 0)]);
          break;
        case 'PageDown':
          event.preventDefault();
          this.nextDecade();
          break;
        case 'PageUp':
          event.preventDefault();
          this.previousDecade();
          break;
        case 'Home':
          event.preventDefault();
          this.focusedYear.set(years[0]);
          break;
        case 'End':
          event.preventDefault();
          this.focusedYear.set(years[years.length - 1]);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          this.selectYear(this.focusedYear());
          break;
        case 'Escape':
          event.preventDefault();
          this.closeRequested.emit();
          break;
        case 'Tab':
          this.closeRequested.emit();
          break;
      }
      return;
    }
    const years = this.yearListItems();
    const index = years.indexOf(this.focusedYear());
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusedYear.set(years[Math.min(index + 1, years.length - 1)]);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusedYear.set(years[Math.max(index - 1, 0)]);
        break;
      case 'PageDown':
        event.preventDefault();
        this.focusedYear.set(years[Math.min(index + 12, years.length - 1)]);
        break;
      case 'PageUp':
        event.preventDefault();
        this.focusedYear.set(years[Math.max(index - 12, 0)]);
        break;
      case 'Home':
        event.preventDefault();
        this.focusedYear.set(years[0]);
        break;
      case 'End':
        event.preventDefault();
        this.focusedYear.set(years[years.length - 1]);
        break;
      case 'Enter':
        event.preventDefault();
        this.selectYear(this.focusedYear());
        break;
      case ' ':
        if ((event.target as HTMLElement).tagName === 'INPUT') {
          return; // let Space type into the year filter box
        }
        event.preventDefault();
        this.selectYear(this.focusedYear());
        break;
      case 'Escape':
        event.preventDefault();
        this.closeRequested.emit();
        break;
      case 'Tab':
        this.closeRequested.emit();
        break;
    }
  }

  private selectYear(year: number): void {
    if (this.disabled() || this.isYearDisabled(year)) {
      return;
    }
    this.viewYear.set(year);
    if (this.pickerView() === 'year') {
      this.dateSelect.emit(new Date(year, 0, 1));
      return;
    }
    this.view.set('month');
  }

  private selectMonth(month: number): void {
    this.viewMonth.set(month);
    if (this.pickerView() === 'month') {
      this.dateSelect.emit(new Date(this.viewYear(), month, 1));
      return;
    }
    const day = Math.min(this.focusedDate().getDate(), daysInMonth(this.viewYear(), month));
    this.focusedDate.set(new Date(this.viewYear(), month, day));
    this.view.set('day');
  }

  private activateDate(date: Date): void {
    if (this.selectionMode() === 'single') {
      this.dateSelect.emit(this.withTime(date));
      return;
    }
    if (this.selectionMode() === 'multiple') {
      const current = this.selectedDates();
      const exists = current.some((d) => isSameDay(d, date));
      const next = exists ? current.filter((d) => !isSameDay(d, date)) : [...current, date].sort((a, b) => a.getTime() - b.getTime());
      this.multipleSelect.emit(next);
      return;
    }
    const anchor = this.rangeAnchor();
    if (anchor === null) {
      this.rangeAnchor.set(date);
      this.previewEnd.set(date);
      this.beginFreshRangeStage(date);
    } else {
      const start = anchor <= date ? anchor : date;
      const end = anchor <= date ? date : anchor;
      this.rangeAnchor.set(null);
      this.previewEnd.set(null);
      this.rangeComplete.emit({ start, end });
      this.beginFreshRangeStage(date);
    }
  }

  /** Merges the current hour/minute state onto `date`'s day when `showTime()` or `timeOnly()` is on — a no-op otherwise (or in range mode, where time stays out of scope). */
  private withTime(date: Date): Date {
    if ((!this.showTime() && !this.timeOnly()) || this.selectionMode() !== 'single') {
      return date;
    }
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), this.selectedHour24(), this.selectedMinute());
  }

  private combine12Hour(displayHour: number, period: 'AM' | 'PM'): number {
    const hour24 = displayHour % 12;
    return period === 'PM' ? hour24 + 12 : hour24;
  }

  private setHour24(hour24: number): void {
    this.selectedHour24.set(hour24);
    this.emitTimeChangeIfDateSelected();
  }

  private setMinute(minute: number): void {
    this.selectedMinute.set(minute);
    this.emitTimeChangeIfDateSelected();
  }

  /** Adjusting the time controls before any day is picked just updates the pending state used by the next `activateDate()` unless `timeOnly()` is active (where there is no calendar grid to pick a day). */
  private emitTimeChangeIfDateSelected(): void {
    const current = this.selectedValue();
    if (current) {
      this.dateSelect.emit(this.withTime(current));
    } else if (this.timeOnly()) {
      this.dateSelect.emit(this.withTime(startOfDay(this.todayDate())));
    }
  }

  protected onHourInput(event: Event): void {
    if (this.disabled()) {
      return;
    }
    const raw = (event.target as HTMLInputElement).valueAsNumber;
    if (Number.isNaN(raw)) {
      return;
    }
    if (this.hourFormat() === '24') {
      this.setHour24(Math.min(23, Math.max(0, Math.trunc(raw))));
    } else {
      const displayHour = Math.min(12, Math.max(1, Math.trunc(raw)));
      this.setHour24(this.combine12Hour(displayHour, this.period()));
    }
  }

  protected onMinuteInput(event: Event): void {
    if (this.disabled()) {
      return;
    }
    const raw = (event.target as HTMLInputElement).valueAsNumber;
    if (Number.isNaN(raw)) {
      return;
    }
    this.setMinute(Math.min(59, Math.max(0, Math.trunc(raw))));
  }

  protected togglePeriod(): void {
    if (this.disabled()) {
      return;
    }
    this.setHour24(this.combine12Hour(this.displayHour(), this.period() === 'AM' ? 'PM' : 'AM'));
  }

  protected onTimeEscape(event: Event): void {
    event.preventDefault();
    this.closeRequested.emit();
  }

  protected isTodayDisabled(): boolean {
    const today = startOfDay(this.todayDate());
    if (this.pickerView() === 'month') {
      return this.isMonthDisabled(today.getFullYear(), today.getMonth());
    }
    if (this.pickerView() === 'year') {
      return this.isYearDisabled(today.getFullYear());
    }
    return this.isDayDisabled(today);
  }

  protected onTodayClick(): void {
    if (this.disabled() || this.isTodayDisabled()) {
      return;
    }
    const today = startOfDay(this.todayDate());
    this.setViewMonth(today);
    this.focusedDate.set(today);
    this.focusedMonth.set(today.getMonth());
    this.focusedYear.set(today.getFullYear());
    if (this.pickerView() === 'year') {
      this.dateSelect.emit(new Date(today.getFullYear(), 0, 1));
      return;
    }
    if (this.pickerView() === 'month') {
      this.dateSelect.emit(new Date(today.getFullYear(), today.getMonth(), 1));
      return;
    }
    if (this.selectionMode() === 'single') {
      if (this.timeOnly()) {
        const now = new Date();
        this.selectedHour24.set(now.getHours());
        this.selectedMinute.set(now.getMinutes());
      }
      this.dateSelect.emit(this.withTime(today));
      return;
    }
    if (this.selectionMode() === 'multiple') {
      const current = this.selectedDates();
      const exists = current.some((d) => isSameDay(d, today));
      const next = exists ? current : [...current, today].sort((a, b) => a.getTime() - b.getTime());
      this.multipleSelect.emit(next);
      return;
    }
    this.rangeAnchor.set(null);
    this.previewEnd.set(null);
    this.rangeComplete.emit({ start: today, end: today });
  }

  protected onClearClick(): void {
    if (this.disabled()) {
      return;
    }
    this.rangeAnchor.set(null);
    this.previewEnd.set(null);
    this.clearRequested.emit();
  }

  /** Seeds view state for the very first render (`ngAfterViewInit`) or a drilldown month selection — always makes `seedDate`'s month the *first* visible one, since there's no existing window worth preserving yet. */
  private beginFreshPick(seedDate: Date): void {
    this.viewYear.set(seedDate.getFullYear());
    this.viewMonth.set(seedDate.getMonth());
    this.focusedDate.set(seedDate);
    this.focusedMonth.set(seedDate.getMonth());
    this.focusedYear.set(seedDate.getFullYear());
    this.yearFilterText.set('');
    this.view.set(this.navigation() === 'drilldown' || this.pickerView() === 'year' ? 'year' : this.pickerView() === 'month' ? 'month' : 'day');
  }

  /**
   * Seeds view state for a new range-picking stage (first endpoint, second
   * endpoint, or a do-over after completion) — unlike `beginFreshPick`,
   * calendar mode only shifts the month window if `seedDate` actually falls
   * outside it (`ensureMonthVisible`), instead of always resetting it to
   * start at `seedDate`'s month. That distinction matters once
   * `effectiveNumberOfMonths() > 1`: picking the second endpoint of a range
   * that spans two already-visible months must not scroll the first one
   * out of view just because it wasn't the *most recently* clicked one.
   * Drilldown mode has no such window to preserve (always exactly one
   * month, and re-enters `'year'` view for the next drill anyway).
   */
  private beginFreshRangeStage(seedDate: Date): void {
    this.focusedDate.set(seedDate);
    this.focusedMonth.set(seedDate.getMonth());
    this.focusedYear.set(seedDate.getFullYear());
    this.yearFilterText.set('');
    if (this.navigation() === 'drilldown') {
      this.viewYear.set(seedDate.getFullYear());
      this.viewMonth.set(seedDate.getMonth());
      this.view.set('year');
    } else {
      this.ensureMonthVisible(seedDate);
    }
  }

  protected onYearFilterInput(event: Event): void {
    this.yearFilterText.set((event.target as HTMLInputElement).value);
    // The previously focused year may have just been filtered out — fall
    // back to the first remaining match (same rationale as Select's
    // `onFilterInput` re-clamping `activeIndex`).
    const years = this.yearListItems();
    if (!years.includes(this.focusedYear())) {
      this.focusedYear.set(years[0] ?? this.focusedYear());
    }
  }

  private setViewMonth(date: Date): void {
    this.viewYear.set(date.getFullYear());
    this.viewMonth.set(date.getMonth());
  }

  private moveFocusedDateBy(deltaDays: number): void {
    const direction: 1 | -1 = deltaDays >= 0 ? 1 : -1;
    const naive = addDays(this.focusedDate(), deltaDays);
    this.moveFocusedDateTo(this.nearestEnabledDate(naive, direction));
  }

  private moveFocusedDateTo(rawDate: Date): void {
    const date = this.clampToBounds(rawDate);
    this.focusedDate.set(date);
    this.ensureMonthVisible(date);
    if (this.rangeAnchor() !== null) {
      this.previewEnd.set(date);
    }
  }

  /**
   * Shifts the visible month window only if `date`'s month falls outside
   * it — sliding forward/backward by the minimum amount needed, not always
   * resetting the window to start at `date`'s month (that would be wrong
   * with `effectiveNumberOfMonths() > 1`: e.g. moving focus from the first
   * visible month into the second shouldn't scroll the first one out of
   * view).
   */
  private ensureMonthVisible(date: Date): void {
    const base = this.viewYear() * 12 + this.viewMonth();
    const target = date.getFullYear() * 12 + date.getMonth();
    const span = this.effectiveNumberOfMonths();
    if (target < base) {
      this.setViewMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    } else if (target > base + span - 1) {
      this.setViewMonth(dateFromAbsoluteMonth(target - (span - 1), 1));
    }
  }

  private moveFocusedMonthBy(delta: number): void {
    this.focusedMonth.set(((this.focusedMonth() + delta) % 12 + 12) % 12);
  }

  private clampToBounds(date: Date): Date {
    const min = this.minDateNormalized();
    const max = this.maxDateNormalized();
    if (min && date < min) {
      return min;
    }
    if (max && date > max) {
      return max;
    }
    return date;
  }

  private isOutOfBounds(date: Date): boolean {
    const min = this.minDateNormalized();
    const max = this.maxDateNormalized();
    return (!!min && date < min) || (!!max && date > max);
  }

  /**
   * The full day-disabling check: out of `[minDate,maxDate]` bounds, OR its
   * weekday is in `disabledDays`, OR it matches one of `disabledDates`.
   * Month/year-level disabling (`isMonthDisabled`) deliberately stays
   * bounds-only — `disabledDates`/`disabledDays` block *specific days*, not
   * whole months (a scattered weekday exclusion like "no Saturdays" could
   * never disable an entire month on its own, and a month is greyed out for
   * navigation purposes, not selection).
   */
  private isDayDisabled(date: Date): boolean {
    if (this.isOutOfBounds(date)) {
      return true;
    }
    if (this.disabledDays().includes(date.getDay())) {
      return true;
    }
    return this.disabledDates().some((disabledDate) => isSameDay(disabledDate, date));
  }

  /**
   * Steps from `target` in `direction` (one day at a time) until it lands on
   * a non-disabled day, or until it would step outside `[minDate,maxDate]`
   * (in which case the last in-bounds candidate is returned as a best
   * effort, even if still disabled — better than getting stuck unable to
   * move focus at all). Used by every keyboard-navigation entry point so
   * focus never lands on a `disabledDates`/`disabledDays` cell.
   */
  private nearestEnabledDate(target: Date, direction: 1 | -1): Date {
    let candidate = target;
    for (let i = 0; i < 366; i++) {
      const bounded = this.clampToBounds(candidate);
      if (!this.isDayDisabled(bounded)) {
        return bounded;
      }
      if (bounded.getTime() !== candidate.getTime()) {
        // `candidate` was already outside bounds and got clamped to a
        // disabled boundary — stepping further in `direction` would only
        // move further out of bounds, so stop here.
        return bounded;
      }
      candidate = addDays(candidate, direction);
    }
    return this.clampToBounds(target);
  }

  private startOfWeek(date: Date): Date {
    const offset = (date.getDay() - this.firstDayOfWeek() + 7) % 7;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - offset);
  }

  private endOfWeek(date: Date): Date {
    const start = this.startOfWeek(date);
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  }

  private addMonthsClamped(date: Date, delta: number): Date {
    const day = Math.min(date.getDate(), daysInMonth(date.getFullYear(), date.getMonth() + delta));
    return new Date(date.getFullYear(), date.getMonth() + delta, day);
  }

  private addYearsClamped(date: Date, delta: number): Date {
    const day = Math.min(date.getDate(), daysInMonth(date.getFullYear() + delta, date.getMonth()));
    return new Date(date.getFullYear() + delta, date.getMonth(), day);
  }
}
