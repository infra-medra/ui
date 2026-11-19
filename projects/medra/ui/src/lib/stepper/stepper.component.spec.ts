import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepPanelComponent } from './step-panel.component';
import { StepperComponent } from './stepper.component';

@Component({
  standalone: true,
  imports: [StepperComponent, StepPanelComponent],
  template: `
    <med-stepper [linear]="linear" (completed)="onCompleted()">
      <med-step-panel label="Cart"><p class="panel">Cart content</p></med-step-panel>
      <med-step-panel label="Shipping" [disabled]="shippingDisabled"><p class="panel">Shipping content</p></med-step-panel>
      <med-step-panel label="Payment"><p class="panel">Payment content</p></med-step-panel>
    </med-stepper>
  `,
})
class HostComponent {
  linear = false;
  shippingDisabled = false;
  completedCount = 0;

  onCompleted(): void {
    this.completedCount++;
  }
}

function visiblePanelText(fixture: { nativeElement: HTMLElement }): string {
  return Array.from(fixture.nativeElement.querySelectorAll('med-step-panel'))
    .find((el) => (el as HTMLElement).hidden === false)!
    .textContent!.trim();
}

function headerButtons(fixture: { nativeElement: HTMLElement }): HTMLButtonElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('nav button'));
}

function navButton(fixture: { nativeElement: HTMLElement }, label: string): HTMLButtonElement {
  return Array.from(fixture.nativeElement.querySelectorAll('div.mt-4.flex.justify-between button')).find((b) => b.textContent?.trim() === label) as HTMLButtonElement;
}

