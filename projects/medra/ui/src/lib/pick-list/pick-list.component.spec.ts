import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PickListComponent } from './pick-list.component';

@Component({
  standalone: true,
  imports: [PickListComponent],
  template: `
    <med-pick-list [(source)]="source" [(target)]="target">
      <ng-template let-item>{{ item }}</ng-template>
    </med-pick-list>
  `,
})
class HostComponent {
  source: string[] = ['Apple', 'Banana', 'Cherry'];
  target: string[] = [];
}

function lists(fixture: { nativeElement: HTMLElement }): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('[role="listbox"]'));
}

function itemsIn(list: HTMLElement): HTMLElement[] {
  return Array.from(list.querySelectorAll('[role="option"]'));
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

describe('PickListComponent', () => {
  it('renders source items in the first list, target items in the second', () => {
    const fixture = create((h) => (h.target = ['Durian']));
    const [source, target] = lists(fixture);
    expect(itemsIn(source).map(labelOf)).toEqual(['Apple', 'Banana', 'Cherry']);
    expect(itemsIn(target).map(labelOf)).toEqual(['Durian']);
  });

  it('clicking an item selects it (aria-selected), clicking again deselects it', () => {
    const fixture = create();
    const [source] = lists(fixture);
    const apple = itemsIn(source)[0];
    expect(apple.getAttribute('aria-selected')).toBe('false');

    apple.click();
    fixture.detectChanges();
    expect(apple.getAttribute('aria-selected')).toBe('true');

    apple.click();
    fixture.detectChanges();
    expect(itemsIn(lists(fixture)[0])[0].getAttribute('aria-selected')).toBe('false');
  });

  it('roving tabindex and arrow-key navigation work independently per list (Wave 2 fix)', () => {
    const fixture = create();
    const [sourceList] = lists(fixture);
    const sourceItems = itemsIn(sourceList);
    expect(sourceItems.map((o) => o.tabIndex)).toEqual([0, -1, -1]);

    sourceItems[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(itemsIn(lists(fixture)[0])[1]);
  });

  it('Home/End move focus to the first/last item in a list', () => {
    const fixture = create();
    const sourceItems = itemsIn(lists(fixture)[0]);

    sourceItems[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(itemsIn(lists(fixture)[0])[2]); // 'Cherry'
  });

  it('Enter/Space toggle selection on the focused option', () => {
    const fixture = create();
    const apple = itemsIn(lists(fixture)[0])[0];

    apple.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(itemsIn(lists(fixture)[0])[0].getAttribute('aria-selected')).toBe('true');
  });

  it('Move (selected) transfers only the selected items to the target', () => {
    const fixture = create();
    const [source] = lists(fixture);
    itemsIn(source)[0].click(); // Apple
    fixture.detectChanges();

    moveButton(fixture, 'Move selected to target').click();
    fixture.detectChanges();

    expect(fixture.componentInstance.source).toEqual(['Banana', 'Cherry']);
    expect(fixture.componentInstance.target).toEqual(['Apple']);
  });

  it('Move all transfers every source item regardless of selection', () => {
    const fixture = create();
    moveButton(fixture, 'Move all to target').click();
    fixture.detectChanges();

    expect(fixture.componentInstance.source).toEqual([]);
    expect(fixture.componentInstance.target).toEqual(['Apple', 'Banana', 'Cherry']);
  });

  it('double-clicking a single item transfers it immediately, ignoring selection', () => {
    const fixture = create();
    const [source] = lists(fixture);
    itemsIn(source)[1].click(); // select Banana
    fixture.detectChanges();
    itemsIn(source)[2].dispatchEvent(new MouseEvent('dblclick', { bubbles: true })); // double-click Cherry
    fixture.detectChanges();

    expect(fixture.componentInstance.target).toEqual(['Cherry']);
    expect(fixture.componentInstance.source).toEqual(['Apple', 'Banana']);
  });

  it('moving to target clears the source selection', () => {
    const fixture = create();
    const [source] = lists(fixture);
    itemsIn(source)[0].click();
    fixture.detectChanges();
    moveButton(fixture, 'Move selected to target').click();
    fixture.detectChanges();

    expect(moveButton(fixture, 'Move selected to target').disabled).toBe(true);
  });

  it('the Move buttons are disabled when there is nothing to move', () => {
    const fixture = create((h) => (h.source = []));
    expect(moveButton(fixture, 'Move selected to target').disabled).toBe(true);
    expect(moveButton(fixture, 'Move all to target').disabled).toBe(true);
  });

  it('moving back to source works the same way in reverse', () => {
    const fixture = create((h) => (h.target = ['Durian', 'Elderberry']));
    moveButton(fixture, 'Move all to source').click();
    fixture.detectChanges();

    expect(fixture.componentInstance.target).toEqual([]);
    expect(fixture.componentInstance.source).toEqual(['Apple', 'Banana', 'Cherry', 'Durian', 'Elderberry']);
  });

  it('shows the empty label when a list has no items', () => {
    const fixture = create();
    const [, target] = lists(fixture);
    expect(target.textContent).toContain('No items');
  });

  describe('reordering within a list (buttons)', () => {
    it('Move up — Available swaps the selected item with its predecessor, within source only', () => {
      const fixture = create();
      itemsIn(lists(fixture)[0])[1].click(); // Banana
      fixture.detectChanges();

      moveButton(fixture, 'Move up — Available').click();
      fixture.detectChanges();

      expect(fixture.componentInstance.source).toEqual(['Banana', 'Apple', 'Cherry']);
    });

    it('Move to bottom — Selected sends the target selection to the end of the target list', () => {
      const fixture = create((h) => (h.target = ['Durian', 'Elderberry', 'Fig']));
      itemsIn(lists(fixture)[1])[0].click(); // Durian
      fixture.detectChanges();

      moveButton(fixture, 'Move to bottom — Selected').click();
      fixture.detectChanges();

      expect(fixture.componentInstance.target).toEqual(['Elderberry', 'Fig', 'Durian']);
    });

    it('reorder buttons are disabled when nothing is selected in that list', () => {
      const fixture = create();
      expect(moveButton(fixture, 'Move up — Available').disabled).toBe(true);
      expect(moveButton(fixture, 'Move down — Available').disabled).toBe(true);
    });
  });

  describe('drag-and-drop', () => {
    function dragEvent(type: string): DragEvent {
      const event = new Event(type, { bubbles: true, cancelable: true }) as DragEvent;
      Object.defineProperty(event, 'dataTransfer', { value: { effectAllowed: '', setData: jest.fn() }, configurable: true });
      return event;
    }

    it('every option is draggable by default', () => {
      const fixture = create();
      expect(itemsIn(lists(fixture)[0]).every((el) => el.draggable)).toBe(true);
    });

    it('dragging within the same list reorders it, ignoring selection', () => {
      const fixture = create();
      const source = () => itemsIn(lists(fixture)[0]);
      source()[0].dispatchEvent(dragEvent('dragstart')); // Apple
      source()[2].dispatchEvent(dragEvent('dragover')); // onto Cherry
      source()[2].dispatchEvent(dragEvent('drop'));
      fixture.detectChanges();

      expect(fixture.componentInstance.source).toEqual(['Banana', 'Cherry', 'Apple']);
      expect(fixture.componentInstance.target).toEqual([]);
    });

    it('dragging from source onto a target item inserts it at that position (not always appended)', () => {
      const fixture = create((h) => (h.target = ['Durian', 'Elderberry']));
      const source = () => itemsIn(lists(fixture)[0]);
      const target = () => itemsIn(lists(fixture)[1]);

      source()[1].dispatchEvent(dragEvent('dragstart')); // Banana
      target()[0].dispatchEvent(dragEvent('dragover')); // onto Durian's slot
      target()[0].dispatchEvent(dragEvent('drop'));
      fixture.detectChanges();

      expect(fixture.componentInstance.source).toEqual(['Apple', 'Cherry']);
      expect(fixture.componentInstance.target).toEqual(['Banana', 'Durian', 'Elderberry']);
    });

    it('dragging into an empty target list works via the list-level drop fallback', () => {
      const fixture = create();
      const sourceList = lists(fixture)[0];
      const targetList = lists(fixture)[1];

      itemsIn(sourceList)[0].dispatchEvent(dragEvent('dragstart')); // Apple
      targetList.dispatchEvent(dragEvent('dragover'));
      targetList.dispatchEvent(dragEvent('drop'));
      fixture.detectChanges();

      expect(fixture.componentInstance.source).toEqual(['Banana', 'Cherry']);
      expect(fixture.componentInstance.target).toEqual(['Apple']);
    });

    it('dragdrop="false" disables native dragging without affecting the buttons', () => {
      @Component({
        standalone: true,
        imports: [PickListComponent],
        template: `
          <med-pick-list [(source)]="source" [(target)]="target" [dragdrop]="false">
            <ng-template let-item>{{ item }}</ng-template>
          </med-pick-list>
        `,
      })
      class NoDragHost {
        source: string[] = ['Apple', 'Banana', 'Cherry'];
        target: string[] = [];
      }

      const fixture = TestBed.createComponent(NoDragHost);
      fixture.detectChanges();

      expect(itemsIn(lists(fixture)[0]).every((el) => el.draggable)).toBe(false);

      itemsIn(lists(fixture)[0])[0].click(); // Apple
      fixture.detectChanges();
      moveButton(fixture, 'Move selected to target').click();
      fixture.detectChanges();
      expect(fixture.componentInstance.target).toEqual(['Apple']);
    });
  });
});

describe('PickListComponent (filter, itemDisabled, keepSelection, granular events)', () => {
  const startsWith = (item: string, query: string) => item.toLowerCase().startsWith(query.toLowerCase());

  @Component({
    standalone: true,
    imports: [PickListComponent],
    template: `
      <med-pick-list
        [(source)]="source"
        [(target)]="target"
        [filterPredicate]="filterPredicate"
        [itemDisabled]="itemDisabled"
        [keepSelection]="keepSelection"
        (moveToTarget)="onMoveToTarget($event)"
        (moveAllToTarget)="onMoveAllToTarget($event)"
        (moveToSource)="onMoveToSource($event)"
        (moveAllToSource)="onMoveAllToSource($event)"
      >
        <ng-template let-item>{{ item }}</ng-template>
      </med-pick-list>
    `,
  })
  class ExtendedHostComponent {
    source: string[] = ['Apple', 'Banana', 'Cherry'];
    target: string[] = ['Durian'];
    filterPredicate: ((item: string, query: string) => boolean) | null = null;
    itemDisabled: (item: string) => boolean = () => false;
    keepSelection = false;
    onMoveToTarget = jest.fn();
    onMoveAllToTarget = jest.fn();
    onMoveToSource = jest.fn();
    onMoveAllToSource = jest.fn();
  }

  function createExtended(configure?: (h: ExtendedHostComponent) => void) {
    const fixture = TestBed.createComponent(ExtendedHostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  describe('filterPredicate', () => {
    it('renders no filter box when filterPredicate is unset, even with showSourceFilter/showTargetFilter default true', () => {
      const fixture = createExtended();
      expect(fixture.nativeElement.querySelector('input[type="text"]')).toBeNull();
    });

    it('narrows the visible items in the list being typed into', () => {
      const fixture = createExtended((h) => (h.filterPredicate = startsWith));
      const filterInput = fixture.nativeElement.querySelectorAll('input[type="text"]')[0] as HTMLInputElement;
      filterInput.value = 'Ba';
      filterInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(itemsIn(lists(fixture)[0]).map(labelOf)).toEqual(['Banana']);
      expect(itemsIn(lists(fixture)[1]).map(labelOf)).toEqual(['Durian']); // target list untouched
    });

    it('"Move All" only moves the currently-filtered-visible items, not the whole list', () => {
      const fixture = createExtended((h) => (h.filterPredicate = startsWith));
      const filterInput = fixture.nativeElement.querySelectorAll('input[type="text"]')[0] as HTMLInputElement;
      filterInput.value = 'Ba';
      filterInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      moveButton(fixture, 'Move all to target').click();
      fixture.detectChanges();

      expect(fixture.componentInstance.source).toEqual(['Apple', 'Cherry']);
      expect(fixture.componentInstance.target).toEqual(['Durian', 'Banana']);
    });
  });

  describe('itemDisabled', () => {
    it('a disabled item cannot be clicked to select', () => {
      const fixture = createExtended((h) => (h.itemDisabled = (item) => item === 'Banana'));
      itemsIn(lists(fixture)[0])[1].click(); // Banana
      fixture.detectChanges();
      expect(itemsIn(lists(fixture)[0])[1].getAttribute('aria-selected')).toBe('false');
    });

    it('a disabled item has aria-disabled and is not draggable', () => {
      const fixture = createExtended((h) => (h.itemDisabled = (item) => item === 'Banana'));
      const bananaEl = itemsIn(lists(fixture)[0])[1];
      expect(bananaEl.getAttribute('aria-disabled')).toBe('true');
      expect(bananaEl.draggable).toBe(false);
    });

    it('a disabled item is excluded from "Move All"', () => {
      const fixture = createExtended((h) => (h.itemDisabled = (item) => item === 'Banana'));
      moveButton(fixture, 'Move all to target').click();
      fixture.detectChanges();
      expect(fixture.componentInstance.source).toEqual(['Banana']);
      expect(fixture.componentInstance.target).toEqual(['Durian', 'Apple', 'Cherry']);
    });

    it('double-clicking a disabled item does not transfer it', () => {
      const fixture = createExtended((h) => (h.itemDisabled = (item) => item === 'Banana'));
      itemsIn(lists(fixture)[0])[1].dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      fixture.detectChanges();
      expect(fixture.componentInstance.target).toEqual(['Durian']);
    });
  });

  describe('keepSelection', () => {
    it('false (default): moved items land unselected in the destination list', () => {
      const fixture = createExtended();
      itemsIn(lists(fixture)[0])[0].click(); // select Apple
      fixture.detectChanges();
      moveButton(fixture, 'Move selected to target').click();
      fixture.detectChanges();

      const target = lists(fixture)[1];
      const appleInTarget = itemsIn(target).find((el) => labelOf(el) === 'Apple')!;
      expect(appleInTarget.getAttribute('aria-selected')).toBe('false');
    });

    it('true: moved items land selected in the destination list', () => {
      const fixture = createExtended((h) => (h.keepSelection = true));
      itemsIn(lists(fixture)[0])[0].click(); // select Apple
      fixture.detectChanges();
      moveButton(fixture, 'Move selected to target').click();
      fixture.detectChanges();

      const target = lists(fixture)[1];
      const appleInTarget = itemsIn(target).find((el) => labelOf(el) === 'Apple')!;
      expect(appleInTarget.getAttribute('aria-selected')).toBe('true');
    });
  });

  describe('granular transfer events', () => {
    it('moveToTarget fires for a button-driven "move selected", not moveAllToTarget', () => {
      const fixture = createExtended();
      itemsIn(lists(fixture)[0])[0].click(); // Apple
      fixture.detectChanges();
      moveButton(fixture, 'Move selected to target').click();
      fixture.detectChanges();

      expect(fixture.componentInstance.onMoveToTarget).toHaveBeenCalledWith(['Apple']);
      expect(fixture.componentInstance.onMoveAllToTarget).not.toHaveBeenCalled();
    });

    it('moveAllToTarget fires for the "Move All" button, not moveToTarget', () => {
      const fixture = createExtended();
      moveButton(fixture, 'Move all to target').click();
      fixture.detectChanges();

      expect(fixture.componentInstance.onMoveAllToTarget).toHaveBeenCalledWith(['Apple', 'Banana', 'Cherry']);
      expect(fixture.componentInstance.onMoveToTarget).not.toHaveBeenCalled();
    });

    it('a double-click transfer fires the same non-"all" event as a button-driven "move selected"', () => {
      const fixture = createExtended();
      itemsIn(lists(fixture)[0])[2].dispatchEvent(new MouseEvent('dblclick', { bubbles: true })); // Cherry
      fixture.detectChanges();

      expect(fixture.componentInstance.onMoveToTarget).toHaveBeenCalledWith(['Cherry']);
      expect(fixture.componentInstance.onMoveAllToTarget).not.toHaveBeenCalled();
    });

    it('moveToSource/moveAllToSource mirror the target-direction pair', () => {
      const fixture = createExtended();
      moveButton(fixture, 'Move all to source').click();
      fixture.detectChanges();
      expect(fixture.componentInstance.onMoveAllToSource).toHaveBeenCalledWith(['Durian']);
      expect(fixture.componentInstance.onMoveToSource).not.toHaveBeenCalled();
    });
  });

  // @scenario UI-008.S2
  describe('stripedRows and showSourceControls/showTargetControls (Wave 2)', () => {
    @Component({
      standalone: true,
      imports: [PickListComponent],
      template: `
        <med-pick-list
          [(source)]="source"
          [(target)]="target"
          [stripedRows]="true"
          [showSourceControls]="showSourceControls"
          [showTargetControls]="showTargetControls"
        >
          <ng-template let-item>{{ item }}</ng-template>
        </med-pick-list>
      `,
    })
    class Wave2PickListHostComponent {
      source = ['A', 'B', 'C'];
      target = ['D', 'E'];
      showSourceControls = false;
      showTargetControls = false;
    }

    it('hides source and target reorder controls when false and applies stripedRows', () => {
      const fixture = TestBed.createComponent(Wave2PickListHostComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('button[aria-label*="Move up"]')).toBeNull();
      const sourceItems = Array.from(lists(fixture)[0].querySelectorAll('[role="option"]')) as HTMLElement[];
      expect(sourceItems[1].className).toContain('bg-surface-50');
    });
  });
});
