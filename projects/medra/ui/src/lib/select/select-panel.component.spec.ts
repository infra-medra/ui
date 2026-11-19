import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectPanelComponent, buildPanelRows } from './select-panel.component';
import { SelectOption } from './select.types';

const FRUITS: SelectOption<string>[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry', disabled: true },
  { label: 'Durian', value: 'durian' },
];

function createPanel(
  inputs: Partial<{
    options: SelectOption<string>[];
    multiple: boolean;
    filterable: boolean;
    selectedValue: string | null;
    selectedValues: string[];
    loading: boolean;
    showToggleAll: boolean;
    selectionLimit: number | null;
    grabFocus: boolean;
    initialSearchText: string | null;
  }> = {},
) {
  const fixture = TestBed.createComponent(SelectPanelComponent<string>);
  fixture.componentRef.setInput('panelId', 'med-select-panel-test');
  fixture.componentRef.setInput('options', inputs.options ?? FRUITS);
  if (inputs.multiple !== undefined) fixture.componentRef.setInput('multiple', inputs.multiple);
  if (inputs.filterable !== undefined) fixture.componentRef.setInput('filterable', inputs.filterable);
  if (inputs.selectedValue !== undefined) fixture.componentRef.setInput('selectedValue', inputs.selectedValue);
  if (inputs.selectedValues !== undefined) fixture.componentRef.setInput('selectedValues', inputs.selectedValues);
  if (inputs.loading !== undefined) fixture.componentRef.setInput('loading', inputs.loading);
  if (inputs.showToggleAll !== undefined) fixture.componentRef.setInput('showToggleAll', inputs.showToggleAll);
  if (inputs.selectionLimit !== undefined) fixture.componentRef.setInput('selectionLimit', inputs.selectionLimit);
  if (inputs.grabFocus !== undefined) fixture.componentRef.setInput('grabFocus', inputs.grabFocus);
  if (inputs.initialSearchText !== undefined) fixture.componentRef.setInput('initialSearchText', inputs.initialSearchText);
  fixture.detectChanges();
  const list = fixture.nativeElement.querySelector('[role="listbox"]') as HTMLElement;
  const filterInput = fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement | null;
  return { fixture, list, filterInput };
}

function keydown(fixture: ComponentFixture<unknown>, el: HTMLElement, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  fixture.detectChanges();
}

