import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FieldsetComponent } from './fieldset.component';
import { FieldsetLegendDirective } from './fieldset.directives';

function createFieldset() {
  const fixture = TestBed.createComponent(FieldsetComponent);
  fixture.detectChanges();
  return fixture;
}

function legend(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('legend') as HTMLElement;
}

function content(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('[id^="med-fieldset-content-"]') as HTMLElement;
}

describe('FieldsetComponent', () => {
  it('renders a real <fieldset>/<legend>, with the legend text', () => {
    const fixture = createFieldset();
    fixture.componentRef.setInput('legend', 'Shipping address');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('fieldset')).not.toBeNull();
    expect(legend(fixture).textContent?.trim()).toBe('Shipping address');
  });

  it('is expanded by default and shows no toggle button when not toggleable', () => {
    const fixture = createFieldset();
    expect(content(fixture).hidden).toBe(false);
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('clicking the legend toggles collapsed when toggleable', () => {
    const fixture = createFieldset();
    fixture.componentRef.setInput('toggleable', true);
    fixture.detectChanges();

    legend(fixture).dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();
    expect(content(fixture).hidden).toBe(true);

    legend(fixture).dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();
    expect(content(fixture).hidden).toBe(false);
  });

  it('clicking the legend does nothing when not toggleable', () => {
    const fixture = createFieldset();
    legend(fixture).dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();
    expect(content(fixture).hidden).toBe(false);
  });

  it('the toggle button click toggles exactly once, not twice (no double bubble)', () => {
    const fixture = createFieldset();
    fixture.componentRef.setInput('toggleable', true);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(content(fixture).hidden).toBe(true);
  });

  it('sets aria-expanded and aria-controls correctly on the toggle button', () => {
    const fixture = createFieldset();
    fixture.componentRef.setInput('toggleable', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    const contentEl = content(fixture);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.getAttribute('aria-controls')).toBe(contentEl.id);

    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('collapsed supports two-way binding via [(collapsed)]', () => {
    @Component({
      standalone: true,
      imports: [FieldsetComponent],
      template: `<med-fieldset legend="Details" toggleable [(collapsed)]="isCollapsed" />`,
    })
    class HostComponent {
      isCollapsed = true;
    }

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(content(fixture).hidden).toBe(true);
    legend(fixture).dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.isCollapsed).toBe(false);
    expect(content(fixture).hidden).toBe(false);
  });

  it('projects content into the body', () => {
    @Component({
      standalone: true,
      imports: [FieldsetComponent],
      template: `<med-fieldset legend="Details"><p class="body-marker">Hello</p></med-fieldset>`,
    })
    class HostComponent {}

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.body-marker')?.textContent).toBe('Hello');
  });

  it('uses custom expand/collapse labels', () => {
    const fixture = createFieldset();
    fixture.componentRef.setInput('toggleable', true);
    fixture.componentRef.setInput('collapseLabel', 'Recolher');
    fixture.componentRef.setInput('expandLabel', 'Expandir');
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Recolher');
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-label')).toBe('Expandir');
  });

  describe('disabled', () => {
    @Component({
      standalone: true,
      imports: [FieldsetComponent],
      template: `
        <med-fieldset legend="Details" [disabled]="isDisabled">
          <input type="text" />
        </med-fieldset>
      `,
    })
    class HostWithInputComponent {
      isDisabled = false;
    }

    // jsdom doesn't simulate the browser's own fieldset-disables-descendants
    // cascade (HTML spec's "disabled state" algorithm for form-associated
    // elements) — `inputEl.disabled` stays `false` here even though real
    // Chrome/Firefox/Safari correctly cascade it. This only checks what
    // jsdom actually can; the real cascade is covered by a Chromium e2e
    // test instead, see `e2e/fieldset.spec.ts`.
    it('sets the disabled property on the native <fieldset> itself', () => {
      TestBed.configureTestingModule({ imports: [HostWithInputComponent] });
      const fixture = TestBed.createComponent(HostWithInputComponent);
      fixture.componentInstance.isDisabled = true;
      fixture.detectChanges();

      const fieldsetEl = fixture.nativeElement.querySelector('fieldset') as HTMLFieldSetElement;
      expect(fieldsetEl.disabled).toBe(true);
    });

    it('leaves descendant controls enabled when disabled is false', () => {
      TestBed.configureTestingModule({ imports: [HostWithInputComponent] });
      const fixture = TestBed.createComponent(HostWithInputComponent);
      fixture.detectChanges();

      const inputEl = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      expect(inputEl.disabled).toBe(false);
    });
  });

  describe('medFieldsetLegend slot', () => {
    it('renders the projected rich legend instead of the plain-string legend', () => {
      @Component({
        standalone: true,
        imports: [FieldsetComponent, FieldsetLegendDirective],
        template: `
          <med-fieldset legend="Fallback text">
            <span medFieldsetLegend class="legend-marker">Rich <b>legend</b></span>
          </med-fieldset>
        `,
      })
      class HostComponent {}

      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();

      const legendEl = legend(fixture);
      expect(legendEl.querySelector('.legend-marker')).not.toBeNull();
      expect(legendEl.textContent?.trim()).toBe('Rich legend');
    });

    it('falls back to the plain-string legend when no slot is projected', () => {
      const fixture = createFieldset();
      fixture.componentRef.setInput('legend', 'Plain text');
      fixture.detectChanges();

      expect(legend(fixture).textContent?.trim()).toBe('Plain text');
    });
  });

  describe('beforeToggle/afterToggle', () => {
    it('emits beforeToggle with the pre-toggle value and afterToggle with the post-toggle value', () => {
      const fixture = createFieldset();
      fixture.componentRef.setInput('toggleable', true);
      fixture.detectChanges();

      const beforeValues: boolean[] = [];
      const afterValues: boolean[] = [];
      fixture.componentInstance.beforeToggle.subscribe((v: boolean) => beforeValues.push(v));
      fixture.componentInstance.afterToggle.subscribe((v: boolean) => afterValues.push(v));

      (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(beforeValues).toEqual([false]);
      expect(afterValues).toEqual([true]);
    });

    it('fires beforeToggle strictly before the collapsed state changes', () => {
      const fixture = createFieldset();
      fixture.componentRef.setInput('toggleable', true);
      fixture.detectChanges();

      let collapsedAtEmitTime: boolean | undefined;
      fixture.componentInstance.beforeToggle.subscribe(() => {
        collapsedAtEmitTime = fixture.componentInstance.collapsed();
      });

      (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(collapsedAtEmitTime).toBe(false);
    });

    it('does not emit either event for a programmatic model write (only collapsedChange does)', () => {
      const fixture = createFieldset();
      fixture.componentRef.setInput('toggleable', true);
      fixture.detectChanges();

      let beforeToggleCount = 0;
      let afterToggleCount = 0;
      fixture.componentInstance.beforeToggle.subscribe(() => beforeToggleCount++);
      fixture.componentInstance.afterToggle.subscribe(() => afterToggleCount++);

      fixture.componentInstance.collapsed.set(true);
      fixture.detectChanges();

      expect(content(fixture).hidden).toBe(true);
      expect(beforeToggleCount).toBe(0);
      expect(afterToggleCount).toBe(0);
    });
  });
});
