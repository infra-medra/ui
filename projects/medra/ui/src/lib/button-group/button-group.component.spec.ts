import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ButtonDirective } from '../button/button.directive';
import { ButtonGroupComponent } from './button-group.component';
import { buttonGroupVariants } from './button-group.styles';

@Component({
  standalone: true,
  imports: [ButtonGroupComponent, ButtonDirective],
  template: `
    <med-button-group>
      <button medButton type="button" variant="outlined">Save</button>
      <button medButton type="button" variant="outlined">Delete</button>
      <button medButton type="button" variant="outlined">Cancel</button>
    </med-button-group>
  `,
})
class DefaultHostComponent {}

@Component({
  standalone: true,
  imports: [ButtonGroupComponent, ButtonDirective],
  template: `
    <med-button-group class="flex gap-2">
      <button medButton type="button">One</button>
      <button medButton type="button">Two</button>
      <button medButton type="button">Three</button>
    </med-button-group>
  `,
})
class OverrideHostComponent {}

describe('ButtonGroupComponent (BTD-002.S1)', () => {
  it('BTD-002.S1: renders with role="group", projects three buttons, and applies connected border/radius/focus classes', () => {
    const fixture = TestBed.createComponent(DefaultHostComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('med-button-group') as HTMLElement;
    const buttons = host.querySelectorAll('button[medButton]');
    const tokens = host.className.split(/\s+/);

    expect(host.getAttribute('role')).toBe('group');
    expect(buttons.length).toBe(3);
    expect(tokens).toContain('inline-flex');
    expect(tokens).toContain('items-center');
    expect(tokens).toContain('[&>*:not(:first-child)]:rounded-l-none');
    expect(tokens).toContain('[&>*:not(:last-child)]:rounded-r-none');
    expect(tokens).toContain('[&>*:not(:first-child)]:-ml-px');
    expect(tokens).toContain('[&>*:hover]:z-10');
    expect(tokens).toContain('[&>*:focus-visible]:z-10');
  });

  it('BTD-002.S1: merges consumer class overrides cleanly via mergeClasses', () => {
    const fixture = TestBed.createComponent(OverrideHostComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('med-button-group') as HTMLElement;
    const tokens = host.className.split(/\s+/);

    expect(tokens).toContain('flex');
    expect(tokens).not.toContain('inline-flex');
    expect(tokens).toContain('gap-2');
  });

  it('BTD-002.S1: buttonGroupVariants provides the connected button-group classes', () => {
    const classes = buttonGroupVariants();

    expect(classes).toContain('inline-flex');
    expect(classes).toContain('[&>*:not(:first-child)]:rounded-l-none');
    expect(classes).toContain('[&>*:not(:last-child)]:rounded-r-none');
    expect(classes).toContain('[&>*:not(:first-child)]:-ml-px');
    expect(classes).toContain('[&>*:focus-visible]:z-10');
  });

  it('BTD-002.S1: groups <a medButton> anchor children with role="group" and connected classes', () => {
    @Component({
      standalone: true,
      imports: [ButtonGroupComponent, ButtonDirective],
      template: `
        <med-button-group>
          <a medButton href="#first">First</a>
          <a medButton href="#second">Second</a>
        </med-button-group>
      `,
    })
    class AnchorHostComponent {}

    const fixture = TestBed.createComponent(AnchorHostComponent);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('med-button-group') as HTMLElement;
    const anchors = host.querySelectorAll('a[medButton]');
    const tokens = host.className.split(/\s+/);

    expect(host.getAttribute('role')).toBe('group');
    expect(anchors.length).toBe(2);
    expect(tokens).toContain('inline-flex');
    expect(tokens).toContain('[&>*:not(:first-child)]:-ml-px');
  });
});
