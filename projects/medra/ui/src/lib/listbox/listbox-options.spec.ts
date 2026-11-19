import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListboxComponent } from './listbox.component';

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

function optionRows(fixture: ComponentFixture<unknown>): HTMLElement[] {
  return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[role="listbox"] [role="option"]'));
}

function groupHeaders(fixture: ComponentFixture<unknown>): HTMLElement[] {
  return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[role="listbox"] [role="presentation"]'));
}

function pick(fixture: ComponentFixture<unknown>, label: string): void {
  const row = optionRows(fixture).find((el) => el.textContent?.includes(label));
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

describe('ListboxComponent — consumer data mapping', () => {
  let restoreLayout: () => void;

  beforeEach(() => {
    restoreLayout = fakeViewportLayout();
  });

  afterEach(() => {
    restoreLayout();
  });

  async function create(inputs: Record<string, unknown>) {
    const fixture = TestBed.createComponent(ListboxComponent<unknown>);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
    const received: unknown[] = [];
    fixture.componentInstance.registerOnChange((value: unknown) => received.push(value));
    return { fixture, received };
  }

  // UI-036.S1
  it('UI-036.S1: shows the optionLabel field of the chosen option and emits its optionValue', async () => {
    const { fixture, received } = await create({ options: CITIES, optionLabel: 'name', optionValue: 'code' });

    expect(optionRows(fixture).map((row) => row.textContent?.trim())).toEqual(['New York', 'Rome', 'London']);
    pick(fixture, 'Rome');

    const chosen = optionRows(fixture).find((row) => row.textContent?.includes('Rome'))!;
    expect(chosen.getAttribute('aria-selected')).toBe('true');
    expect(received[received.length - 1]).toBe('RM');
  });

  // UI-036.S2
  it('UI-036.S2: renders nested groups as non-interactive headers followed by their options', async () => {
    const groups = [
      { label: 'Germany', items: [{ label: 'Berlin', value: 'BE' }, { label: 'Munich', value: 'MU' }] },
      { label: 'USA', items: [{ label: 'Chicago', value: 'CH' }] },
    ];
    const { fixture } = await create({ options: groups, optionGroupLabel: 'label', optionGroupChildren: 'items' });

    expect(groupHeaders(fixture).map((el) => el.textContent?.trim())).toEqual(['Germany', 'USA']);
    expect(groupHeaders(fixture).every((el) => el.getAttribute('role') === 'presentation')).toBe(true);
    const listbox = fixture.nativeElement.querySelector('[role="listbox"]') as HTMLElement;
    const order = Array.from(listbox.querySelectorAll('[role="presentation"], [role="option"]')).map((el) => el.textContent?.trim());
    expect(order).toEqual(['Germany', 'Berlin', 'Munich', 'USA', 'Chicago']);
  });

  // UI-036.S3
  it('UI-036.S3: an option disabled through a field name cannot be chosen', async () => {
    const { fixture, received } = await create({ options: CITIES, optionLabel: 'name', optionValue: 'code', optionDisabled: 'off' });

    pick(fixture, 'London');

    expect(received).toEqual([]);
    const disabled = optionRows(fixture).find((row) => row.textContent?.includes('London'))!;
    expect(disabled.getAttribute('aria-disabled')).toBe('true');
  });

  it('UI-036.S3: an option disabled through a predicate cannot be chosen', async () => {
    const { fixture, received } = await create({
      options: CITIES,
      optionLabel: 'name',
      optionValue: 'code',
      optionDisabled: (city: City) => city.code === 'RM',
    });

    pick(fixture, 'Rome');

    expect(received).toEqual([]);
    pick(fixture, 'New York');
    expect(received[received.length - 1]).toBe('NY');
  });

  // UI-036.S4
  it('UI-036.S4: marks the options whose dataKey matches a written object value that is not the same reference', async () => {
    const options = [
      { label: 'New York', value: { id: 1, name: 'New York' } },
      { label: 'Rome', value: { id: 2, name: 'Rome' } },
      { label: 'London', value: { id: 3, name: 'London' } },
    ];
    const { fixture } = await create({ options, multiple: true, dataKey: 'id' });

    fixture.componentInstance.writeValue([{ id: 2, name: 'Rome' }, { id: 3, name: 'London' }]);
    fixture.detectChanges();

    const selected = optionRows(fixture)
      .filter((row) => row.getAttribute('aria-selected') === 'true')
      .map((row) => row.textContent?.trim());
    expect(selected).toEqual(['Rome', 'London']);
  });

  it('UI-036.S4: without dataKey the same written objects match nothing', async () => {
    const options = [{ label: 'Rome', value: { id: 2 } }];
    const { fixture } = await create({ options, multiple: true });

    fixture.componentInstance.writeValue([{ id: 2 }]);
    fixture.detectChanges();

    expect(optionRows(fixture).every((row) => row.getAttribute('aria-selected') !== 'true')).toBe(true);
  });

  // UI-036.S5
  it('UI-036.S5: without mapping inputs keeps the label/value shape and the flat group header', async () => {
    const options = [
      { label: 'Berlin', value: 'BE', group: 'Germany' },
      { label: 'Munich', value: 'MU', group: 'Germany' },
      { label: 'Chicago', value: 'CH', group: 'USA' },
    ];
    const { fixture, received } = await create({ options });

    expect(groupHeaders(fixture).map((el) => el.textContent?.trim())).toEqual(['Germany', 'USA']);
    pick(fixture, 'Munich');

    expect(received[received.length - 1]).toBe('MU');
  });
});
