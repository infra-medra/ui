import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MenuItem } from '../menu/menu.types';
import { DockComponent } from './dock.component';

const ITEMS: MenuItem[] = [
  { label: 'Finder', icon: 'folder' },
  { label: 'Mail', icon: 'envelope' },
  { label: 'Settings', icon: 'cog', disabled: true },
  { label: 'Trash', icon: 'trash' },
];

@Component({
  standalone: true,
  imports: [DockComponent],
  template: `<med-dock [items]="items" />`,
})
class HostComponent {
  items: MenuItem[] = ITEMS;
}

function buttons(fixture: { nativeElement: HTMLElement }): HTMLButtonElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('button'));
}

// Configure host fields BEFORE the single detectChanges() call, one fresh
// fixture per test case — mutating componentInstance.items and calling
// detectChanges() a second time left the @for loop's bound `item` stuck on
// the stale object in practice (see jest-ng0100-host-field-mutation memory:
// same underlying trap, this time manifesting as a silent stale binding
// rather than NG0100).
function create(configure?: (h: HostComponent) => void) {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

describe('DockComponent', () => {
  it('renders one button per item, labeled for accessibility from item.label', () => {
    const fixture = create();
    expect(buttons(fixture).map((b) => b.getAttribute('aria-label'))).toEqual(['Finder', 'Mail', 'Settings', 'Trash']);
  });

  it('role="toolbar" on the container', () => {
    const fixture = create();
    expect(fixture.nativeElement.querySelector('[role="toolbar"]')).not.toBeNull();
  });

  it('every item starts at scale(1) with nothing hovered', () => {
    const fixture = create();
    expect(buttons(fixture).every((b) => b.style.transform === 'scale(1)')).toBe(true);
  });

  it('hovering an item scales it up, and applies a smaller falloff to its neighbors', () => {
    const fixture = create();
    buttons(fixture)[1].dispatchEvent(new Event('pointerenter'));
    fixture.detectChanges();

    const scales = buttons(fixture).map((b) => b.style.transform);
    expect(scales[1]).toBe('scale(1.5)'); // hovered item itself
    expect(scales[0]).toBe('scale(1.25)'); // immediate neighbor
    expect(scales[2]).toBe('scale(1.25)'); // immediate neighbor
    expect(scales[3]).toBe('scale(1.1)'); // two away
  });

  it('leaving the dock resets every item back to scale(1)', () => {
    const fixture = create();
    buttons(fixture)[1].dispatchEvent(new Event('pointerenter'));
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('[role="toolbar"]') as HTMLElement).dispatchEvent(new Event('pointerleave'));
    fixture.detectChanges();

    expect(buttons(fixture).every((b) => b.style.transform === 'scale(1)')).toBe(true);
  });

  it('keyboard focus magnifies an item the same way pointer hover does (Wave 2 fix)', () => {
    const fixture = create();
    buttons(fixture)[1].dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    const scales = buttons(fixture).map((b) => b.style.transform);
    expect(scales[1]).toBe('scale(1.5)');
    expect(scales[0]).toBe('scale(1.25)');
  });

  it('blurring an item resets every item back to scale(1)', () => {
    const fixture = create();
    buttons(fixture)[1].dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    buttons(fixture)[1].dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(buttons(fixture).every((b) => b.style.transform === 'scale(1)')).toBe(true);
  });

  it('clicking an item runs its command', () => {
    const command = jest.fn();
    const fixture = create((h) => (h.items = [...ITEMS.slice(0, 3), { ...ITEMS[3], command }]));

    buttons(fixture)[3].click();
    expect(command).toHaveBeenCalledTimes(1);
  });

  it('a disabled item is a real disabled <button> and never runs its command', () => {
    const command = jest.fn();
    const fixture = create((h) => (h.items = [...ITEMS.slice(0, 2), { ...ITEMS[2], command }, ITEMS[3]]));

    const disabledButton = buttons(fixture)[2];
    expect(disabledButton.disabled).toBe(true);
    disabledButton.click();
    expect(command).not.toHaveBeenCalled();
  });

  it('roving tabindex: only one item is in the Tab order at a time, starting with the first item', () => {
    const fixture = create();
    expect(buttons(fixture).map((b) => b.tabIndex)).toEqual([0, -1, -1, -1]);
  });

  it('ArrowRight moves the roving tab stop to (and focuses) the next enabled item, skipping a disabled one', () => {
    const fixture = create();
    const btns = buttons(fixture);
    btns[0].dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    btns[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(btns[1]);
    expect(buttons(fixture).map((b) => b.tabIndex)).toEqual([-1, 0, -1, -1]);

    // Settings (index 2) is disabled, so ArrowRight from Mail jumps straight to Trash.
    btns[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(btns[3]);
  });

  it('ArrowLeft from the first item wraps around to the last enabled item', () => {
    const fixture = create();
    const btns = buttons(fixture);
    btns[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(btns[3]);
  });

  it('Home/End jump the roving tab stop to the first/last enabled item', () => {
    const fixture = create();
    const btns = buttons(fixture);
    btns[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(btns[3]);

    btns[3].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(btns[0]);
  });
});

describe('DockComponent #item', () => {
  @Component({
    standalone: true,
    imports: [DockComponent],
    template: `
      <med-dock [items]="items">
        <ng-template #item let-menuItem>
          <span class="item-marker">{{ menuItem.label }}</span>
        </ng-template>
      </med-dock>
    `,
  })
  class ItemTemplateHostComponent {
    items: MenuItem[] = ITEMS;
  }

  it('renders the default med-icon when no #item template is projected', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('med-icon')).not.toBeNull();
  });

  it('renders the projected #item template with the item as context instead of the default icon', () => {
    const fixture = TestBed.createComponent(ItemTemplateHostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('med-icon')).toBeNull();
    const markers = Array.from(fixture.nativeElement.querySelectorAll('.item-marker')) as HTMLElement[];
    expect(markers.map((el) => el.textContent)).toEqual(['Finder', 'Mail', 'Settings', 'Trash']);
  });
});
