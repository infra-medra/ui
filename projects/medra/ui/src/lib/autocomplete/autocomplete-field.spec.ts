import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { AutocompleteComponent } from './autocomplete.component';
import { SelectOption } from '../select/select.types';

/**
 * Field behavior of the autocomplete added by the `add-autocomplete-parity`
 * change: UI-015 (forceSelection), UI-016 (completeOnFocus), UI-017 (events) and
 * the readonly part of UI-018 (UI-018.S4).
 *
 * Inputs are set by name and outputs are read through a loose accessor so that a
 * missing API surfaces as a runtime failure of the scenario, not as a compile
 * error of the whole file.
 */

const FRUITS: SelectOption<string>[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry', disabled: true },
];

type Value = SelectOption<string> | readonly SelectOption<string>[] | null;

function trigger(fixture: ComponentFixture<unknown>): HTMLInputElement {
  return fixture.nativeElement.querySelector('[role="combobox"]') as HTMLInputElement;
}

function listbox(): HTMLElement | null {
  return document.querySelector('[role="listbox"]');
}

function typeText(fixture: ComponentFixture<unknown>, text: string) {
  const el = trigger(fixture);
  el.value = text;
  el.dispatchEvent(new Event('input'));
  fixture.detectChanges();
}

function pickRow(fixture: ComponentFixture<unknown>, index: number) {
  const row = document.querySelectorAll('[role="option"]')[index] as HTMLElement;
  row.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
  fixture.detectChanges();
}

/** Reads an output by name; throws a TypeError at `.subscribe` when the output does not exist yet. */
function output<E>(fixture: ComponentFixture<AutocompleteComponent<string>>, name: string): { subscribe(fn: (event: E) => void): unknown } {
  return (fixture.componentInstance as unknown as Record<string, { subscribe(fn: (event: E) => void): unknown }>)[name];
}