describe('StepperComponent', () => {
  function create(configure?: (host: HostComponent) => void): ComponentFixture<HostComponent> {
    const fixture = TestBed.createComponent(HostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  it('shows only the first panel initially, others hidden', () => {
    const fixture = create();
    expect(visiblePanelText(fixture)).toBe('Cart content');
  });

  it('Next advances to the next panel', () => {
    const fixture = create();
    navButton(fixture, 'Next').click();
    fixture.detectChanges();
    expect(visiblePanelText(fixture)).toBe('Shipping content');
  });

  it('Back is disabled on the first step, enabled after advancing', () => {
    const fixture = create();
    expect(navButton(fixture, 'Back').disabled).toBe(true);

    navButton(fixture, 'Next').click();
    fixture.detectChanges();
    expect(navButton(fixture, 'Back').disabled).toBe(false);

    navButton(fixture, 'Back').click();
    fixture.detectChanges();
    expect(visiblePanelText(fixture)).toBe('Cart content');
  });

  it('the last step\'s Next button reads "Finish" and emits completed instead of advancing', () => {
    const fixture = create();
    navButton(fixture, 'Next').click();
    fixture.detectChanges();
    navButton(fixture, 'Next').click();
    fixture.detectChanges();

    expect(navButton(fixture, 'Finish')).not.toBeUndefined();
    navButton(fixture, 'Finish').click();
    fixture.detectChanges();

    expect(fixture.componentInstance.completedCount).toBe(1);
    expect(visiblePanelText(fixture)).toBe('Payment content'); // stays put, doesn't overshoot
  });

  it('clicking a header step jumps directly to it (non-linear, the default)', () => {
    const fixture = create();
    headerButtons(fixture)[2].click();
    fixture.detectChanges();
    expect(visiblePanelText(fixture)).toBe('Payment content');
  });

  it('linear mode disables header steps ahead of the current one, but back navigation stays clickable', () => {
    const fixture = create((host) => (host.linear = true));
    // Ahead of step 0: Shipping/Payment are disabled headers, not buttons.
    expect(headerButtons(fixture).length).toBe(1);

    navButton(fixture, 'Next').click();
    fixture.detectChanges();
    // Now on step 1: Cart (behind) stays clickable, Shipping (current) too, Payment (ahead) still blocked.
    expect(headerButtons(fixture).length).toBe(2);

    headerButtons(fixture)[0].click();
    fixture.detectChanges();
    expect(visiblePanelText(fixture)).toBe('Cart content');
  });

  it("a panel's own disabled composes with linear (stays disabled even once reachable)", () => {
    const fixture = create((host) => {
      host.linear = true;
      host.shippingDisabled = true;
    });
    navButton(fixture, 'Next').click();
    fixture.detectChanges();
    // Even on step 1 (Shipping is now "ahead-unlocked" by linear), it's still disabled on its own merits.
    expect(headerButtons(fixture).length).toBe(1); // only Cart (step 0) is clickable
  });

  it('showNavigation=false hides the Next/Back row', () => {
    const soloFixture = TestBed.createComponent(StepperComponent);
    soloFixture.componentRef.setInput('showNavigation', false);
    soloFixture.detectChanges();
    expect(soloFixture.nativeElement.querySelector('div.mt-4.flex.justify-between')).toBeNull();
  });

  it('sets aria-label on the steps header via ariaLabel', () => {
    const soloFixture = TestBed.createComponent(StepperComponent);
    soloFixture.componentRef.setInput('ariaLabel', 'Checkout steps');
    soloFixture.detectChanges();
    expect(soloFixture.nativeElement.querySelector('nav')?.getAttribute('aria-label')).toBe('Checkout steps');
  });

  it('each panel carries role="group" and an aria-label matching its own label', () => {
    const fixture = create();
    const panels = Array.from(fixture.nativeElement.querySelectorAll('med-step-panel'));
    expect(panels.map((p) => (p as HTMLElement).getAttribute('role'))).toEqual(['group', 'group', 'group']);
    expect(panels.map((p) => (p as HTMLElement).getAttribute('aria-label'))).toEqual(['Cart', 'Shipping', 'Payment']);
  });

  it('Back and Next are real native <button>s, so Enter/Space activate them the same way a click does (browsers turn a focused button\'s Enter/Space into a synthetic click; jsdom does not synthesize this, so a dispatched click mirrors it directly)', () => {
    const fixture = create();
    const next = navButton(fixture, 'Next');
    expect(next.tagName).toBe('BUTTON');
    next.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(visiblePanelText(fixture)).toBe('Shipping content');

    const back = navButton(fixture, 'Back');
    expect(back.tagName).toBe('BUTTON');
    back.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(visiblePanelText(fixture)).toBe('Cart content');
  });
});

describe('StepperComponent (orientation: vertical)', () => {
  @Component({
    standalone: true,
    imports: [StepperComponent, StepPanelComponent],
    template: `
      <med-stepper orientation="vertical" [linear]="linear">
        <med-step-panel label="Cart"><p class="panel">Cart content</p></med-step-panel>
        <med-step-panel label="Shipping" [disabled]="shippingDisabled"><p class="panel">Shipping content</p></med-step-panel>
        <med-step-panel label="Payment"><p class="panel">Payment content</p></med-step-panel>
      </med-stepper>
    `,
  })
  class VerticalHostComponent {
    linear = false;
    shippingDisabled = false;
  }

  function createVertical(configure?: (host: VerticalHostComponent) => void) {
    const fixture = TestBed.createComponent(VerticalHostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  it('does not render <med-steps> in vertical mode', () => {
    const fixture = createVertical();
    expect(fixture.nativeElement.querySelector('med-steps')).toBeNull();
  });

  it('renders its own vertical step list with one header button per panel, circle number + label together', () => {
    const fixture = createVertical();
    expect(headerButtons(fixture)).toHaveLength(3);
    expect(headerButtons(fixture).map((b) => b.textContent?.replace(/\s+/g, ' ').trim())).toEqual(['1 Cart', '2 Shipping', '3 Payment']);
  });

  it('shows only the active panel, same single shared content area as horizontal mode', () => {
    const fixture = createVertical();
    expect(visiblePanelText(fixture)).toBe('Cart content');
  });

  it('clicking a header step jumps directly to it (non-linear, the default)', () => {
    const fixture = createVertical();
    headerButtons(fixture)[2].click();
    fixture.detectChanges();
    expect(visiblePanelText(fixture)).toBe('Payment content');
  });

  it('marks the active step with aria-current="step"', () => {
    const fixture = createVertical();
    headerButtons(fixture)[1].click();
    fixture.detectChanges();
    expect(headerButtons(fixture)[1].getAttribute('aria-current')).toBe('step');
    expect(headerButtons(fixture)[0].getAttribute('aria-current')).toBeNull();
  });

  it('linear mode disables header steps ahead of the current one, same semantics as horizontal', () => {
    const fixture = createVertical((host) => (host.linear = true));
    expect(headerButtons(fixture)).toHaveLength(1); // only Cart is clickable

    navButton(fixture, 'Next').click();
    fixture.detectChanges();
    expect(headerButtons(fixture)).toHaveLength(2); // Cart (behind) + Shipping (current)
  });

  it('Next/Back navigation works the same as horizontal mode', () => {
    const fixture = createVertical();
    navButton(fixture, 'Next').click();
    fixture.detectChanges();
    expect(visiblePanelText(fixture)).toBe('Shipping content');

    navButton(fixture, 'Back').click();
    fixture.detectChanges();
    expect(visiblePanelText(fixture)).toBe('Cart content');
  });

  it('sets aria-label on the vertical step nav via ariaLabel', () => {
    const soloFixture = TestBed.createComponent(StepperComponent);
    soloFixture.componentRef.setInput('orientation', 'vertical');
    soloFixture.componentRef.setInput('ariaLabel', 'Checkout steps');
    soloFixture.detectChanges();
    expect(soloFixture.nativeElement.querySelector('nav')?.getAttribute('aria-label')).toBe('Checkout steps');
  });
});
