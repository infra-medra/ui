import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SliderComponent } from './slider.component';
import { SliderRange, SliderValue } from './slider.types';

function track(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('[role="slider"]')?.parentElement as HTMLElement;
}

function thumbs(fixture: { nativeElement: HTMLElement }): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('[role="slider"]'));
}

function keydown(el: HTMLElement, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

/** jsdom's layout engine always reports a 0-width rect — stub a real one so pointer-position math has something to work with. */
function stubTrackRect(fixture: { nativeElement: HTMLElement }, left = 0, width = 200): void {
  jest.spyOn(track(fixture), 'getBoundingClientRect').mockReturnValue({
    left,
    width,
    right: left + width,
    top: 0,
    bottom: 20,
    height: 20,
    x: left,
    y: 0,
    toJSON: () => ({}),
  });
}

/** jsdom has no PointerEvent constructor — same plain-Event-cast pattern already used by ripple.directive.spec.ts. */
function pointer(type: string, clientX: number, pointerId = 1): PointerEvent {
  return Object.assign(new Event(type, { bubbles: true, cancelable: true }), { clientX, pointerId }) as PointerEvent;
}

describe('SliderComponent (single mode)', () => {
  function create(): ComponentFixture<SliderComponent> {
    const fixture = TestBed.createComponent(SliderComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('defaults to min, exposes aria-valuemin/max/now', () => {
    const fixture = create();
    const thumb = thumbs(fixture)[0];
    expect(thumb.getAttribute('aria-valuemin')).toBe('0');
    expect(thumb.getAttribute('aria-valuemax')).toBe('100');
    expect(thumb.getAttribute('aria-valuenow')).toBe('0');
  });

  it('ArrowRight/ArrowUp increases by step, ArrowLeft/ArrowDown decreases', () => {
    const fixture = create();
    const thumb = thumbs(fixture)[0];
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    keydown(thumb, 'ArrowRight');
    fixture.detectChanges();
    expect(onChange).toHaveBeenLastCalledWith(1);

    keydown(thumb, 'ArrowUp');
    fixture.detectChanges();
    expect(onChange).toHaveBeenLastCalledWith(2);

    keydown(thumb, 'ArrowLeft');
    fixture.detectChanges();
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it('PageUp/PageDown step by step*10, Home/End jump to min/max', () => {
    const fixture = create();
    const thumb = thumbs(fixture)[0];

    keydown(thumb, 'PageUp');
    fixture.detectChanges();
    expect(thumb.getAttribute('aria-valuenow')).toBe('10');

    keydown(thumb, 'End');
    fixture.detectChanges();
    expect(thumb.getAttribute('aria-valuenow')).toBe('100');

    keydown(thumb, 'PageDown');
    fixture.detectChanges();
    expect(thumb.getAttribute('aria-valuenow')).toBe('90');

    keydown(thumb, 'Home');
    fixture.detectChanges();
    expect(thumb.getAttribute('aria-valuenow')).toBe('0');
  });

  it('clamps at min/max instead of wrapping', () => {
    const fixture = create();
    const thumb = thumbs(fixture)[0];
    keydown(thumb, 'Home');
    fixture.detectChanges();
    keydown(thumb, 'ArrowLeft');
    fixture.detectChanges();
    expect(thumb.getAttribute('aria-valuenow')).toBe('0');
  });

  it('calls onTouched on the first keyboard interaction', () => {
    const fixture = create();
    const onTouched = jest.fn();
    fixture.componentInstance.registerOnTouched(onTouched);
    keydown(thumbs(fixture)[0], 'ArrowRight');
    expect(onTouched).toHaveBeenCalled();
  });

  it('respects custom min/max/step', () => {
    const fixture = TestBed.createComponent(SliderComponent);
    fixture.componentRef.setInput('min', 10);
    fixture.componentRef.setInput('max', 20);
    fixture.componentRef.setInput('step', 5);
    fixture.detectChanges();

    const thumb = thumbs(fixture)[0];
    expect(thumb.getAttribute('aria-valuenow')).toBe('10');
    keydown(thumb, 'ArrowRight');
    fixture.detectChanges();
    expect(thumb.getAttribute('aria-valuenow')).toBe('15');
  });

  it('avoids floating-point drift when stepping with a fractional step', () => {
    const fixture = TestBed.createComponent(SliderComponent);
    fixture.componentRef.setInput('min', 0);
    fixture.componentRef.setInput('max', 1);
    fixture.componentRef.setInput('step', 0.1);
    fixture.detectChanges();

    const thumb = thumbs(fixture)[0];
    keydown(thumb, 'ArrowRight');
    keydown(thumb, 'ArrowRight');
    keydown(thumb, 'ArrowRight');
    fixture.detectChanges();
    expect(thumb.getAttribute('aria-valuenow')).toBe('0.3');
  });

  it('clicking the track jumps the thumb to that position', () => {
    const fixture = create();
    stubTrackRect(fixture, 0, 200);
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    track(fixture).dispatchEvent(pointer('pointerdown', 150)); // 75% of 200px -> value 75
    fixture.detectChanges();

    expect(onChange).toHaveBeenCalledWith(75);
    expect(thumbs(fixture)[0].getAttribute('aria-valuenow')).toBe('75');
  });

  it('dragging (pointermove after pointerdown) keeps updating the value', () => {
    const fixture = create();
    stubTrackRect(fixture, 0, 200);
    const el = track(fixture);

    el.dispatchEvent(pointer('pointerdown', 0));
    fixture.detectChanges();
    expect(thumbs(fixture)[0].getAttribute('aria-valuenow')).toBe('0');

    el.dispatchEvent(pointer('pointermove', 100));
    fixture.detectChanges();
    expect(thumbs(fixture)[0].getAttribute('aria-valuenow')).toBe('50');

    el.dispatchEvent(pointer('pointerup', 100));
    el.dispatchEvent(pointer('pointermove', 200));
    fixture.detectChanges();
    expect(thumbs(fixture)[0].getAttribute('aria-valuenow')).toBe('50'); // move after pointerup is ignored
  });

  it('disabled: keyboard and pointer interaction are both no-ops, thumb is aria-disabled and untabbable', () => {
    const fixture = create();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    stubTrackRect(fixture, 0, 200);

    const thumb = thumbs(fixture)[0];
    expect(thumb.getAttribute('aria-disabled')).toBe('true');
    expect(thumb.tabIndex).toBe(-1);

    keydown(thumb, 'ArrowRight');
    track(fixture).dispatchEvent(pointer('pointerdown', 150));
    fixture.detectChanges();
    expect(thumb.getAttribute('aria-valuenow')).toBe('0');
  });

  it('sets aria-invalid when invalid is true', () => {
    const fixture = create();
    fixture.componentRef.setInput('invalid', true);
    fixture.detectChanges();
    expect(thumbs(fixture)[0].getAttribute('aria-invalid')).toBe('true');
  });

  it('sets aria-label from ariaLabel', () => {
    const fixture = create();
    fixture.componentRef.setInput('ariaLabel', 'Volume');
    fixture.detectChanges();
    expect(thumbs(fixture)[0].getAttribute('aria-label')).toBe('Volume');
  });

  it('writeValue(null/undefined) normalizes to min, never throwing', () => {
    const fixture = create();
    const slider = fixture.componentInstance;
    slider.writeValue(42);
    fixture.detectChanges();
    expect(thumbs(fixture)[0].getAttribute('aria-valuenow')).toBe('42');

    expect(() => slider.writeValue(null)).not.toThrow();
    fixture.detectChanges();
    expect(thumbs(fixture)[0].getAttribute('aria-valuenow')).toBe('0');

    expect(() => slider.writeValue(undefined)).not.toThrow();
    fixture.detectChanges();
    expect(thumbs(fixture)[0].getAttribute('aria-valuenow')).toBe('0');
  });

  it('a FormControl initialized with a value renders it', () => {
    @Component({
      standalone: true,
      imports: [SliderComponent, ReactiveFormsModule],
      template: `<med-slider [formControl]="control" />`,
    })
    class HostComponent {
      readonly control = new FormControl<SliderValue>(30, { nonNullable: true });
    }

    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(thumbs(fixture)[0].getAttribute('aria-valuenow')).toBe('30');
  });

  it('disables via setDisabledState (Reactive Forms disable())', () => {
    const fixture = create();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    expect(thumbs(fixture)[0].getAttribute('aria-disabled')).toBe('true');
  });
});

describe('SliderComponent (range mode)', () => {
  function create(): ComponentFixture<SliderComponent> {
    const fixture = TestBed.createComponent(SliderComponent);
    fixture.componentRef.setInput('range', true);
    fixture.detectChanges();
    return fixture;
  }

  it('defaults to { start: min, end: max } and renders two thumbs', () => {
    const fixture = create();
    const [start, end] = thumbs(fixture);
    expect(start.getAttribute('aria-valuenow')).toBe('0');
    expect(end.getAttribute('aria-valuenow')).toBe('100');
  });

  it("each thumb's dynamic min/max is bounded by the other thumb's current position", () => {
    const fixture = create();
    fixture.componentInstance.writeValue({ start: 20, end: 60 });
    fixture.detectChanges();
    const [start, end] = thumbs(fixture);
    expect(start.getAttribute('aria-valuemax')).toBe('60');
    expect(end.getAttribute('aria-valuemin')).toBe('20');
  });

  it('the start thumb can never cross past the end thumb', () => {
    const fixture = create();
    fixture.componentInstance.writeValue({ start: 20, end: 60 });
    fixture.detectChanges();
    const [start] = thumbs(fixture);

    keydown(start, 'End'); // "go as far right as possible" clamps at the end thumb, not global max
    fixture.detectChanges();
    expect(start.getAttribute('aria-valuenow')).toBe('60');
  });

  it('the end thumb can never cross past the start thumb', () => {
    const fixture = create();
    fixture.componentInstance.writeValue({ start: 20, end: 60 });
    fixture.detectChanges();
    const [, end] = thumbs(fixture);

    keydown(end, 'Home'); // "go as far left as possible" clamps at the start thumb, not global min
    fixture.detectChanges();
    expect(end.getAttribute('aria-valuenow')).toBe('20');
  });

  it('arrow keys step each thumb independently', () => {
    const fixture = create();
    fixture.componentInstance.writeValue({ start: 20, end: 60 });
    fixture.detectChanges();
    const [start, end] = thumbs(fixture);
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    keydown(start, 'ArrowRight');
    fixture.detectChanges();
    expect(onChange).toHaveBeenLastCalledWith({ start: 21, end: 60 } as SliderRange);

    keydown(end, 'ArrowLeft');
    fixture.detectChanges();
    expect(onChange).toHaveBeenLastCalledWith({ start: 21, end: 59 } as SliderRange);
  });

  it('clicking the track moves whichever thumb is closer to the click position', () => {
    const fixture = create();
    fixture.componentInstance.writeValue({ start: 20, end: 80 });
    fixture.detectChanges();
    stubTrackRect(fixture, 0, 200);

    track(fixture).dispatchEvent(pointer('pointerdown', 40)); // 20% -> value 20, closer to start (20) than end (80)
    fixture.detectChanges();
    const [start, end] = thumbs(fixture);
    expect(start.getAttribute('aria-valuenow')).toBe('20');
    expect(end.getAttribute('aria-valuenow')).toBe('80');

    track(fixture).dispatchEvent(pointer('pointerdown', 180)); // 90% -> value 90, closer to end
    fixture.detectChanges();
    expect(end.getAttribute('aria-valuenow')).toBe('90');
  });

  it('writeValue(null/undefined) normalizes to { start: min, end: max }', () => {
    const fixture = create();
    const slider = fixture.componentInstance;
    slider.writeValue({ start: 20, end: 60 });
    fixture.detectChanges();

    expect(() => slider.writeValue(null)).not.toThrow();
    fixture.detectChanges();
    const [start, end] = thumbs(fixture);
    expect(start.getAttribute('aria-valuenow')).toBe('0');
    expect(end.getAttribute('aria-valuenow')).toBe('100');
  });

  it('sets aria-label from startLabel/endLabel', () => {
    const fixture = create();
    fixture.componentRef.setInput('startLabel', 'From');
    fixture.componentRef.setInput('endLabel', 'To');
    fixture.detectChanges();
    const [start, end] = thumbs(fixture);
    expect(start.getAttribute('aria-label')).toBe('From');
    expect(end.getAttribute('aria-label')).toBe('To');
  });

  describe('minStepsBetweenHandles', () => {
    it('keeps a minimum gap between the two handles, tighter than plain crossing-prevention', () => {
      const fixture = create();
      fixture.componentRef.setInput('minStepsBetweenHandles', 10);
      fixture.componentInstance.writeValue({ start: 20, end: 60 });
      fixture.detectChanges();
      const [start, end] = thumbs(fixture);

      keydown(start, 'End'); // would go to 60 (end's position) without the gap
      fixture.detectChanges();
      expect(start.getAttribute('aria-valuenow')).toBe('50'); // stops 10 short of end

      keydown(end, 'Home'); // would go to start's position without the gap
      fixture.detectChanges();
      expect(end.getAttribute('aria-valuenow')).toBe('60'); // stops 10 above start
    });
  });

  describe('disabledMinHandle/disabledMaxHandle', () => {
    it('disabledMinHandle makes the start thumb untabbable and inert to keyboard input, without affecting the end thumb', () => {
      const fixture = create();
      fixture.componentRef.setInput('disabledMinHandle', true);
      fixture.componentInstance.writeValue({ start: 20, end: 60 });
      fixture.detectChanges();
      const [start, end] = thumbs(fixture);

      expect(start.getAttribute('aria-disabled')).toBe('true');
      expect(start.tabIndex).toBe(-1);
      expect(end.getAttribute('aria-disabled')).toBeNull();
      expect(end.tabIndex).toBe(0);

      keydown(start, 'ArrowRight');
      fixture.detectChanges();
      expect(start.getAttribute('aria-valuenow')).toBe('20');

      keydown(end, 'ArrowLeft');
      fixture.detectChanges();
      expect(end.getAttribute('aria-valuenow')).toBe('59');
    });

    it('disabledMaxHandle makes the end thumb untabbable and inert to keyboard input, without affecting the start thumb', () => {
      const fixture = create();
      fixture.componentRef.setInput('disabledMaxHandle', true);
      fixture.componentInstance.writeValue({ start: 20, end: 60 });
      fixture.detectChanges();
      const [start, end] = thumbs(fixture);

      expect(end.getAttribute('aria-disabled')).toBe('true');
      expect(end.tabIndex).toBe(-1);

      keydown(end, 'ArrowRight');
      fixture.detectChanges();
      expect(end.getAttribute('aria-valuenow')).toBe('60');

      keydown(start, 'ArrowRight');
      fixture.detectChanges();
      expect(start.getAttribute('aria-valuenow')).toBe('21');
    });

    it('pointer-down on the track routes to the enabled handle even if the disabled one is closer', () => {
      const fixture = create();
      fixture.componentRef.setInput('disabledMinHandle', true);
      fixture.componentInstance.writeValue({ start: 20, end: 80 });
      fixture.detectChanges();
      stubTrackRect(fixture, 0, 200);

      // 20% -> value 20, right on top of the disabled start handle — must route to end instead.
      track(fixture).dispatchEvent(pointer('pointerdown', 40));
      fixture.detectChanges();
      const [start, end] = thumbs(fixture);
      expect(start.getAttribute('aria-valuenow')).toBe('20');
      expect(end.getAttribute('aria-valuenow')).toBe('20');
    });

    it('pointer-down on the track is a no-op when both handles are disabled', () => {
      const fixture = create();
      fixture.componentRef.setInput('disabledMinHandle', true);
      fixture.componentRef.setInput('disabledMaxHandle', true);
      fixture.componentInstance.writeValue({ start: 20, end: 80 });
      fixture.detectChanges();
      stubTrackRect(fixture, 0, 200);

      track(fixture).dispatchEvent(pointer('pointerdown', 100));
      fixture.detectChanges();
      const [start, end] = thumbs(fixture);
      expect(start.getAttribute('aria-valuenow')).toBe('20');
      expect(end.getAttribute('aria-valuenow')).toBe('80');
    });
  });

  it('[UI-010.S1] applies orientation="vertical" aria-orientation attribute', () => {
    const fixture = TestBed.createComponent(SliderComponent);
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.detectChanges();

    const [thumb] = thumbs(fixture);
    expect(thumb.getAttribute('aria-orientation')).toBe('vertical');
    expect(fixture.nativeElement.getAttribute('data-orientation')).toBe('vertical');
  });
});

describe('SliderComponent scenarios', () => {
  @Component({
    standalone: true,
    imports: [SliderComponent, ReactiveFormsModule],
    template: `<med-slider [formControl]="volume" />`,
  })
  class SingleHostComponent {
    readonly volume = new FormControl<SliderValue>(50);
  }

  @Component({
    standalone: true,
    imports: [SliderComponent, ReactiveFormsModule],
    template: `<med-slider range [formControl]="price" />`,
  })
  class RangeHostComponent {
    readonly price = new FormControl<SliderValue>({ start: 20, end: 40 });
  }

  @Component({
    standalone: true,
    imports: [SliderComponent, ReactiveFormsModule],
    template: `<med-slider [formControl]="volume" />`,
  })
  class DisabledHostComponent {
    readonly volume = new FormControl<SliderValue>({ value: 50, disabled: true });
  }

  // SLD-002.S1
  it('[SLD-002.S1] ArrowRight on a slider with value 50 makes the value 51', () => {
    const fixture = TestBed.createComponent(SingleHostComponent);
    fixture.detectChanges();
    const [thumb] = thumbs(fixture);
    expect(thumb.getAttribute('aria-valuenow')).toBe('50');

    keydown(thumb, 'ArrowRight');
    fixture.detectChanges();

    expect(fixture.componentInstance.volume.value).toBe(51);
    expect(thumb.getAttribute('aria-valuenow')).toBe('51');
  });

  // SLD-003.S1
  it('[SLD-003.S1] End on the start thumb of { start: 20, end: 40 } stops the start at 40', () => {
    const fixture = TestBed.createComponent(RangeHostComponent);
    fixture.detectChanges();
    const [startThumb, endThumb] = thumbs(fixture);
    expect(startThumb.getAttribute('aria-valuenow')).toBe('20');
    expect(endThumb.getAttribute('aria-valuenow')).toBe('40');

    keydown(startThumb, 'End');
    fixture.detectChanges();

    expect(fixture.componentInstance.price.value).toEqual({ start: 40, end: 40 } satisfies SliderRange);
  });

  // SLD-004.S1
  it('[SLD-004.S1] pressing a key on a disabled slider leaves the value unchanged', () => {
    const fixture = TestBed.createComponent(DisabledHostComponent);
    fixture.detectChanges();
    const [thumb] = thumbs(fixture);
    expect(thumb.getAttribute('aria-disabled')).toBe('true');

    keydown(thumb, 'ArrowRight');
    keydown(thumb, 'End');
    fixture.detectChanges();

    expect(fixture.componentInstance.volume.value).toBe(50);
    expect(thumb.getAttribute('aria-valuenow')).toBe('50');
  });
});

describe('SliderComponent (vertical orientation)', () => {
  function createVertical(value?: number): ComponentFixture<SliderComponent> {
    const fixture = TestBed.createComponent(SliderComponent);
    fixture.componentRef.setInput('orientation', 'vertical');
    if (value !== undefined) {
      fixture.componentInstance.writeValue(value);
    }
    fixture.detectChanges();
    return fixture;
  }

  /** A 200px-tall, 20px-wide vertical track whose top edge sits at y=100. */
  function stubVerticalTrackRect(fixture: { nativeElement: HTMLElement }): void {
    jest.spyOn(track(fixture), 'getBoundingClientRect').mockReturnValue({
      left: 0,
      width: 20,
      right: 20,
      top: 100,
      bottom: 300,
      height: 200,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    });
  }

  function verticalPointer(type: string, clientY: number, pointerId = 1): PointerEvent {
    return Object.assign(new Event(type, { bubbles: true, cancelable: true }), { clientX: 10, clientY, pointerId }) as PointerEvent;
  }

  // SLD-005.S1
  it('[SLD-005.S1] places the thumb 30% up from the bottom and fills the bottom 30% of the track for value 30', () => {
    const fixture = createVertical(30);
    const [thumb] = thumbs(fixture);
    const fill = track(fixture).children[1] as HTMLElement;
    expect(thumb.getAttribute('aria-orientation')).toBe('vertical');
    expect(thumb.getAttribute('aria-valuenow')).toBe('30');

    expect(thumb.style.bottom).toBe('30%');
    expect(thumb.style.left).toBe('');
    expect(fill.style.bottom).toBe('0%');
    expect(fill.style.height).toBe('30%');
    expect(fill.style.width).toBe('');
  });

  // SLD-005.S2
  it('[SLD-005.S2] pressing the track 25% down from its top sets the value to 75', () => {
    const fixture = createVertical();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    const trackEl = track(fixture);
    trackEl.setPointerCapture = jest.fn();
    stubVerticalTrackRect(fixture);
    expect(thumbs(fixture)[0].getAttribute('aria-valuemin')).toBe('0');
    expect(thumbs(fixture)[0].getAttribute('aria-valuemax')).toBe('100');

    trackEl.dispatchEvent(verticalPointer('pointerdown', 150));
    fixture.detectChanges();

    expect(onChange).toHaveBeenLastCalledWith(75);
    expect(thumbs(fixture)[0].getAttribute('aria-valuenow')).toBe('75');
  });
});
