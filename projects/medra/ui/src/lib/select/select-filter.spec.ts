import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { SelectComponent } from './select.component';

interface Country {
  name: string;
  code: string;
}

const COUNTRIES: Country[] = [
  { name: 'Brazil', code: 'ID-10' },
  { name: 'Argentina', code: 'ID-20' },
  { name: 'Chile', code: 'ID-30' },
];

// jsdom has no layout, so `cdk-virtual-scroll-viewport` measures a zero-height
// viewport and renders no rows. Give it a real measured size so the rendered
// rows (headers, options) can be asserted from the DOM.
function fakeViewportLayout(): () => void {
  const clientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
  const clientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 300 });
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 300 });
  return () => {
    if (clientHeight) Object.defineProperty(HTMLElement.prototype, 'clientHeight', clientHeight);
    else delete (HTMLElement.prototype as unknown as Record<string, unknown>)['clientHeight'];
    if (clientWidth) Object.defineProperty(HTMLElement.prototype, 'clientWidth', clientWidth);
    else delete (HTMLElement.prototype as unknown as Record<string, unknown>)['clientWidth'];
  };
}

function trigger(fixture: ComponentFixture<unknown>): HTMLElement {
  return fixture.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
}

function listbox(): HTMLElement | null {
  return document.querySelector('[role="listbox"]');
}

function filterInput(): HTMLInputElement | null {
  return document.querySelector('input[type="text"], input:not([type])') as HTMLInputElement | null;
}

function visibleLabels(): string[] {
  return Array.from(document.querySelectorAll('[role="listbox"] [role="option"]')).map((el) => (el.textContent ?? '').trim());
}

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  await new Promise((resolve) => setTimeout(resolve, 0));
  fixture.detectChanges();
}

async function type(fixture: ComponentFixture<unknown>, text: string): Promise<void> {
  const input = filterInput()!;
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await settle(fixture);
}

describe('SelectComponent — filter options', () => {
  let restoreLayout: () => void;

  beforeEach(() => {
    restoreLayout = fakeViewportLayout();
    TestBed.configureTestingModule({ imports: [OverlayModule] });
  });

  afterEach(() => {
    restoreLayout();
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function create(inputs: Record<string, unknown> = {}) {
    const fixture = TestBed.createComponent(SelectComponent<Country>);
    fixture.componentRef.setInput('options', COUNTRIES);
    fixture.componentRef.setInput('optionLabel', 'name');
    fixture.componentRef.setInput('filter', true);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    return fixture;
  }

  async function open(fixture: ComponentFixture<unknown>): Promise<void> {
    trigger(fixture).click();
    await settle(fixture);
  }

  async function close(fixture: ComponentFixture<unknown>): Promise<void> {
    listbox()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await settle(fixture);
  }

  // UI-028.S1
  it('UI-028.S1: filterBy makes the filter match the listed fields', async () => {
    const fixture = create({ filterBy: 'name,code' });
    await open(fixture);

    await type(fixture, 'ID-10'); // present only in the code of Brazil, not in any name

    expect(visibleLabels()).toEqual(['Brazil']);
  });

  // UI-028.S2
  it('UI-028.S2: filterMatchMode startsWith hides an option whose label only contains the text', async () => {
    const fixture = create({ filterMatchMode: 'startsWith' });
    await open(fixture);

    await type(fixture, 'raz'); // middle of Brazil
    expect(visibleLabels()).not.toContain('Brazil');

    await type(fixture, 'bra');
    expect(visibleLabels()).toContain('Brazil');
  });

  // UI-028.S3
  it('UI-028.S3: resetFilterOnHide clears the filter text when the panel closes', async () => {
    const fixture = create({ resetFilterOnHide: true });
    await open(fixture);
    await type(fixture, 'chi');
    expect(visibleLabels()).toEqual(['Chile']);

    await close(fixture);
    await open(fixture);

    expect(filterInput()!.value).toBe('');
    expect(visibleLabels()).toHaveLength(COUNTRIES.length);
  });

  // UI-028.S4
  it('UI-028.S4: autofocusFilter off leaves the filter field without focus on open', async () => {
    const fixture = create({ autofocusFilter: false });
    await open(fixture);

    expect(filterInput()).not.toBeNull();
    expect(document.activeElement).not.toBe(filterInput());
  });

  // UI-028.S5
  it('UI-028.S5: defaults keep the current filter — label contains, text kept on reopen, input focused', async () => {
    const fixture = create();
    await open(fixture);
    expect(document.activeElement).toBe(filterInput());

    await type(fixture, 'raz');
    expect(visibleLabels()).toEqual(['Brazil']);

    await close(fixture);
    await open(fixture);

    expect(filterInput()!.value).toBe('raz');
    expect(document.activeElement).toBe(filterInput());
  });
});
