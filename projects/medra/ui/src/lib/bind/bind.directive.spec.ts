import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BindDirective } from './bind.directive';

@Component({
  standalone: true,
  imports: [BindDirective],
  template: `
    <a [medBind]="bindings()" data-testid="bind-host">Link</a>
  `,
})
class BindHostComponent {
  readonly bindings = signal<Record<string, unknown> | null>(null);
}

describe('BindDirective (UI-013.S4)', () => {
  it('applies safe attributes, classes, styles, and cleans up event listeners on update/destroy (UI-013.S4, M-03)', () => {
    TestBed.configureTestingModule({ imports: [BindHostComponent] });
    const fixture = TestBed.createComponent(BindHostComponent);

    const firstClick = jest.fn();
    const secondClick = jest.fn();

    fixture.componentInstance.bindings.set({
      'aria-label': 'Open profile',
      'data-role': 'primary-link',
      class: 'custom-link',
      style: { color: 'rgb(255, 0, 0)' },
      onClick: firstClick,
    });
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('[data-testid="bind-host"]') as HTMLAnchorElement;
    expect(host.getAttribute('aria-label')).toBe('Open profile');
    expect(host.getAttribute('data-role')).toBe('primary-link');
    expect(host.classList.contains('custom-link')).toBe(true);
    expect(host.style.color).toBe('rgb(255, 0, 0)');

    host.click();
    expect(firstClick).toHaveBeenCalledTimes(1);

    fixture.componentInstance.bindings.set({
      'aria-label': 'Updated profile',
      onClick: secondClick,
    });
    fixture.detectChanges();

    expect(host.getAttribute('aria-label')).toBe('Updated profile');
    expect(host.getAttribute('data-role')).toBeNull();
    host.click();
    expect(firstClick).toHaveBeenCalledTimes(1);
    expect(secondClick).toHaveBeenCalledTimes(1);

    fixture.destroy();
    host.click();
    expect(secondClick).toHaveBeenCalledTimes(1);
  });

  it('blocks HTML/script sink attributes and string on* handlers case-insensitively (UI-013.S4, M-01)', () => {
    TestBed.configureTestingModule({ imports: [BindHostComponent] });
    const fixture = TestBed.createComponent(BindHostComponent);

    fixture.componentInstance.bindings.set({
      innerHTML: '<img src=x onerror=alert(1)>',
      INNERHTML: '<b>hack</b>',
      outerHTML: '<div>x</div>',
      srcdoc: '<script>alert(1)</script>',
      insertAdjacentHTML: '<p>x</p>',
      onclick: 'alert(1)',
      onMouseOver: 'evil()',
      title: 'Safe title',
    });
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('[data-testid="bind-host"]') as HTMLAnchorElement;
    expect(host.innerHTML).toBe('Link');
    expect(host.getAttribute('onclick')).toBeNull();
    expect(host.getAttribute('onmouseover')).toBeNull();
    expect(host.getAttribute('srcdoc')).toBeNull();
    expect(host.getAttribute('title')).toBe('Safe title');
  });

  it('validates URLs on href/src/action/formAction and rejects prototype keys (UI-013.S4, M-01, M-02)', () => {
    TestBed.configureTestingModule({ imports: [BindHostComponent] });
    const fixture = TestBed.createComponent(BindHostComponent);

    const payload = JSON.parse(
      '{"__proto__": {"polluted": true}, "constructor": "bad", "prototype": "bad", "href": "javascript:alert(1)", "xlink:href": "javascript:alert(1)", "src": "data:text/html,<script>", "action": "vbscript:msgbox(1)", "formAction": "https://example.com/submit"}',
    ) as Record<string, unknown>;

    fixture.componentInstance.bindings.set(payload);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('[data-testid="bind-host"]') as HTMLAnchorElement;
    expect(host.getAttribute('href')).toBeNull();
    expect(host.getAttribute('xlink:href')).toBeNull();
    expect(host.getAttribute('src')).toBeNull();
    expect(host.getAttribute('action')).toBeNull();
    expect(host.getAttribute('formaction')).toBe('https://example.com/submit');
    expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();

    fixture.componentInstance.bindings.set({
      href: '/docs/chart',
    });
    fixture.detectChanges();
    expect(host.getAttribute('href')).toBe('/docs/chart');
  });
});
