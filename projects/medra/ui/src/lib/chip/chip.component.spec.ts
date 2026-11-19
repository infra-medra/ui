import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ChipComponent } from './chip.component';

function createChip() {
  const fixture = TestBed.createComponent(ChipComponent);
  fixture.detectChanges();
  return fixture;
}

function pill(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('span') as HTMLElement;
}

@Component({
  standalone: true,
  imports: [ChipComponent],
  template: `<med-chip>{{ text }}</med-chip>`,
})
class HostComponent {
  text = 'Angular';
}

describe('ChipComponent', () => {
  it('renders the projected content', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Angular');
  });

  it('shows neither image nor icon by default', () => {
    const fixture = createChip();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.querySelector('med-icon')).toBeNull();
  });

  it('shows the icon when set', () => {
    const fixture = createChip();
    fixture.componentRef.setInput('icon', 'star');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('med-icon')).not.toBeNull();
  });

  it('shows the image, with alt text, when set', () => {
    const fixture = createChip();
    fixture.componentRef.setInput('image', 'https://example.com/avatar.png');
    fixture.componentRef.setInput('imageAlt', 'Jane Doe');
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img.src).toBe('https://example.com/avatar.png');
    expect(img.alt).toBe('Jane Doe');
  });

  it('prefers the image over the icon when both are set', () => {
    const fixture = createChip();
    fixture.componentRef.setInput('image', 'https://example.com/avatar.png');
    fixture.componentRef.setInput('icon', 'star');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('img')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('med-icon')).toBeNull();
  });

  it('has no remove button by default', () => {
    const fixture = createChip();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('shows a remove button, labeled by removeLabel, when removable', () => {
    const fixture = createChip();
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.getAttribute('aria-label')).toBe('Remove');
  });

  it('applies a custom removeLabel', () => {
    const fixture = createChip();
    fixture.componentRef.setInput('removable', true);
    fixture.componentRef.setInput('removeLabel', 'Remove filter');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('button')!.getAttribute('aria-label')).toBe('Remove filter');
  });

  it('emits removed when the remove button is clicked', () => {
    const fixture = createChip();
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();

    const emitted = jest.fn();
    fixture.componentInstance.removed.subscribe(emitted);

    fixture.nativeElement.querySelector('button')!.click();

    expect(emitted).toHaveBeenCalledTimes(1);
  });

  it('the remove button is a genuine keyboard-activatable native <button> (Wave 2 fix — 2026-08-19)', () => {
    // Enter/Space activation itself needs no custom (keydown) handler,
    // relying entirely on the browser's native behavior for a real
    // <button> (Backspace is the one key this component does wire itself —
    // see the tests below). jsdom does not implement that native
    // keydown-to-click translation (verified directly: dispatching a
    // KeyboardEvent('keydown', { key: 'Enter' | ' ' }) at a plain native
    // <button> in this test environment never fires a 'click'), so what's
    // actually testable here is the set of preconditions that *make* native
    // keyboard activation work in a real browser: it must be a real
    // `<button>` (not a `role="button"` div), `type="button"` (so Enter/Space
    // never triggers an implicit form submit as a side effect), and not
    // excluded from the tab order.
    const fixture = createChip();
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.tagName).toBe('BUTTON');
    expect(button.type).toBe('button');
    expect(button.tabIndex).toBe(0);
    expect(button.disabled).toBe(false);
  });

  it('the remove button has the focus-visible ring class (Wave 2 fix — 2026-08-19)', () => {
    const fixture = createChip();
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.className).toContain('focus-visible:ring-(--focus-ring-width)');
    expect(button.className).toContain('focus-visible:ring-brand-500');
  });

  it('falls through to the icon when the image fails to load', () => {
    const fixture = createChip();
    fixture.componentRef.setInput('image', 'https://example.com/broken.png');
    fixture.componentRef.setInput('icon', 'star');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).not.toBeNull();

    fixture.nativeElement.querySelector('img')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.querySelector('med-icon')).not.toBeNull();
  });

  it('falls through to no leading image/icon at all when the image fails and there is no icon fallback', () => {
    const fixture = createChip();
    fixture.componentRef.setInput('image', 'https://example.com/broken.png');
    fixture.detectChanges();

    fixture.nativeElement.querySelector('img')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.querySelector('med-icon')).toBeNull();
  });

  it('recovers once image is set to a different URL after a previous failure', () => {
    const fixture = createChip();
    fixture.componentRef.setInput('image', 'https://example.com/broken.png');
    fixture.detectChanges();
    fixture.nativeElement.querySelector('img')!.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();

    fixture.componentRef.setInput('image', 'https://example.com/working.png');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('img')).not.toBeNull();
  });

  it('emits removed with the KeyboardEvent when Backspace is pressed on the remove button', () => {
    const fixture = createChip();
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();

    const emitted = jest.fn();
    fixture.componentInstance.removed.subscribe(emitted);

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    const event = new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true });
    button.dispatchEvent(event);

    expect(emitted).toHaveBeenCalledTimes(1);
    expect(emitted.mock.calls[0][0]).toBe(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('does not emit removed for other keys on the remove button', () => {
    const fixture = createChip();
    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();

    const emitted = jest.fn();
    fixture.componentInstance.removed.subscribe(emitted);

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));

    expect(emitted).not.toHaveBeenCalled();
  });

  it('merges a consumer class override', () => {
    const fixture = createChip();
    fixture.componentRef.setInput('class', 'ring-2');
    fixture.detectChanges();

    expect(pill(fixture).className).toContain('ring-2');
  });

  describe('#removeicon', () => {
    it('renders the default x-mark icon when no template is projected', () => {
      const fixture = createChip();
      fixture.componentRef.setInput('removable', true);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('button med-icon')).not.toBeNull();
    });

    it('renders the projected #removeicon template instead of the default icon', () => {
      @Component({
        standalone: true,
        imports: [ChipComponent],
        template: `
          <med-chip removable>
            Angular
            <ng-template #removeicon>
              <span class="remove-icon-marker">X</span>
            </ng-template>
          </med-chip>
        `,
      })
      class RemoveIconHostComponent {}

      const fixture = TestBed.createComponent(RemoveIconHostComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('button med-icon')).toBeNull();
      expect(fixture.nativeElement.querySelector('button .remove-icon-marker')?.textContent).toBe('X');
    });
  });

  // @scenario UI-008.S2
  it('renders label input when provided', () => {
    const fixture = TestBed.createComponent(ChipComponent);
    fixture.componentRef.setInput('label', 'TypeScript');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent?.trim()).toBe('TypeScript');
  });
});
