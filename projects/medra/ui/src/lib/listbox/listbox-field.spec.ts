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

const MANY_OPTIONS = Array.from({ length: 12 }, (_, index) => ({ label: `Option ${index}`, value: index }));

describe('ListboxComponent — list attributes and appearance', () => {
  let restoreLayout: () => void;

  beforeEach(() => {
    restoreLayout = fakeViewportLayout();
  });

  afterEach(() => {
    restoreLayout();
  });

  async function create(inputs: Record<string, unknown>): Promise<ComponentFixture<ListboxComponent<unknown>>> {
    const fixture = TestBed.createComponent(ListboxComponent<unknown>);
    for (const [name, value] of Object.entries({ options: MANY_OPTIONS, ...inputs })) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
    return fixture;
  }

  function list(fixture: ComponentFixture<unknown>): HTMLElement {
    return fixture.nativeElement.querySelector('[role="listbox"]') as HTMLElement;
  }

  function viewport(fixture: ComponentFixture<unknown>): HTMLElement {
    return fixture.nativeElement.querySelector('cdk-virtual-scroll-viewport') as HTMLElement;
  }

  // UI-041.S1
  it('UI-041.S1: ariaLabel and tabindex reach the list element and name reaches a hidden field', async () => {
    const fixture = await create({ ariaLabel: 'Countries', tabindex: 3, name: 'countries', multiple: true });
    fixture.componentInstance.writeValue([2, 5]);
    fixture.detectChanges();

    expect(list(fixture).getAttribute('aria-label')).toBe('Countries');
    expect(list(fixture).getAttribute('tabindex')).toBe('3');
    const hidden = Array.from(fixture.nativeElement.querySelectorAll('input[type="hidden"][name="countries"]')) as HTMLInputElement[];
    expect(hidden.map((input) => input.value)).toEqual(['2', '5']);
  });

  // UI-041.S2
  it('UI-041.S2: ariaLabelledBy reaches the list element as aria-labelledby', async () => {
    const fixture = await create({ ariaLabelledBy: 'title' });

    expect(list(fixture).getAttribute('aria-labelledby')).toBe('title');
  });

  // UI-041.S3
  it('UI-041.S3: scrollHeight caps the options area at the given height', async () => {
    const fixture = await create({ scrollHeight: '120px' });

    expect(viewport(fixture).style.height).toBe('120px');
  });

  // UI-041.S4
  it('UI-041.S4: listStyleClass adds its class to the options area', async () => {
    const fixture = await create({ listStyleClass: 'my-list' });

    expect(list(fixture).classList.contains('my-list')).toBe(true);
  });

  // UI-041.S5
  it('UI-041.S5: without the attributes the list keeps the current defaults', async () => {
    const fixture = await create({});

    expect(list(fixture).getAttribute('tabindex')).toBe('-1');
    expect(list(fixture).hasAttribute('aria-label')).toBe(false);
    expect(list(fixture).hasAttribute('aria-labelledby')).toBe(false);
    expect(fixture.nativeElement.querySelector('input[type="hidden"]')).toBeNull();
    expect(viewport(fixture).style.height).toBe('240px');

    // New branch of the same scenario: setting the attributes later changes the list and
    // clearing them goes back to those defaults.
    fixture.componentRef.setInput('tabindex', 5);
    fixture.componentRef.setInput('ariaLabel', 'Cities');
    fixture.detectChanges();
    expect(list(fixture).getAttribute('tabindex')).toBe('5');
    expect(list(fixture).getAttribute('aria-label')).toBe('Cities');

    fixture.componentRef.setInput('tabindex', null);
    fixture.componentRef.setInput('ariaLabel', null);
    fixture.detectChanges();
    expect(list(fixture).getAttribute('tabindex')).toBe('-1');
    expect(list(fixture).hasAttribute('aria-label')).toBe(false);
  });

  // UI-041 — dragdrop keeps its own rows, so the attributes go to its drop list container.
  it('UI-041.S4: with dragdrop, listStyleClass, scrollHeight and aria attributes reach the drop list', async () => {
    const fixture = await create({ dragdrop: true, listStyleClass: 'my-list', scrollHeight: '120px', ariaLabel: 'Countries', ariaLabelledBy: 'title' });

    const dropList = list(fixture);
    expect(dropList.classList.contains('my-list')).toBe(true);
    expect(dropList.style.maxHeight).toBe('120px');
    expect(dropList.getAttribute('aria-label')).toBe('Countries');
    expect(dropList.getAttribute('aria-labelledby')).toBe('title');
  });
});
