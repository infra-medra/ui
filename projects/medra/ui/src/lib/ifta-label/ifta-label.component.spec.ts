import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IftaLabelComponent } from './ifta-label.component';
import { IftaLabelTextDirective } from './ifta-label-text.directive';

@Component({
  standalone: true,
  imports: [IftaLabelComponent, IftaLabelTextDirective],
  template: `
    <med-ifta-label class="w-48">
      <label medIftaLabelText for="username">Username</label>
      <input id="username" />
    </med-ifta-label>
  `,
})
class HostComponent {}

describe('IftaLabelComponent / IftaLabelTextDirective', () => {
  function create() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the label above the input in a bordered field box', () => {
    const fixture = create();
    const wrapper = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(wrapper.className).toContain('flex-col');
    expect(wrapper.className).toContain('border');
    const children = Array.from(wrapper.children).map((el) => (el as HTMLElement).tagName);
    expect(children).toEqual(['LABEL', 'INPUT']);
  });

  it('the field box reacts to focus-within, not its own :focus', () => {
    const fixture = create();
    const wrapper = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(wrapper.className).toContain('focus-within:border-brand-500');
  });

  it('the label is small and muted', () => {
    const fixture = create();
    const label = fixture.nativeElement.querySelector('label') as HTMLElement;
    expect(label.className).toContain('text-xs');
  });

  it('merges a consumer class override on both the wrapper and the label', () => {
    @Component({
      standalone: true,
      imports: [IftaLabelComponent, IftaLabelTextDirective],
      template: `
        <med-ifta-label class="max-w-xs">
          <label medIftaLabelText for="x" class="text-danger-500">X</label>
          <input id="x" />
        </med-ifta-label>
      `,
    })
    class OverrideHost {}

    const fixture = TestBed.createComponent(OverrideHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('div').className).toContain('max-w-xs');
    expect(fixture.nativeElement.querySelector('label').className).toContain('text-danger-500');
  });
});
