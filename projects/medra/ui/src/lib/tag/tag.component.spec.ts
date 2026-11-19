import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TagComponent } from './tag.component';

@Component({
  standalone: true,
  imports: [TagComponent],
  template: `<med-tag [severity]="severity" [pill]="pill" [icon]="icon" [value]="value" [class]="extraClass">{{ text }}</med-tag>`,
})
class HostComponent {
  severity: 'primary' | 'secondary' | 'info' | 'success' | 'warn' | 'help' | 'danger' | 'contrast' = 'primary';
  pill = false;
  icon: string | null = null;
  value: string | null = null;
  extraClass = '';
  text = 'New';
}

describe('TagComponent', () => {
  function createHost(overrides: Partial<HostComponent> = {}) {
    const fixture = TestBed.createComponent(HostComponent);
    Object.assign(fixture.componentInstance, overrides);
    fixture.detectChanges();
    return { fixture, tag: fixture.nativeElement.querySelector('med-tag > span') as HTMLElement };
  }

  it('renders the projected content', () => {
    const { fixture } = createHost();
    expect(fixture.nativeElement.textContent).toContain('New');
  });

  it.each([
    ['primary', 'bg-brand-500'],
    ['secondary', 'bg-surface-100'],
    ['info', 'bg-info-500'],
    ['success', 'bg-success-500'],
    ['warn', 'bg-warn-500'],
    ['help', 'bg-help-500'],
    ['danger', 'bg-danger-500'],
    ['contrast', 'bg-surface-950'],
  ] as const)('severity=%s applies %s', (severity, expectedClass) => {
    const { tag } = createHost({ severity });
    expect(tag.className).toContain(expectedClass);
  });

  it('is square-cornered by default and fully rounded with pill', () => {
    const { tag: square } = createHost();
    expect(square.className).toContain('rounded-md');

    const { tag: pill } = createHost({ pill: true });
    expect(pill.className).toContain('rounded-full');
  });

  it('merges a consumer class override', () => {
    const { tag } = createHost({ extraClass: 'text-base' });
    expect(tag.className).toContain('text-base');
  });

  it('renders a leading icon when icon is set', () => {
    const { fixture } = createHost({ icon: 'star' });
    expect(fixture.nativeElement.querySelector('med-icon')).not.toBeNull();
  });

  it('renders no icon when icon is unset', () => {
    const { fixture } = createHost();
    expect(fixture.nativeElement.querySelector('med-icon')).toBeNull();
  });

  it('renders value as an alternative to projected content', () => {
    const { fixture } = createHost({ text: '', value: 'Active' });
    expect(fixture.nativeElement.textContent).toContain('Active');
  });
});
