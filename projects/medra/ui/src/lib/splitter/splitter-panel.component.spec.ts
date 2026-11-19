import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SplitterPanelComponent } from './splitter-panel.component';

@Component({
  standalone: true,
  imports: [SplitterPanelComponent],
  template: `<med-splitter-panel [minSize]="minSize" [class]="customClass">content</med-splitter-panel>`,
})
class HostComponent {
  minSize = 5;
  customClass = '';
}

function el(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('med-splitter-panel') as HTMLElement;
}

function create(configure?: (host: HostComponent) => void) {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

describe('SplitterPanelComponent', () => {
  it('projects its content', () => {
    const fixture = create();
    expect(el(fixture).textContent).toContain('content');
  });

  it('starts at 0% flex-basis until a parent Splitter pushes a real size', () => {
    const fixture = create();
    expect(el(fixture).style.flex).toBe('0 0 0%');
  });

  it('defaults minSize to 5', () => {
    const fixture = create();
    const panel = fixture.debugElement.query(By.directive(SplitterPanelComponent)).componentInstance as SplitterPanelComponent;
    expect(panel.minSize()).toBe(5);
  });

  it('defaults maxSize to 100 and collapsible to false', () => {
    const fixture = create();
    const panel = fixture.debugElement.query(By.directive(SplitterPanelComponent)).componentInstance as SplitterPanelComponent;
    expect(panel.maxSize()).toBe(100);
    expect(panel.collapsible()).toBe(false);
  });

  it('merges a consumer class via the escape hatch', () => {
    const fixture = create((host) => (host.customClass = 'bg-surface-50'));
    expect(el(fixture).className).toContain('bg-surface-50');
  });
});
