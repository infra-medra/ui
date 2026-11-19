import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KnobComponent } from './knob.component';

function svg(fixture: { nativeElement: HTMLElement }): SVGSVGElement {
  return fixture.nativeElement.querySelector('svg') as unknown as SVGSVGElement;
}

/** jsdom's layout engine always reports a 0-size rect — stub a real one centered at (100,100) so pointer-angle math has something to work with. */
function stubSvgRect(fixture: { nativeElement: HTMLElement }): void {
  jest.spyOn(svg(fixture), 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    width: 200,
    height: 200,
    right: 200,
    bottom: 200,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
}

/** jsdom has no PointerEvent constructor — same plain-Event-cast pattern already used by Slider's spec. */
function pointer(type: string, clientX: number, clientY: number, pointerId = 1): PointerEvent {
  return Object.assign(new Event(type, { bubbles: true, cancelable: true }), { clientX, clientY, pointerId }) as PointerEvent;
}

function keydown(el: Element, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('KnobComponent', () => {
  function create(): ComponentFixture<KnobComponent> {
    return TestBed.createComponent(KnobComponent);
  }

  it('defaults to min when never written', () => {
    const fixture = create();
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 100);
    fixture.detectChanges();
    expect(svg(fixture).getAttribute('aria-valuenow')).toBe('0');
  });

  it('writeValue sets the displayed value', () => {
    const fixture = create();
    fixture.componentInstance.writeValue(42);
    fixture.detectChanges();
    expect(svg(fixture).getAttribute('aria-valuenow')).toBe('42');
    expect(fixture.nativeElement.querySelector('text')!.textContent).toBe('42');
  });

  it('exposes min/max/value via aria-value* on the svg (role="slider")', () => {
    const fixture = create();
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 10);
    fixture.componentInstance.writeValue(4);
    fixture.detectChanges();
    const el = svg(fixture);
    expect(el.getAttribute('role')).toBe('slider');
    expect(el.getAttribute('aria-valuemin')).toBe('0');
    expect(el.getAttribute('aria-valuemax')).toBe('10');
    expect(el.getAttribute('aria-valuenow')).toBe('4');
  });

  it('ArrowRight/ArrowUp increase by step, ArrowLeft/ArrowDown decrease', () => {
    const fixture = create();
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 10);
    fixture.componentRef.setInput('step', 2);
    fixture.componentInstance.writeValue(4);
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    fixture.detectChanges();

    keydown(svg(fixture), 'ArrowRight');
    expect(onChange).toHaveBeenLastCalledWith(6);
    keydown(svg(fixture), 'ArrowUp');
    expect(onChange).toHaveBeenLastCalledWith(8);
    keydown(svg(fixture), 'ArrowLeft');
    expect(onChange).toHaveBeenLastCalledWith(6);
    keydown(svg(fixture), 'ArrowDown');
    expect(onChange).toHaveBeenLastCalledWith(4);
  });

  it('Home/End jump to min/max', () => {
    const fixture = create();
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 10);
    fixture.componentInstance.writeValue(4);
    fixture.detectChanges();

    keydown(svg(fixture), 'End');
    fixture.detectChanges();
    expect(svg(fixture).getAttribute('aria-valuenow')).toBe('10');
    keydown(svg(fixture), 'Home');
    fixture.detectChanges();
    expect(svg(fixture).getAttribute('aria-valuenow')).toBe('0');
  });

  it('keyboard input never moves the value past min/max', () => {
    const fixture = create();
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 10);
    fixture.componentInstance.writeValue(10);
    fixture.detectChanges();
    keydown(svg(fixture), 'ArrowRight');
    expect(svg(fixture).getAttribute('aria-valuenow')).toBe('10');
  });

  it('disabled: pointer/keyboard input has no effect, and tabindex is -1', () => {
    const fixture = create();
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 10);
    fixture.componentRef.setInput('disabled', true);
    fixture.componentInstance.writeValue(4);
    fixture.detectChanges();

    expect(svg(fixture).getAttribute('tabindex')).toBe('-1');
    expect(svg(fixture).getAttribute('aria-disabled')).toBe('true');
    keydown(svg(fixture), 'ArrowRight');
    expect(svg(fixture).getAttribute('aria-valuenow')).toBe('4');
  });

  it('readonly: shows the value, ignores keyboard input, tabindex is -1', () => {
    const fixture = create();
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 10);
    fixture.componentRef.setInput('readonly', true);
    fixture.componentInstance.writeValue(4);
    fixture.detectChanges();

    expect(svg(fixture).getAttribute('tabindex')).toBe('-1');
    expect(svg(fixture).getAttribute('aria-readonly')).toBe('true');
    keydown(svg(fixture), 'ArrowRight');
    expect(svg(fixture).getAttribute('aria-valuenow')).toBe('4');
  });

  it('sets aria-invalid on the slider when invalid is true, and omits it otherwise (Wave 2 a11y fix — the `invalid` input previously only drove the value arc\'s danger color, with no aria-invalid wired up at all)', () => {
    const fixture = create();
    fixture.componentRef.setInput('invalid', true);
    fixture.detectChanges();
    expect(svg(fixture).getAttribute('aria-invalid')).toBe('true');

    fixture.componentRef.setInput('invalid', false);
    fixture.detectChanges();
    expect(svg(fixture).getAttribute('aria-invalid')).toBeNull();
  });

  it('showValue=false omits the center <text>', () => {
    const fixture = create();
    fixture.componentRef.setInput('showValue', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('text')).toBeNull();
  });

  describe('valueColor/rangeColor/textColor', () => {
    function paths(fixture: { nativeElement: HTMLElement }): SVGPathElement[] {
      return Array.from(fixture.nativeElement.querySelectorAll('path')) as unknown as SVGPathElement[];
    }

    it('leaves the default severity-driven colors alone when unset', () => {
      const fixture = create();
      fixture.detectChanges();
      const [track, value] = paths(fixture);
      expect(track.style.stroke).toBe('');
      expect(value.style.stroke).toBe('');
    });

    it('overrides the value arc, track, and text colors independently when set', () => {
      const fixture = create();
      fixture.componentRef.setInput('valueColor', 'rgb(255, 0, 0)');
      fixture.componentRef.setInput('rangeColor', 'rgb(0, 255, 0)');
      fixture.componentRef.setInput('textColor', 'rgb(0, 0, 255)');
      fixture.detectChanges();

      const [track, value] = paths(fixture);
      expect(track.style.stroke).toBe('rgb(0, 255, 0)');
      expect(value.style.stroke).toBe('rgb(255, 0, 0)');
      expect((fixture.nativeElement.querySelector('text') as unknown as SVGTextElement).style.fill).toBe('rgb(0, 0, 255)');
    });
  });

  describe('valueTemplate', () => {
    it('formats the displayed text, defaulting to the plain number', () => {
      const fixture = create();
      fixture.componentInstance.writeValue(42);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('text')!.textContent).toBe('42');
    });

    it('applies a custom formatter when set', () => {
      const fixture = create();
      fixture.componentRef.setInput('valueTemplate', (value: number) => `${value}%`);
      fixture.componentInstance.writeValue(42);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('text')!.textContent).toBe('42%');
    });
  });

  describe('pointer interaction', () => {
    it('dragging to the top of the dial (12 o\'clock) sets roughly the midpoint value', () => {
      const fixture = create();
      fixture.componentRef.setInput('min', 0);
      fixture.componentRef.setInput('max', 100);
      fixture.detectChanges();
      stubSvgRect(fixture);

      // Center is (100,100); "straight up" is (100, 0) relative to the stubbed 200x200 rect.
      svg(fixture).dispatchEvent(pointer('pointerdown', 100, 0));
      fixture.detectChanges();

      const value = Number(svg(fixture).getAttribute('aria-valuenow'));
      expect(value).toBeGreaterThanOrEqual(45);
      expect(value).toBeLessThanOrEqual(55);
    });

    it('dragging into the bottom gap clamps to the nearer end, not an invalid value', () => {
      const fixture = create();
      fixture.componentRef.setInput('min', 0);
      fixture.componentRef.setInput('max', 100);
      fixture.detectChanges();
      stubSvgRect(fixture);

      // Straight down (6 o'clock) is the center of the gap, equidistant — but slightly
      // right-of-center should clamp toward max (100).
      svg(fixture).dispatchEvent(pointer('pointerdown', 101, 200));
      fixture.detectChanges();

      const value = Number(svg(fixture).getAttribute('aria-valuenow'));
      expect(value).toBe(100);
    });

    it('pointerup ends the drag — further pointermove has no effect', () => {
      const fixture = create();
      fixture.componentRef.setInput('min', 0);
      fixture.componentRef.setInput('max', 100);
      fixture.componentInstance.writeValue(50);
      fixture.detectChanges();
      stubSvgRect(fixture);

      svg(fixture).dispatchEvent(pointer('pointerdown', 100, 0));
      svg(fixture).dispatchEvent(pointer('pointerup', 100, 0));
      const afterDrag = svg(fixture).getAttribute('aria-valuenow');

      svg(fixture).dispatchEvent(pointer('pointermove', 200, 100));
      fixture.detectChanges();
      expect(svg(fixture).getAttribute('aria-valuenow')).toBe(afterDrag);
    });
  });

  it('[UI-010.S2] formats displayed label using valueTemplate', () => {
    const fixture = TestBed.createComponent(KnobComponent);
    fixture.componentRef.setInput('valueTemplate', '{value}%');
    fixture.componentInstance.writeValue(42);
    fixture.detectChanges();

    expect(svg(fixture).textContent).toContain('42%');
  });
});
