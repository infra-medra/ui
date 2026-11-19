import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Fluid, FluidDirective, MED_FLUID_CONTEXT } from './fluid.directive';
import { InputTextDirective } from '../input-text/input-text.directive';

@Component({
  standalone: true,
  imports: [Fluid, InputTextDirective],
  template: `
    <med-fluid data-testid="fluid-element">
      <input medInputText data-testid="child-input" />
    </med-fluid>
    <div medFluid data-testid="fluid-attr">
      <span data-testid="probe">{{ contextValue() }}</span>
    </div>
    <div [medFluid]="false" data-testid="fluid-disabled"></div>
  `,
})
class TestHostComponent {
  readonly context = inject(MED_FLUID_CONTEXT, { optional: true });
  contextValue(): boolean {
    return this.context?.() ?? false;
  }
}

describe('FluidDirective (UI-011.S1)', () => {
  it('applies data-fluid="true" and w-full on <med-fluid> and [medFluid]', () => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const fluidEl = fixture.nativeElement.querySelector('[data-testid="fluid-element"]') as HTMLElement;
    const fluidAttr = fixture.nativeElement.querySelector('[data-testid="fluid-attr"]') as HTMLElement;
    const fluidDisabled = fixture.nativeElement.querySelector('[data-testid="fluid-disabled"]') as HTMLElement;

    expect(Fluid).toBe(FluidDirective);
    expect(fluidEl.getAttribute('data-fluid')).toBe('true');
    expect(fluidEl.className).toContain('w-full');

    expect(fluidAttr.getAttribute('data-fluid')).toBe('true');
    expect(fluidAttr.className).toContain('w-full');

    expect(fluidDisabled.getAttribute('data-fluid')).toBeNull();
    expect(fluidDisabled.className).not.toContain('w-full');
  });

  it('provides MED_FLUID_CONTEXT to descendant controls such as InputTextDirective', () => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const childInput = fixture.nativeElement.querySelector('[data-testid="child-input"]') as HTMLInputElement;
    expect(childInput.className).toContain('w-full');
  });
});
