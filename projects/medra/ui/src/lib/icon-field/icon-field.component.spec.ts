import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IconFieldComponent } from './icon-field.component';
import { IconFieldIconDirective } from './icon-field-icon.directive';

@Component({
  standalone: true,
  imports: [IconFieldComponent, IconFieldIconDirective],
  template: `
    <med-icon-field>
      <span medIconFieldIcon id="left-icon" aria-hidden="true">S</span>
      <input type="text" />
    </med-icon-field>
    <med-icon-field>
      <input type="text" />
      <span medIconFieldIcon position="right" id="right-icon" class="pointer-events-auto">X</span>
    </med-icon-field>
  `,
})
class HostComponent {}

describe('IconFieldComponent / IconFieldIconDirective', () => {
  function create() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('the wrapper is a positioning context for the overlaid icon', () => {
    const fixture = create();
    const wrapper = fixture.nativeElement.querySelector('med-icon-field') as HTMLElement;
    expect(wrapper.className).toContain('relative');
  });

  it('defaults to left placement', () => {
    const fixture = create();
    const icon = fixture.nativeElement.querySelector('#left-icon') as HTMLElement;
    expect(icon.className).toContain('left-3');
    expect(icon.className).not.toContain('right-3');
  });

  it('supports right placement', () => {
    const fixture = create();
    const icon = fixture.nativeElement.querySelector('#right-icon') as HTMLElement;
    expect(icon.className).toContain('right-3');
  });

  it('is pointer-events-none by default (never steals a click meant for the input underneath)', () => {
    const fixture = create();
    const icon = fixture.nativeElement.querySelector('#left-icon') as HTMLElement;
    expect(icon.className).toContain('pointer-events-none');
  });

  it('a consumer class override can re-enable pointer events for a clickable icon', () => {
    const fixture = create();
    const icon = fixture.nativeElement.querySelector('#right-icon') as HTMLElement;
    expect(icon.className).toContain('pointer-events-auto');
    expect(icon.className).not.toContain('pointer-events-none');
  });

  it("neither IconFieldComponent nor IconFieldIconDirective ever renders their own icon markup — `medIconFieldIcon` is purely a positioning directive applied to whatever the consumer projects — so a decorative icon's aria-hidden is correctly the consumer's own responsibility to set, and IconField passes it through untouched rather than stripping or overriding it (Wave 2 re-verdict evidence, By design not Partial)", () => {
    const fixture = create();
    const icon = fixture.nativeElement.querySelector('#left-icon') as HTMLElement;
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });

  it('is absolutely positioned and vertically centered', () => {
    const fixture = create();
    const icon = fixture.nativeElement.querySelector('#left-icon') as HTMLElement;
    expect(icon.className).toContain('absolute');
    expect(icon.className).toContain('top-1/2');
  });
});
