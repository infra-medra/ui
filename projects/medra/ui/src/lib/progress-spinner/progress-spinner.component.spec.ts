import { TestBed } from '@angular/core/testing';
import { ProgressSpinnerComponent } from './progress-spinner.component';

function createSpinner() {
  const fixture = TestBed.createComponent(ProgressSpinnerComponent);
  fixture.detectChanges();
  return fixture;
}

function svg(fixture: { nativeElement: HTMLElement }): SVGElement {
  return fixture.nativeElement.querySelector('svg') as unknown as SVGElement;
}

describe('ProgressSpinnerComponent', () => {
  it('renders with role="status" and a default English aria-label', () => {
    const fixture = createSpinner();
    expect(svg(fixture).getAttribute('role')).toBe('status');
    expect(svg(fixture).getAttribute('aria-label')).toBe('Loading');
  });

  it('accepts a custom aria-label', () => {
    const fixture = createSpinner();
    fixture.componentRef.setInput('ariaLabel', 'Carregando');
    fixture.detectChanges();

    expect(svg(fixture).getAttribute('aria-label')).toBe('Carregando');
  });

  it('always spins', () => {
    const fixture = createSpinner();
    expect(svg(fixture).getAttribute('class')).toContain('animate-spin');
  });

  it.each([
    ['sm', 'size-4'],
    ['default', 'size-8'],
    ['lg', 'size-12'],
  ] as const)('applies the size class for size=%s', (size, expectedClass) => {
    const fixture = createSpinner();
    fixture.componentRef.setInput('size', size);
    fixture.detectChanges();

    expect(svg(fixture).getAttribute('class')).toContain(expectedClass);
  });

  it('applies the severity color class', () => {
    const fixture = createSpinner();
    fixture.componentRef.setInput('severity', 'danger');
    fixture.detectChanges();

    expect(svg(fixture).getAttribute('class')).toContain('text-danger-500');
  });

  it('merges a consumer class override', () => {
    const fixture = createSpinner();
    fixture.componentRef.setInput('class', 'opacity-50');
    fixture.detectChanges();

    expect(svg(fixture).getAttribute('class')).toContain('opacity-50');
  });

  it('[UI-009.S2] applies strokeWidth to spinner circles', () => {
    const fixture = createSpinner();
    fixture.componentRef.setInput('strokeWidth', '8');
    fixture.detectChanges();

    const circles = Array.from(svg(fixture).querySelectorAll('circle'));
    expect(circles.length).toBe(2);
    expect(circles.every((c) => c.getAttribute('stroke-width') === '8')).toBe(true);
  });
});
