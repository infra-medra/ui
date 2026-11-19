import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OrderListComponent } from './order-list.component';

@Component({
  standalone: true,
  imports: [OrderListComponent],
  template: `
    <med-order-list [(value)]="value" [(selection)]="selection" [disabled]="disabled" header="Items">
      <ng-template let-item>{{ item }}</ng-template>
    </med-order-list>
  `,
})
class HostComponent {
  value: string[] = ['Apple', 'Banana', 'Cherry', 'Durian'];
  selection: string[] = [];
  disabled = false;
}

function list(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('[role="listbox"]') as HTMLElement;
}

function itemsIn(listEl: HTMLElement): HTMLElement[] {
  return Array.from(listEl.querySelectorAll('[role="option"]'));
}

function labelOf(el: HTMLElement): string {
  return el.textContent?.trim() ?? '';
}

function moveButton(fixture: { nativeElement: HTMLElement }, label: string): HTMLButtonElement {
  return fixture.nativeElement.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement;
}

function create(configure?: (h: HostComponent) => void) {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

describe('OrderListComponent', () => {
  it('renders the items in order', () => {
    const fixture = create();
    expect(itemsIn(list(fixture)).map(labelOf)).toEqual(['Apple', 'Banana', 'Cherry', 'Durian']);
  });

  it('clicking an item selects it (aria-selected), clicking again deselects it', () => {
    const fixture = create();
    const apple = itemsIn(list(fixture))[0];
    expect(apple.getAttribute('aria-selected')).toBe('false');

    apple.click();
    fixture.detectChanges();
    expect(apple.getAttribute('aria-selected')).toBe('true');

    apple.click();
    fixture.detectChanges();
    expect(itemsIn(list(fixture))[0].getAttribute('aria-selected')).toBe('false');
  });

  it('roving tabindex: only one option is in the tab order at a time, starting at the first', () => {
    const fixture = create();
    const options = itemsIn(list(fixture));
    expect(options.map((o) => o.tabIndex)).toEqual([0, -1, -1, -1]);
  });

  it('ArrowDown/ArrowUp move focus and the roving tabindex, wrapping at the ends (Wave 2 fix)', () => {
    const fixture = create();
    const options = itemsIn(list(fixture));

    options[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(itemsIn(list(fixture))[1]);
    expect(itemsIn(list(fixture)).map((o) => o.tabIndex)).toEqual([-1, 0, -1, -1]);

    itemsIn(list(fixture))[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(itemsIn(list(fixture))[0]);
  });

  it('Home/End jump focus to the first/last option', () => {
    const fixture = create();
    const options = itemsIn(list(fixture));

    options[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(itemsIn(list(fixture))[3]); // 'Durian', the last item

    itemsIn(list(fixture))[3].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(itemsIn(list(fixture))[0]);
  });

  it('Enter/Space toggle selection on the focused option, same as a click', () => {
    const fixture = create();
    const apple = itemsIn(list(fixture))[0];

    apple.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(itemsIn(list(fixture))[0].getAttribute('aria-selected')).toBe('true');

    itemsIn(list(fixture))[0].dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(itemsIn(list(fixture))[0].getAttribute('aria-selected')).toBe('false');
  });

  it('Move up swaps the selected item with its predecessor', () => {
    const fixture = create();
    itemsIn(list(fixture))[1].click(); // Banana
    fixture.detectChanges();

    moveButton(fixture, 'Move up').click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value).toEqual(['Banana', 'Apple', 'Cherry', 'Durian']);
  });

  it('Move down swaps the selected item with its successor', () => {
    const fixture = create();
    itemsIn(list(fixture))[1].click(); // Banana
    fixture.detectChanges();

    moveButton(fixture, 'Move down').click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value).toEqual(['Apple', 'Cherry', 'Banana', 'Durian']);
  });

  it('moves a multi-selection up together as one block, keeping relative order', () => {
    const fixture = create();
    const items = itemsIn(list(fixture));
    items[2].click(); // Cherry
    fixture.detectChanges();
    itemsIn(list(fixture))[3].click(); // Durian
    fixture.detectChanges();

    moveButton(fixture, 'Move up').click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value).toEqual(['Apple', 'Cherry', 'Durian', 'Banana']);
  });

  it('Move to top sends the selection to the start, keeping relative order', () => {
    const fixture = create();
    const items = itemsIn(list(fixture));
    items[1].click(); // Banana
    fixture.detectChanges();
    itemsIn(list(fixture))[3].click(); // Durian
    fixture.detectChanges();

    moveButton(fixture, 'Move to top').click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value).toEqual(['Banana', 'Durian', 'Apple', 'Cherry']);
  });

  it('Move to bottom sends the selection to the end, keeping relative order', () => {
    const fixture = create();
    const items = itemsIn(list(fixture));
    items[0].click(); // Apple
    fixture.detectChanges();
    itemsIn(list(fixture))[2].click(); // Cherry
    fixture.detectChanges();

    moveButton(fixture, 'Move to bottom').click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value).toEqual(['Banana', 'Durian', 'Apple', 'Cherry']);
  });

  it('Move up/down are disabled when the selection already touches that edge', () => {
    const fixture = create();
    const items = itemsIn(list(fixture));
    items[0].click(); // Apple, already at the top
    fixture.detectChanges();
    expect(moveButton(fixture, 'Move up').disabled).toBe(true);
    expect(moveButton(fixture, 'Move down').disabled).toBe(false);

    items[0].click(); // deselect Apple
    fixture.detectChanges();
    itemsIn(list(fixture))[3].click(); // Durian, already at the bottom
    fixture.detectChanges();
    expect(moveButton(fixture, 'Move down').disabled).toBe(true);
    expect(moveButton(fixture, 'Move up').disabled).toBe(false);
  });

  it('Move buttons are disabled when nothing is selected', () => {
    const fixture = create();
    expect(moveButton(fixture, 'Move up').disabled).toBe(true);
    expect(moveButton(fixture, 'Move down').disabled).toBe(true);
    expect(moveButton(fixture, 'Move to top').disabled).toBe(true);
    expect(moveButton(fixture, 'Move to bottom').disabled).toBe(true);
  });

  it('shows the empty label when there are no items', () => {
    const fixture = create((h) => (h.value = []));
    expect(list(fixture).textContent).toContain('No items');
  });

  describe('drag-and-drop reordering', () => {
    function dragEvent(type: string): DragEvent {
      const event = new Event(type, { bubbles: true, cancelable: true }) as DragEvent;
      Object.defineProperty(event, 'dataTransfer', { value: { effectAllowed: '', setData: jest.fn() }, configurable: true });
      return event;
    }

    function drag(fixture: { nativeElement: HTMLElement }, fromIndex: number, toIndex: number): void {
      const items = itemsIn(list(fixture));
      items[fromIndex].dispatchEvent(dragEvent('dragstart'));
      items[toIndex].dispatchEvent(dragEvent('dragover'));
      items[toIndex].dispatchEvent(dragEvent('drop'));
      items[fromIndex].dispatchEvent(dragEvent('dragend'));
    }

    it('every option is draggable by default', () => {
      const fixture = create();
      expect(itemsIn(list(fixture)).every((el) => el.draggable)).toBe(true);
    });

    it('dragging one item onto another moves just that single item to the drop position, ignoring selection', () => {
      const fixture = create();
      drag(fixture, 0, 2); // Apple dropped on Cherry's slot
      fixture.detectChanges();
      expect(fixture.componentInstance.value).toEqual(['Banana', 'Cherry', 'Apple', 'Durian']);
    });

    it('dragging onto its own position is a no-op', () => {
      const fixture = create();
      drag(fixture, 1, 1);
      fixture.detectChanges();
      expect(fixture.componentInstance.value).toEqual(['Apple', 'Banana', 'Cherry', 'Durian']);
    });

    it('dragdrop="false" makes every option non-draggable, without affecting the button controls', () => {
      @Component({
        standalone: true,
        imports: [OrderListComponent],
        template: `
          <med-order-list [(value)]="value" [dragdrop]="false" header="Items">
            <ng-template let-item>{{ item }}</ng-template>
          </med-order-list>
        `,
      })
      class NoDragHost {
        value: string[] = ['Apple', 'Banana', 'Cherry', 'Durian'];
      }

      const fixture = TestBed.createComponent(NoDragHost);
      fixture.detectChanges();

      expect(itemsIn(list(fixture)).every((el) => el.draggable)).toBe(false);

      itemsIn(list(fixture))[1].click(); // Banana
      fixture.detectChanges();
      moveButton(fixture, 'Move up').click();
      fixture.detectChanges();
      expect(fixture.componentInstance.value).toEqual(['Banana', 'Apple', 'Cherry', 'Durian']);
    });
  });

  describe('selection/disabled', () => {
    it('selection is a public, [(selection)]-bindable model reflecting clicks', () => {
      const fixture = create();
      expect(fixture.componentInstance.selection).toEqual([]);

      itemsIn(list(fixture))[0].click(); // Apple
      fixture.detectChanges();
      expect(fixture.componentInstance.selection).toEqual(['Apple']);

      itemsIn(list(fixture))[2].click(); // Cherry
      fixture.detectChanges();
      expect(fixture.componentInstance.selection).toEqual(['Apple', 'Cherry']);
    });

    it('driving selection from the outside selects the matching options (aria-selected)', () => {
      const fixture = create((h) => (h.selection = ['Banana']));
      const options = itemsIn(list(fixture));
      expect(options[0].getAttribute('aria-selected')).toBe('false'); // Apple
      expect(options[1].getAttribute('aria-selected')).toBe('true'); // Banana
    });

    it('disabled blocks click-to-select', () => {
      const fixture = create((h) => (h.disabled = true));
      itemsIn(list(fixture))[0].click(); // Apple
      fixture.detectChanges();
      expect(fixture.componentInstance.selection).toEqual([]);
    });

    it('disabled disables every move button regardless of selection', () => {
      const fixture = create((h) => {
        h.disabled = true;
        h.selection = ['Banana'];
      });
      fixture.detectChanges();
      expect(moveButton(fixture, 'Move up').disabled).toBe(true);
      expect(moveButton(fixture, 'Move down').disabled).toBe(true);
      expect(moveButton(fixture, 'Move to top').disabled).toBe(true);
      expect(moveButton(fixture, 'Move to bottom').disabled).toBe(true);
    });

    it('disabled removes every option from the tab order', () => {
      const fixture = create((h) => (h.disabled = true));
      expect(itemsIn(list(fixture)).every((el) => el.tabIndex === -1)).toBe(true);
    });

    it('disabled makes every option non-draggable', () => {
      const fixture = create((h) => (h.disabled = true));
      expect(itemsIn(list(fixture)).every((el) => !el.draggable)).toBe(true);
    });

    it('disabled sets aria-disabled on the listbox', () => {
      const fixture = create((h) => (h.disabled = true));
      expect(list(fixture).getAttribute('aria-disabled')).toBe('true');
    });

    it('enabled (default) leaves aria-disabled unset', () => {
      const fixture = create();
      expect(list(fixture).hasAttribute('aria-disabled')).toBe(false);
    });
  });

  // @scenario UI-008.S2
  describe('filterBy and stripedRows (Wave 2)', () => {
    @Component({
      standalone: true,
      imports: [OrderListComponent],
      template: `
        <med-order-list [(value)]="items" filterBy="name" [stripedRows]="true">
          <ng-template let-item>{{ item.name }}</ng-template>
        </med-order-list>
      `,
    })
    class FilterStripedHostComponent {
      items = [{ name: 'Alpha' }, { name: 'Beta' }, { name: 'Apricot' }];
    }

    it('filters items by filterBy field and applies stripedRows classes', () => {
      const fixture = TestBed.createComponent(FilterStripedHostComponent);
      fixture.detectChanges();

      const options = Array.from(fixture.nativeElement.querySelectorAll('[role="option"]')) as HTMLElement[];
      expect(options[1].className).toContain('bg-surface-50');

      const search = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
      expect(search).not.toBeNull();
      search.value = 'ap';
      search.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const filtered = Array.from(fixture.nativeElement.querySelectorAll('[role="option"]')) as HTMLElement[];
      expect(filtered.map((el) => el.textContent?.trim())).toEqual(['Apricot']);
    });
  });
});
