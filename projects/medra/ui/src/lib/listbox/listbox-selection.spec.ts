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

type Mode = 'default' | 'dragdrop';

describe.each<Mode>(['default', 'dragdrop'])('ListboxComponent — metaKeySelection and readonly (%s mode)', (mode) => {
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
    fixture.componentRef.setInput('multiple', true);
    fixture.componentRef.setInput('dragdrop', mode === 'dragdrop');
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    await settle(fixture);
    const received: unknown[] = [];
    fixture.componentInstance.registerOnChange((value: unknown) => received.push(value));
    return { fixture, received };
  }

  /** A pointer press on the default panel's row, or a click on the drag row, optionally with Ctrl held. */
  async function press(fixture: ComponentFixture<unknown>, label: string, ctrl = false): Promise<void> {
    const row = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[role="option"]')).find((el) => el.textContent?.includes(label))!;
    const type = mode === 'dragdrop' ? 'click' : 'pointerdown';
    row.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, ctrlKey: ctrl }));
    await settle(fixture);
  }

  // UI-040.S1
  it('UI-040.S1: a plain press with metaKeySelection selects only the pressed option', async () => {
    const { fixture, received } = await create({ metaKeySelection: true });
    fixture.componentInstance.writeValue(['a', 'b']);
    await settle(fixture);

    await press(fixture, 'Gamma');

    expect(received[received.length - 1]).toEqual(['c']);
  });

  // UI-040.S2
  it('UI-040.S2: a Ctrl press toggles the option and keeps the others', async () => {
    const { fixture, received } = await create({ metaKeySelection: true });
    fixture.componentInstance.writeValue(['a']);
    await settle(fixture);

    await press(fixture, 'Beta', true);
    expect(received[received.length - 1]).toEqual(['a', 'b']);

    await press(fixture, 'Alpha', true);
    expect(received[received.length - 1]).toEqual(['b']);
  });

  // UI-040.S3
  it('UI-040.S3: without metaKeySelection every press toggles and keeps the others', async () => {
    const { fixture, received } = await create();
    fixture.componentInstance.writeValue(['a']);
    await settle(fixture);

    await press(fixture, 'Beta');

    expect(received[received.length - 1]).toEqual(['a', 'b']);
  });

  // UI-040.S4
  it('UI-040.S4: readonly keeps the value and emits no change', async () => {
    const { fixture, received } = await create({ readonly: true });
    fixture.componentInstance.writeValue(['a']);
    await settle(fixture);

    await press(fixture, 'Beta');

    expect(received).toEqual([]);
    const selected = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[role="option"][aria-selected="true"]')).map((el) => el.textContent?.trim());
    expect(selected).toEqual(['Alpha']);
  });

  // UI-040.S5
  it('UI-040.S5: readonly blocks "Select all"', async () => {
    const { fixture, received } = await create({ readonly: true, showToggleAll: true });

    (fixture.nativeElement.querySelector('[role="checkbox"]') as HTMLElement).click();
    await settle(fixture);

    expect(received).toEqual([]);
  });
});
