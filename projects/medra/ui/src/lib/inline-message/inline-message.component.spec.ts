import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IconComponent } from '../icon/icon.component';
import { InlineMessageComponent } from './inline-message.component';

@Component({
  standalone: true,
  imports: [InlineMessageComponent],
  template: `<med-inline-message [severity]="severity" class="mt-2">{{ text }}</med-inline-message>`,
})
class HostComponent {
  severity: 'info' | 'success' | 'warn' | 'danger' = 'info';
  text = 'Field is required';
}

describe('InlineMessageComponent', () => {
  function create(configure?: (host: HostComponent) => void) {
    const fixture = TestBed.createComponent(HostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  it('projects the message text', () => {
    const fixture = create();
    expect(fixture.nativeElement.textContent).toContain('Field is required');
  });

  it('is inline, not block, unlike MessageComponent', () => {
    const fixture = create();
    expect(fixture.nativeElement.querySelector('med-inline-message').className).toContain('inline-flex');
  });

  it('announces itself as a polite live region', () => {
    const fixture = create();
    const host = fixture.nativeElement.querySelector('med-inline-message');
    expect(host.getAttribute('role')).toBe('status');
    expect(host.getAttribute('aria-live')).toBe('polite');
  });

  it.each([
    ['info', 'information-circle'],
    ['success', 'check-circle'],
    ['warn', 'exclamation-triangle'],
    ['danger', 'x-circle'],
  ] as const)('severity=%s shows the %s icon', (severity, iconName) => {
    const fixture = create((host) => (host.severity = severity));
    const icon = fixture.debugElement.query(By.directive(IconComponent)).componentInstance as IconComponent;
    expect(icon.name()).toBe(iconName);
  });

  it('has no close button (unlike MessageComponent)', () => {
    const fixture = create();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('merges a consumer class override', () => {
    const fixture = create();
    const wrapper = fixture.nativeElement.querySelector('span') as HTMLElement;
    expect(wrapper.className).toContain('text-sm');
    expect(wrapper.className).toContain('mt-2');
  });
});
