import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PanelMenuComponent } from './panel-menu.component';
import { TieredMenuItem } from '../tiered-menu/tiered-menu.types';

const renameSpy = jest.fn();
const deleteSpy = jest.fn();

const ITEMS: TieredMenuItem[] = [
  {
    label: 'File',
    items: [
      { label: 'Rename', command: renameSpy },
      { separator: true },
      { label: 'Delete', command: deleteSpy, disabled: true },
    ],
  },
  { label: 'About' },
];

function buttons(fixture: { nativeElement: HTMLElement }): HTMLButtonElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('button'));
}

function buttonByText(fixture: { nativeElement: HTMLElement }, text: string): HTMLButtonElement {
  return buttons(fixture).find((b) => b.textContent?.trim() === text) as HTMLButtonElement;
}

describe('PanelMenuComponent', () => {
  function create(): ComponentFixture<PanelMenuComponent> {
    const fixture = TestBed.createComponent(PanelMenuComponent);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.detectChanges();
    return fixture;
  }

  it('renders only top-level items initially, children collapsed', () => {
    const fixture = create();
    expect(buttons(fixture).map((b) => b.textContent?.trim())).toEqual(['File', 'About']);
  });

  it('clicking a parent item expands it, revealing its children', () => {
    const fixture = create();
    buttonByText(fixture, 'File').click();
    fixture.detectChanges();
    expect(buttons(fixture).map((b) => b.textContent?.trim())).toEqual(['File', 'Rename', 'Delete', 'About']);
    expect(buttonByText(fixture, 'File').getAttribute('aria-expanded')).toBe('true');
  });

  it('clicking an expanded parent again collapses it', () => {
    const fixture = create();
    const fileBtn = buttonByText(fixture, 'File');
    fileBtn.click();
    fixture.detectChanges();
    fileBtn.click();
    fixture.detectChanges();
    expect(buttons(fixture).map((b) => b.textContent?.trim())).toEqual(['File', 'About']);
  });

  it('renders a separator between children', () => {
    const fixture = create();
    buttonByText(fixture, 'File').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="separator"]')).not.toBeNull();
  });

  it('clicking a leaf item calls its command() and emits itemSelect', () => {
    const fixture = create();
    const onItemSelect = jest.fn();
    fixture.componentInstance.itemSelect.subscribe(onItemSelect);

    buttonByText(fixture, 'File').click();
    fixture.detectChanges();
    buttonByText(fixture, 'Rename').click();
    fixture.detectChanges();

    expect(renameSpy).toHaveBeenCalledTimes(1);
    expect(onItemSelect).toHaveBeenCalledWith(ITEMS[0].items![0]);
  });

  it('a disabled leaf item never activates', () => {
    const fixture = create();
    const onItemSelect = jest.fn();
    fixture.componentInstance.itemSelect.subscribe(onItemSelect);

    buttonByText(fixture, 'File').click();
    fixture.detectChanges();
    const deleteBtn = buttonByText(fixture, 'Delete');
    expect(deleteBtn.disabled).toBe(true);
    deleteBtn.click();
    fixture.detectChanges();

    expect(deleteSpy).not.toHaveBeenCalled();
    expect(onItemSelect).not.toHaveBeenCalled();
  });

  it('Enter activates the disclosure toggle (expands a collapsed parent)', () => {
    const fixture = create();
    const fileBtn = buttonByText(fixture, 'File');
    expect(fileBtn.getAttribute('aria-expanded')).toBe('false');

    // The toggle is a real native <button>, so a real browser turns an
    // Enter/Space keydown into a genuine click for free (HTML's own button
    // "activation behavior") — the component has no separate keydown
    // handler by design (see panel-menu-node.component.ts's header comment).
    // jsdom does not implement that native activation behavior, so this
    // dispatches the keydown a keyboard user would send, then the click a
    // real browser would synthesize in response, and asserts on the result.
    fileBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fileBtn.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(fileBtn.getAttribute('aria-expanded')).toBe('true');
    expect(buttons(fixture).map((b) => b.textContent?.trim())).toEqual(['File', 'Rename', 'Delete', 'About']);
  });

  it('Space activates the disclosure toggle (collapses an expanded parent)', () => {
    const fixture = create();
    const fileBtn = buttonByText(fixture, 'File');
    fileBtn.click();
    fixture.detectChanges();
    expect(fileBtn.getAttribute('aria-expanded')).toBe('true');

    // Same native-activation caveat as the Enter test above: jsdom doesn't
    // turn a Space keydown on a <button> into a click on its own.
    fileBtn.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
    fileBtn.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(fileBtn.getAttribute('aria-expanded')).toBe('false');
    expect(buttons(fixture).map((b) => b.textContent?.trim())).toEqual(['File', 'About']);
  });

  it('a disabled parent toggle ignores Enter/Space activation, same as a disabled native button would', () => {
    const items: TieredMenuItem[] = [{ label: 'Locked', disabled: true, items: [{ label: 'Hidden' }] }];
    const fixture = TestBed.createComponent(PanelMenuComponent);
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();

    const lockedBtn = buttonByText(fixture, 'Locked');
    expect(lockedBtn.disabled).toBe(true);

    // A real disabled <button> never fires click at all, so Enter/Space is a
    // dead end natively; this also exercises toggle()'s own `disabled` guard
    // as a second line of defense, in case a click somehow still lands.
    lockedBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    lockedBtn.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(lockedBtn.getAttribute('aria-expanded')).toBe('false');
  });

  it('sets aria-label when provided', () => {
    const fixture = create();
    fixture.componentRef.setInput('ariaLabel', 'Site navigation');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ul')?.getAttribute('aria-label')).toBe('Site navigation');
  });

  it('supports arbitrarily deep nesting', () => {
    const fixture = TestBed.createComponent(PanelMenuComponent);
    fixture.componentRef.setInput('items', [{ label: 'A', items: [{ label: 'B', items: [{ label: 'C' }] }] }]);
    fixture.detectChanges();

    buttonByText(fixture, 'A').click();
    fixture.detectChanges();
    buttonByText(fixture, 'B').click();
    fixture.detectChanges();
    expect(buttonByText(fixture, 'C')).not.toBeUndefined();
  });

  describe('url/target/badge', () => {
    it('renders a leaf item with url as a real <a href>, with a badge alongside it', () => {
      const fixture = TestBed.createComponent(PanelMenuComponent);
      fixture.componentRef.setInput('items', [{ label: 'Docs', url: 'https://example.com/docs', target: '_blank', badge: '3' }]);
      fixture.detectChanges();

      const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
      expect(link.getAttribute('href')).toBe('https://example.com/docs');
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.textContent).toContain('3');
      expect(fixture.nativeElement.querySelector('button')).toBeNull();
    });

    it('a node with children never becomes an <a>, even with a url set', () => {
      const fixture = TestBed.createComponent(PanelMenuComponent);
      fixture.componentRef.setInput('items', [{ label: 'File', url: 'https://example.com', items: [{ label: 'New' }] }]);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('a')).toBeNull();
    });

    it('a disabled item with url renders as a real disabled <button>, never a clickable <a>', () => {
      const fixture = TestBed.createComponent(PanelMenuComponent);
      fixture.componentRef.setInput('items', [{ label: 'Docs', url: 'https://example.com/docs', disabled: true }]);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('a')).toBeNull();
      expect((fixture.nativeElement.querySelector('button') as HTMLButtonElement).disabled).toBe(true);
    });
  });

  describe('programmatic expand control', () => {
    const NESTED_ITEMS: TieredMenuItem[] = [
      { label: 'File', items: [{ label: 'Rename' }, { label: 'Delete' }] },
      { label: 'Edit', items: [{ label: 'Undo' }] },
    ];

    function create(): ComponentFixture<PanelMenuComponent> {
      const fixture = TestBed.createComponent(PanelMenuComponent);
      fixture.componentRef.setInput('items', NESTED_ITEMS);
      fixture.detectChanges();
      return fixture;
    }

    it('starts fully collapsed, expandedItems is an empty Set', () => {
      const fixture = create();
      expect(fixture.componentInstance.expandedItems().size).toBe(0);
      expect(buttonByText(fixture, 'Rename')).toBeUndefined();
    });

    it('clicking a node adds it to expandedItems (model updates, not just internal DOM state)', () => {
      const fixture = create();
      buttonByText(fixture, 'File').click();
      fixture.detectChanges();

      expect(fixture.componentInstance.expandedItems().has(NESTED_ITEMS[0])).toBe(true);
      expect(buttonByText(fixture, 'Rename')).not.toBeUndefined();
    });

    it('setting expandedItems programmatically expands the matching node, by object reference', () => {
      const fixture = create();
      fixture.componentInstance.expandedItems.set(new Set([NESTED_ITEMS[0]]));
      fixture.detectChanges();

      expect(buttonByText(fixture, 'Rename')).not.toBeUndefined();
      expect(buttonByText(fixture, 'Undo')).toBeUndefined(); // "Edit" wasn't in the set
    });

    it('expandAll() expands every node with children, at every depth', () => {
      const fixture = TestBed.createComponent(PanelMenuComponent);
      const items: TieredMenuItem[] = [{ label: 'A', items: [{ label: 'B', items: [{ label: 'C' }] }] }];
      fixture.componentRef.setInput('items', items);
      fixture.detectChanges();

      fixture.componentInstance.expandAll();
      fixture.detectChanges();

      expect(buttonByText(fixture, 'B')).not.toBeUndefined();
      expect(buttonByText(fixture, 'C')).not.toBeUndefined();
      expect(fixture.componentInstance.expandedItems().size).toBe(2); // "A" and "B" have children; "C" doesn't
    });

    it('collapseAll() collapses everything regardless of how it got expanded', () => {
      const fixture = create();
      buttonByText(fixture, 'File').click();
      buttonByText(fixture, 'Edit').click();
      fixture.detectChanges();
      expect(buttonByText(fixture, 'Rename')).not.toBeUndefined();

      fixture.componentInstance.collapseAll();
      fixture.detectChanges();

      expect(fixture.componentInstance.expandedItems().size).toBe(0);
      expect(buttonByText(fixture, 'Rename')).toBeUndefined();
      expect(buttonByText(fixture, 'Undo')).toBeUndefined();
    });
  });
});
