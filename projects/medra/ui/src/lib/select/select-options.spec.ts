import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { SelectComponent } from './select.component';

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

function optionRows(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[role="listbox"] [role="option"]'));
}

function groupHeaders(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[role="listbox"] [role="presentation"]'));
}

async function openPanel(fixture: ComponentFixture<unknown>): Promise<void> {
  trigger(fixture).click();
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  await new Promise((resolve) => setTimeout(resolve, 0));
  fixture.detectChanges();
}

function pick(fixture: ComponentFixture<unknown>, label: string): void {
  const row = optionRows().find((el) => el.textContent?.includes(label));
  row!.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));
  fixture.detectChanges();
}

interface City {
  name: string;
  code: string;
  off?: boolean;
}

const CITIES: City[] = [
  { name: 'New York', code: 'NY' },
  { name: 'Rome', code: 'RM' },
  { name: 'London', code: 'LDN', off: true },
];

describe('SelectComponent — consumer data mapping', () => {
  let restoreLayout: () => void;

  beforeEach(() => {
    restoreLayout = fakeViewportLayout();
    TestBed.configureTestingModule({ imports: [OverlayModule] });
  });

  afterEach(() => {
    restoreLayout();
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function create(inputs: Record<string, unknown>) {
    const fixture = TestBed.createComponent(SelectComponent<unknown>);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    const received: unknown[] = [];
    fixture.componentInstance.registerOnChange((value: unknown) => received.push(value));
    return { fixture, received };
  }

  // UI-026.S1
  it('UI-026.S1: shows the optionLabel field and emits the optionValue field', async () => {
    const { fixture, received } = create({ options: CITIES, optionLabel: 'name', optionValue: 'code' });
    await openPanel(fixture);

    expect(optionRows().map((row) => row.textContent?.trim())).toEqual(['New York', 'Rome', 'London']);
    pick(fixture, 'Rome');

    expect(trigger(fixture).textContent).toContain('Rome');
    expect(received).toEqual(['RM']);
  });

  // UI-026.S2
  it('UI-026.S2: renders nested groups as non-interactive headers followed by their options', async () => {
    const groups = [
      { label: 'Germany', items: [{ label: 'Berlin', value: 'BE' }, { label: 'Munich', value: 'MU' }] },
      { label: 'USA', items: [{ label: 'Chicago', value: 'CH' }] },
    ];
    const { fixture } = create({ options: groups, optionGroupLabel: 'label', optionGroupChildren: 'items' });
    await openPanel(fixture);

    expect(groupHeaders().map((el) => el.textContent?.trim())).toEqual(['Germany', 'USA']);
    expect(groupHeaders().every((el) => el.getAttribute('role') === 'presentation')).toBe(true);
    expect(optionRows().map((row) => row.textContent?.trim())).toEqual(['Berlin', 'Munich', 'Chicago']);
    const listbox = document.querySelector('[role="listbox"]')!;
    const order = Array.from(listbox.querySelectorAll('[role="presentation"], [role="option"]')).map((el) => el.textContent?.trim());
    expect(order).toEqual(['Germany', 'Berlin', 'Munich', 'USA', 'Chicago']);
  });

  // UI-026.S3
  it('UI-026.S3: an option disabled through a field name cannot be chosen', async () => {
    const { fixture, received } = create({ options: CITIES, optionLabel: 'name', optionValue: 'code', optionDisabled: 'off' });
    await openPanel(fixture);

    const london = optionRows().find((row) => row.textContent?.includes('London'))!;
    expect(london.getAttribute('aria-disabled')).toBe('true');
    pick(fixture, 'London');

    expect(received).toEqual([]);
    expect(trigger(fixture).textContent).not.toContain('London');
  });

  it('UI-026.S3: an option disabled through a function cannot be chosen', async () => {
    const { fixture, received } = create({
      options: CITIES,
      optionLabel: 'name',
      optionValue: 'code',
      optionDisabled: (option: City) => option.code === 'RM',
    });
    await openPanel(fixture);

    pick(fixture, 'Rome');

    expect(received).toEqual([]);
    pick(fixture, 'New York');
    expect(received).toEqual(['NY']);
  });

  // UI-026.S4
  it('UI-026.S4: dataKey matches an object value written by the form that is not the same reference', () => {
    const { fixture } = create({
      options: [
        { name: 'Ana', value: { id: 1, name: 'Ana' } },
        { name: 'Bruno', value: { id: 2, name: 'Bruno' } },
      ],
      optionLabel: 'name',
      dataKey: 'id',
    });

    fixture.componentInstance.writeValue({ id: 2, name: 'stale copy' });
    fixture.detectChanges();

    expect(trigger(fixture).textContent).toContain('Bruno');
    expect(trigger(fixture).textContent).not.toContain('stale copy');
  });

  // UI-026.S5
  it('UI-026.S5: with no mapping input, label/value/disabled and a flat group keep working', async () => {
    const flat = [
      { label: 'Apple', value: 'apple', group: 'Fruits' },
      { label: 'Banana', value: 'banana', group: 'Fruits' },
      { label: 'Carrot', value: 'carrot', group: 'Vegetables' },
      { label: 'Daikon', value: 'daikon', group: 'Vegetables', disabled: true },
    ];
    const { fixture, received } = create({ options: flat });
    await openPanel(fixture);

    expect(groupHeaders().map((el) => el.textContent?.trim())).toEqual(['Fruits', 'Vegetables']);
    pick(fixture, 'Carrot');

    expect(trigger(fixture).textContent).toContain('Carrot');
    expect(received).toEqual(['carrot']);
  });

  it('UI-026.S5: the same flat data is read again under another field once optionLabel is mapped', async () => {
    const both = [{ label: 'Wrong', name: 'Right', value: 'v' }];
    const { fixture } = create({ options: both, optionLabel: 'name' });
    await openPanel(fixture);

    expect(optionRows().map((row) => row.textContent?.trim())).toEqual(['Right']);
  });
});
