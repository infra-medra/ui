import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListboxComponent } from './listbox.component';

// jsdom has no layout, so `cdk-virtual-scroll-viewport` measures a zero-height
// viewport and renders no rows. Give it a real measured size so the rendered
// rows can be asserted from the DOM.
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

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  await new Promise((resolve) => setTimeout(resolve, 0));
  fixture.detectChanges();
}

function filterInput(fixture: ComponentFixture<unknown>): HTMLInputElement {
  return fixture.nativeElement.querySelector('input:not([type="hidden"])') as HTMLInputElement;
}

function visibleLabels(fixture: ComponentFixture<unknown>): string[] {
  return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[role="listbox"] [role="option"]')).map((row) => row.textContent?.trim() ?? '');
}

async function type(fixture: ComponentFixture<unknown>, text: string): Promise<void> {
  const input = filterInput(fixture);
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await settle(fixture);
}

async function toggleAll(fixture: ComponentFixture<unknown>): Promise<void> {
  (fixture.nativeElement.querySelector('[role="checkbox"]') as HTMLElement).click();
  await settle(fixture);
}

interface Country {
  name: string;
  code: string;
  off?: boolean;
}

const COUNTRIES: Country[] = [
  { name: 'Brazil', code: 'ID-10' },
  { name: 'Chile', code: 'CL' },
  { name: 'Canada', code: 'CA' },
];

describe('ListboxComponent — filter options and select all over the filtered list', () => {
  let restoreLayout: () => void;

  beforeEach(() => {
    restoreLayout = fakeViewportLayout();
  });

  afterEach(() => {
    restoreLayout();
  });

  async function create(inputs: Record<string, unknown> = {}) {
    const fixture = TestBed.createComponent(ListboxComponent<unknown>);
    fixture.componentRef.setInput('options', COUNTRIES);
    fixture.componentRef.setInput('optionLabel', 'name');
    fixture.componentRef.setInput('optionValue', 'code');
    fixture.componentRef.setInput('filter', true);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    await settle(fixture);
    const received: unknown[] = [];
    fixture.componentInstance.registerOnChange((value: unknown) => received.push(value));
    return { fixture, received };
  }

  // UI-038.S1
  it('UI-038.S1: filterBy makes the filter match the listed fields', async () => {
    const { fixture } = await create({ filterBy: 'code' });

    await type(fixture, 'ID-10'); // present only in the code of Brazil, not in any name

    expect(visibleLabels(fixture)).toEqual(['Brazil']);
  });

  // UI-038.S2
  it('UI-038.S2: filterMatchMode startsWith hides an option whose label only contains the text', async () => {
    const { fixture } = await create({ filterMatchMode: 'startsWith' });

    await type(fixture, 'raz'); // middle of Brazil
    expect(visibleLabels(fixture)).not.toContain('Brazil');

    await type(fixture, 'bra');
    expect(visibleLabels(fixture)).toContain('Brazil');
  });

  // UI-038.S3
  it('UI-038.S3: "Select all" selects only the enabled options the filter shows', async () => {
    const { fixture, received } = await create({ multiple: true, showToggleAll: true });

    await type(fixture, 'ch'); // Chile only
    await type(fixture, 'c'); // Chile and Canada, not Brazil
    expect(visibleLabels(fixture)).toEqual(['Chile', 'Canada']);

    await toggleAll(fixture);

    expect(received[received.length - 1]).toEqual(['CL', 'CA']);
    expect(received[received.length - 1]).not.toContain('ID-10');
  });

  // UI-038.S4
  it('UI-038.S4: "Select all" skips a disabled option', async () => {
    const options: Country[] = [...COUNTRIES, { name: 'Chad', code: 'TD', off: true }];
    const { fixture, received } = await create({ options, multiple: true, showToggleAll: true, optionDisabled: 'off' });

    await toggleAll(fixture);

    expect(received[received.length - 1]).toEqual(['ID-10', 'CL', 'CA']);
    expect(received[received.length - 1]).not.toContain('TD');
  });

  // UI-038.S5
  it('UI-038.S5: without filterBy and filterMatchMode the filter matches labels that contain the text', async () => {
    const { fixture } = await create();

    await type(fixture, 'raz');

    expect(visibleLabels(fixture)).toEqual(['Brazil']);
    await type(fixture, 'ID-10'); // the code is not searched by default
    expect(visibleLabels(fixture)).toEqual([]);
  });
});
