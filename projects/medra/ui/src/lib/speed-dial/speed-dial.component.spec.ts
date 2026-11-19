import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IconComponent } from '../icon/icon.component';
import { SpeedDialComponent } from './speed-dial.component';
import { MenuItem } from '../menu/menu.types';

const editSpy = jest.fn();
const deleteSpy = jest.fn();
const ITEMS: MenuItem[] = [
  { label: 'Edit', icon: 'pencil', command: editSpy },
  { label: 'Delete', icon: 'trash', command: deleteSpy, disabled: true },
];

function buttons(fixture: { nativeElement: HTMLElement }): HTMLButtonElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('button'));
}

function mainButton(fixture: { nativeElement: HTMLElement }): HTMLButtonElement {
  return buttons(fixture)[0];
}

function itemButtons(fixture: { nativeElement: HTMLElement }): HTMLButtonElement[] {
  return buttons(fixture).slice(1);
}

function firePointerDown(el: HTMLElement) {
  const event = Object.assign(new Event('pointerdown', { bubbles: true }), { clientX: 5, clientY: 5 });
  el.dispatchEvent(event as PointerEvent);
}

describe('SpeedDialComponent', () => {
  let animateSpy: jest.Mock;

  beforeEach(() => {
    animateSpy = jest.fn().mockReturnValue({ finished: Promise.resolve() });
    HTMLElement.prototype.animate = animateSpy as unknown as HTMLElement['animate'];
  });

  afterEach(() => {
    delete (HTMLElement.prototype as { animate?: unknown }).animate;
  });

  function create(): ComponentFixture<SpeedDialComponent> {
    const fixture = TestBed.createComponent(SpeedDialComponent);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the main button plus one button per item, closed by default', () => {
    const fixture = create();
    expect(buttons(fixture).length).toBe(3);
    expect(mainButton(fixture).getAttribute('aria-expanded')).toBe('false');
  });

  it('triggers the ripple effect on the main button on pointerdown (Ripple adoption)', () => {
    const fixture = create();
    firePointerDown(mainButton(fixture));
    expect(animateSpy).toHaveBeenCalledTimes(1);
  });

  it('triggers the ripple effect on an enabled item button, but not on the disabled one', () => {
    const fixture = create();
    mainButton(fixture).click();
    fixture.detectChanges();

    const [editButton, deleteButton] = itemButtons(fixture); // 'Delete' is disabled
    firePointerDown(editButton);
    expect(animateSpy).toHaveBeenCalledTimes(1);

    firePointerDown(deleteButton);
    expect(animateSpy).toHaveBeenCalledTimes(1);
  });

  it('clicking the main button opens the dial, setting aria-expanded and a real tabIndex on items', () => {
    const fixture = create();
    mainButton(fixture).click();
    fixture.detectChanges();

    expect(mainButton(fixture).getAttribute('aria-expanded')).toBe('true');
    expect(itemButtons(fixture).every((b) => b.tabIndex === 0)).toBe(true);
  });

  it('closed items are out of the tab order (tabIndex -1)', () => {
    const fixture = create();
    expect(itemButtons(fixture).every((b) => b.tabIndex === -1)).toBe(true);
  });

  it('clicking the main button again closes it', () => {
    const fixture = create();
    const btn = mainButton(fixture);
    btn.click();
    fixture.detectChanges();
    btn.click();
    fixture.detectChanges();
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('clicking an item calls its command(), emits itemSelect, and closes the dial', () => {
    const fixture = create();
    const onItemSelect = jest.fn();
    fixture.componentInstance.itemSelect.subscribe(onItemSelect);

    mainButton(fixture).click();
    fixture.detectChanges();
    itemButtons(fixture)[0].click(); // Edit
    fixture.detectChanges();

    expect(editSpy).toHaveBeenCalledTimes(1);
    expect(onItemSelect).toHaveBeenCalledWith(ITEMS[0]);
    expect(mainButton(fixture).getAttribute('aria-expanded')).toBe('false');
  });

  it('opening moves focus to the first enabled item button (Wave 2 fix)', () => {
    const fixture = create();
    mainButton(fixture).click();
    fixture.detectChanges();
    expect(document.activeElement).toBe(itemButtons(fixture)[0]); // 'Edit', the first enabled item
  });

  it('Escape closes the dial and returns focus to the main button', () => {
    const fixture = create();
    mainButton(fixture).click();
    fixture.detectChanges();

    itemButtons(fixture)[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(mainButton(fixture).getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(mainButton(fixture));
  });

  it('activating an item returns focus to the main button (dial closes)', () => {
    const fixture = create();
    mainButton(fixture).click();
    fixture.detectChanges();
    itemButtons(fixture)[0].click();
    fixture.detectChanges();

    expect(document.activeElement).toBe(mainButton(fixture));
  });

  it('ArrowRight/ArrowDown move focus to the next enabled item, wrapping and skipping disabled', () => {
    const fixture = create();
    mainButton(fixture).click();
    fixture.detectChanges();
    // Only 'Edit' is enabled ('Delete' is disabled) — ArrowRight should wrap back to 'Edit' itself.
    itemButtons(fixture)[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(itemButtons(fixture)[0]);
  });

  it('Home/End jump to the first/last enabled item', () => {
    const fixture = create();
    mainButton(fixture).click();
    fixture.detectChanges();
    itemButtons(fixture)[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(itemButtons(fixture)[0]); // only enabled item

    itemButtons(fixture)[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(itemButtons(fixture)[0]);
  });

  it('a disabled item is a real disabled button and never activates', () => {
    const fixture = create();
    mainButton(fixture).click();
    fixture.detectChanges();
    const deleteBtn = itemButtons(fixture)[1];
    expect(deleteBtn.disabled).toBe(true);

    deleteBtn.click();
    fixture.detectChanges();
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it('disabled: the main button never opens the dial', () => {
    const fixture = create();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    mainButton(fixture).click();
    fixture.detectChanges();
    expect(mainButton(fixture).getAttribute('aria-expanded')).toBe('false');
  });

  it('sets aria-label on the main button via toggleLabel', () => {
    const fixture = create();
    fixture.componentRef.setInput('toggleLabel', 'Show quick actions');
    fixture.detectChanges();
    expect(mainButton(fixture).getAttribute('aria-label')).toBe('Show quick actions');
  });

  it('each item button gets its own aria-label from the item label', () => {
    const fixture = create();
    const labels = itemButtons(fixture).map((b) => b.getAttribute('aria-label'));
    expect(labels).toEqual(['Edit', 'Delete']);
  });

  describe('mask', () => {
    it('renders no backdrop when closed, even if mask is true', () => {
      const fixture = create();
      fixture.componentRef.setInput('mask', true);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.fixed.inset-0')).toBeNull();
    });

    it('renders a backdrop once open, only when mask is true', () => {
      const fixture = create();
      fixture.componentRef.setInput('mask', true);
      fixture.detectChanges();
      mainButton(fixture).click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.fixed.inset-0')).not.toBeNull();
    });

    it('does not render a backdrop when open with mask false (default)', () => {
      const fixture = create();
      mainButton(fixture).click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.fixed.inset-0')).toBeNull();
    });

    it('clicking the backdrop closes the dial', () => {
      const fixture = create();
      fixture.componentRef.setInput('mask', true);
      fixture.detectChanges();
      mainButton(fixture).click();
      fixture.detectChanges();

      (fixture.nativeElement.querySelector('.fixed.inset-0') as HTMLElement).click();
      fixture.detectChanges();

      expect(mainButton(fixture).getAttribute('aria-expanded')).toBe('false');
    });
  });

  describe('transitionDelay', () => {
    it('staggers each item button transition-delay by its index, 0 by default', () => {
      const fixture = create();
      const delays = itemButtons(fixture).map((b) => b.style.transitionDelay);
      expect(delays).toEqual(['0ms', '0ms']);
    });

    it('multiplies the given delay by each item index', () => {
      const fixture = create();
      fixture.componentRef.setInput('transitionDelay', 50);
      fixture.detectChanges();
      const delays = itemButtons(fixture).map((b) => b.style.transitionDelay);
      expect(delays).toEqual(['0ms', '50ms']);
    });
  });

  // @scenario UI-005.S2
  describe('radial type, icons, and visible model', () => {
    it('positions items with polar transform coordinates when type is radial and visible is true', () => {
      const fixture = create();
      fixture.componentRef.setInput('type', 'circle');
      fixture.componentRef.setInput('radius', 80);
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      expect(mainButton(fixture).getAttribute('aria-expanded')).toBe('true');
      const transforms = itemButtons(fixture).map((b) => b.style.transform);
      expect(transforms[0]).toContain('translate(');
      expect(transforms[1]).toContain('translate(');
      expect(transforms[0]).not.toBe(transforms[1]);
    });

    it('supports semi-circle and quarter-circle radial layouts and updates visible model on toggle', () => {
      const fixture = create();
      fixture.componentRef.setInput('type', 'semi-circle');
      fixture.componentRef.setInput('radius', 60);
      fixture.detectChanges();

      expect(fixture.componentInstance.visible()).toBe(false);
      mainButton(fixture).click();
      fixture.detectChanges();
      expect(fixture.componentInstance.visible()).toBe(true);
      expect(itemButtons(fixture)[0].style.transform).toContain('translate(');

      fixture.componentRef.setInput('type', 'quarter-circle');
      fixture.detectChanges();
      expect(itemButtons(fixture)[1].style.transform).toContain('translate(');
    });

    it('switches between showIcon and hideIcon based on open state', () => {
      const fixture = create();
      fixture.componentRef.setInput('showIcon', 'plus');
      fixture.componentRef.setInput('hideIcon', 'x-mark');
      fixture.detectChanges();

      const mainIcon = () =>
        (fixture.debugElement.query(By.directive(IconComponent)).componentInstance as IconComponent).name();

      expect(mainIcon()).toBe('plus');
      mainButton(fixture).click();
      fixture.detectChanges();
      expect(mainIcon()).toBe('x-mark');
    });
  });
});
