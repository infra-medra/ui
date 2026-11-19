import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { MultiSelectComponent } from './multi-select.component';
import { SelectOption } from '../select/select.types';

const FRUITS: SelectOption<string>[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
];

function trigger(fixture: ComponentFixture<unknown>): HTMLElement {
  return fixture.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
}

function listbox(): HTMLElement | null {
  return document.querySelector('[role="listbox"]');
}

function keydownOnPanel(fixture: ComponentFixture<unknown>, key: string): void {
  listbox()!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  fixture.detectChanges();
}

describe('MultiSelectComponent — events', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function create(inputs: Record<string, unknown> = {}) {
    const fixture = TestBed.createComponent(MultiSelectComponent<string>);
    fixture.componentRef.setInput('options', FRUITS);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    return fixture;
  }

  /** Subscribes to the named outputs and records each emission, in order, as `name` (plus the payload). */
  function record(fixture: ComponentFixture<MultiSelectComponent<string>>, names: string[]) {
    const log: { name: string; event?: unknown }[] = [];
    const instance = fixture.componentInstance as unknown as Record<string, { subscribe: (fn: (event?: unknown) => void) => void }>;
    for (const name of names) {
      instance[name].subscribe((event) => log.push({ name, event }));
    }
    return log;
  }

  // UI-032.S1
  it('UI-032.S1: selectionChanged emits the new list and the toggled option value', () => {
    const fixture = create();
    fixture.componentInstance.writeValue(['apple']);
    fixture.detectChanges();
    const log = record(fixture, ['selectionChanged']);

    trigger(fixture).click();
    fixture.detectChanges();
    keydownOnPanel(fixture, 'ArrowDown'); // apple -> banana
    keydownOnPanel(fixture, 'Enter');

    expect(log).toEqual([{ name: 'selectionChanged', event: { value: ['apple', 'banana'], itemValue: 'banana' } }]);
  });

  // UI-032.S2
  it('UI-032.S2: removing a chip emits chipRemoved with the value and selectionChanged with the rest', () => {
    const fixture = create({ display: 'chip' });
    fixture.componentInstance.writeValue(['apple', 'banana']);
    fixture.detectChanges();
    const log = record(fixture, ['chipRemoved', 'selectionChanged']);

    (trigger(fixture).querySelector('med-chip button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(log).toEqual([
      { name: 'chipRemoved', event: { value: 'apple' } },
      { name: 'selectionChanged', event: { value: ['banana'], itemValue: 'apple' } },
    ]);
  });

  // UI-032.S3
  it('UI-032.S3: select all emits selectAllChanged checked and selectionChanged with the full list', () => {
    const fixture = create();
    const log = record(fixture, ['selectAllChanged', 'selectionChanged']);

    trigger(fixture).click();
    fixture.detectChanges();
    (document.querySelector('[role="checkbox"]') as HTMLElement).click();
    fixture.detectChanges();

    expect(log).toEqual([
      { name: 'selectAllChanged', event: { checked: true } },
      { name: 'selectionChanged', event: { value: ['apple', 'banana', 'cherry'], itemValue: null } },
    ]);
  });

  // UI-032.S4
  it('UI-032.S4: fieldClick emits with the click event when the field is clicked', () => {
    const fixture = create();
    const log = record(fixture, ['fieldClick']);

    trigger(fixture).click();

    expect(log).toHaveLength(1);
    expect(log[0].event).toBeInstanceOf(MouseEvent);
  });

  // UI-032.S5
  it('UI-032.S5: the panel events fire in order — before show, show, before hide, hide', () => {
    const fixture = create();
    const log = record(fixture, ['panelBeforeShow', 'panelShow', 'panelBeforeHide', 'panelHide']);

    trigger(fixture).click();
    fixture.detectChanges();
    expect(log.map((entry) => entry.name)).toEqual(['panelBeforeShow', 'panelShow']);

    keydownOnPanel(fixture, 'Escape');

    expect(log.map((entry) => entry.name)).toEqual(['panelBeforeShow', 'panelShow', 'panelBeforeHide', 'panelHide']);
  });

  // UI-032.S6
  it('UI-032.S6: cleared emits, followed by selectionChanged with an empty list', () => {
    const fixture = create({ showClear: true });
    fixture.componentInstance.writeValue(['apple', 'banana']);
    fixture.detectChanges();
    const log = record(fixture, ['cleared', 'selectionChanged']);

    (fixture.nativeElement.querySelector('button[aria-label="Clear"]') as HTMLElement).click();
    fixture.detectChanges();

    expect(log).toEqual([
      { name: 'cleared', event: undefined },
      { name: 'selectionChanged', event: { value: [], itemValue: null } },
    ]);
  });

  // UI-032.S7
  it('UI-032.S7: inputFocus emits on focus and inputBlur on blur', () => {
    const fixture = create();
    const log = record(fixture, ['inputFocus', 'inputBlur']);

    trigger(fixture).dispatchEvent(new FocusEvent('focus'));
    expect(log.map((entry) => entry.name)).toEqual(['inputFocus']);
    expect(log[0].event).toBeInstanceOf(FocusEvent);

    trigger(fixture).dispatchEvent(new FocusEvent('blur'));
    expect(log.map((entry) => entry.name)).toEqual(['inputFocus', 'inputBlur']);
  });

  it('UI-032.S7 (D-10): inputBlur is not emitted when focus moves into the open panel', () => {
    const fixture = create();
    const log = record(fixture, ['inputBlur']);

    trigger(fixture).click();
    fixture.detectChanges();
    trigger(fixture).dispatchEvent(new FocusEvent('blur', { relatedTarget: listbox() }));

    expect(log).toEqual([]);
  });

  // UI-032.S8
  it('UI-032.S8: filtered emits the typed text', () => {
    const fixture = create({ filter: true });
    const log = record(fixture, ['filtered']);

    trigger(fixture).click();
    fixture.detectChanges();
    const input = document.querySelector<HTMLInputElement>('input[placeholder="Search"]')!;
    input.value = 'ban';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    expect(log).toEqual([{ name: 'filtered', event: { filter: 'ban' } }]);
  });

  // UI-032.S9
  it('UI-032.S9: a disabled MultiSelect emits no show event when opening is attempted', () => {
    const fixture = create({ disabled: true });
    const log = record(fixture, ['panelBeforeShow', 'panelShow', 'fieldClick']);

    trigger(fixture).click();
    trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(listbox()).toBeNull();
    expect(log).toEqual([]);
  });
});