describe('SelectPanelComponent', () => {
  it('starts with the first enabled option active when nothing is selected', () => {
    const { list } = createPanel();
    expect(list.getAttribute('aria-activedescendant')).toBe('med-select-panel-test-option-0');
  });

  it('starts with the already-selected option active, not the first one', () => {
    const { list } = createPanel({ selectedValue: 'durian' });
    expect(list.getAttribute('aria-activedescendant')).toBe('med-select-panel-test-option-3');
  });

  it('ArrowDown moves to the next option, skipping disabled ones', () => {
    const { fixture, list } = createPanel();
    keydown(fixture, list, 'ArrowDown'); // apple(0) -> banana(1)
    expect(list.getAttribute('aria-activedescendant')).toBe('med-select-panel-test-option-1');
    keydown(fixture, list, 'ArrowDown'); // banana(1) -> cherry(2) is disabled, skip to durian(3)
    expect(list.getAttribute('aria-activedescendant')).toBe('med-select-panel-test-option-3');
  });

  it('ArrowDown wraps from the last enabled option back to the first', () => {
    const { fixture, list } = createPanel({ selectedValue: 'durian' });
    keydown(fixture, list, 'ArrowDown');
    expect(list.getAttribute('aria-activedescendant')).toBe('med-select-panel-test-option-0');
  });

  it('ArrowUp wraps from the first enabled option to the last', () => {
    const { fixture, list } = createPanel();
    keydown(fixture, list, 'ArrowUp');
    expect(list.getAttribute('aria-activedescendant')).toBe('med-select-panel-test-option-3');
  });

  it('Home/End jump to the first/last enabled option', () => {
    const { fixture, list } = createPanel();
    keydown(fixture, list, 'End');
    expect(list.getAttribute('aria-activedescendant')).toBe('med-select-panel-test-option-3');
    keydown(fixture, list, 'Home');
    expect(list.getAttribute('aria-activedescendant')).toBe('med-select-panel-test-option-0');
  });

  it('Enter emits optionToggled with the active option value', () => {
    const { fixture, list } = createPanel();
    const received: string[] = [];
    fixture.componentInstance.optionToggled.subscribe((value) => received.push(value));

    keydown(fixture, list, 'ArrowDown');
    keydown(fixture, list, 'Enter');

    expect(received).toEqual(['banana']);
  });

  it('never emits optionToggled for a disabled option, even after navigating past it', () => {
    const { fixture, list } = createPanel();
    const received: string[] = [];
    fixture.componentInstance.optionToggled.subscribe((value) => received.push(value));

    keydown(fixture, list, 'ArrowDown'); // banana
    keydown(fixture, list, 'ArrowDown'); // durian (cherry skipped, never becomes active)
    keydown(fixture, list, 'ArrowUp'); // back to banana
    keydown(fixture, list, 'Enter');

    expect(received).toEqual(['banana']);
  });

  it('Tab emits closeRequested', () => {
    const { fixture, list } = createPanel();
    const closeRequested = jest.fn();
    fixture.componentInstance.closeRequested.subscribe(closeRequested);

    keydown(fixture, list, 'Tab');

    expect(closeRequested).toHaveBeenCalledTimes(1);
  });

  describe('filter', () => {
    function typeFilter(fixture: ComponentFixture<unknown>, input: HTMLInputElement, value: string) {
      input.value = value;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    }

    it('typing narrows the option set and resets the active option to the first (filtered) match', () => {
      const { fixture, filterInput } = createPanel({ filterable: true });
      const received: string[] = [];
      fixture.componentInstance.optionToggled.subscribe((value) => received.push(value));

      typeFilter(fixture, filterInput!, 'rian');
      keydown(fixture, filterInput!, 'Enter');

      expect(received).toEqual(['durian']);
    });

    it('is case-insensitive', () => {
      const { fixture, filterInput } = createPanel({ filterable: true });
      const received: string[] = [];
      fixture.componentInstance.optionToggled.subscribe((value) => received.push(value));

      typeFilter(fixture, filterInput!, 'APPLE');
      keydown(fixture, filterInput!, 'Enter');

      expect(received).toEqual(['apple']);
    });

    it('Space types into the filter box instead of selecting the active option', () => {
      const { fixture, filterInput } = createPanel({ filterable: true });
      const received: string[] = [];
      fixture.componentInstance.optionToggled.subscribe((value) => received.push(value));

      keydown(fixture, filterInput!, ' ');

      expect(received).toEqual([]);
    });

    it('does not render a filter box when filterable is false', () => {
      const { filterInput } = createPanel({ filterable: false });
      expect(filterInput).toBeNull();
    });
  });

  describe('multiple', () => {
    it('emits optionToggled for every pick without needing them to be mutually exclusive', () => {
      const { fixture, list } = createPanel({ multiple: true, selectedValues: [] });
      const received: string[] = [];
      fixture.componentInstance.optionToggled.subscribe((value) => received.push(value));

      keydown(fixture, list, 'Enter'); // apple
      keydown(fixture, list, 'ArrowDown');
      keydown(fixture, list, 'Enter'); // banana

      expect(received).toEqual(['apple', 'banana']);
    });

    it('sets aria-multiselectable on the listbox', () => {
      const { list } = createPanel({ multiple: true });
      expect(list.getAttribute('aria-multiselectable')).toBe('true');
    });
  });

  describe('showToggleAll', () => {
    function toggleAllRow(fixture: { nativeElement: HTMLElement }): HTMLElement | null {
      return fixture.nativeElement.querySelector('[role="checkbox"]');
    }

    it('is not shown by default (opt-in), even in multiple mode', () => {
      const { fixture } = createPanel({ multiple: true });
      expect(toggleAllRow(fixture)).toBeNull();
    });

    it('is not shown in single-select mode, even when requested', () => {
      const { fixture } = createPanel({ multiple: false, showToggleAll: true });
      expect(toggleAllRow(fixture)).toBeNull();
    });

    it('selects every enabled option when unchecked, over the full list when unfiltered', () => {
      const { fixture } = createPanel({ multiple: true, showToggleAll: true, selectedValues: [] });
      const received: string[][] = [];
      fixture.componentInstance.toggleAllRequested.subscribe((next) => received.push([...next]));

      toggleAllRow(fixture)!.click();

      expect(received).toEqual([['apple', 'banana', 'durian']]); // 'cherry' excluded, it's disabled
    });

    it('is indeterminate when some (not all) enabled options are selected, and clicking it completes to all', () => {
      const { fixture } = createPanel({ multiple: true, showToggleAll: true, selectedValues: ['apple'] });
      expect(toggleAllRow(fixture)!.getAttribute('aria-checked')).toBe('mixed');

      const received: string[][] = [];
      fixture.componentInstance.toggleAllRequested.subscribe((next) => received.push([...next]));
      toggleAllRow(fixture)!.click();

      expect(received).toEqual([['apple', 'banana', 'durian']]);
    });

    it('is fully checked when every enabled option is selected, and clicking it clears them', () => {
      const { fixture } = createPanel({ multiple: true, showToggleAll: true, selectedValues: ['apple', 'banana', 'durian'] });
      expect(toggleAllRow(fixture)!.getAttribute('aria-checked')).toBe('true');

      const received: string[][] = [];
      fixture.componentInstance.toggleAllRequested.subscribe((next) => received.push([...next]));
      toggleAllRow(fixture)!.click();

      expect(received).toEqual([[]]);
    });

    it('only targets the currently-filtered options, preserving a selection outside the filter untouched', () => {
      const { fixture, filterInput } = createPanel({ multiple: true, filterable: true, showToggleAll: true, selectedValues: ['cherry'] });
      // 'cherry' is disabled and filtered out below, but must survive untouched in the emitted array.
      filterInput!.value = 'ban';
      filterInput!.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const received: string[][] = [];
      fixture.componentInstance.toggleAllRequested.subscribe((next) => received.push([...next]));
      toggleAllRow(fixture)!.click(); // selects 'banana', the only match for "ban"

      expect(received).toEqual([['cherry', 'banana']]);
    });

    it('is force-hidden whenever selectionLimit is set', () => {
      const { fixture } = createPanel({ multiple: true, showToggleAll: true, selectionLimit: 2 });
      expect(toggleAllRow(fixture)).toBeNull();
    });
  });

  // `[role="option"]` rows live inside a CdkVirtualScrollViewport, which never
  // actually lays out in jsdom (same limitation the rest of this file already
  // works around) — driven via keyboard/aria-activedescendant instead of
  // querying rendered row elements, same as every other disabled-skipping
  // test above.
  describe('selectionLimit', () => {
    it('once the limit is reached, keyboard nav only ever lands on already-selected options, wrapping between them', () => {
      const { fixture, list } = createPanel({ multiple: true, selectedValues: ['apple', 'banana'], selectionLimit: 2 });
      expect(list.getAttribute('aria-activedescendant')).toBe('med-select-panel-test-option-0'); // apple, first selected

      keydown(fixture, list, 'ArrowDown'); // apple -> banana (both already selected, still reachable)
      expect(list.getAttribute('aria-activedescendant')).toBe('med-select-panel-test-option-1');

      keydown(fixture, list, 'ArrowDown'); // banana -> wraps to apple, skipping cherry (disabled) and durian (limit-reached)
      expect(list.getAttribute('aria-activedescendant')).toBe('med-select-panel-test-option-0');
    });

    it('Enter still toggles an already-selected option once the limit is reached, so the user can deselect down from the cap', () => {
      const { fixture, list } = createPanel({ multiple: true, selectedValues: ['apple', 'banana'], selectionLimit: 2 });
      const received: string[] = [];
      fixture.componentInstance.optionToggled.subscribe((value) => received.push(value));

      keydown(fixture, list, 'Enter'); // apple, already selected
      expect(received).toEqual(['apple']);
    });

    it('does not disable anything below the limit', () => {
      const { fixture, list } = createPanel({ multiple: true, selectedValues: ['apple'], selectionLimit: 2 });
      keydown(fixture, list, 'End'); // durian is still reachable — the cap isn't reached yet
      expect(list.getAttribute('aria-activedescendant')).toBe('med-select-panel-test-option-3');
    });

    it('pre-selected values already over the limit are preserved, not truncated', () => {
      const { list } = createPanel({ multiple: true, selectedValues: ['apple', 'banana', 'durian'], selectionLimit: 1 });
      // Still recognized as selected/reachable despite exceeding the limit — no crash, no silent truncation.
      expect(list.getAttribute('aria-activedescendant')).toBe('med-select-panel-test-option-0');
    });
  });

  it('does not set aria-multiselectable in single-select mode', () => {
    const { list } = createPanel({ multiple: false });
    expect(list.getAttribute('aria-multiselectable')).toBeNull();
  });

  describe('grabFocus', () => {
    it('grabs real DOM focus onto the listbox by default', () => {
      const { list } = createPanel();
      expect(document.activeElement).toBe(list);
    });

    it('never touches focus when false (SelectComponent editable mode keeps focus on its own <input>)', () => {
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();
      expect(document.activeElement).toBe(input);

      createPanel({ grabFocus: false });

      expect(document.activeElement).toBe(input); // untouched
      input.remove();
    });

    it('an external caller can still drive keyboard nav via handleExternalKeydown even though this panel never took focus', () => {
      const { fixture } = createPanel({ grabFocus: false, selectedValue: 'apple' });
      const received: string[] = [];
      fixture.componentInstance.optionToggled.subscribe((value) => received.push(value));

      fixture.componentInstance.handleExternalKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }));
      fixture.componentInstance.handleExternalKeydown(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));

      expect(received).toEqual(['banana']);
    });
  });

  describe('initialSearchText/setActiveByPrefix (SelectComponent editable mode typeahead)', () => {
    it('initialSearchText seeds the initial active option by prefix match, overriding the usual selected/first default', () => {
      const { list } = createPanel({ selectedValue: 'apple', initialSearchText: 'ban' });
      expect(list.getAttribute('aria-activedescendant')).toBe('med-select-panel-test-option-1'); // banana, not apple (the selected one)
    });

    it('falls back to the usual selected/first default when initialSearchText matches nothing', () => {
      const { list } = createPanel({ selectedValue: 'apple', initialSearchText: 'zzz' });
      expect(list.getAttribute('aria-activedescendant')).toBe('med-select-panel-test-option-0'); // apple, the selected one
    });

    it('setActiveByPrefix moves the highlight live', () => {
      const { fixture, list } = createPanel();
      fixture.componentInstance.setActiveByPrefix('ban');
      fixture.detectChanges();
      expect(list.getAttribute('aria-activedescendant')).toBe('med-select-panel-test-option-1');
    });

    it('never highlights a disabled option even when its label matches', () => {
      const { fixture, list } = createPanel();
      const before = list.getAttribute('aria-activedescendant');
      fixture.componentInstance.setActiveByPrefix('cherry'); // disabled
      fixture.detectChanges();
      expect(list.getAttribute('aria-activedescendant')).toBe(before); // unchanged
    });

    it('leaves the current highlight unchanged when nothing matches', () => {
      const { fixture, list } = createPanel({ selectedValue: 'banana' });
      const before = list.getAttribute('aria-activedescendant');
      fixture.componentInstance.setActiveByPrefix('zzz');
      fixture.detectChanges();
      expect(list.getAttribute('aria-activedescendant')).toBe(before);
    });
  });

  describe('loading', () => {
    it('shows a spinner instead of the option list', () => {
      const { fixture, list } = createPanel({ loading: true });
      expect(list.querySelectorAll('[role="option"]').length).toBe(0);
      expect(fixture.nativeElement.textContent).toContain('Loading...');
    });

    it('never emits optionToggled while loading, even on Enter', () => {
      const { fixture, list } = createPanel({ loading: true });
      const received: string[] = [];
      fixture.componentInstance.optionToggled.subscribe((value) => received.push(value));

      keydown(fixture, list, 'Enter');

      expect(received).toEqual([]);
    });
  });

  describe('buildPanelRows', () => {
    it('inserts one header row before the first option of each new group, none for ungrouped runs', () => {
      const rows = buildPanelRows<string>([
        { label: 'Apple', value: 'apple', group: 'Fruits' },
        { label: 'Banana', value: 'banana', group: 'Fruits' },
        { label: 'Carrot', value: 'carrot', group: 'Vegetables' },
        { label: 'Loose', value: 'loose' },
        { label: 'Daikon', value: 'daikon', group: 'Vegetables' },
      ]);

      expect(rows.map((row) => (row.kind === 'group' ? `[${row.label}]` : row.option.value))).toEqual([
        '[Fruits]',
        'apple',
        'banana',
        '[Vegetables]',
        'carrot',
        'loose',
        '[Vegetables]', // re-opened after the ungrouped option broke the run — a second header is correct here
        'daikon',
      ]);
    });

    it('keeps each option row addressed by its flat (ungrouped) index, not its row position', () => {
      const rows = buildPanelRows<string>([
        { label: 'Apple', value: 'apple', group: 'Fruits' },
        { label: 'Carrot', value: 'carrot', group: 'Vegetables' },
      ]);
      const optionRows = rows.filter((row) => row.kind === 'option');
      expect(optionRows.map((row) => row.flatIndex)).toEqual([0, 1]);
    });
  });

  describe('group', () => {
    const GROUPED: SelectOption<string>[] = [
      { label: 'Apple', value: 'apple', group: 'Fruits' },
      { label: 'Banana', value: 'banana', group: 'Fruits' },
      { label: 'Carrot', value: 'carrot', group: 'Vegetables' },
      { label: 'Daikon', value: 'daikon', group: 'Vegetables' },
    ];

    // `cdk-virtual-scroll-viewport` never lays out its rows in jsdom (no real
    // client height to measure — same limitation the SelectComponent spec
    // documents), so group headers can't be asserted from rendered DOM here;
    // `aria-activedescendant` (set directly on the un-virtualized `#list`
    // container) is what actually exercises the row-building/index-mapping
    // logic in this environment.
    it('keyboard nav addresses options only, correctly skipping past the flat index a group header occupies', () => {
      const { fixture, list } = createPanel({ options: GROUPED, selectedValue: 'banana' });
      expect(list.getAttribute('aria-activedescendant')).toBe('med-select-panel-test-option-1');
      keydown(fixture, list, 'ArrowDown');
      expect(list.getAttribute('aria-activedescendant')).toBe('med-select-panel-test-option-2'); // carrot — flat index, not the row index the "Vegetables" header pushes it to
    });

    it('Enter on an option right after a group boundary still selects that option', () => {
      const { fixture, list } = createPanel({ options: GROUPED, selectedValue: 'banana' });
      const received: string[] = [];
      fixture.componentInstance.optionToggled.subscribe((value) => received.push(value));

      keydown(fixture, list, 'ArrowDown'); // banana -> carrot (first of the "Vegetables" group)
      keydown(fixture, list, 'Enter');

      expect(received).toEqual(['carrot']);
    });
  });
});
