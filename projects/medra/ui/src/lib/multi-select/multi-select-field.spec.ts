import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { MultiSelectComponent } from './multi-select.component';

const OPTIONS = Array.from({ length: 10 }, (_, i) => ({ label: `Option ${i + 1}`, value: i + 1 }));

// jsdom has no layout, so `cdk-virtual-scroll-viewport` measures a zero-height
// viewport and renders no rows. Give it a real measured size.
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

function trigger(fixture: ComponentFixture<unknown>): HTMLElement {
  return fixture.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
}

describe('MultiSelectComponent — field attributes and appearance', () => {
  let restoreLayout: () => void;

  beforeEach(() => {
    restoreLayout = fakeViewportLayout();
    TestBed.configureTestingModule({ imports: [OverlayModule] });
  });

  afterEach(() => {
    restoreLayout();
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  async function create(inputs: Record<string, unknown> = {}): Promise<ComponentFixture<MultiSelectComponent<number>>> {
    const fixture = TestBed.createComponent(MultiSelectComponent<number>);
    // Attached to the document so focus can be asserted.
    document.body.appendChild(fixture.nativeElement);
    fixture.componentRef.setInput('options', OPTIONS);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    await settle(fixture);
    return fixture;
  }

  it('UI-035.S1: inputId, name, ariaLabel and required reach the field', async () => {
    const fixture = await create({ inputId: 'countries', name: 'countries-field', ariaLabel: 'Countries', required: true });

    const field = trigger(fixture);
    expect(field.id).toBe('countries');
    expect(field.getAttribute('aria-label')).toBe('Countries');
    expect(field.getAttribute('aria-required')).toBe('true');
    // D-14: nothing chosen, nothing submitted; one hidden input per chosen value.
    expect(fixture.nativeElement.querySelector('input[type="hidden"]')).toBeNull();

    fixture.componentInstance.writeValue([2, 5]);
    await settle(fixture);

    const hidden = Array.from(fixture.nativeElement.querySelectorAll('input[type="hidden"][name="countries-field"]')) as HTMLInputElement[];
    expect(hidden.map((input) => input.value)).toEqual(['2', '5']);
  });

  it('UI-035.S1: ariaLabelledBy reaches the field', async () => {
    const fixture = await create({ ariaLabelledBy: 'label-id' });

    expect(trigger(fixture).getAttribute('aria-labelledby')).toBe('label-id');
  });

  it('UI-035.S2: tabindex is applied and autofocus focuses the field', async () => {
    const fixture = await create({ tabindex: 3, autofocus: true });

    expect(trigger(fixture).getAttribute('tabindex')).toBe('3');
    expect(document.activeElement).toBe(trigger(fixture));
  });

  it('UI-035.S3: variant="filled" uses the filled style of the theme', async () => {
    const fixture = await create({ variant: 'filled' });

    expect(trigger(fixture).className).toContain('bg-surface-100');
  });

  it('UI-035.S4: fluid marks the host so the field fills its container', async () => {
    const fixture = await create({ fluid: true });

    expect(fixture.nativeElement.classList.contains('med-multi-select-fluid')).toBe(true);
    expect(fixture.nativeElement.classList.contains('w-full')).toBe(true);
  });

  it('UI-035.S5: panelStyleClass, appendTo="body" and scrollHeight shape the panel', async () => {
    const fixture = await create({ panelStyleClass: 'my-panel', appendTo: 'body', scrollHeight: '100px' });
    trigger(fixture).click();
    await settle(fixture);

    const panel = document.querySelector('.my-panel') as HTMLElement | null;
    expect(panel).not.toBeNull();
    expect(document.body.contains(panel)).toBe(true);
    expect(fixture.nativeElement.contains(panel)).toBe(false);
    const viewport = document.querySelector('cdk-virtual-scroll-viewport') as HTMLElement;
    expect(viewport.style.height).toBe('100px');
  });

  it('UI-035.S6: appendTo="self" places the panel inside the component host', async () => {
    const fixture = await create({ panelStyleClass: 'my-panel', appendTo: 'self' });
    trigger(fixture).click();
    await settle(fixture);

    const panel = document.querySelector('.my-panel') as HTMLElement | null;
    expect(panel).not.toBeNull();
    expect(fixture.nativeElement.contains(panel)).toBe(true);
  });

  it('UI-035.S6: appendTo with an element places the panel inside that element', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const fixture = await create({ panelStyleClass: 'my-panel', appendTo: target });
    trigger(fixture).click();
    await settle(fixture);

    const panel = document.querySelector('.my-panel') as HTMLElement | null;
    expect(panel).not.toBeNull();
    expect(target.contains(panel)).toBe(true);
    expect(fixture.nativeElement.contains(panel)).toBe(false);
    target.remove();
  });

  it('UI-035.S7: without the inputs the field keeps the current behavior', async () => {
    const fixture = await create();
    const field = trigger(fixture);

    expect(field.getAttribute('aria-label')).toBeNull();
    expect(field.getAttribute('aria-required')).toBeNull();
    expect(field.getAttribute('tabindex')).toBe('0');
    expect(fixture.nativeElement.querySelector('input[type="hidden"]')).toBeNull();
    expect(document.activeElement).not.toBe(field);

    field.click();
    await settle(fixture);

    const panel = document.querySelector('[role="listbox"]') as HTMLElement | null;
    expect(panel).not.toBeNull();
    expect(document.body.contains(panel)).toBe(true);
    expect(fixture.nativeElement.contains(panel)).toBe(false);
    expect((document.querySelector('cdk-virtual-scroll-viewport') as HTMLElement).style.height).toBe('240px');
  });
});
