import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { SelectComponent } from './select.component';
import { SelectOption } from './select.types';

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

describe('SelectComponent — events', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function create(inputs: Record<string, unknown> = {}) {
    const fixture = TestBed.createComponent(SelectComponent<string>);
    fixture.componentRef.setInput('options', FRUITS);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    return fixture;
  }

  /** Subscribes to the named outputs and records each emission, in order, as `name` (plus the payload). */
  function record(fixture: ComponentFixture<SelectComponent<string>>, names: string[]) {
    const log: { name: string; event?: unknown }[] = [];
    const instance = fixture.componentInstance as unknown as Record<string, { subscribe: (fn: (event?: unknown) => void) => void }>;
    for (const name of names) {
      instance[name].subscribe((event) => log.push({ name, event }));
    }
    return log;
  }

  // UI-027.S1
  it('UI-027.S1: optionSelected emits the chosen value when an option is picked', () => {
    const fixture = create();
    const log = record(fixture, ['optionSelected']);

    trigger(fixture).click();
    fixture.detectChanges();
    keydownOnPanel(fixture, 'ArrowDown'); // apple -> banana
    keydownOnPanel(fixture, 'Enter');

    expect(log).toEqual([{ name: 'optionSelected', event: { value: 'banana' } }]);
  });

  // UI-027.S2
  it('UI-027.S2: fieldClick emits with the click event when the field is clicked', () => {
    const fixture = create();
    const log = record(fixture, ['fieldClick']);

    trigger(fixture).click();

    expect(log).toHaveLength(1);
    expect(log[0].event).toBeInstanceOf(MouseEvent);
  });

  // UI-027.S3
  it('UI-027.S3: the panel events fire in order — before show, show, before hide, hide', () => {
    const fixture = create();
    const log = record(fixture, ['panelBeforeShow', 'panelShow', 'panelBeforeHide', 'panelHide']);

    trigger(fixture).click();
    fixture.detectChanges();
    expect(log.map((entry) => entry.name)).toEqual(['panelBeforeShow', 'panelShow']);

    keydownOnPanel(fixture, 'Escape');

    expect(log.map((entry) => entry.name)).toEqual(['panelBeforeShow', 'panelShow', 'panelBeforeHide', 'panelHide']);
  });

  it('UI-027.S3: choosing an option also reports the hide events', () => {
    const fixture = create();
    const log = record(fixture, ['panelBeforeHide', 'panelHide']);

    trigger(fixture).click();
    fixture.detectChanges();
    keydownOnPanel(fixture, 'Enter');

    expect(log.map((entry) => entry.name)).toEqual(['panelBeforeHide', 'panelHide']);
  });

  // UI-027.S4
  it('UI-027.S4: cleared emits when the clear button is used', () => {
    const fixture = create({ showClear: true });
    fixture.componentInstance.writeValue('apple');
    fixture.detectChanges();
    const log = record(fixture, ['cleared']);

    (fixture.nativeElement.querySelector('button[aria-label="Clear"]') as HTMLElement).click();
    fixture.detectChanges();

    expect(log).toHaveLength(1);
    expect(trigger(fixture).textContent).toContain('Select an option');
  });

  // UI-027.S5
  it('UI-027.S5: inputFocus emits on focus and inputBlur on blur', () => {
    const fixture = create();
    const log = record(fixture, ['inputFocus', 'inputBlur']);

    trigger(fixture).dispatchEvent(new FocusEvent('focus'));
    expect(log.map((entry) => entry.name)).toEqual(['inputFocus']);
    expect(log[0].event).toBeInstanceOf(FocusEvent);

    trigger(fixture).dispatchEvent(new FocusEvent('blur'));
    expect(log.map((entry) => entry.name)).toEqual(['inputFocus', 'inputBlur']);
  });

  it('UI-027.S5 (D-10): inputBlur is not emitted when focus moves into the open panel', () => {
    const fixture = create();
    const log = record(fixture, ['inputBlur']);

    trigger(fixture).click();
    fixture.detectChanges();
    trigger(fixture).dispatchEvent(new FocusEvent('blur', { relatedTarget: listbox() }));

    expect(log).toEqual([]);
  });

  // UI-027.S6
  it('UI-027.S6: filtered emits the typed text', () => {
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

  // UI-027.S7
  it('UI-027.S7: a disabled Select emits no show event when opening is attempted', () => {
    const fixture = create({ disabled: true });
    const log = record(fixture, ['panelBeforeShow', 'panelShow', 'fieldClick']);

    trigger(fixture).click();
    trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(listbox()).toBeNull();
    expect(log).toEqual([]);
  });
});
