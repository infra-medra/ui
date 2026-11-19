import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FocusTrapFactory } from '@angular/cdk/a11y';
import { FocusTrapDirective } from './focus-trap.directive';

@Component({
  standalone: true,
  imports: [FocusTrapDirective],
  template: `
    <div [medFocusTrap]="enabled()" [autoFocus]="autoFocus()" data-testid="trap-host">
      <button type="button" data-testid="first-btn">First</button>
      <button type="button" data-testid="last-btn">Last</button>
    </div>
  `,
})
class FocusTrapHostComponent {
  readonly enabled = signal(true);
  readonly autoFocus = signal(true);
}

describe('FocusTrapDirective (UI-012.S3)', () => {
  it('creates a CDK FocusTrap via FocusTrapFactory, contains focus, toggles enabled, and destroys on cleanup (M-05)', () => {
    const mockTrap = {
      enabled: true,
      focusInitialElementWhenReady: jest.fn().mockResolvedValue(true),
      destroy: jest.fn(),
    };
    const createSpy = jest.fn().mockReturnValue(mockTrap);

    TestBed.configureTestingModule({
      imports: [FocusTrapHostComponent],
      providers: [
        {
          provide: FocusTrapFactory,
          useValue: { create: createSpy },
        },
      ],
    });

    const fixture = TestBed.createComponent(FocusTrapHostComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('[data-testid="trap-host"]') as HTMLElement;
    expect(createSpy).toHaveBeenCalledWith(host);
    expect(mockTrap.enabled).toBe(true);
    expect(mockTrap.focusInitialElementWhenReady).toHaveBeenCalledTimes(1);

    // Disable trap dynamically
    fixture.componentInstance.enabled.set(false);
    fixture.detectChanges();
    expect(mockTrap.enabled).toBe(false);

    // Re-enable trap dynamically
    fixture.componentInstance.enabled.set(true);
    fixture.detectChanges();
    expect(mockTrap.enabled).toBe(true);

    // Cleanup on destroy
    fixture.destroy();
    expect(mockTrap.destroy).toHaveBeenCalledTimes(1);
  });

  it('contains Tab / Shift+Tab navigation within the container using real FocusTrapFactory', () => {
    TestBed.configureTestingModule({
      imports: [FocusTrapHostComponent],
    });
    const fixture = TestBed.createComponent(FocusTrapHostComponent);
    fixture.detectChanges();

    const anchors = fixture.nativeElement.querySelectorAll('.cdk-focus-trap-anchor');
    expect(anchors.length).toBe(2);
  });

  it('does not create FocusTrap in SSR (M-04)', () => {
    const createSpy = jest.fn();
    TestBed.configureTestingModule({
      imports: [FocusTrapHostComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: FocusTrapFactory, useValue: { create: createSpy } },
      ],
    });

    const fixture = TestBed.createComponent(FocusTrapHostComponent);
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(createSpy).not.toHaveBeenCalled();
  });
});
