import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StyleClassDirective } from './style-class.directive';

@Component({
  standalone: true,
  imports: [StyleClassDirective],
  template: `
    <div class="grandparent" data-testid="grandparent">
      <div class="parent" data-testid="parent">
        <span data-testid="prev">Prev</span>
        <button
          type="button"
          [medStyleClass]="target()"
          [toggleClass]="toggleClass()"
          [enterFromClass]="enterFromClass()"
          [enterToClass]="enterToClass()"
          [leaveFromClass]="leaveFromClass()"
          [leaveToClass]="leaveToClass()"
          [hideOnOutsideClick]="hideOnOutsideClick()"
          [hideOnEscape]="hideOnEscape()"
          [trigger]="trigger()"
          data-testid="trigger-btn"
        >
          Toggle
        </button>
        <div data-testid="next" class="next-panel">Next</div>
      </div>
      <div class="css-target" data-testid="css-target">CSS Target</div>
    </div>
    <div data-testid="outside">Outside</div>
  `,
})
class StyleClassHostComponent {
  readonly target = signal<string>('@next');
  readonly toggleClass = signal<string | undefined>('is-open');
  readonly enterFromClass = signal<string | undefined>(undefined);
  readonly enterToClass = signal<string | undefined>(undefined);
  readonly leaveFromClass = signal<string | undefined>(undefined);
  readonly leaveToClass = signal<string | undefined>(undefined);
  readonly hideOnOutsideClick = signal<boolean>(false);
  readonly hideOnEscape = signal<boolean>(false);
  readonly trigger = signal<'click' | 'hover'>('click');
}

describe('StyleClassDirective (UI-013.S2)', () => {
  it('toggles class on @next, @prev, @parent, @grandparent and CSS selector targets (UI-013.S2)', () => {
    TestBed.configureTestingModule({ imports: [StyleClassHostComponent] });
    const fixture = TestBed.createComponent(StyleClassHostComponent);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('[data-testid="trigger-btn"]') as HTMLButtonElement;
    const next = fixture.nativeElement.querySelector('[data-testid="next"]') as HTMLElement;
    const prev = fixture.nativeElement.querySelector('[data-testid="prev"]') as HTMLElement;
    const parent = fixture.nativeElement.querySelector('[data-testid="parent"]') as HTMLElement;
    const grandparent = fixture.nativeElement.querySelector('[data-testid="grandparent"]') as HTMLElement;
    const cssTarget = fixture.nativeElement.querySelector('[data-testid="css-target"]') as HTMLElement;

    btn.click();
    expect(next.classList.contains('is-open')).toBe(true);
    btn.click();
    expect(next.classList.contains('is-open')).toBe(false);

    fixture.componentInstance.target.set('@prev');
    fixture.detectChanges();
    btn.click();
    expect(prev.classList.contains('is-open')).toBe(true);

    fixture.componentInstance.target.set('@parent');
    fixture.detectChanges();
    btn.click();
    expect(parent.classList.contains('is-open')).toBe(true);

    fixture.componentInstance.target.set('@grandparent');
    fixture.detectChanges();
    btn.click();
    expect(grandparent.classList.contains('is-open')).toBe(true);

    fixture.componentInstance.target.set('.css-target');
    fixture.detectChanges();
    btn.click();
    expect(cssTarget.classList.contains('is-open')).toBe(true);
  });

  it('supports enter/leave classes, hover trigger, hideOnOutsideClick, and hideOnEscape (UI-013.S2)', () => {
    TestBed.configureTestingModule({ imports: [StyleClassHostComponent] });
    const fixture = TestBed.createComponent(StyleClassHostComponent);
    const comp = fixture.componentInstance;
    comp.toggleClass.set(undefined);
    comp.enterFromClass.set('opacity-0');
    comp.enterToClass.set('opacity-100');
    comp.leaveFromClass.set('opacity-100');
    comp.leaveToClass.set('opacity-0');
    comp.hideOnOutsideClick.set(true);
    comp.hideOnEscape.set(true);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('[data-testid="trigger-btn"]') as HTMLButtonElement;
    const next = fixture.nativeElement.querySelector('[data-testid="next"]') as HTMLElement;
    const outside = fixture.nativeElement.querySelector('[data-testid="outside"]') as HTMLElement;

    btn.click();
    expect(next.classList.contains('opacity-100')).toBe(true);

    outside.click();
    expect(next.classList.contains('opacity-100')).toBe(false);
    expect(next.classList.contains('opacity-0')).toBe(true);

    btn.click();
    expect(next.classList.contains('opacity-100')).toBe(true);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(next.classList.contains('opacity-100')).toBe(false);

    // Hover trigger
    comp.trigger.set('hover');
    comp.toggleClass.set('hovered');
    comp.enterToClass.set(undefined);
    comp.leaveToClass.set(undefined);
    fixture.detectChanges();

    btn.dispatchEvent(new MouseEvent('mouseenter'));
    expect(next.classList.contains('hovered')).toBe(true);
    btn.dispatchEvent(new MouseEvent('mouseleave'));
    expect(next.classList.contains('hovered')).toBe(false);
  });

  it('handles invalid CSS selectors without throwing and cleans up listeners on destroy (UI-013.S2, M-03)', () => {
    TestBed.configureTestingModule({ imports: [StyleClassHostComponent] });
    const fixture = TestBed.createComponent(StyleClassHostComponent);
    fixture.componentInstance.target.set('[invalid==');
    fixture.componentInstance.hideOnOutsideClick.set(true);
    fixture.componentInstance.hideOnEscape.set(true);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('[data-testid="trigger-btn"]') as HTMLButtonElement;
    expect(() => btn.click()).not.toThrow();

    const next = fixture.nativeElement.querySelector('[data-testid="next"]') as HTMLElement;
    fixture.componentInstance.target.set('@next');
    fixture.detectChanges();
    btn.click();
    expect(next.classList.contains('is-open')).toBe(true);

    fixture.destroy();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(next.classList.contains('is-open')).toBe(true);
  });
});
