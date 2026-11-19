import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IconComponent } from '../icon/icon.component';
import { MessageComponent } from './message.component';
import { MessageSize } from './message.styles';

@Component({
  standalone: true,
  imports: [MessageComponent],
  template: `<med-message
    [severity]="severity"
    [closable]="closable"
    [closeLabel]="closeLabel"
    [class]="extraClass"
    [icon]="icon"
    [size]="size"
    [life]="life"
    (closed)="onClosed()"
  >
    {{ text }}
  </med-message>`,
})
class HostComponent {
  severity: 'info' | 'success' | 'warn' | 'danger' = 'info';
  closable = false;
  closeLabel = 'Close';
  extraClass = '';
  icon: string | null = null;
  size: MessageSize = 'default';
  life: number | null = null;
  text = 'Saved successfully';
  closedCount = 0;

  onClosed(): void {
    this.closedCount++;
  }
}

describe('MessageComponent', () => {
  function createHost(overrides: Partial<HostComponent> = {}) {
    const fixture = TestBed.createComponent(HostComponent);
    Object.assign(fixture.componentInstance, overrides);
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('med-message > div') as HTMLElement;
    return { fixture, card };
  }

  it('renders the projected content', () => {
    const { fixture } = createHost();
    expect(fixture.nativeElement.textContent).toContain('Saved successfully');
  });

  it.each([
    ['info', 'bg-info-50'],
    ['success', 'bg-success-50'],
    ['warn', 'bg-warn-50'],
    ['danger', 'bg-danger-50'],
  ] as const)('severity=%s applies %s', (severity, expectedClass) => {
    const { card } = createHost({ severity });
    expect(card.className).toContain(expectedClass);
  });

  it('has no close button by default', () => {
    const { fixture } = createHost();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('shows a close button with the default "Close" label when closable', () => {
    const { fixture } = createHost({ closable: true });
    expect(fixture.nativeElement.querySelector('[aria-label="Close"]')).not.toBeNull();
  });

  it('uses a custom closeLabel', () => {
    const { fixture } = createHost({ closable: true, closeLabel: 'Fechar' });
    expect(fixture.nativeElement.querySelector('[aria-label="Fechar"]')).not.toBeNull();
  });

  it('emits (closed) when the close button is clicked, without removing itself', () => {
    const { fixture } = createHost({ closable: true });
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();

    expect(fixture.componentInstance.closedCount).toBe(1);
    expect(fixture.nativeElement.querySelector('med-message')).not.toBeNull();
  });

  it('merges a consumer class override onto the card', () => {
    const { card } = createHost({ extraClass: 'rounded-full' });
    expect(card.className).toContain('rounded-full');
    expect(card.className).not.toContain('rounded-lg');
  });

  it.each([
    ['info', 'status', 'polite'],
    ['success', 'status', 'polite'],
    ['warn', 'status', 'polite'],
  ] as const)('severity=%s sets role="%s" and aria-live="%s" on the host', (severity, role, ariaLive) => {
    const { fixture } = createHost({ severity });
    const host = fixture.nativeElement.querySelector('med-message') as HTMLElement;
    expect(host.getAttribute('role')).toBe(role);
    expect(host.getAttribute('aria-live')).toBe(ariaLive);
  });

  it('severity=danger escalates the host to role="alert" and aria-live="assertive"', () => {
    const { fixture } = createHost({ severity: 'danger' });
    const host = fixture.nativeElement.querySelector('med-message') as HTMLElement;
    expect(host.getAttribute('role')).toBe('alert');
    expect(host.getAttribute('aria-live')).toBe('assertive');
  });

  describe('icon', () => {
    function iconNames(fixture: { debugElement: import('@angular/core').DebugElement }): string[] {
      return fixture.debugElement.queryAll(By.directive(IconComponent)).map((de) => (de.componentInstance as IconComponent).name());
    }

    it('defaults to the severity-derived icon', () => {
      const { fixture } = createHost({ severity: 'success' });
      expect(iconNames(fixture)[0]).toBe('check-circle');
    });

    it('overrides the default icon when set', () => {
      const { fixture } = createHost({ severity: 'success', icon: 'star' });
      expect(iconNames(fixture)[0]).toBe('star');
    });
  });

  describe('size', () => {
    it('defaults to size=default padding', () => {
      const { card } = createHost();
      expect(card.className).toContain('p-4');
    });

    it.each([
      ['sm', 'p-2'],
      ['lg', 'p-5'],
    ] as const)('size=%s applies %s', (size, expectedClass) => {
      const { card } = createHost({ size });
      expect(card.className).toContain(expectedClass);
    });
  });

  describe('life', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('does not auto-close when life is unset', () => {
      const { fixture } = createHost();
      jest.advanceTimersByTime(10_000);
      expect(fixture.componentInstance.closedCount).toBe(0);
    });

    it('emits (closed) automatically once life elapses', () => {
      const { fixture } = createHost({ life: 3000 });
      jest.advanceTimersByTime(2999);
      expect(fixture.componentInstance.closedCount).toBe(0);

      jest.advanceTimersByTime(1);
      expect(fixture.componentInstance.closedCount).toBe(1);
    });

    it('cancels the timer when the component is destroyed first', () => {
      const { fixture } = createHost({ life: 3000 });
      fixture.destroy();
      jest.advanceTimersByTime(3000);
      expect(fixture.componentInstance.closedCount).toBe(0);
    });
  });
});
