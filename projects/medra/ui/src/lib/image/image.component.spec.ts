import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { ImageComponent } from './image.component';

function nativeImg(fixture: { nativeElement: HTMLElement }): HTMLImageElement {
  return fixture.nativeElement.querySelector('img') as HTMLImageElement;
}

function overlayContainer(): HTMLElement {
  return document.querySelector('.cdk-overlay-container') as HTMLElement;
}

function previewImg(): HTMLImageElement | null {
  return overlayContainer()?.querySelector('med-image-preview img') ?? null;
}

describe('ImageComponent', () => {
  let appRef: ApplicationRef;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
    appRef = TestBed.inject(ApplicationRef);
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function create(): ComponentFixture<ImageComponent> {
    const fixture = TestBed.createComponent(ImageComponent);
    fixture.componentRef.setInput('src', 'https://example.com/photo.jpg');
    fixture.componentRef.setInput('alt', 'A photo');
    fixture.detectChanges();
    return fixture;
  }

  it('renders a plain <img> with the given src/alt when preview is off', () => {
    const fixture = create();
    const img = nativeImg(fixture);
    expect(img.src).toBe('https://example.com/photo.jpg');
    expect(img.alt).toBe('A photo');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('sets width/height attributes when provided, to reserve layout space before load', () => {
    const fixture = create();
    fixture.componentRef.setInput('width', 400);
    fixture.componentRef.setInput('height', 300);
    fixture.detectChanges();

    const img = nativeImg(fixture);
    expect(img.getAttribute('width')).toBe('400');
    expect(img.getAttribute('height')).toBe('300');
  });

  it('omits width/height attributes entirely when not provided', () => {
    const fixture = create();
    const img = nativeImg(fixture);
    expect(img.hasAttribute('width')).toBe(false);
    expect(img.hasAttribute('height')).toBe(false);
  });

  it('sets srcset/sizes for responsive images when provided', () => {
    const fixture = create();
    fixture.componentRef.setInput('srcSet', 'small.jpg 480w, large.jpg 1080w');
    fixture.componentRef.setInput('sizes', '(max-width: 600px) 480px, 1080px');
    fixture.detectChanges();

    const img = nativeImg(fixture);
    expect(img.getAttribute('srcset')).toBe('small.jpg 480w, large.jpg 1080w');
    expect(img.getAttribute('sizes')).toBe('(max-width: 600px) 480px, 1080px');
  });

  it('wraps the image in a button when preview is on', () => {
    const fixture = create();
    fixture.componentRef.setInput('preview', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).not.toBeNull();
    expect(nativeImg(fixture).src).toBe('https://example.com/photo.jpg');
  });

  it('shows the broken-image fallback after the <img> fails to load, and retries on a new src', () => {
    const fixture = create();
    nativeImg(fixture).dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.querySelector('med-icon')).not.toBeNull();

    fixture.componentRef.setInput('src', 'https://example.com/other.jpg');
    fixture.detectChanges();
    expect(nativeImg(fixture)).not.toBeNull(); // a new URL always retries, never stuck on the fallback
  });

  it('the broken-image fallback icon is labeled from alt (Wave 2 fix — 2026-08-19)', () => {
    const fixture = create();
    nativeImg(fixture).dispatchEvent(new Event('error'));
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('med-icon svg') as SVGElement;
    expect(icon.getAttribute('role')).toBe('img');
    expect(icon.getAttribute('aria-label')).toBe('Image failed to load: A photo');
    expect(icon.hasAttribute('aria-hidden')).toBe(false);
  });

  it('the broken-image fallback icon is aria-hidden (decorative) when there is no alt at all', () => {
    const fixture = TestBed.createComponent(ImageComponent);
    fixture.componentRef.setInput('src', 'https://example.com/photo.jpg');
    fixture.detectChanges();
    nativeImg(fixture).dispatchEvent(new Event('error'));
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('med-icon svg') as SVGElement;
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(icon.hasAttribute('aria-label')).toBe(false);
  });

  it('the broken-image fallback is never wrapped in a preview button', () => {
    const fixture = create();
    fixture.componentRef.setInput('preview', true);
    fixture.detectChanges();
    nativeImg(fixture).dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('clicking the preview button opens a full-screen overlay showing the same image', () => {
    const fixture = create();
    fixture.componentRef.setInput('preview', true);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button')!.click();
    appRef.tick();

    expect(previewImg()?.src).toBe('https://example.com/photo.jpg');
  });

  it('the preview overlay panel has role="dialog"/aria-modal and an accessible name from alt (Wave 2 fix — 2026-08-19)', () => {
    const fixture = create();
    fixture.componentRef.setInput('preview', true);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button')!.click();
    appRef.tick();

    const panel = overlayContainer().querySelector('med-image-preview') as HTMLElement;
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-modal')).toBe('true');
    expect(panel.getAttribute('aria-label')).toBe('A photo');
  });

  it('the preview overlay panel falls back to a generic aria-label when alt is empty', () => {
    const fixture = TestBed.createComponent(ImageComponent);
    fixture.componentRef.setInput('src', 'https://example.com/photo.jpg');
    fixture.componentRef.setInput('preview', true);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button')!.click();
    appRef.tick();

    const panel = overlayContainer().querySelector('med-image-preview') as HTMLElement;
    expect(panel.getAttribute('aria-label')).toBe('Image preview');
  });

  it('the close button in the preview closes the overlay', () => {
    const fixture = create();
    fixture.componentRef.setInput('preview', true);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button')!.click();
    appRef.tick();
    expect(previewImg()).not.toBeNull();

    (overlayContainer().querySelector('[aria-label="Close"]') as HTMLButtonElement).click();
    expect(previewImg()).toBeNull();
  });

  it('closes on Escape', () => {
    const fixture = create();
    fixture.componentRef.setInput('preview', true);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button')!.click();
    appRef.tick();

    overlayContainer().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(previewImg()).toBeNull();
  });

  it('zoom in/out buttons scale the previewed image and disable at the min/max bound', () => {
    const fixture = create();
    fixture.componentRef.setInput('preview', true);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button')!.click();
    appRef.tick();

    const zoomInBtn = () => overlayContainer().querySelector('[aria-label="Zoom in"]') as HTMLButtonElement;
    const zoomOutBtn = () => overlayContainer().querySelector('[aria-label="Zoom out"]') as HTMLButtonElement;

    expect(zoomOutBtn().disabled).toBe(true);
    zoomInBtn().click();
    appRef.tick();
    expect(previewImg()!.style.transform).toBe('rotate(0deg) scale(1.5)');
    expect(zoomOutBtn().disabled).toBe(false);

    for (let i = 0; i < 5; i++) {
      zoomInBtn().click();
    }
    appRef.tick();
    expect(previewImg()!.style.transform).toBe('rotate(0deg) scale(3)');
    expect(zoomInBtn().disabled).toBe(true);
  });

  it('rotate left/right buttons rotate the previewed image by ±90°, unbounded', () => {
    const fixture = create();
    fixture.componentRef.setInput('preview', true);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button')!.click();
    appRef.tick();

    const rotateRightBtn = () => overlayContainer().querySelector('[aria-label="Rotate right"]') as HTMLButtonElement;
    const rotateLeftBtn = () => overlayContainer().querySelector('[aria-label="Rotate left"]') as HTMLButtonElement;

    rotateRightBtn().click();
    appRef.tick();
    expect(previewImg()!.style.transform).toBe('rotate(90deg) scale(1)');

    rotateRightBtn().click();
    rotateRightBtn().click();
    appRef.tick();
    expect(previewImg()!.style.transform).toBe('rotate(270deg) scale(1)'); // unbounded, no wrap/clamp

    rotateLeftBtn().click();
    appRef.tick();
    expect(previewImg()!.style.transform).toBe('rotate(180deg) scale(1)');
  });

  it('imageError emits the native error event and still runs the broken-image fallback', () => {
    const fixture = create();
    const emitted: Event[] = [];
    fixture.componentInstance.imageError.subscribe((event: Event) => emitted.push(event));

    const errorEvent = new Event('error');
    nativeImg(fixture).dispatchEvent(errorEvent);
    fixture.detectChanges();

    expect(emitted).toEqual([errorEvent]);
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
  });

  it('opened emits when the preview overlay is requested, closed emits once it actually closes', () => {
    const fixture = create();
    fixture.componentRef.setInput('preview', true);
    fixture.detectChanges();

    const opened = jest.fn();
    const closed = jest.fn();
    fixture.componentInstance.opened.subscribe(opened);
    fixture.componentInstance.closed.subscribe(closed);

    fixture.nativeElement.querySelector('button')!.click();
    appRef.tick();
    expect(opened).toHaveBeenCalledTimes(1);
    expect(closed).not.toHaveBeenCalled();

    (overlayContainer().querySelector('[aria-label="Close"]') as HTMLButtonElement).click();
    expect(closed).toHaveBeenCalledTimes(1);
  });

  it('clicking the trigger again while already open does not open a second overlay', () => {
    const fixture = create();
    fixture.componentRef.setInput('preview', true);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    trigger.click();
    trigger.click();
    appRef.tick();
    expect(overlayContainer().querySelectorAll('med-image-preview').length).toBe(1);
  });

  it('destroying the host while the preview is open closes the overlay', () => {
    const fixture = create();
    fixture.componentRef.setInput('preview', true);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button')!.click();
    appRef.tick();
    expect(previewImg()).not.toBeNull();

    fixture.destroy();
    expect(previewImg()).toBeNull();
  });
});
