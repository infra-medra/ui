import { ComponentType } from '@angular/cdk/portal';
import { ApplicationRef, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { JsonPipe } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { DialogOptions, DialogService } from './dialog.service';
import { DIALOG_DATA, DIALOG_REF } from './dialog.tokens';

@Component({
  standalone: true,
  template: `
    <p>data: {{ data | json }}</p>
    <button type="button" (click)="confirm()">confirm</button>
  `,
  imports: [JsonPipe],
})
class TestContentComponent {
  protected readonly dialogRef = inject(DIALOG_REF);
  protected readonly data = inject(DIALOG_DATA, { optional: true });

  protected confirm(): void {
    this.dialogRef.close('confirmed');
  }
}

function getOverlayContainerElement(): HTMLElement {
  return document.querySelector('.cdk-overlay-container') as HTMLElement;
}

/** jsdom has no PointerEvent constructor — same plain-Event-cast pattern already used by slider.component.spec.ts. */
function pointer(type: string, clientX: number, clientY: number, pointerId = 1): PointerEvent {
  return Object.assign(new Event(type, { bubbles: true, cancelable: true }), { clientX, clientY, pointerId }) as PointerEvent;
}

describe('DialogService', () => {
  let service: DialogService;
  let appRef: ApplicationRef;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
    service = TestBed.inject(DialogService);
    appRef = TestBed.inject(ApplicationRef);
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  // Dynamically created components (shell + content) aren't rendered until
  // the app's change detection actually runs a pass over them.
  function open<T>(component: new (...args: never[]) => T, options?: DialogOptions) {
    const ref = service.open(component as ComponentType<T>, options);
    appRef.tick();
    return ref;
  }

  it('renders the header, the content component, and the close button', () => {
    open(TestContentComponent, { header: 'Delete item?' });
    const container = getOverlayContainerElement();

    expect(container.querySelector('h2')?.textContent).toBe('Delete item?');
    expect(container.querySelector('button[type="button"]')).not.toBeNull();
    expect(container.textContent).toContain('confirm');
  });

  it('defaults the close button aria-label to "Close"', () => {
    open(TestContentComponent, { header: 'Title' });
    const container = getOverlayContainerElement();
    const closeButton = container.querySelector('[aria-label="Close"]');

    expect(closeButton).not.toBeNull();
  });

  it('uses a custom closeLabel when provided', () => {
    open(TestContentComponent, { header: 'Title', closeLabel: 'Fechar' });
    const container = getOverlayContainerElement();

    expect(container.querySelector('[aria-label="Fechar"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="Close"]')).toBeNull();
  });

  it('hides the close button when closable is false', () => {
    open(TestContentComponent, { header: 'Title', closable: false });
    const container = getOverlayContainerElement();

    expect(container.querySelector('[aria-label]')).toBeNull();
  });

  it('renders no header bar at all when there is no header and closable is false', () => {
    open(TestContentComponent, { closable: false });
    const container = getOverlayContainerElement();

    expect(container.querySelector('h2')).toBeNull();
  });

  it('with no header, no maximize, and not draggable, closable renders a floating corner button, not an empty bordered bar (real UX issue caught live)', () => {
    open(TestContentComponent, {});
    const container = getOverlayContainerElement();

    expect(container.querySelector('h2')).toBeNull(); // still no title, nothing to show one for
    const closeButton = container.querySelector('[data-dialog-close]');
    expect(closeButton).not.toBeNull();
    expect(closeButton!.className).toContain('absolute');
    // No sibling bordered bar wrapping it — the button sits directly in the shell, not inside a `border-b` row.
    expect(closeButton!.parentElement?.className).not.toContain('border-b');
  });

  it('a header still gets the full bordered bar (unchanged)', () => {
    open(TestContentComponent, { header: 'Title' });
    const container = getOverlayContainerElement();

    const closeButton = container.querySelector('[data-dialog-close]') as HTMLElement;
    expect(closeButton.parentElement?.parentElement?.className).toContain('border-b');
  });

  it('maximizable with no header still gets the full bordered bar (a real row with two controls, not "empty chrome")', () => {
    open(TestContentComponent, { maximizable: true });
    const container = getOverlayContainerElement();

    const closeButton = container.querySelector('[data-dialog-close]') as HTMLElement;
    expect(closeButton.parentElement?.parentElement?.className).toContain('border-b');
  });

  it('draggable with no header still gets the full bordered bar, since it doubles as the drag handle', () => {
    open(TestContentComponent, { draggable: true });
    const container = getOverlayContainerElement();

    const closeButton = container.querySelector('[data-dialog-close]') as HTMLElement;
    expect(closeButton.parentElement?.parentElement?.className).toContain('border-b');
    expect(closeButton.parentElement?.parentElement?.className).toContain('cursor-move');
  });

  it('injects DIALOG_DATA into the content component', () => {
    open(TestContentComponent, { data: { itemId: 42 } });
    const container = getOverlayContainerElement();

    expect(container.querySelector('p')?.textContent).toContain('42');
  });

  it('sets role=dialog and aria-modal on the shell, with aria-labelledby matching the header', () => {
    open(TestContentComponent, { header: 'Title' });
    const container = getOverlayContainerElement();
    const shell = container.querySelector('med-dialog-shell') as HTMLElement;
    const header = container.querySelector('h2') as HTMLElement;

    expect(shell.getAttribute('role')).toBe('dialog');
    expect(shell.getAttribute('aria-modal')).toBe('true');
    expect(shell.getAttribute('aria-labelledby')).toBe(header.id);
  });

  it("the content component's DialogRef.close(result) closes the overlay and emits the result", (done) => {
    const dialogRef = open<TestContentComponent>(TestContentComponent, { header: 'Title' });

    dialogRef.closed$.subscribe((result) => {
      expect(result).toBe('confirmed');
      expect(getOverlayContainerElement().querySelector('med-dialog-shell')).toBeNull();
      done();
    });

    const container = getOverlayContainerElement();
    const confirmButton = [...container.querySelectorAll('button')].find((b) => b.textContent?.includes('confirm'));
    (confirmButton as HTMLButtonElement).click();
  });

  it('has a backdrop and closes on Escape (delegates to OverlayService defaults)', (done) => {
    const dialogRef = open(TestContentComponent, { header: 'Title' });

    expect(document.querySelector('.cdk-overlay-backdrop')).not.toBeNull();

    dialogRef.closed$.subscribe(() => {
      expect(getOverlayContainerElement().querySelector('med-dialog-shell')).toBeNull();
      done();
    });

    const shell = getOverlayContainerElement().querySelector('med-dialog-shell') as HTMLElement;
    shell.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  });

  describe('position', () => {
    function wrapperStyle(): CSSStyleDeclaration {
      return (document.querySelector('.cdk-global-overlay-wrapper') as HTMLElement).style;
    }

    it('defaults to centered', () => {
      open(TestContentComponent, { header: 'Title' });
      expect(wrapperStyle().justifyContent).toBe('center');
      expect(wrapperStyle().alignItems).toBe('center');
    });

    it('anchors to a corner when given', () => {
      open(TestContentComponent, { header: 'Title', position: 'top-right' });
      expect(wrapperStyle().justifyContent).toBe('flex-end');
      expect(wrapperStyle().alignItems).toBe('flex-start');
    });
  });

  describe('draggable', () => {
    function shell(): HTMLElement {
      return getOverlayContainerElement().querySelector('med-dialog-shell') as HTMLElement;
    }

    function header(): HTMLElement {
      return shell().querySelector('h2')!.parentElement as HTMLElement;
    }

    it('does not move on drag when draggable is not set (default)', () => {
      open(TestContentComponent, { header: 'Title' });
      header().dispatchEvent(pointer('pointerdown', 100, 100));
      header().dispatchEvent(pointer('pointermove', 150, 130));
      appRef.tick();
      expect(shell().style.transform).toBe('');
    });

    it('moves the shell via transform while dragging the header', () => {
      open(TestContentComponent, { header: 'Title', draggable: true });
      header().dispatchEvent(pointer('pointerdown', 100, 100));
      header().dispatchEvent(pointer('pointermove', 150, 130));
      appRef.tick();
      expect(shell().style.transform).toBe('translate(50px, 30px)');
    });

    it('stops updating after pointerup, and a second drag accumulates onto the previous offset', () => {
      open(TestContentComponent, { header: 'Title', draggable: true });
      header().dispatchEvent(pointer('pointerdown', 100, 100));
      header().dispatchEvent(pointer('pointermove', 150, 100)); // +50, 0
      header().dispatchEvent(pointer('pointerup', 150, 100));
      header().dispatchEvent(pointer('pointermove', 300, 100)); // ignored, no active drag
      appRef.tick();
      expect(shell().style.transform).toBe('translate(50px, 0px)');

      header().dispatchEvent(pointer('pointerdown', 150, 100));
      header().dispatchEvent(pointer('pointermove', 170, 100)); // +20 more
      appRef.tick();
      expect(shell().style.transform).toBe('translate(70px, 0px)');
    });

    it('a pointerdown on the close button never starts a drag', () => {
      open(TestContentComponent, { header: 'Title', draggable: true });
      const closeButton = shell().querySelector('[aria-label="Close"]') as HTMLElement;
      closeButton.dispatchEvent(pointer('pointerdown', 100, 100));
      header().dispatchEvent(pointer('pointermove', 200, 200));
      appRef.tick();
      expect(shell().style.transform).toBe('');
    });
  });

  describe('resizable', () => {
    function shell(): HTMLElement {
      return getOverlayContainerElement().querySelector('med-dialog-shell') as HTMLElement;
    }

    function resizeHandle(): HTMLElement {
      return shell().querySelector('.cursor-nwse-resize') as HTMLElement;
    }

    beforeEach(() => {
      jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
        width: 400,
        height: 300,
        top: 0,
        left: 0,
        right: 400,
        bottom: 300,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });
    });

    it('renders no resize handle by default', () => {
      open(TestContentComponent, { header: 'Title' });
      expect(shell().querySelector('.cursor-nwse-resize')).toBeNull();
    });

    it('drag-resizing from the corner sets explicit width/height', () => {
      open(TestContentComponent, { header: 'Title', resizable: true });
      resizeHandle().dispatchEvent(pointer('pointerdown', 400, 300));
      resizeHandle().dispatchEvent(pointer('pointermove', 460, 340));
      appRef.tick();
      expect(shell().style.width).toBe('460px'); // 400 + 60
      expect(shell().style.height).toBe('340px'); // 300 + 40
    });

    it('never shrinks below the minimum size', () => {
      open(TestContentComponent, { header: 'Title', resizable: true });
      resizeHandle().dispatchEvent(pointer('pointerdown', 400, 300));
      resizeHandle().dispatchEvent(pointer('pointermove', -1000, -1000));
      appRef.tick();
      expect(shell().style.width).toBe('280px');
      expect(shell().style.height).toBe('160px');
    });
  });

  describe('maximizable', () => {
    function shell(): HTMLElement {
      return getOverlayContainerElement().querySelector('med-dialog-shell') as HTMLElement;
    }

    function maximizeButton(): HTMLElement {
      return shell().querySelector('[aria-label="Maximize"], [aria-label="Restore"]') as HTMLElement;
    }

    it('renders no maximize button by default', () => {
      open(TestContentComponent, { header: 'Title' });
      expect(shell().querySelector('[aria-label="Maximize"]')).toBeNull();
    });

    it('toggles between Maximize and Restore, filling the viewport while maximized', () => {
      open(TestContentComponent, { header: 'Title', maximizable: true });
      expect(maximizeButton().getAttribute('aria-label')).toBe('Maximize');

      maximizeButton().click();
      appRef.tick();
      expect(shell().getAttribute('aria-label')).not.toBe('Maximize'); // sanity: didn't rename the shell itself
      expect(maximizeButton().getAttribute('aria-label')).toBe('Restore');
      expect(shell().style.maxWidth).toBe('none');
      expect(shell().style.maxHeight).toBe('none');
      expect(shell().style.width).toBe(`${window.innerWidth - 32}px`);
      expect(shell().style.height).toBe(`${window.innerHeight - 32}px`);

      maximizeButton().click();
      appRef.tick();
      expect(maximizeButton().getAttribute('aria-label')).toBe('Maximize');
      expect(shell().style.maxWidth).toBe('');
    });

    it('suppresses the resize handle while maximized', () => {
      open(TestContentComponent, { header: 'Title', maximizable: true, resizable: true });
      expect(shell().querySelector('.cursor-nwse-resize')).not.toBeNull();

      maximizeButton().click();
      appRef.tick();
      expect(shell().querySelector('.cursor-nwse-resize')).toBeNull();
    });

    it('suppresses (but keeps) a drag offset while maximized, restoring it back on restore', () => {
      open(TestContentComponent, { header: 'Title', maximizable: true, draggable: true });
      const header = shell().querySelector('h2')!.parentElement as HTMLElement;
      header.dispatchEvent(pointer('pointerdown', 0, 0));
      header.dispatchEvent(pointer('pointermove', 40, 20));
      appRef.tick();
      expect(shell().style.transform).toBe('translate(40px, 20px)');

      maximizeButton().click();
      appRef.tick();
      expect(shell().style.transform).toBe('');

      maximizeButton().click();
      appRef.tick();
      expect(shell().style.transform).toBe('translate(40px, 20px)');
    });
  });

  describe('closeOnEscape / dismissableMask', () => {
    function shell(): HTMLElement {
      return getOverlayContainerElement().querySelector('med-dialog-shell') as HTMLElement;
    }

    function backdrop(): HTMLElement {
      return document.querySelector('.cdk-overlay-backdrop') as HTMLElement;
    }

    it('dismissableMask defaults to true (unchanged from before this option existed) — clicking the backdrop closes it', () => {
      open(TestContentComponent, { header: 'Title' });
      backdrop().click();
      appRef.tick();
      expect(getOverlayContainerElement().querySelector('med-dialog-shell')).toBeNull();
    });

    it('dismissableMask: false keeps the dialog open on a backdrop click', () => {
      open(TestContentComponent, { header: 'Title', dismissableMask: false });
      backdrop().click();
      appRef.tick();
      expect(getOverlayContainerElement().querySelector('med-dialog-shell')).not.toBeNull();
    });

    it('closeOnEscape defaults to true (unchanged)', () => {
      open(TestContentComponent, { header: 'Title' });
      shell().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      appRef.tick();
      expect(getOverlayContainerElement().querySelector('med-dialog-shell')).toBeNull();
    });

    it('closeOnEscape: false keeps the dialog open on Escape', () => {
      open(TestContentComponent, { header: 'Title', closeOnEscape: false });
      shell().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      appRef.tick();
      expect(getOverlayContainerElement().querySelector('med-dialog-shell')).not.toBeNull();
    });
  });

  describe('breakpoints', () => {
    afterEach(() => {
      document.querySelectorAll('style').forEach((el) => {
        if (el.textContent?.includes('data-dialog-id')) {
          el.remove();
        }
      });
    });

    it('injects no scoped <style> when breakpoints is not set', () => {
      open(TestContentComponent, { header: 'Title' });
      const shell = getOverlayContainerElement().querySelector('med-dialog-shell') as HTMLElement;
      const dialogId = shell.getAttribute('data-dialog-id');
      expect(Array.from(document.querySelectorAll('style')).some((el) => el.textContent?.includes(dialogId!))).toBe(false);
    });

    it('injects a scoped <style> with one @media rule per breakpoint, targeting this dialog\'s own data-dialog-id', () => {
      open(TestContentComponent, { header: 'Title', breakpoints: { '960px': '75vw', '640px': '90vw' } });
      const shell = getOverlayContainerElement().querySelector('med-dialog-shell') as HTMLElement;
      const dialogId = shell.getAttribute('data-dialog-id');

      const styleEl = Array.from(document.querySelectorAll('style')).find((el) => el.textContent?.includes(dialogId!));
      expect(styleEl).not.toBeUndefined();
      expect(styleEl!.textContent).toContain('@media (max-width: 960px)');
      expect(styleEl!.textContent).toContain('75vw');
      expect(styleEl!.textContent).toContain('@media (max-width: 640px)');
      expect(styleEl!.textContent).toContain('90vw');
    });

    it('guards the rule against the maximized state', () => {
      open(TestContentComponent, { header: 'Title', breakpoints: { '960px': '75vw' } });
      const shell = getOverlayContainerElement().querySelector('med-dialog-shell') as HTMLElement;
      const dialogId = shell.getAttribute('data-dialog-id');
      const styleEl = Array.from(document.querySelectorAll('style')).find((el) => el.textContent?.includes(dialogId!));
      expect(styleEl!.textContent).toContain(':not([data-maximized="true"])');
    });
  });

  describe('opened$', () => {
    it('emits once after the caller has a chance to subscribe (deferred to a microtask)', async () => {
      const dialogRef = open(TestContentComponent, { header: 'Title' });
      const received: unknown[] = [];
      dialogRef.opened$.subscribe(() => received.push(undefined));

      expect(received).toHaveLength(0); // not yet — still deferred
      await Promise.resolve(); // let the microtask queue flush
      expect(received).toHaveLength(1);
    });

    it('completes after emitting (a late subscriber gets nothing further, but no error)', async () => {
      const dialogRef = open(TestContentComponent, { header: 'Title' });
      await Promise.resolve();

      let completed = false;
      dialogRef.opened$.subscribe({ complete: () => (completed = true) });
      expect(completed).toBe(true);
    });
  });

  describe('modal (DLD-002.S1)', () => {
    it('[DLD-002.S1] retains .cdk-overlay-backdrop and aria-modal="true" when modal defaults to true', () => {
      open(TestContentComponent, { header: 'Title' });
      const shell = getOverlayContainerElement().querySelector('med-dialog-shell') as HTMLElement;

      expect(shell.getAttribute('role')).toBe('dialog');
      expect(document.querySelectorAll('.cdk-overlay-backdrop')).toHaveLength(1);
      expect(shell.getAttribute('aria-modal')).toBe('true');
    });

    it('[DLD-002.S1] modal: false opens role="dialog" with zero .cdk-overlay-backdrop, omits aria-modal, and closes on outside click by default', () => {
      open(TestContentComponent, { header: 'Title', modal: false } as DialogOptions);
      const shell = getOverlayContainerElement().querySelector('med-dialog-shell') as HTMLElement;

      expect(shell.getAttribute('role')).toBe('dialog');
      expect(document.querySelectorAll('.cdk-overlay-backdrop')).toHaveLength(0);
      expect(shell.getAttribute('aria-modal')).toBeNull();

      document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      appRef.tick();

      expect(getOverlayContainerElement().querySelector('med-dialog-shell')).toBeNull();
    });

    it('[DLD-002.S1] modal: false with dismissableMask: false stays open on outside click', () => {
      open(TestContentComponent, { header: 'Title', modal: false, dismissableMask: false } as DialogOptions);
      const shell = getOverlayContainerElement().querySelector('med-dialog-shell') as HTMLElement;

      expect(shell.getAttribute('role')).toBe('dialog');
      expect(document.querySelectorAll('.cdk-overlay-backdrop')).toHaveLength(0);
      expect(shell.getAttribute('aria-modal')).toBeNull();

      document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      appRef.tick();

      expect(getOverlayContainerElement().querySelector('med-dialog-shell')).not.toBeNull();
    });
  });
});