describe('AutocompleteComponent field behavior', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function create(inputs: Record<string, unknown> = {}) {
    const fixture = TestBed.createComponent(AutocompleteComponent<string>);
    fixture.componentRef.setInput('suggestions', FRUITS);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    const changes: Value[] = [];
    fixture.componentInstance.registerOnChange((value) => changes.push(value));
    return { fixture, changes };
  }

  function openPanel(fixture: ComponentFixture<unknown>, text = 'a') {
    typeText(fixture, text);
    jest.runAllTimers();
    fixture.detectChanges();
  }

  describe('UI-015 forceSelection', () => {
    it('UI-015.S1: discards free text that was not picked when leaving the field', () => {
      const { fixture, changes } = create({ forceSelection: true });
      let controlValue: Value = null;
      fixture.componentInstance.registerOnChange((value) => {
        controlValue = value;
        changes.push(value);
      });

      typeText(fixture, 'zzz');
      jest.runAllTimers();
      trigger(fixture).dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(trigger(fixture).value).toBe('');
      expect(controlValue).toBeNull();
      expect(changes.filter((value) => value !== null)).toEqual([]);
    });

    it('UI-015.S2: restores the label of the picked suggestion and keeps the control value', () => {
      const { fixture, changes } = create({ forceSelection: true });
      openPanel(fixture);
      pickRow(fixture, 0); // Apple

      typeText(fixture, 'xyz');
      jest.runAllTimers();
      trigger(fixture).dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(trigger(fixture).value).toBe('Apple');
      expect(changes[changes.length - 1]).toEqual({ label: 'Apple', value: 'apple' });
    });

    it('UI-015.S3: without forceSelection the free text stays and the control value does not change', () => {
      const { fixture, changes } = create();

      typeText(fixture, 'zzz');
      jest.runAllTimers();
      trigger(fixture).dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(trigger(fixture).value).toBe('zzz');
      expect(changes).toEqual([]);
    });
  });

  describe('UI-016 completeOnFocus', () => {
    it('UI-016.S1: focusing the field emits a search with the empty text and opens the panel once suggestions arrive', () => {
      const { fixture } = create({ completeOnFocus: true, suggestions: [] });
      const queries: string[] = [];
      fixture.componentInstance.search.subscribe((query) => queries.push(query));

      trigger(fixture).dispatchEvent(new Event('focus'));
      jest.runAllTimers();
      fixture.detectChanges();
      expect(queries).toEqual(['']);

      fixture.componentRef.setInput('suggestions', FRUITS);
      fixture.detectChanges();
      expect(listbox()).not.toBeNull();
    });

    it('UI-016.S2: by default focusing the field emits no search', () => {
      const { fixture } = create();
      const search = jest.fn();
      fixture.componentInstance.search.subscribe(search);

      trigger(fixture).dispatchEvent(new Event('focus'));
      jest.runAllTimers();
      fixture.detectChanges();

      expect(search).not.toHaveBeenCalled();
    });

    it('UI-016.S3: a read-only field emits no search on focus', () => {
      const { fixture } = create({ completeOnFocus: true, readonly: true });
      const search = jest.fn();
      fixture.componentInstance.search.subscribe(search);

      trigger(fixture).dispatchEvent(new Event('focus'));
      jest.runAllTimers();
      fixture.detectChanges();

      expect(search).not.toHaveBeenCalled();
    });
  });

  describe('UI-017 events', () => {
    it('UI-017.S1: optionSelected emits the picked option', () => {
      const { fixture } = create();
      const picked: SelectOption<string>[] = [];
      output<SelectOption<string>>(fixture, 'optionSelected').subscribe((option) => picked.push(option));

      openPanel(fixture);
      pickRow(fixture, 1); // Banana

      expect(picked).toEqual([{ label: 'Banana', value: 'banana' }]);
    });

    it('UI-017.S2: optionRemoved emits the removed option in multiple mode', () => {
      const { fixture } = create({ multiple: true });
      fixture.componentInstance.writeValue([FRUITS[0], FRUITS[1]]);
      fixture.detectChanges();
      const removed: SelectOption<string>[] = [];
      output<SelectOption<string>>(fixture, 'optionRemoved').subscribe((option) => removed.push(option));

      (fixture.nativeElement.querySelector('med-chip button') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(removed).toEqual([FRUITS[0]]);
    });

    it('UI-017.S3: inputFocus and inputBlur emit with the focus event', () => {
      const { fixture } = create();
      const order: string[] = [];
      output<FocusEvent>(fixture, 'inputFocus').subscribe((event) => order.push(`focus:${event.type}`));
      output<FocusEvent>(fixture, 'inputBlur').subscribe((event) => order.push(`blur:${event.type}`));

      trigger(fixture).dispatchEvent(new FocusEvent('focus'));
      trigger(fixture).dispatchEvent(new FocusEvent('blur'));

      expect(order).toEqual(['focus:focus', 'blur:blur']);
    });

    it('UI-017.S4: cleared emits when the clear button is clicked', () => {
      const { fixture } = create({ showClear: true });
      fixture.componentInstance.writeValue(FRUITS[0]);
      fixture.detectChanges();
      const cleared = jest.fn();
      output<void>(fixture, 'cleared').subscribe(cleared);

      (fixture.nativeElement.querySelector('button[aria-label="Clear"]') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(cleared).toHaveBeenCalledTimes(1);
    });

    it('UI-017.S5: panelShow emits on open and panelHide emits on close', () => {
      const { fixture } = create();
      const order: string[] = [];
      output<void>(fixture, 'panelShow').subscribe(() => order.push('show'));
      output<void>(fixture, 'panelHide').subscribe(() => order.push('hide'));

      openPanel(fixture);
      expect(order).toEqual(['show']);

      trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(order).toEqual(['show', 'hide']);
    });

    it('UI-017.S6: dropdownClick emits with the mouse event', () => {
      const { fixture } = create({ dropdown: true });
      const clicks: MouseEvent[] = [];
      output<MouseEvent>(fixture, 'dropdownClick').subscribe((event) => clicks.push(event));

      (fixture.nativeElement.querySelector('button[aria-label="Show suggestions"]') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(clicks).toHaveLength(1);
      expect(clicks[0]).toBeInstanceOf(MouseEvent);
    });
  });

  describe('UI-018 readonly', () => {
    it('UI-018.S4: a read-only field keeps its text, never opens the panel and hides the clear button', () => {
      const { fixture } = create({ readonly: true, showClear: true, dropdown: true });
      fixture.componentInstance.writeValue(FRUITS[0]);
      fixture.detectChanges();
      const search = jest.fn();
      fixture.componentInstance.search.subscribe(search);

      expect(trigger(fixture).readOnly).toBe(true);
      expect(trigger(fixture).value).toBe('Apple');

      trigger(fixture).click();
      trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
      jest.runAllTimers();
      fixture.detectChanges();

      expect(trigger(fixture).value).toBe('Apple');
      expect(search).not.toHaveBeenCalled();
      expect(listbox()).toBeNull();
      expect(fixture.nativeElement.querySelector('button[aria-label="Clear"]')).toBeNull();
    });

    it('UI-018.S4: a read-only multiple field hides the chip remove buttons', () => {
      const { fixture } = create({ readonly: true, multiple: true });
      fixture.componentInstance.writeValue([FRUITS[0], FRUITS[1]]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('med-chip')).toHaveLength(2);
      expect(fixture.nativeElement.querySelector('med-chip button')).toBeNull();
    });
  });
});
