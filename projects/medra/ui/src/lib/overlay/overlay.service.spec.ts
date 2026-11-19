import { Component, TemplateRef, ViewContainerRef, inject, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  BlockScrollStrategy,
  GlobalPositionStrategy,
  NoopScrollStrategy,
  Overlay,
  OverlayModule,
  OverlayRef,
  RepositionScrollStrategy,
} from '@angular/cdk/overlay';
import { A11yModule, ConfigurableFocusTrap, FocusTrapFactory } from '@angular/cdk/a11y';
import { Subject } from 'rxjs';
import { OverlayService } from './overlay.service';

@Component({
  standalone: true,
  template: `<button type="button">overlay content</button>`,
})
class TestOverlayContentComponent {}

@Component({
  standalone: true,
  template: `<ng-template #tpl><button type="button">template content</button></ng-template>`,
})
class TestTemplateHostComponent {
  readonly tpl = viewChild.required('tpl', { read: TemplateRef });
  readonly viewContainerRef = inject(ViewContainerRef);
}

function dispatchKeydown(target: EventTarget, key: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('OverlayService', () => {
  let service: OverlayService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule, A11yModule] });
    service = TestBed.inject(OverlayService);
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  it('openGlobal creates the overlay with a backdrop by default and attaches the component', () => {
    const handle = service.openGlobal(TestOverlayContentComponent);

    expect(handle.componentRef.instance).toBeInstanceOf(TestOverlayContentComponent);
    expect(handle.overlayRef.hasAttached()).toBe(true);
    expect(handle.overlayRef.overlayElement.parentElement?.classList.contains('cdk-overlay-backdrop')).toBe(false);
    expect(document.querySelector('.cdk-overlay-backdrop')).not.toBeNull();

    handle.close();
  });

  it('openConnected has no backdrop by default', () => {
    const origin = document.createElement('div');
    document.body.appendChild(origin);

    const handle = service.openConnected(origin, TestOverlayContentComponent);

    expect(document.querySelector('.cdk-overlay-backdrop')).toBeNull();

    handle.close();
    origin.remove();
  });

  it('closes on Escape and emits the result on closed$', (done) => {
    const handle = service.openGlobal<TestOverlayContentComponent, string>(TestOverlayContentComponent);

    handle.closed$.subscribe((result) => {
      expect(result).toBeUndefined();
      expect(handle.overlayRef.hasAttached()).toBe(false);
      done();
    });

    dispatchKeydown(handle.overlayRef.overlayElement, 'Escape');
  });

  it('closes on backdrop click (global overlay)', (done) => {
    const handle = service.openGlobal(TestOverlayContentComponent);

    handle.closed$.subscribe(() => {
      expect(handle.overlayRef.hasAttached()).toBe(false);
      done();
    });

    const backdrop = document.querySelector<HTMLElement>('.cdk-overlay-backdrop');
    backdrop?.click();
  });

  it('openGlobal defaults to centering both axes', () => {
    const centerHSpy = jest.spyOn(GlobalPositionStrategy.prototype, 'centerHorizontally');
    const centerVSpy = jest.spyOn(GlobalPositionStrategy.prototype, 'centerVertically');

    const handle = service.openGlobal(TestOverlayContentComponent);

    expect(centerHSpy).toHaveBeenCalled();
    expect(centerVSpy).toHaveBeenCalled();

    handle.close();
    centerHSpy.mockRestore();
    centerVSpy.mockRestore();
  });

  it('openGlobal with position "top-right" anchors to that corner instead of centering', () => {
    const topSpy = jest.spyOn(GlobalPositionStrategy.prototype, 'top');
    const rightSpy = jest.spyOn(GlobalPositionStrategy.prototype, 'right');
    const centerHSpy = jest.spyOn(GlobalPositionStrategy.prototype, 'centerHorizontally');
    const centerVSpy = jest.spyOn(GlobalPositionStrategy.prototype, 'centerVertically');

    const handle = service.openGlobal(TestOverlayContentComponent, { position: 'top-right' });

    expect(topSpy).toHaveBeenCalledWith('1rem');
    expect(rightSpy).toHaveBeenCalledWith('1rem');
    expect(centerHSpy).not.toHaveBeenCalled();
    expect(centerVSpy).not.toHaveBeenCalled();

    handle.close();
    topSpy.mockRestore();
    rightSpy.mockRestore();
    centerHSpy.mockRestore();
    centerVSpy.mockRestore();
  });

  it('repositionGlobal moves an already-open overlay in place, without detaching its content', () => {
    const handle = service.openGlobal(TestOverlayContentComponent, { position: 'top-right' });
    const updateSpy = jest.spyOn(handle.overlayRef, 'updatePositionStrategy');

    service.repositionGlobal(handle.overlayRef, 'bottom-left');

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(handle.overlayRef.hasAttached()).toBe(true);

    handle.close();
    updateSpy.mockRestore();
  });

  it('subscribes to outsidePointerEvents by default when there is no backdrop', () => {
    const spy = jest.spyOn(OverlayRef.prototype, 'outsidePointerEvents');

    const handle = service.openGlobal(TestOverlayContentComponent, { hasBackdrop: false });

    expect(spy).toHaveBeenCalled();

    handle.close();
    spy.mockRestore();
  });

  it('does not subscribe to outsidePointerEvents when closeOnOutsideClick is explicitly false (e.g. Toast)', () => {
    const spy = jest.spyOn(OverlayRef.prototype, 'outsidePointerEvents');

    const handle = service.openGlobal(TestOverlayContentComponent, {
      hasBackdrop: false,
      closeOnOutsideClick: false,
    });

    expect(spy).not.toHaveBeenCalled();

    handle.close();
    spy.mockRestore();
  });

  describe('outside-click origin exclusion (regression)', () => {
    // outsidePointerEvents() is CDK's own global pointerdown detector —
    // exercising it for real would depend on CDK/jsdom event-dispatch
    // timing we don't control. Stubbing it isolates the one thing that's
    // actually ours to get right: the filter that decides which of its
    // emissions should close the overlay.
    function stubOutsidePointerEvents() {
      const subject = new Subject<MouseEvent>();
      const spy = jest.spyOn(OverlayRef.prototype, 'outsidePointerEvents').mockReturnValue(subject.asObservable());
      return { subject, spy };
    }

    it('does not close when the emitted event targets the origin (trigger) itself', () => {
      const { subject, spy } = stubOutsidePointerEvents();
      const origin = document.createElement('button');
      document.body.appendChild(origin);

      const handle = service.openConnected(origin, TestOverlayContentComponent);
      // Regression: outsidePointerEvents() fires on pointerdown, before the
      // origin's own click handler — without excluding the origin, this
      // would auto-close here, and then the origin's own click-to-toggle
      // handler (running after, on the same physical click) would see a
      // closed overlay and reopen it, so clicking an open trigger again
      // could never close it.
      subject.next({ target: origin } as unknown as MouseEvent);

      expect(handle.overlayRef.hasAttached()).toBe(true);

      handle.close();
      origin.remove();
      spy.mockRestore();
    });

    it('still closes when the emitted event targets something outside both the panel and the origin', () => {
      const { subject, spy } = stubOutsidePointerEvents();
      const origin = document.createElement('button');
      document.body.appendChild(origin);
      const elsewhere = document.createElement('div');
      document.body.appendChild(elsewhere);

      const handle = service.openConnected(origin, TestOverlayContentComponent);
      subject.next({ target: elsewhere } as unknown as MouseEvent);

      expect(handle.overlayRef.hasAttached()).toBe(false);

      origin.remove();
      elsewhere.remove();
      spy.mockRestore();
    });
  });

  describe('scroll strategy (regression: Toast permanently blocked page scroll)', () => {
    // BlockScrollStrategy.enable() only actually engages (adds the
    // cdk-global-scrollblock class) when the document is taller/wider than
    // the viewport — a real-layout check jsdom can't satisfy (both report
    // 0). So instead of observing the effect, capture which strategy
    // *class* our code handed to Overlay.create() — that's the part that's
    // actually ours to get right.
    function spyOnCreate() {
      const original = Overlay.prototype.create;
      let captured: unknown;
      const spy = jest.spyOn(Overlay.prototype, 'create').mockImplementation(function (this: Overlay, config) {
        captured = config?.scrollStrategy;
        return original.call(this, config);
      });
      return { spy, getStrategy: () => captured };
    }

    it('openGlobal with a backdrop (e.g. Dialog) uses BlockScrollStrategy', () => {
      const { spy, getStrategy } = spyOnCreate();
      const handle = service.openGlobal(TestOverlayContentComponent, { hasBackdrop: true });

      expect(getStrategy()).toBeInstanceOf(BlockScrollStrategy);

      handle.close();
      spy.mockRestore();
    });

    it('openGlobal without a backdrop (e.g. Toast) uses NoopScrollStrategy, never BlockScrollStrategy', () => {
      // Regression: this used to key off `isGlobal` (viewport-relative
      // positioning) instead of `hasBackdrop` (actually modal), so Toast —
      // global-positioned (top-right) but explicitly non-modal — got the
      // same BlockScrollStrategy as Dialog. Since Toast's container is
      // created once and never disposed, the lock (meant to be released on
      // close) never released: the first toast ever shown permanently
      // broke scrolling on the page behind it.
      const { spy, getStrategy } = spyOnCreate();
      const handle = service.openGlobal(TestOverlayContentComponent, { hasBackdrop: false });

      expect(getStrategy()).toBeInstanceOf(NoopScrollStrategy);

      handle.close();
      spy.mockRestore();
    });

    it('openConnected (e.g. Select, Menu, Tooltip) uses RepositionScrollStrategy, never BlockScrollStrategy', () => {
      const { spy, getStrategy } = spyOnCreate();
      const origin = document.createElement('div');
      document.body.appendChild(origin);

      const handle = service.openConnected(origin, TestOverlayContentComponent);

      expect(getStrategy()).toBeInstanceOf(RepositionScrollStrategy);

      handle.close();
      origin.remove();
      spy.mockRestore();
    });
  });

  // Wave 2 fix: this wiring (focus trap creation, initial-focus-on-open,
  // and focus-restore-on-close) is shared by every modal/dismissable
  // OverlayService consumer — Dialog, ConfirmDialog, ConfirmPopup, Drawer,
  // Popover — and previously had zero test coverage anywhere in the repo,
  // despite all of them depending on it identically. One suite here
  // retroactively de-risks all of them at once, rather than each
  // component re-deriving the same assertions against a shared mechanism
  // they don't implement themselves.
  describe('focus management (Wave 2 fix — trap and restore)', () => {
    function stubFocusTrap() {
      const trap = {
        focusInitialElementWhenReady: jest.fn().mockResolvedValue(true),
        destroy: jest.fn(),
      } as unknown as ConfigurableFocusTrap;
      const spy = jest.spyOn(FocusTrapFactory.prototype, 'create').mockReturnValue(trap);
      return { spy, trap };
    }

    it('a backdrop (modal) overlay creates a focus trap on the overlay element and calls focusInitialElementWhenReady', () => {
      const { spy, trap } = stubFocusTrap();
      const handle = service.openGlobal(TestOverlayContentComponent, { hasBackdrop: true });

      expect(spy).toHaveBeenCalledWith(handle.overlayRef.overlayElement);
      expect(trap.focusInitialElementWhenReady).toHaveBeenCalledTimes(1);

      handle.close();
      spy.mockRestore();
    });

    it('closing a trapped overlay destroys the focus trap', () => {
      const { spy, trap } = stubFocusTrap();
      const handle = service.openGlobal(TestOverlayContentComponent, { hasBackdrop: true });

      handle.close();

      expect(trap.destroy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });

    it('a non-backdrop overlay (e.g. Menu, Select, Tooltip) does not create a focus trap by default', () => {
      const { spy } = stubFocusTrap();
      const origin = document.createElement('div');
      document.body.appendChild(origin);
      const handle = service.openConnected(origin, TestOverlayContentComponent);

      expect(spy).not.toHaveBeenCalled();

      handle.close();
      origin.remove();
      spy.mockRestore();
    });

    it('trapFocus: true forces a trap even on a non-backdrop overlay', () => {
      const { spy } = stubFocusTrap();
      const origin = document.createElement('div');
      document.body.appendChild(origin);
      const handle = service.openConnected(origin, TestOverlayContentComponent, { trapFocus: true });

      expect(spy).toHaveBeenCalledWith(handle.overlayRef.overlayElement);

      handle.close();
      origin.remove();
      spy.mockRestore();
    });

    it('trapFocus: false skips the trap even on a backdrop overlay', () => {
      const { spy } = stubFocusTrap();
      const handle = service.openGlobal(TestOverlayContentComponent, { hasBackdrop: true, trapFocus: false });

      expect(spy).not.toHaveBeenCalled();

      handle.close();
      spy.mockRestore();
    });

    it('closing restores focus to whatever was focused before the overlay opened', () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      trigger.focus();
      expect(document.activeElement).toBe(trigger);

      const handle = service.openGlobal(TestOverlayContentComponent);
      handle.close();

      expect(document.activeElement).toBe(trigger);
      trigger.remove();
    });

    it('restoreFocus: false leaves focus wherever it already is instead of returning it to the trigger', () => {
      const trigger = document.createElement('button');
      const somewhereElse = document.createElement('button');
      document.body.append(trigger, somewhereElse);
      trigger.focus();

      const handle = service.openGlobal(TestOverlayContentComponent, { restoreFocus: false });
      // Simulate focus having moved on (e.g. the user tabbed elsewhere
      // while the overlay was open) — `restoreFocus: false` should leave
      // it right there instead of pulling it back to `trigger`.
      somewhereElse.focus();
      handle.close();

      expect(document.activeElement).toBe(somewhereElse);
      trigger.remove();
      somewhereElse.remove();
    });
  });

  describe('openGlobalTemplate', () => {
    function createTemplateHost() {
      const fixture = TestBed.createComponent(TestTemplateHostComponent);
      fixture.detectChanges();
      return fixture;
    }

    it('attaches the TemplateRef content instead of a component', () => {
      const fixture = createTemplateHost();
      const handle = service.openGlobalTemplate(fixture.componentInstance.tpl(), fixture.componentInstance.viewContainerRef);

      expect(handle.overlayRef.hasAttached()).toBe(true);
      expect(document.querySelector('.cdk-overlay-pane')?.textContent).toContain('template content');
      expect('componentRef' in handle).toBe(false);

      handle.close();
    });

    it('has a backdrop by default, same as openGlobal', () => {
      const fixture = createTemplateHost();
      const handle = service.openGlobalTemplate(fixture.componentInstance.tpl(), fixture.componentInstance.viewContainerRef);

      expect(document.querySelector('.cdk-overlay-backdrop')).not.toBeNull();

      handle.close();
    });
  });

  describe('edge position strategy (Drawer)', () => {
    it('"left" anchors left and stretches the pane to full height', () => {
      const leftSpy = jest.spyOn(GlobalPositionStrategy.prototype, 'left');
      const heightSpy = jest.spyOn(GlobalPositionStrategy.prototype, 'height');

      const handle = service.openGlobal(TestOverlayContentComponent, { edge: 'left' });

      expect(leftSpy).toHaveBeenCalledWith('0');
      expect(heightSpy).toHaveBeenCalledWith('100%');

      handle.close();
      leftSpy.mockRestore();
      heightSpy.mockRestore();
    });

    it('"top" anchors top and stretches the pane to full width', () => {
      const topSpy = jest.spyOn(GlobalPositionStrategy.prototype, 'top');
      const widthSpy = jest.spyOn(GlobalPositionStrategy.prototype, 'width');

      const handle = service.openGlobal(TestOverlayContentComponent, { edge: 'top' });

      expect(topSpy).toHaveBeenCalledWith('0');
      expect(widthSpy).toHaveBeenCalledWith('100%');

      handle.close();
      topSpy.mockRestore();
      widthSpy.mockRestore();
    });

    it('edge takes precedence over position when both are set', () => {
      const centerHSpy = jest.spyOn(GlobalPositionStrategy.prototype, 'centerHorizontally');
      const leftSpy = jest.spyOn(GlobalPositionStrategy.prototype, 'left');

      const handle = service.openGlobal(TestOverlayContentComponent, { edge: 'left', position: 'center' });

      expect(leftSpy).toHaveBeenCalled();
      expect(centerHSpy).not.toHaveBeenCalled();

      handle.close();
      centerHSpy.mockRestore();
      leftSpy.mockRestore();
    });
  });

  describe('beforeClose (regression: Drawer needs time for its exit transition)', () => {
    it('delays dispose and the closed$ emission until the returned promise resolves', async () => {
      let resolveBeforeClose!: () => void;
      const beforeClose = jest.fn(() => new Promise<void>((resolve) => (resolveBeforeClose = resolve)));
      const handle = service.openGlobal(TestOverlayContentComponent, { beforeClose });

      let closedEmitted = false;
      handle.closed$.subscribe(() => (closedEmitted = true));

      handle.close();

      expect(beforeClose).toHaveBeenCalledTimes(1);
      expect(handle.overlayRef.hasAttached()).toBe(true);
      expect(closedEmitted).toBe(false);

      resolveBeforeClose();
      await Promise.resolve();

      expect(handle.overlayRef.hasAttached()).toBe(false);
      expect(closedEmitted).toBe(true);
    });

    it('a repeated close() call while beforeClose is still pending is a no-op', async () => {
      let resolveBeforeClose!: () => void;
      const beforeClose = jest.fn(() => new Promise<void>((resolve) => (resolveBeforeClose = resolve)));
      const handle = service.openGlobal(TestOverlayContentComponent, { beforeClose });

      handle.close();
      handle.close();
      expect(beforeClose).toHaveBeenCalledTimes(1);

      resolveBeforeClose();
      await Promise.resolve();

      expect(handle.overlayRef.hasAttached()).toBe(false);
    });

    it('without beforeClose, dispose is still synchronous (every other overlay)', () => {
      const handle = service.openGlobal(TestOverlayContentComponent);

      handle.close();

      expect(handle.overlayRef.hasAttached()).toBe(false);
    });
  });

  it('close(result) emits the result and completes closed$ exactly once', () => {
    const handle = service.openGlobal<TestOverlayContentComponent, string>(TestOverlayContentComponent);
    const received: (string | undefined)[] = [];
    let completed = false;
    handle.closed$.subscribe({ next: (r) => received.push(r), complete: () => (completed = true) });

    handle.close('confirmed');
    handle.close('repeated call should be ignored');

    expect(received).toEqual(['confirmed']);
    expect(completed).toBe(true);
  });
});
