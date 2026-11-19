import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { AutocompleteComponent } from './autocomplete.component';
import { SelectOption } from '../select/select.types';

/** List options of the autocomplete: UI-018.S1 (autoHighlight), UI-018.S2 and UI-018.S3 (unique). */

const FRUITS: SelectOption<string>[] = [
  { label: 'Apple', value: 'apple', disabled: true },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
];

function trigger(fixture: ComponentFixture<unknown>): HTMLInputElement {
  return fixture.nativeElement.querySelector('[role="combobox"]') as HTMLInputElement;
}

describe('AutocompleteComponent list options', () => {
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
    const changes: (SelectOption<string> | readonly SelectOption<string>[] | null)[] = [];
    fixture.componentInstance.registerOnChange((value) => changes.push(value));
    return { fixture, changes };
  }

  function openPanel(fixture: ComponentFixture<unknown>) {
    const el = trigger(fixture);
    el.value = 'a';
    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    jest.runAllTimers();
    fixture.detectChanges();
  }

  function pickRow(fixture: ComponentFixture<unknown>, index: number) {
    const row = document.querySelectorAll('[role="option"]')[index] as HTMLElement;
    row.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
  }

  it('UI-018.S1: with autoHighlight the first enabled item is active and Enter picks it', () => {
    const { fixture, changes } = create({ autoHighlight: true });
    openPanel(fixture);

    expect(trigger(fixture).getAttribute('aria-activedescendant')).toMatch(/-option-1$/); // Apple is disabled

    trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(changes).toEqual([{ label: 'Banana', value: 'banana' }]);
  });

  it('UI-018.S1: without autoHighlight no item is active when the panel opens and Enter picks nothing', () => {
    const { fixture, changes } = create({ autoHighlight: false });
    openPanel(fixture);

    expect(trigger(fixture).getAttribute('aria-activedescendant')).toBeNull();

    trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(changes).toEqual([]);
  });

  it('UI-018.S2: with unique, picking an already chosen suggestion leaves the values unchanged', () => {
    const { fixture, changes } = create({ multiple: true, unique: true });
    fixture.componentInstance.writeValue([FRUITS[1]]);
    fixture.detectChanges();
    openPanel(fixture);

    pickRow(fixture, 1); // Banana again

    expect(changes[changes.length - 1] ?? [FRUITS[1]]).toEqual([FRUITS[1]]);
    expect(fixture.nativeElement.querySelectorAll('med-chip')).toHaveLength(1);
  });

  it('UI-018.S3: without unique, the same suggestion appears twice in the values', () => {
    const { fixture, changes } = create({ multiple: true, unique: false });
    fixture.componentInstance.writeValue([FRUITS[1]]);
    fixture.detectChanges();
    openPanel(fixture);

    pickRow(fixture, 1); // Banana again
    fixture.detectChanges();

    expect(changes[changes.length - 1]).toEqual([FRUITS[1], FRUITS[1]]);
    expect(fixture.nativeElement.querySelectorAll('med-chip')).toHaveLength(2);
  });
});
