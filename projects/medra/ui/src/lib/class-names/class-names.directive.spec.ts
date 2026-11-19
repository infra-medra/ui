import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ClassNamesDirective, ClassNamesValue } from './class-names.directive';

@Component({
  standalone: true,
  imports: [ClassNamesDirective],
  template: `
    <div class="base-cls p-2" [medClassNames]="classes()" data-testid="cn-host">Host</div>
  `,
})
class ClassNamesHostComponent {
  readonly classes = signal<ClassNamesValue>('text-sm');
}

describe('ClassNamesDirective (UI-013.S3)', () => {
  it('merges string, array, and record class values while preserving static host classes via mergeClasses (UI-013.S3)', () => {
    TestBed.configureTestingModule({ imports: [ClassNamesHostComponent] });
    const fixture = TestBed.createComponent(ClassNamesHostComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('[data-testid="cn-host"]') as HTMLElement;
    expect(host.classList.contains('base-cls')).toBe(true);
    expect(host.classList.contains('p-2')).toBe(true);
    expect(host.classList.contains('text-sm')).toBe(true);

    fixture.componentInstance.classes.set(['font-bold', 'p-4']);
    fixture.detectChanges();
    expect(host.classList.contains('base-cls')).toBe(true);
    expect(host.classList.contains('font-bold')).toBe(true);
    expect(host.classList.contains('p-4')).toBe(true);
    expect(host.classList.contains('p-2')).toBe(false);
    expect(host.classList.contains('text-sm')).toBe(false);

    fixture.componentInstance.classes.set({ 'text-blue-600': true, 'hidden': false });
    fixture.detectChanges();
    expect(host.classList.contains('base-cls')).toBe(true);
    expect(host.classList.contains('text-blue-600')).toBe(true);
    expect(host.classList.contains('hidden')).toBe(false);
  });

  it('ignores prototype pollution keys when evaluating Record inputs (UI-013.S3, M-02)', () => {
    TestBed.configureTestingModule({ imports: [ClassNamesHostComponent] });
    const fixture = TestBed.createComponent(ClassNamesHostComponent);

    const maliciousRecord = JSON.parse(
      '{"__proto__": true, "constructor": true, "prototype": true, "safe-class": true}',
    ) as Record<string, boolean>;

    fixture.componentInstance.classes.set(maliciousRecord);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('[data-testid="cn-host"]') as HTMLElement;
    expect(host.classList.contains('safe-class')).toBe(true);
    expect(host.classList.contains('constructor')).toBe(false);
    expect(host.classList.contains('prototype')).toBe(false);
    expect(host.classList.contains('__proto__')).toBe(false);
  });
});
