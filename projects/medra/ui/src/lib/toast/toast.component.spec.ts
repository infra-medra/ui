import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { ToastComponent } from './toast.component';
import { ToastService } from './toast.service';

@Component({
  standalone: true,
  imports: [ToastComponent],
  template: `
    <med-toast key="alerts" [preventDuplicates]="true" />
  `,
})
class KeyedToastHostComponent {}

describe('ToastComponent (UI-009.S2)', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule, KeyedToastHostComponent],
    });
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    service.clear();
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => {
      el.innerHTML = '';
    });
  });

  it('[UI-009.S2] filters messages by key, supports sticky, and prevents duplicates when enabled', () => {
    const fixture = TestBed.createComponent(KeyedToastHostComponent);
    fixture.detectChanges();

    service.add({ key: 'alerts', severity: 'warn', summary: 'Disk full', sticky: true });
    service.add({ key: 'alerts', severity: 'warn', summary: 'Disk full', sticky: true });
    service.add({ key: 'other', severity: 'info', summary: 'Ignored' });
    fixture.detectChanges();

    const container = document.querySelector('.cdk-overlay-container') as HTMLElement;
    expect(container.textContent).toContain('Disk full');
    expect(container.textContent).not.toContain('Ignored');
    expect(container.querySelectorAll('[role="alert"], med-message').length).toBe(1);
  });
});
