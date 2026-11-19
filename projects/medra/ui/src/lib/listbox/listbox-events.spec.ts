import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListboxComponent } from './listbox.component';
import { SelectOption } from '../select/select.types';

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

const OPTIONS: SelectOption<string>[] = [
  { label: 'Alpha', value: 'a' },
  { label: 'Beta', value: 'b' },
  { label: 'Gamma', value: 'c' },
];

function row(fixture: ComponentFixture<unknown>, label: string): HTMLElement {
  return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[role="option"]')).find((el) => el.textContent?.includes(label))!;
}

async function press(fixture: ComponentFixture<unknown>, label: string): Promise<void> {
  row(fixture, label).dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
  await settle(fixture);
}

describe('ListboxComponent — events', () => {
  let restoreLayout: () => void;

  beforeEach(() => {
    restoreLayout = fakeViewportLayout();
  });

  afterEach(() => {
    restoreLayout();
  });

  async function create(inputs: Record<string, unknown> = {}) {
    const fixture = TestBed.createComponent(ListboxComponent<string>);
    fixture.componentRef.setInput('options', OPTIONS);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.componentInstance.registerOnChange(() => {});
    // Subscribe before the first render, so an event fired while the list initializes is seen too.
    const log: { name: string; event: unknown }[] = [];
    const instance = fixture.componentInstance as unknown as Record<string, { subscribe: (fn: (event: unknown) => void) => void }>;
    for (const name of ['selectionChanged', 'optionClicked', 'optionDoubleClicked', 'selectAllChanged', 'listFocus', 'listBlur', 'filtered']) {
      instance[name].subscribe((event) => log.push({ name, event }));
    }
    await settle(fixture);
    return { fixture, log };
  }

  // UI-037.S1
  it('UI-037.S1: selectionChanged carries the new value list and the toggled option', async () => {
    const { fixture, log } = await create({ multiple: true });
    fixture.componentInstance.writeValue(['a']);
    await settle(fixture);

    await press(fixture, 'Beta');

    const changes = log.filter((entry) => entry.name === 'selectionChanged');
    expect(changes).toHaveLength(1);
    expect(changes[0].event).toEqual({ value: ['a', 'b'], itemValue: 'b' });
  });

  // UI-037.S2
  it('UI-037.S2: optionClicked and optionDoubleClicked carry the value of the option and the original event', async () => {
    const { fixture, log } = await create();

    row(fixture, 'Alpha').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    row(fixture, 'Beta').dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
    await settle(fixture);

    const clicked = log.filter((entry) => entry.name === 'optionClicked').map((entry) => entry.event as { value: string; originalEvent: Event });
    const doubled = log.filter((entry) => entry.name === 'optionDoubleClicked').map((entry) => entry.event as { value: string; originalEvent: Event });
    expect(clicked.map((event) => event.value)).toEqual(['a']);
    expect(clicked[0].originalEvent.type).toBe('click');
    expect(doubled.map((event) => event.value)).toEqual(['b']);
    expect(doubled[0].originalEvent.type).toBe('dblclick');
  });

  it('UI-037.S2: the drag rows of the dragdrop mode emit the same click events', async () => {
    const { fixture, log } = await create({ dragdrop: true });

    row(fixture, 'Gamma').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    row(fixture, 'Alpha').dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
    await settle(fixture);

    expect(log.filter((entry) => entry.name === 'optionClicked').map((entry) => (entry.event as { value: string }).value)).toEqual(['c']);
    expect(log.filter((entry) => entry.name === 'optionDoubleClicked').map((entry) => (entry.event as { value: string }).value)).toEqual(['a']);
  });

  // UI-037.S3
  it('UI-037.S3: "Select all" emits selectAllChanged checked and the full selectionChanged list', async () => {
    const { fixture, log } = await create({ multiple: true, showToggleAll: true });

    (fixture.nativeElement.querySelector('[role="checkbox"]') as HTMLElement).click();
    await settle(fixture);

    expect(log.filter((entry) => entry.name === 'selectAllChanged').map((entry) => entry.event)).toEqual([{ checked: true }]);
    expect(log.filter((entry) => entry.name === 'selectionChanged').map((entry) => (entry.event as { value: string[] }).value)).toEqual([['a', 'b', 'c']]);
  });

  // UI-037.S4
  it('UI-037.S4: listFocus then listBlur follow the real focus, and the initial focus grab of the panel emits nothing', async () => {
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    try {
      const { fixture, log } = await create();
      expect(log.filter((entry) => entry.name === 'listFocus' || entry.name === 'listBlur')).toEqual([]);

      outside.focus();
      await settle(fixture);
      (fixture.nativeElement.querySelector('[role="listbox"]') as HTMLElement).focus();
      await settle(fixture);
      outside.focus();
      await settle(fixture);

      expect(log.filter((entry) => entry.name === 'listFocus' || entry.name === 'listBlur').map((entry) => entry.name)).toEqual(['listBlur', 'listFocus', 'listBlur']);
    } finally {
      outside.remove();
    }
  });

  // UI-037.S5
  it('UI-037.S5: filtered carries the text typed in the filter box', async () => {
    const { fixture, log } = await create({ filter: true });

    const input = fixture.nativeElement.querySelector('input:not([type="hidden"])') as HTMLInputElement;
    input.value = 'ab';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await settle(fixture);

    expect(log.filter((entry) => entry.name === 'filtered').map((entry) => entry.event)).toEqual([{ filter: 'ab' }]);
  });

  // UI-037.S6
  it('UI-037.S6: a disabled list emits no change and no click', async () => {
    const { fixture, log } = await create({ disabled: true, multiple: true, showToggleAll: true });

    await press(fixture, 'Alpha');
    row(fixture, 'Beta').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    (fixture.nativeElement.querySelector('[role="checkbox"]') as HTMLElement).click();
    await settle(fixture);

    expect(log.filter((entry) => ['selectionChanged', 'optionClicked', 'selectAllChanged'].includes(entry.name))).toEqual([]);
  });
});
