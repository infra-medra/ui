import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PanelComponent } from './panel.component';

function createPanel() {
  const fixture = TestBed.createComponent(PanelComponent);
  fixture.detectChanges();
  return fixture;
}

function header(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('h3')!.parentElement as HTMLElement;
}

function content(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('[id^="med-panel-content-"]') as HTMLElement;
}

describe('PanelComponent', () => {
  it('renders the header text', () => {
    const fixture = createPanel();
    fixture.componentRef.setInput('header', 'Account settings');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h3')?.textContent).toBe('Account settings');
  });

  it('is expanded by default and shows no toggle button when not toggleable', () => {
    const fixture = createPanel();
    expect(content(fixture).hidden).toBe(false);
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('clicking the header toggles collapsed when toggleable', () => {
    const fixture = createPanel();
    fixture.componentRef.setInput('toggleable', true);
    fixture.detectChanges();

    header(fixture).dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();
    expect(content(fixture).hidden).toBe(true);

    header(fixture).dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();
    expect(content(fixture).hidden).toBe(false);
  });

  it('clicking the header does nothing when not toggleable', () => {
    const fixture = createPanel();
    header(fixture).dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();

    expect(content(fixture).hidden).toBe(false);
  });

  it('the toggle button click toggles exactly once, not twice (no double bubble)', () => {
    const fixture = createPanel();
    fixture.componentRef.setInput('toggleable', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(content(fixture).hidden).toBe(true);
  });

  it('sets aria-expanded and aria-controls correctly on the toggle button', () => {
    const fixture = createPanel();
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
      imports: [PanelComponent],
      template: `<med-panel header="Details" toggleable [(collapsed)]="isCollapsed" />`,
    })
    class HostComponent {
      isCollapsed = true;
    }

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(content(fixture).hidden).toBe(true);
    expect(fixture.componentInstance.isCollapsed).toBe(true);

    header(fixture).dispatchEvent(new Event('click', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.isCollapsed).toBe(false);
    expect(content(fixture).hidden).toBe(false);
  });

  it('projects content into the body', () => {
    @Component({
      standalone: true,
      imports: [PanelComponent],
      template: `<med-panel header="Details"><p class="body-marker">Hello</p></med-panel>`,
    })
    class HostComponent {}

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.body-marker')?.textContent).toBe('Hello');
  });

  it('uses custom expand/collapse labels', () => {
    const fixture = createPanel();
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

  describe('toggler', () => {
    it('defaults to "header": clicking the header row toggles', () => {
      const fixture = createPanel();
      fixture.componentRef.setInput('toggleable', true);
      fixture.detectChanges();

      header(fixture).dispatchEvent(new Event('click', { bubbles: true }));
      fixture.detectChanges();
      expect(content(fixture).hidden).toBe(true);
    });

    it('toggler="icon": clicking the header row (not the button) does nothing', () => {
      const fixture = createPanel();
      fixture.componentRef.setInput('toggleable', true);
      fixture.componentRef.setInput('toggler', 'icon');
      fixture.detectChanges();

      header(fixture).dispatchEvent(new Event('click', { bubbles: true }));
      fixture.detectChanges();
      expect(content(fixture).hidden).toBe(false);
    });

    it('toggler="icon": clicking the button still toggles exactly once', () => {
      const fixture = createPanel();
      fixture.componentRef.setInput('toggleable', true);
      fixture.componentRef.setInput('toggler', 'icon');
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      button.click();
      fixture.detectChanges();
      expect(content(fixture).hidden).toBe(true);

      button.click();
      fixture.detectChanges();
      expect(content(fixture).hidden).toBe(false);
    });
  });

  describe('iconPos', () => {
    it('defaults to "end": header stays justify-between, button has no order-first', () => {
      const fixture = createPanel();
      fixture.componentRef.setInput('toggleable', true);
      fixture.detectChanges();

      expect(header(fixture).className).toContain('justify-between');
      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      expect(button.className).not.toContain('order-first');
    });

    it('"start": button gets order-first', () => {
      const fixture = createPanel();
      fixture.componentRef.setInput('toggleable', true);
      fixture.componentRef.setInput('iconPos', 'start');
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
      expect(button.className).toContain('order-first');
    });

    it('"center": header switches to justify-center', () => {
      const fixture = createPanel();
      fixture.componentRef.setInput('toggleable', true);
      fixture.componentRef.setInput('iconPos', 'center');
      fixture.detectChanges();

      expect(header(fixture).className).toContain('justify-center');
      expect(header(fixture).className).not.toContain('justify-between');
    });
  });

  describe('showHeader', () => {
    it('hides the header row when false', () => {
      const fixture = createPanel();
      fixture.componentRef.setInput('header', 'Details');
      fixture.componentRef.setInput('showHeader', false);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('h3')).toBeNull();
    });

    it('still renders the body content when the header is hidden', () => {
      @Component({
        standalone: true,
        imports: [PanelComponent],
        template: `<med-panel [showHeader]="false"><p class="body-marker">Hello</p></med-panel>`,
      })
      class HostComponent {}

      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.body-marker')?.textContent).toBe('Hello');
    });
  });
});
