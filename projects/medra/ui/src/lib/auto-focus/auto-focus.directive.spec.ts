import { Component, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AutoFocusDirective } from './auto-focus.directive';

@Component({
  standalone: true,
  imports: [AutoFocusDirective],
  template: `
    <input medAutoFocus data-testid="direct-input" />
  `,
})
class DirectHostFocusComponent {}

@Component({
  standalone: true,
  imports: [AutoFocusDirective],
  template: `
    <div medAutoFocus data-testid="wrapper">
      <span>Label</span>
      <button type="button" data-testid="first-button">Action</button>
    </div>
  `,
})
class DescendantFocusComponent {}

@Component({
  standalone: true,
  imports: [AutoFocusDirective],
  template: `
    <input [medAutoFocus]="false" data-testid="disabled-input" />
  `,
})
class DisabledFocusComponent {}

describe('AutoFocusDirective (UI-012.S2)', () => {
  it('focuses the host element directly when it is focusable', () => {
    TestBed.configureTestingModule({
      imports: [DirectHostFocusComponent],
    });
    const fixture = TestBed.createComponent(DirectHostFocusComponent);
    const input = fixture.nativeElement.querySelector('[data-testid="direct-input"]') as HTMLInputElement;
    const focusSpy = jest.spyOn(input, 'focus');

    fixture.detectChanges();

    expect(focusSpy).toHaveBeenCalledTimes(1);
  });

  it('focuses the first focusable descendant when host is not natively focusable', () => {
    TestBed.configureTestingModule({
      imports: [DescendantFocusComponent],
    });
    const fixture = TestBed.createComponent(DescendantFocusComponent);
    const button = fixture.nativeElement.querySelector('[data-testid="first-button"]') as HTMLButtonElement;
    const focusSpy = jest.spyOn(button, 'focus');

    fixture.detectChanges();

    expect(focusSpy).toHaveBeenCalledTimes(1);
  });

  it('does not focus when disabled', () => {
    TestBed.configureTestingModule({
      imports: [DisabledFocusComponent],
    });
    const fixture = TestBed.createComponent(DisabledFocusComponent);
    const input = fixture.nativeElement.querySelector('[data-testid="disabled-input"]') as HTMLInputElement;
    const focusSpy = jest.spyOn(input, 'focus');

    fixture.detectChanges();

    expect(focusSpy).not.toHaveBeenCalled();
  });

  it('is a safe no-op in SSR (M-04)', () => {
    TestBed.configureTestingModule({
      imports: [DirectHostFocusComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
    const fixture = TestBed.createComponent(DirectHostFocusComponent);
    const input = fixture.nativeElement.querySelector('[data-testid="direct-input"]') as HTMLInputElement;
    const focusSpy = jest.spyOn(input, 'focus');

    expect(() => fixture.detectChanges()).not.toThrow();
    expect(focusSpy).not.toHaveBeenCalled();
  });
});
