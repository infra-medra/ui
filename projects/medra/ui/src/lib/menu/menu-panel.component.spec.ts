import { TestBed } from '@angular/core/testing';
import { MenuPanelComponent } from './menu-panel.component';
import { MenuItem } from './menu.types';

function createPanel(items: MenuItem[]) {
  const fixture = TestBed.createComponent(MenuPanelComponent);
  fixture.componentRef.setInput('panelId', 'med-menu-panel-test');
  fixture.componentRef.setInput('items', items);
  fixture.detectChanges();
  const list = fixture.nativeElement.querySelector('[role="menu"]') as HTMLElement;
  return { fixture, list };
}

function keydown(fixture: { detectChanges: () => void }, el: HTMLElement, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  fixture.detectChanges();
}

const ITEMS: MenuItem[] = [
  { label: 'Rename' },
  { label: 'Duplicate' },
  { separator: true },
  { label: 'Archive', disabled: true },
  { label: 'Delete' },
];

describe('MenuPanelComponent', () => {
  it('renders separators as role="separator", not role="menuitem"', () => {
    const { fixture } = createPanel(ITEMS);
    expect(fixture.nativeElement.querySelectorAll('[role="menuitem"]').length).toBe(4);
    expect(fixture.nativeElement.querySelectorAll('[role="separator"]').length).toBe(1);
  });

  it('starts active on the first enabled item', () => {
    const { list } = createPanel(ITEMS);
    expect(list.getAttribute('aria-activedescendant')).toBe('med-menu-panel-test-item-0');
  });

  it('ArrowDown moves to the next item, skipping the separator and disabled items', () => {
    const { fixture, list } = createPanel(ITEMS);
    keydown(fixture, list, 'ArrowDown'); // Rename(0) -> Duplicate(1)
    expect(list.getAttribute('aria-activedescendant')).toBe('med-menu-panel-test-item-1');
    keydown(fixture, list, 'ArrowDown'); // Duplicate(1) -> separator(2) & Archive(3) skipped -> Delete(4)
    expect(list.getAttribute('aria-activedescendant')).toBe('med-menu-panel-test-item-4');
  });

  it('ArrowUp wraps from the first enabled item to the last', () => {
    const { fixture, list } = createPanel(ITEMS);
    keydown(fixture, list, 'ArrowUp');
    expect(list.getAttribute('aria-activedescendant')).toBe('med-menu-panel-test-item-4');
  });

  it('Enter activates the active item: calls command() and emits itemActivated', () => {
    const { fixture, list } = createPanel(ITEMS);
    const commandSpy = jest.fn();
    const items: MenuItem[] = [{ label: 'Rename', command: commandSpy }, ...ITEMS.slice(1)];
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();

    const received: MenuItem[] = [];
    fixture.componentInstance.itemActivated.subscribe((item) => received.push(item));

    keydown(fixture, list, 'Enter');

    expect(commandSpy).toHaveBeenCalledTimes(1);
    expect(received).toEqual([items[0]]);
  });

  it('never activates a disabled item, even via a direct pointerdown', () => {
    const { fixture } = createPanel(ITEMS);
    const received: MenuItem[] = [];
    fixture.componentInstance.itemActivated.subscribe((item) => received.push(item));

    const archiveRow = fixture.nativeElement.querySelectorAll('[role="menuitem"]')[2] as HTMLElement; // Archive (disabled)
    archiveRow.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));

    expect(received).toEqual([]);
  });

  it('clicking (pointerdown) an enabled item activates it', () => {
    const { fixture } = createPanel(ITEMS);
    const received: MenuItem[] = [];
    fixture.componentInstance.itemActivated.subscribe((item) => received.push(item));

    const duplicateRow = fixture.nativeElement.querySelectorAll('[role="menuitem"]')[1] as HTMLElement;
    duplicateRow.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));

    expect(received).toEqual([{ label: 'Duplicate' }]);
  });

  it('Tab emits closeRequested', () => {
    const { fixture, list } = createPanel(ITEMS);
    const closeRequested = jest.fn();
    fixture.componentInstance.closeRequested.subscribe(closeRequested);

    keydown(fixture, list, 'Tab');

    expect(closeRequested).toHaveBeenCalledTimes(1);
  });

  it('Home/End jump to the first/last enabled item', () => {
    const { fixture, list } = createPanel(ITEMS);
    keydown(fixture, list, 'End');
    expect(list.getAttribute('aria-activedescendant')).toBe('med-menu-panel-test-item-4');
    keydown(fixture, list, 'Home');
    expect(list.getAttribute('aria-activedescendant')).toBe('med-menu-panel-test-item-0');
  });

  it('moves DOM focus into the list itself on init, not just aria-activedescendant', () => {
    const { list } = createPanel(ITEMS);
    expect(document.activeElement).toBe(list);
  });

  it('renders an item with url as a real <a href>, with target when given', () => {
    const { fixture } = createPanel([{ label: 'Docs', url: 'https://example.com/docs', target: '_blank' }]);
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('https://example.com/docs');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.textContent?.trim()).toBe('Docs');
  });

  it('renders a plain <span> label, not an <a>, when there is no url', () => {
    const { fixture } = createPanel([{ label: 'Rename' }]);
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="menuitem"] span.truncate')?.textContent?.trim()).toBe('Rename');
  });

  it('a url item still calls command() and emits itemActivated on click, same as any other item', () => {
    const command = jest.fn();
    const { fixture } = createPanel([{ label: 'Docs', url: 'https://example.com/docs', command }]);
    const received: MenuItem[] = [];
    fixture.componentInstance.itemActivated.subscribe((item) => received.push(item));

    fixture.nativeElement.querySelector('[role="menuitem"]')!.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));

    expect(command).toHaveBeenCalledTimes(1);
    expect(received).toHaveLength(1);
  });

  it('renders a badge next to the label when given', () => {
    const { fixture } = createPanel([{ label: 'Inbox', badge: '3' }]);
    expect(fixture.nativeElement.querySelector('[role="menuitem"]')!.textContent).toContain('Inbox');
    expect(fixture.nativeElement.querySelector('[role="menuitem"]')!.textContent).toContain('3');
  });
});
