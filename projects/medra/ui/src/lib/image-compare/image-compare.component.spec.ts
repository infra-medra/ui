import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageCompareComponent } from './image-compare.component';

@Component({
  standalone: true,
  imports: [ImageCompareComponent],
  template: `
    <med-image-compare
      beforeSrc="/before.jpg"
      afterSrc="/after.jpg"
      [(position)]="position"
      [disabled]="disabled"
      [step]="step"
      class="h-64 w-96"
    />
  `,
})
class HostComponent {
  position = 50;
  disabled = false;
  step = 1;
}

/** The host itself is the pointer-tracking container — see ImageCompareComponent's own doc for why there's no separate wrapper div. */
function container(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('med-image-compare') as HTMLElement;
}

function handle(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('[role="slider"]') as HTMLElement;
}

/** jsdom's layout engine always reports a 0-width rect — stub a real one so pointer-position math has something to work with. */
function stubContainerRect(fixture: { nativeElement: HTMLElement }, left = 0, width = 200): void {
  jest.spyOn(container(fixture), 'getBoundingClientRect').mockReturnValue({
    left,
    width,
    right: left + width,
    top: 0,
    bottom: 100,
    height: 100,
    x: left,
    y: 0,
    toJSON: () => ({}),
  });
}

/** jsdom has no PointerEvent constructor — same plain-Event-cast pattern already used by Slider's spec. */
function pointer(type: string, clientX: number, pointerId = 1): PointerEvent {
  return Object.assign(new Event(type, { bubbles: true, cancelable: true }), { clientX, pointerId }) as PointerEvent;
}

function keydown(el: HTMLElement, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

function create(configure?: (h: HostComponent) => void): ComponentFixture<HostComponent> {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

describe('ImageCompareComponent', () => {
  it('defaults position to 50, reflected in the handle aria-valuenow', () => {
    const fixture = create();
    expect(handle(fixture).getAttribute('aria-valuenow')).toBe('50');
  });

  it('the clip-path on the before-image wrapper reflects position', () => {
    const fixture = create((h) => (h.position = 30));
    const clipDiv = (fixture.nativeElement as HTMLElement).querySelectorAll('div')[0] as HTMLElement;
    expect(clipDiv.style.clipPath).toBe('inset(0 70% 0 0)');
  });

  it('merges a consumer class (a real static attribute) onto the host, with no separate wrapper div for it to disagree with', () => {
    const fixture = create();
    expect(container(fixture).className).toContain('h-64');
    expect(container(fixture).className).toContain('relative'); // needed for the clip-path/handle positioning to work at all
  });

  it('clicking the container jumps the divider to that position', () => {
    const fixture = create();
    stubContainerRect(fixture, 0, 200);
    container(fixture).dispatchEvent(pointer('pointerdown', 150)); // 75% of 200px
    fixture.detectChanges();
    expect(fixture.componentInstance.position).toBe(75);
  });

  it('dragging (pointermove after pointerdown) keeps updating position', () => {
    const fixture = create();
    stubContainerRect(fixture, 0, 200);
    container(fixture).dispatchEvent(pointer('pointerdown', 0));
    container(fixture).dispatchEvent(pointer('pointermove', 100));
    fixture.detectChanges();
    expect(fixture.componentInstance.position).toBe(50);
  });

  it('pointerup ends the drag — further pointermove has no effect', () => {
    const fixture = create();
    stubContainerRect(fixture, 0, 200);
    container(fixture).dispatchEvent(pointer('pointerdown', 100));
    container(fixture).dispatchEvent(pointer('pointerup', 100));
    container(fixture).dispatchEvent(pointer('pointermove', 200));
    fixture.detectChanges();
    expect(fixture.componentInstance.position).toBe(50);
  });

  it('position is clamped to [0, 100] even when dragged past the container edges', () => {
    const fixture = create();
    stubContainerRect(fixture, 0, 200);
    container(fixture).dispatchEvent(pointer('pointerdown', -50));
    fixture.detectChanges();
    expect(fixture.componentInstance.position).toBe(0);
  });

  it('ArrowRight/ArrowLeft step the position on the handle', () => {
    const fixture = create((h) => (h.step = 5));
    keydown(handle(fixture), 'ArrowRight');
    fixture.detectChanges();
    expect(fixture.componentInstance.position).toBe(55);
    keydown(handle(fixture), 'ArrowLeft');
    keydown(handle(fixture), 'ArrowLeft');
    fixture.detectChanges();
    expect(fixture.componentInstance.position).toBe(45);
  });

  it('Home/End jump to 0/100', () => {
    const fixture = create();
    keydown(handle(fixture), 'End');
    fixture.detectChanges();
    expect(fixture.componentInstance.position).toBe(100);
    keydown(handle(fixture), 'Home');
    fixture.detectChanges();
    expect(fixture.componentInstance.position).toBe(0);
  });

  it('disabled: pointer and keyboard input have no effect, handle is not tabbable', () => {
    const fixture = create((h) => (h.disabled = true));
    stubContainerRect(fixture, 0, 200);
    expect(handle(fixture).getAttribute('tabindex')).toBe('-1');

    container(fixture).dispatchEvent(pointer('pointerdown', 150));
    keydown(handle(fixture), 'ArrowRight');
    fixture.detectChanges();
    expect(fixture.componentInstance.position).toBe(50);
  });

  it('both images are aria-hidden and not draggable — this is a comparison control, not a place to drag-save either image', () => {
    const fixture = create();
    const images = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLImageElement>('img'));
    expect(images.every((img) => img.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(images.every((img) => img.getAttribute('draggable') === 'false')).toBe(true);
  });

  it('shows a placeholder icon instead of the "after" image once it fails to load, independent of "before"', () => {
    const fixture = create();
    const [afterImg] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLImageElement>('img'));

    afterImg.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLImageElement>('img').length).toBe(1); // only "before" remains an <img>
    expect(fixture.nativeElement.querySelector('med-icon')).not.toBeNull();
  });

  it('shows a placeholder icon instead of the "before" image once it fails to load, independent of "after"', () => {
    const fixture = create();
    const [, beforeImg] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLImageElement>('img'));

    beforeImg.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLImageElement>('img').length).toBe(1); // only "after" remains an <img>
    expect(fixture.nativeElement.querySelector('med-icon')).not.toBeNull();
  });
});
