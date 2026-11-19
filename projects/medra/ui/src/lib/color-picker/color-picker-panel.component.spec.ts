import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorPickerPanelComponent } from './color-picker-panel.component';
import { Hsb } from './color-picker.utils';

function svArea(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelectorAll('[role="slider"]')[0] as HTMLElement;
}

function hueTrack(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelectorAll('[role="slider"]')[1] as HTMLElement;
}

function hexInput(fixture: { nativeElement: HTMLElement }): HTMLInputElement {
  return fixture.nativeElement.querySelector('input') as HTMLInputElement;
}

function keydown(el: HTMLElement, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

/** jsdom has no PointerEvent constructor — same plain-Event-cast pattern already used by SliderComponent's own spec. */
function pointer(type: string, clientX: number, clientY: number, pointerId = 1): PointerEvent {
  return Object.assign(new Event(type, { bubbles: true, cancelable: true }), { clientX, clientY, pointerId }) as PointerEvent;
}

/** jsdom's layout engine always reports a 0-size rect — stub a real one so pointer-position math has something to work with. */
function stubRect(el: HTMLElement, left = 0, top = 0, width = 200, height = 160): void {
  jest.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  });
}

describe('ColorPickerPanelComponent', () => {
  function create(initialHsb?: Hsb): ComponentFixture<ColorPickerPanelComponent> {
    const fixture = TestBed.createComponent(ColorPickerPanelComponent);
    if (initialHsb) {
      fixture.componentRef.setInput('initialHsb', initialHsb);
    }
    fixture.detectChanges();
    return fixture;
  }

  it('shows the hex value derived from the initial HSB', () => {
    const fixture = create({ h: 0, s: 100, b: 100 });
    expect(hexInput(fixture).value).toBe('#ff0000');
  });

  it('dragging the saturation/brightness area updates saturation and brightness, emits colorChange', () => {
    const fixture = create({ h: 0, s: 100, b: 100 });
    const onChange = jest.fn();
    fixture.componentInstance.colorChange.subscribe(onChange);
    const area = svArea(fixture);
    stubRect(area);

    area.dispatchEvent(pointer('pointerdown', 100, 0)); // x=50% -> s=50, y=0% -> b=100
    fixture.detectChanges();

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ s: 50, b: 100 }));
  });

  it('dragging the hue track updates hue, emits colorChange', () => {
    const fixture = create({ h: 0, s: 100, b: 100 });
    const onChange = jest.fn();
    fixture.componentInstance.colorChange.subscribe(onChange);
    const track = hueTrack(fixture);
    stubRect(track, 0, 0, 360, 12);

    track.dispatchEvent(pointer('pointerdown', 180, 0)); // x=50% -> h=180
    fixture.detectChanges();

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ h: 180 }));
  });

  it('arrow keys on the saturation/brightness area nudge saturation and brightness by 1', () => {
    const fixture = create({ h: 0, s: 50, b: 50 });
    keydown(svArea(fixture), 'ArrowRight');
    fixture.detectChanges();
    expect(svArea(fixture).getAttribute('aria-valuenow')).toBe('51');

    keydown(svArea(fixture), 'ArrowLeft');
    keydown(svArea(fixture), 'ArrowLeft');
    fixture.detectChanges();
    expect(svArea(fixture).getAttribute('aria-valuenow')).toBe('49');
  });

  it('arrow keys on the hue track nudge hue by 1, Home/End jump to 0/359', () => {
    const fixture = create({ h: 100, s: 50, b: 50 });
    keydown(hueTrack(fixture), 'ArrowRight');
    fixture.detectChanges();
    expect(hueTrack(fixture).getAttribute('aria-valuenow')).toBe('101');

    keydown(hueTrack(fixture), 'End');
    fixture.detectChanges();
    expect(hueTrack(fixture).getAttribute('aria-valuenow')).toBe('359');

    keydown(hueTrack(fixture), 'Home');
    fixture.detectChanges();
    expect(hueTrack(fixture).getAttribute('aria-valuenow')).toBe('0');
  });

  it('typing a valid hex and pressing Enter commits it and emits colorChange', () => {
    const fixture = create({ h: 0, s: 100, b: 100 });
    const onChange = jest.fn();
    fixture.componentInstance.colorChange.subscribe(onChange);
    const input = hexInput(fixture);

    input.value = '#00ff00';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ h: 120, s: 100, b: 100 }));
    expect(hexInput(fixture).value).toBe('#00ff00');
  });

  it('an unparseable hex draft is silently discarded on blur, reverting to the last valid color', () => {
    const fixture = create({ h: 0, s: 100, b: 100 });
    const input = hexInput(fixture);

    input.value = 'not-a-color';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(hexInput(fixture).value).toBe('#ff0000');
  });
});
