import { TestBed } from '@angular/core/testing';
import { AvatarComponent } from './avatar.component';

function createAvatar() {
  const fixture = TestBed.createComponent(AvatarComponent);
  fixture.detectChanges();
  return fixture;
}

function container(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('span') as HTMLElement;
}

describe('AvatarComponent', () => {
  it('shows the generic user icon when neither image nor label is set', () => {
    const fixture = createAvatar();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.querySelector('med-icon[name="user"]')).not.toBeNull();
  });

  it('renders an <img> when image is set', () => {
    const fixture = createAvatar();
    fixture.componentRef.setInput('image', 'https://example.com/avatar.png');
    fixture.componentRef.setInput('alt', 'Jane Doe');
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img.src).toBe('https://example.com/avatar.png');
    expect(img.alt).toBe('Jane Doe');
  });

  it('falls back to initials when the image fails to load', () => {
    const fixture = createAvatar();
    fixture.componentRef.setInput('image', 'https://example.com/broken.png');
    fixture.componentRef.setInput('label', 'Jane Doe');
    fixture.detectChanges();

    fixture.nativeElement.querySelector('img')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('JD');
  });

  it('recovers once a new (different) image URL is set after a failure', () => {
    const fixture = createAvatar();
    fixture.componentRef.setInput('image', 'https://example.com/broken.png');
    fixture.detectChanges();
    fixture.nativeElement.querySelector('img')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();

    fixture.componentRef.setInput('image', 'https://example.com/working.png');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('img')).not.toBeNull();
  });

  it.each([
    ['Jane Doe', 'JD'],
    ['Cher', 'C'],
    ['  Ada   Lovelace  ', 'AL'],
  ])('derives initials %s -> %s', (label, expected) => {
    const fixture = createAvatar();
    fixture.componentRef.setInput('label', label);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.trim()).toBe(expected);
  });

  it('is marked aria-hidden when there is no image, label, or alt at all (Wave 2 fix — 2026-08-19)', () => {
    const fixture = createAvatar();
    expect(container(fixture).getAttribute('aria-hidden')).toBe('true');
    expect(container(fixture).getAttribute('aria-label')).toBeNull();
  });

  it('is not aria-hidden once a label is set, even with no image', () => {
    const fixture = createAvatar();
    fixture.componentRef.setInput('label', 'Jane Doe');
    fixture.detectChanges();

    expect(container(fixture).getAttribute('aria-hidden')).toBeNull();
  });

  it('is not aria-hidden once alt is set, even with no label', () => {
    const fixture = createAvatar();
    fixture.componentRef.setInput('alt', 'Jane Doe');
    fixture.detectChanges();

    expect(container(fixture).getAttribute('aria-hidden')).toBeNull();
    expect(container(fixture).getAttribute('aria-label')).toBe('Jane Doe');
  });

  it('sets aria-label to the label when showing a fallback', () => {
    const fixture = createAvatar();
    fixture.componentRef.setInput('label', 'Jane Doe');
    fixture.detectChanges();

    expect(container(fixture).getAttribute('aria-label')).toBe('Jane Doe');
  });

  it('does not set aria-label on the container when an image is showing (the <img> alt already covers it)', () => {
    const fixture = createAvatar();
    fixture.componentRef.setInput('image', 'https://example.com/avatar.png');
    fixture.componentRef.setInput('label', 'Jane Doe');
    fixture.detectChanges();

    expect(container(fixture).getAttribute('aria-label')).toBeNull();
  });

  it.each([
    ['sm', 'size-8'],
    ['default', 'size-10'],
    ['lg', 'size-12'],
    ['xl', 'size-16'],
  ] as const)('applies the size class for size=%s', (size, expectedClass) => {
    const fixture = createAvatar();
    fixture.componentRef.setInput('size', size);
    fixture.detectChanges();

    expect(container(fixture).className).toContain(expectedClass);
  });

  it('defaults to a circular shape', () => {
    const fixture = createAvatar();
    expect(container(fixture).className).toContain('rounded-full');
  });

  it('applies a square shape when requested', () => {
    const fixture = createAvatar();
    fixture.componentRef.setInput('shape', 'square');
    fixture.detectChanges();

    expect(container(fixture).className).toContain('rounded-md');
    expect(container(fixture).className).not.toContain('rounded-full');
  });

  it('applies the severity background only for the fallback (no image)', () => {
    const fixture = createAvatar();
    fixture.componentRef.setInput('severity', 'danger');
    fixture.detectChanges();

    expect(container(fixture).className).toContain('bg-danger-500');
  });

  it('merges a consumer class override', () => {
    const fixture = createAvatar();
    fixture.componentRef.setInput('class', 'ring-2');
    fixture.detectChanges();

    expect(container(fixture).className).toContain('ring-2');
  });

  // @scenario UI-008.S2
  it('emits onImageError when the avatar image fails to load', () => {
    const fixture = createAvatar();
    const errors: Event[] = [];
    fixture.componentInstance.onImageError.subscribe((e) => errors.push(e));
    fixture.componentRef.setInput('image', 'https://example.com/broken.png');
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(errors).toHaveLength(1);
  });
});
