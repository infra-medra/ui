import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ProgressBarComponent } from './progress-bar.component';

function createProgressBar() {
  const fixture = TestBed.createComponent(ProgressBarComponent);
  fixture.detectChanges();
  return fixture;
}

function track(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('[role="progressbar"]') as HTMLElement;
}

describe('ProgressBarComponent', () => {
  it('defaults to 0% with the correct ARIA attributes', () => {
    const fixture = createProgressBar();
    const el = track(fixture);
    expect(el.getAttribute('aria-valuenow')).toBe('0');
    expect(el.getAttribute('aria-valuemin')).toBe('0');
    expect(el.getAttribute('aria-valuemax')).toBe('100');
  });

  it('renders the fill width proportional to value', () => {
    const fixture = createProgressBar();
    fixture.componentRef.setInput('value', 42);
    fixture.detectChanges();

    expect(track(fixture).getAttribute('aria-valuenow')).toBe('42');
    const fill = fixture.nativeElement.querySelector('[role="progressbar"] > div') as HTMLElement;
    expect(fill.style.width).toBe('42%');
  });

  it.each([
    [-20, 0],
    [150, 100],
  ])('clamps out-of-range value %s to %s', (input, expected) => {
    const fixture = createProgressBar();
    fixture.componentRef.setInput('value', input);
    fixture.detectChanges();

    expect(track(fixture).getAttribute('aria-valuenow')).toBe(String(expected));
  });

  it('shows the numeric label when showValue is true', () => {
    const fixture = createProgressBar();
    fixture.componentRef.setInput('value', 60);
    fixture.componentRef.setInput('showValue', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('60%');
  });

  it('does not show a numeric label by default', () => {
    const fixture = createProgressBar();
    fixture.componentRef.setInput('value', 60);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('60%');
  });

  describe('indeterminate mode', () => {
    it('omits aria-valuenow entirely', () => {
      const fixture = createProgressBar();
      fixture.componentRef.setInput('mode', 'indeterminate');
      fixture.componentRef.setInput('value', 40); // ignored while indeterminate
      fixture.detectChanges();

      expect(track(fixture).hasAttribute('aria-valuenow')).toBe(false);
    });

    it('never shows the numeric label, even if showValue is true', () => {
      const fixture = createProgressBar();
      fixture.componentRef.setInput('mode', 'indeterminate');
      fixture.componentRef.setInput('showValue', true);
      fixture.componentRef.setInput('value', 60);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).not.toContain('60%');
    });
  });

  it('defaults aria-label to "Progress" instead of shipping with none', () => {
    const fixture = createProgressBar();
    expect(track(fixture).getAttribute('aria-label')).toBe('Progress');
  });

  it('applies aria-label when provided', () => {
    const fixture = createProgressBar();
    fixture.componentRef.setInput('ariaLabel', 'Upload progress');
    fixture.detectChanges();

    expect(track(fixture).getAttribute('aria-label')).toBe('Upload progress');
  });

  describe('unit', () => {
    it('defaults to "%"', () => {
      const fixture = createProgressBar();
      fixture.componentRef.setInput('value', 60);
      fixture.componentRef.setInput('showValue', true);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('60%');
    });

    it('uses a custom unit in the label', () => {
      const fixture = createProgressBar();
      fixture.componentRef.setInput('value', 60);
      fixture.componentRef.setInput('showValue', true);
      fixture.componentRef.setInput('unit', ' MB');
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('60 MB');
      expect(fixture.nativeElement.textContent).not.toContain('60%');
    });
  });

  it('merges a consumer class override onto the track', () => {
    const fixture = createProgressBar();
    fixture.componentRef.setInput('class', 'rounded-none');
    fixture.detectChanges();

    expect(track(fixture).className).toContain('rounded-none');
    expect(track(fixture).className).not.toContain('rounded-full');
  });

  describe('#content', () => {
    it('renders the projected #content template with the numeric value as context, instead of the plain value+unit text', () => {
      @Component({
        standalone: true,
        imports: [ProgressBarComponent],
        template: `
          <med-progress-bar [value]="60" showValue>
            <ng-template #content let-value>
              <span class="content-marker">{{ value }} of 100</span>
            </ng-template>
          </med-progress-bar>
        `,
      })
      class ContentTemplateHostComponent {}

      const fixture = TestBed.createComponent(ContentTemplateHostComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.content-marker')?.textContent).toBe('60 of 100');
      expect(fixture.nativeElement.textContent).not.toContain('60%');
    });

    it('stays gated by showValue', () => {
      @Component({
        standalone: true,
        imports: [ProgressBarComponent],
        template: `
          <med-progress-bar [value]="60">
            <ng-template #content let-value>
              <span class="content-marker">{{ value }} of 100</span>
            </ng-template>
          </med-progress-bar>
        `,
      })
      class ContentTemplateNoShowValueHostComponent {}

      const fixture = TestBed.createComponent(ContentTemplateNoShowValueHostComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.content-marker')).toBeNull();
    });
  });
});
