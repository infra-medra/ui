import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { ColorPickerComponent } from './color-picker.component';

function trigger(fixture: { nativeElement: HTMLElement }): HTMLButtonElement {
  return fixture.nativeElement.querySelector('button') as HTMLButtonElement;
}

function panelHexInput(): HTMLInputElement | null {
  return document.querySelector('med-color-picker-panel input');
}

function svArea(): HTMLElement | null {
  return document.querySelectorAll('med-color-picker-panel [role="slider"]')[0] as HTMLElement | null;
}

/** jsdom's layout engine always reports a 0-size rect. */
function stubRect(el: HTMLElement): void {
  jest.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    width: 200,
    height: 160,
    right: 200,
    bottom: 160,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
}

function pointer(type: string, clientX: number, clientY: number, pointerId = 1): PointerEvent {
  return Object.assign(new Event(type, { bubbles: true, cancelable: true }), { clientX, clientY, pointerId }) as PointerEvent;
}

describe('ColorPickerComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function create(): ComponentFixture<ColorPickerComponent> {
    const fixture = TestBed.createComponent(ColorPickerComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('defaults to black when no value is written', () => {
    const fixture = create();
    expect(trigger(fixture).style.background).toBe('rgb(0, 0, 0)');
    expect(trigger(fixture).getAttribute('aria-label')).toContain('#000000');
  });

  it('writeValue shows the given color without opening the panel', () => {
    const fixture = create();
    fixture.componentInstance.writeValue('#3b82f6');
    fixture.detectChanges();
    expect(trigger(fixture).getAttribute('aria-label')).toContain('#3b82f6');
    expect(panelHexInput()).toBeNull();
  });

  it('clicking the trigger opens the panel, pre-filled with the current color', () => {
    const fixture = create();
    fixture.componentInstance.writeValue('#00ff00');
    fixture.detectChanges();

    trigger(fixture).click();
    fixture.detectChanges();

    expect(panelHexInput()!.value).toBe('#00ff00');
  });

  it('dragging in the panel updates the trigger color and calls onChange, without closing the panel', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    trigger(fixture).click();
    fixture.detectChanges();

    const area = svArea()!;
    stubRect(area);
    area.dispatchEvent(pointer('pointerdown', 200, 0)); // s=100, b=100, current hue 0 -> pure red
    fixture.detectChanges();

    expect(onChange).toHaveBeenCalledWith('#ff0000');
    expect(trigger(fixture).style.background).toBe('rgb(255, 0, 0)');
    expect(panelHexInput()).not.toBeNull(); // still open
  });

  it('clicking the trigger again closes the panel', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(panelHexInput()).not.toBeNull();

    trigger(fixture).click();
    fixture.detectChanges();
    expect(panelHexInput()).toBeNull();
  });

  it('setDisabledState(true) (Reactive Forms disable()) prevents opening', () => {
    const fixture = create();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(panelHexInput()).toBeNull();
  });

  // Escape-to-close and outside-click dismissal aren't reimplemented by
  // ColorPicker itself — same as TreeSelect, they come for free from
  // OverlayService.openConnected()'s own defaults (closeOnEscape/
  // closeOnOutsideClick/restoreFocus all default true for a non-backdrop
  // overlay), since ColorPicker never passes any options to openConnected()
  // (color-picker.component.ts:127). Previously untested at this level.
  describe('overlay dismissal (via OverlayService defaults)', () => {
    it('Escape closes the panel and returns focus to the trigger', () => {
      // jsdom's HTMLElement.click() doesn't synthesize real focus, so
      // OverlayService's captured "previously focused" element would
      // otherwise be document.body — focus the trigger explicitly first,
      // matching tree-select.component.spec.ts's own equivalent test.
      const fixture = create();
      trigger(fixture).focus();
      trigger(fixture).click();
      fixture.detectChanges();
      expect(panelHexInput()).not.toBeNull();

      // CDK's OverlayKeyboardDispatcher listens for 'keydown' on <body>
      // itself, so the event has to be dispatched there (or on a body
      // descendant, to bubble up) for overlayRef.keydownEvents() to fire.
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
      fixture.detectChanges();

      expect(panelHexInput()).toBeNull();
      expect(document.activeElement).toBe(trigger(fixture));
    });

    it('a pointerdown+click outside the panel closes it and returns focus to the trigger', () => {
      // CDK's OverlayOutsideClickDispatcher tracks the pointerdown target,
      // then resolves outsidePointerEvents() on the following 'click' (both
      // listened for on <body> with capture:true) — dispatching only one of
      // the two never resolves it. jsdom has no global PointerEvent, so
      // (matching tree-select.component.spec.ts's own equivalent test) a
      // MouseEvent stands in for it.
      const fixture = create();
      trigger(fixture).focus();
      trigger(fixture).click();
      fixture.detectChanges();
      expect(panelHexInput()).not.toBeNull();

      document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();

      expect(panelHexInput()).toBeNull();
      expect(document.activeElement).toBe(trigger(fixture));
    });
  });

  describe('format', () => {
    it('rgb: writeValue accepts rgb(r, g, b) and onChange emits the same shape', () => {
      const fixture = TestBed.createComponent(ColorPickerComponent);
      fixture.componentRef.setInput('format', 'rgb');
      fixture.detectChanges();
      const onChange = jest.fn();
      fixture.componentInstance.registerOnChange(onChange);

      fixture.componentInstance.writeValue('rgb(59, 130, 246)');
      fixture.detectChanges();
      expect(trigger(fixture).getAttribute('aria-label')).toContain('#3b82f6');

      trigger(fixture).click();
      fixture.detectChanges();
      const area = svArea()!;
      stubRect(area);
      area.dispatchEvent(pointer('pointerdown', 200, 0));
      fixture.detectChanges();

      // The initial hue survived writeValue (only s/b moved via this drag), so
      // the exact resulting color isn't pure red here — just assert the shape.
      expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^rgb\(\d+, \d+, \d+\)$/));
    });

    it('hsb: writeValue accepts hsb(h, s%, b%) and onChange emits the same shape', () => {
      const fixture = TestBed.createComponent(ColorPickerComponent);
      fixture.componentRef.setInput('format', 'hsb');
      fixture.detectChanges();
      const onChange = jest.fn();
      fixture.componentInstance.registerOnChange(onChange);

      fixture.componentInstance.writeValue('hsb(0, 100%, 100%)');
      fixture.detectChanges();
      expect(trigger(fixture).getAttribute('aria-label')).toContain('#ff0000');

      trigger(fixture).click();
      fixture.detectChanges();
      const area = svArea()!;
      stubRect(area);
      area.dispatchEvent(pointer('pointerdown', 200, 0));
      fixture.detectChanges();

      expect(onChange).toHaveBeenCalledWith('hsb(0, 100%, 100%)');
    });

    it('defaults to hex when format is not set', () => {
      const fixture = create();
      fixture.componentInstance.writeValue('#3b82f6');
      fixture.detectChanges();
      expect(trigger(fixture).getAttribute('aria-label')).toContain('#3b82f6');
    });
  });

  describe('inline', () => {
    function createInline() {
      const fixture = TestBed.createComponent(ColorPickerComponent);
      fixture.componentRef.setInput('inline', true);
      fixture.detectChanges();
      return fixture;
    }

    it('renders the panel directly, with no trigger button', () => {
      const fixture = createInline();
      expect(fixture.nativeElement.querySelector('button')).toBeNull();
      expect(panelHexInput()).not.toBeNull();
    });

    it('seeds the panel from the value written before first render', () => {
      const fixture = TestBed.createComponent(ColorPickerComponent);
      fixture.componentRef.setInput('inline', true);
      fixture.componentInstance.writeValue('#00ff00');
      fixture.detectChanges();

      expect(panelHexInput()!.value).toBe('#00ff00');
    });

    it('regression: NgModel calling writeValue(null) before the real initial value still seeds the panel correctly (found via a live showcase screenshot, not Jest — see class doc comment)', () => {
      const fixture = TestBed.createComponent(ColorPickerComponent);
      fixture.componentRef.setInput('inline', true);
      // Exactly the sequence NgModel triggers on init: writeValue(null) first
      // (ngOnChanges' first pass, before the bound expression resolves),
      // then the real value on a later ngOnChanges — both still before this
      // fixture's very first detectChanges()/view init.
      fixture.componentInstance.writeValue(null);
      fixture.componentInstance.writeValue('#f59e0b');
      fixture.detectChanges();

      expect(panelHexInput()!.value).toBe('#f59e0b');
    });

    it('a writeValue() after the view has settled no longer reseeds the panel (repaints the swatch only)', async () => {
      const fixture = TestBed.createComponent(ColorPickerComponent);
      fixture.componentRef.setInput('inline', true);
      fixture.componentInstance.writeValue('#00ff00');
      fixture.detectChanges(); // ngAfterViewInit runs, queues the microtask that flips viewInitialized
      await Promise.resolve(); // let that microtask (and any NgModel-style deferred writeValue queued earlier) actually run
      fixture.detectChanges();

      fixture.componentInstance.writeValue('#0000ff');
      fixture.detectChanges();

      expect(panelHexInput()!.value).toBe('#00ff00'); // panel keeps its own in-progress state
    });

    it('dragging in the always-visible panel calls onChange, same as the overlay flow', () => {
      const fixture = createInline();
      const onChange = jest.fn();
      fixture.componentInstance.registerOnChange(onChange);

      const area = svArea()!;
      stubRect(area);
      area.dispatchEvent(pointer('pointerdown', 200, 0));
      fixture.detectChanges();

      expect(onChange).toHaveBeenCalledWith('#ff0000');
    });
  });
});
