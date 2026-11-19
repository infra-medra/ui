import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { InputGroupComponent } from './input-group.component';
import { InputGroupAddonDirective } from './input-group-addon.directive';

@Component({
  standalone: true,
  imports: [InputGroupComponent, InputGroupAddonDirective],
  template: `
    <med-input-group class="max-w-xs">
      <span medInputGroupAddon>$</span>
      <input type="text" />
      <span medInputGroupAddon size="lg">.00</span>
    </med-input-group>
  `,
})
class HostComponent {}

describe('InputGroupComponent', () => {
  it('renders projected content inside the wrapper', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const addons = fixture.nativeElement.querySelectorAll('[medinputgroupaddon]');
    expect(addons.length).toBe(2);
    expect(fixture.nativeElement.querySelector('input')).not.toBeNull();
  });

  it('collapses the border gap between adjacent children and bumps a focused one above its neighbors', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const wrapper = fixture.nativeElement.querySelector('div');
    expect(wrapper.className).toContain('[&>*+*]:-ml-px');
    expect(wrapper.className).toContain('[&>*:focus-within]:z-10');
  });

  it('merges a consumer class override onto the wrapper', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('div').className).toContain('max-w-xs');
  });
});

describe('InputGroupAddonDirective', () => {
  function create() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('applies border/background styling', () => {
    const fixture = create();
    const addon = fixture.nativeElement.querySelector('[medinputgroupaddon]') as HTMLElement;
    expect(addon.className).toContain('border-surface-300');
    expect(addon.className).toContain('bg-surface-100');
  });

  it('sizes via the shared field spacing tokens', () => {
    const fixture = create();
    const addons = fixture.nativeElement.querySelectorAll('[medinputgroupaddon]');
    expect((addons[0] as HTMLElement).className).toContain('--spacing-field-x');
    expect((addons[1] as HTMLElement).className).toContain('--spacing-field-lg-x');
  });
});
