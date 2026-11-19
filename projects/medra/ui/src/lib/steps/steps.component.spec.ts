import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepsComponent } from './steps.component';
import { StepItem } from './steps.types';

const ITEMS: StepItem[] = [{ label: 'Cart' }, { label: 'Shipping' }, { label: 'Payment', disabled: true }, { label: 'Confirm' }];

function buttons(fixture: { nativeElement: HTMLElement }): HTMLButtonElement[] {
  return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
}

describe('StepsComponent', () => {
  function create(): ComponentFixture<StepsComponent> {
    const fixture = TestBed.createComponent(StepsComponent);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.detectChanges();
    return fixture;
  }

  it('renders one interactive step per non-disabled item, a plain span for the disabled one', () => {
    const fixture = create();
    expect(buttons(fixture).length).toBe(3); // Payment (index 2) is disabled
    expect(fixture.nativeElement.textContent).toContain('Payment');
  });

  it('shows step numbers for active/upcoming steps, and a checkmark icon (no number) for completed ones', () => {
    const fixture = create();
    fixture.componentRef.setInput('activeIndex', 2);
    fixture.detectChanges();

    // Steps before index 2 (Cart, Shipping) are completed: their circle shows a checkmark icon instead of "1"/"2".
    const items = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('li'));
    expect(items[0].querySelector('med-icon')).not.toBeNull();
    expect(items[0].textContent).not.toContain('1');
    expect(items[1].querySelector('med-icon')).not.toBeNull();
    // Payment (active, index 2) shows its number, not a checkmark.
    expect(items[2].querySelector('med-icon')).toBeNull();
    expect(items[2].textContent).toContain('3');
    // Confirm (upcoming, index 3) also shows its number.
    expect(items[3].querySelector('med-icon')).toBeNull();
    expect(items[3].textContent).toContain('4');
  });

  it('marks the current step with aria-current="step"', () => {
    const fixture = create();
    fixture.componentRef.setInput('activeIndex', 2);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-current="step"]')?.textContent).toContain('Payment');
  });

  it('clicking a step navigates activeIndex there', () => {
    const fixture = create();
    buttons(fixture)[2].click(); // 3rd enabled button = "Confirm" (index 3, since Payment/index 2 has no button)
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(3);
  });

  it('two-way binds activeIndex via a FormsModule-free model()', () => {
    const fixture = create();
    fixture.componentInstance.activeIndex.set(1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-current="step"]')?.textContent).toContain('Shipping');
  });

  it('readonly renders every step as a non-interactive span, even enabled ones', () => {
    const fixture = create();
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    expect(buttons(fixture).length).toBe(0);
  });

  it('sets aria-label on the nav', () => {
    const fixture = create();
    fixture.componentRef.setInput('ariaLabel', 'Checkout progress');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('nav')?.getAttribute('aria-label')).toBe('Checkout progress');
  });

  it('merges a consumer class override onto the list', () => {
    const fixture = create();
    fixture.componentRef.setInput('class', 'max-w-lg');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ol')?.className).toContain('max-w-lg');
  });

  it('role="toolbar" on the interactive list, dropped in readonly mode', () => {
    const fixture = create();
    expect(fixture.nativeElement.querySelector('ol')?.getAttribute('role')).toBe('toolbar');

    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ol')?.getAttribute('role')).toBeNull();
  });

  it('roving tabindex: only one step is in the Tab order at a time, starting with the first enabled step', () => {
    const fixture = create();
    // Cart, Shipping, Confirm are buttons (Payment/index 2 is disabled -> a span, not counted here).
    expect(buttons(fixture).map((b) => b.tabIndex)).toEqual([0, -1, -1]);
  });

  it('ArrowRight moves the roving tab stop to (and focuses) the next enabled step, skipping the disabled one', () => {
    const fixture = create();
    const btns = buttons(fixture);
    btns[0].dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    // Shipping (index 1) is next; Payment (index 2) is disabled, so ArrowRight from Shipping jumps straight to Confirm (index 3).
    btns[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(btns[1]);
    expect(buttons(fixture).map((b) => b.tabIndex)).toEqual([-1, 0, -1]);

    btns[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(btns[2]);
  });

  it('ArrowLeft from the first step wraps around to the last enabled step', () => {
    const fixture = create();
    const btns = buttons(fixture);
    btns[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(btns[2]);
  });

  it('Home/End jump the roving tab stop to the first/last enabled step', () => {
    const fixture = create();
    const btns = buttons(fixture);
    btns[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(btns[2]);

    btns[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(btns[0]);
  });

  it('Arrow-key navigation only moves focus, it does not activate the step (activeIndex is unchanged)', () => {
    const fixture = create();
    const btns = buttons(fixture);
    btns[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(0);
  });
});
