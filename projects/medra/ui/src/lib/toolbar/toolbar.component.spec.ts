import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToolbarComponent } from './toolbar.component';
import { ToolbarCenterDirective, ToolbarEndDirective, ToolbarStartDirective } from './toolbar.directives';

@Component({
  standalone: true,
  imports: [ToolbarComponent, ToolbarStartDirective, ToolbarCenterDirective, ToolbarEndDirective],
  template: `
    <med-toolbar>
      <div medToolbarStart>Start content</div>
      <div medToolbarCenter>Center content</div>
      <div medToolbarEnd>End content</div>
    </med-toolbar>
  `,
})
class HostComponent {}

describe('ToolbarComponent', () => {
  function create(): ComponentFixture<HostComponent> {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('projects start/center/end content into their respective slots', () => {
    const fixture = create();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Start content');
    expect(root.textContent).toContain('Center content');
    expect(root.textContent).toContain('End content');
  });

  it('sets role="toolbar"', () => {
    const fixture = create();
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="toolbar"]')).not.toBeNull();
  });

  it('omits aria-label when none is provided', () => {
    const fixture = TestBed.createComponent(ToolbarComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="toolbar"]')?.hasAttribute('aria-label')).toBe(false);
  });

  it('sets aria-label when provided', () => {
    const fixture = TestBed.createComponent(ToolbarComponent);
    fixture.componentRef.setInput('ariaLabel', 'Document actions');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('[role="toolbar"]')?.getAttribute('aria-label')).toBe('Document actions');
  });

  it('renders correctly with only a start slot (no center/end)', () => {
    @Component({
      standalone: true,
      imports: [ToolbarComponent, ToolbarStartDirective],
      template: `
        <med-toolbar>
          <div medToolbarStart>Only start</div>
        </med-toolbar>
      `,
    })
    class StartOnlyHost {}

    TestBed.configureTestingModule({ imports: [StartOnlyHost] });
    const fixture = TestBed.createComponent(StartOnlyHost);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Only start');
  });

  it('supports a custom class via the escape hatch', () => {
    @Component({
      standalone: true,
      imports: [ToolbarComponent],
      template: `<med-toolbar class="custom-toolbar" />`,
    })
    class ClassHost {}

    TestBed.configureTestingModule({ imports: [ClassHost] });
    const fixture = TestBed.createComponent(ClassHost);
    fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('[role="toolbar"]') as HTMLElement).className).toContain('custom-toolbar');
  });
});
