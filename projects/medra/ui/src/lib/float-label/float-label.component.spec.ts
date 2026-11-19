import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FloatLabelComponent } from './float-label.component';
import { FloatLabelTextDirective } from './float-label-text.directive';

@Component({
  standalone: true,
  imports: [FloatLabelComponent, FloatLabelTextDirective],
  template: `
    <med-float-label>
      <input id="email" placeholder=" " class="peer" />
      <label medFloatLabelText for="email">Email</label>
    </med-float-label>
    <med-float-label>
      <input id="name" placeholder=" " class="peer" />
      <label medFloatLabelText for="name" class="text-danger-500">Name</label>
    </med-float-label>
    <med-float-label variant="in">
      <input id="in-variant" placeholder=" " class="peer" />
      <label medFloatLabelText for="in-variant">In</label>
    </med-float-label>
    <med-float-label variant="over">
      <input id="over-variant" placeholder=" " class="peer" />
      <label medFloatLabelText for="over-variant">Over</label>
    </med-float-label>
    <med-float-label variant="on">
      <input id="on-variant" placeholder=" " class="peer" />
      <label medFloatLabelText for="on-variant">On</label>
    </med-float-label>
  `,
})
class HostComponent {}

describe('FloatLabelComponent / FloatLabelTextDirective', () => {
  function create() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }

  function wrapperFor(fixture: { nativeElement: HTMLElement }, inputId: string): HTMLElement {
    return fixture.nativeElement.querySelector(`#${inputId}`)!.closest('med-float-label') as HTMLElement;
  }

  function labelFor(fixture: { nativeElement: HTMLElement }, inputId: string): HTMLElement {
    return fixture.nativeElement.querySelector(`label[for="${inputId}"]`) as HTMLElement;
  }

  it('the wrapper is a positioning context', () => {
    const fixture = create();
    const wrapper = fixture.nativeElement.querySelector('med-float-label') as HTMLElement;
    expect(wrapper.className).toContain('relative');
  });

  it('defaults to the floating (up, shrunk) "over" state — not "on"', () => {
    const fixture = create();
    const label = labelFor(fixture, 'email');
    expect(label.className).toContain('scale-75');
    expect(label.className).toContain('-top-6');
  });

  it('rests inside the field only when the peer is both placeholder-shown and not focused, via one compound selector (not two independently-ordered ones)', () => {
    const fixture = create();
    const label = labelFor(fixture, 'email');
    expect(label.className).toContain('peer-[&:placeholder-shown:not(:focus)]:top-1/2');
    expect(label.className).toContain('peer-[&:placeholder-shown:not(:focus)]:scale-100');
  });

  it('is non-interactive (never intercepts a click meant for the input)', () => {
    const fixture = create();
    const label = labelFor(fixture, 'email');
    expect(label.className).toContain('pointer-events-none');
  });

  it('changes color on focus', () => {
    const fixture = create();
    const label = labelFor(fixture, 'email');
    expect(label.className).toContain('peer-focus:text-brand-600');
  });

  it('merges a consumer class override', () => {
    const fixture = create();
    const label = labelFor(fixture, 'name');
    expect(label.className).toContain('text-danger-500');
  });

  describe('variant; moved to the wrapper on 2026-09-10)', () => {
    it('"on" cuts a notch into the border, sitting astride it', () => {
      const fixture = create();
      const label = labelFor(fixture, 'on-variant');
      expect(label.className).toContain('bg-surface-0');
      expect(label.className).toContain('top-0');
      expect(label.className).toContain('-translate-y-1/2');
    });

    it('"in" floats inside the field, transparent (no border cutout), still centered via -translate-y-1/2', () => {
      const fixture = create();
      const label = labelFor(fixture, 'in-variant');
      expect(label.className).toContain('top-2.5');
      expect(label.className).toContain('-translate-y-1/2');
      expect(label.className).toContain('bg-transparent');
      expect(label.className).not.toContain('bg-surface-0');
    });

    it('"over" floats clear above the field, transparent, anchored by its own top edge (translate-y-0, not centered)', () => {
      const fixture = create();
      const label = labelFor(fixture, 'over-variant');
      const tokens = label.className.split(' ');
      expect(label.className).toContain('-top-6');
      expect(tokens).toContain('translate-y-0');
      // Resting state still centers via translate-y-1/2 (peer-prefixed) —
      // only the unprefixed (floating) token must be absent.
      expect(tokens).not.toContain('-translate-y-1/2');
      expect(label.className).toContain('bg-transparent');
      expect(label.className).not.toContain('bg-surface-0');
    });

    it('the resting (placeholder-overlap) position is identical across all three variants', () => {
      const fixture = create();
      const labels = ['on-variant', 'in-variant', 'over-variant'].map((id) => labelFor(fixture, id));
      for (const label of labels) {
        expect(label.className).toContain('peer-[&:placeholder-shown:not(:focus)]:top-1/2');
        expect(label.className).toContain('peer-[&:placeholder-shown:not(:focus)]:scale-100');
      }
    });

    it('"in" auto-applies extra top/bottom padding to the projected input — no consumer guesswork', () => {
      const fixture = create();
      const wrapper = wrapperFor(fixture, 'in-variant');
      expect(wrapper.className).toContain('[&>input]:pt-6');
      expect(wrapper.className).toContain('[&>input]:pb-2');
    });

    it('"on"/"over" do not add input padding — the label never sits inside the padding box', () => {
      const fixture = create();
      expect(wrapperFor(fixture, 'on-variant').className).not.toContain('[&>input]:pt-6');
      expect(wrapperFor(fixture, 'over-variant').className).not.toContain('[&>input]:pt-6');
    });

    it('"over" reserves top margin on the wrapper itself for its own floated label', () => {
      const fixture = create();
      expect(wrapperFor(fixture, 'over-variant').className).toContain('mt-6');
    });

    it('"on"/"in" do not add wrapper margin — their label never leaves the field\'s own box', () => {
      const fixture = create();
      expect(wrapperFor(fixture, 'on-variant').className).not.toContain('mt-6');
      expect(wrapperFor(fixture, 'in-variant').className).not.toContain('mt-6');
    });

    it('defaults to "over" when unset on the wrapper', () => {
      const fixture = create();
      expect(wrapperFor(fixture, 'email').className).toContain('mt-6');
      const label = labelFor(fixture, 'email');
      expect(label.className).toContain('translate-y-0');
    });
  });
});
