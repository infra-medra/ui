import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OrganizationChartComponent } from './organization-chart.component';
import { OrgChartNode, OrgChartSelectionMode } from './organization-chart.types';

const TREE: OrgChartNode = {
  label: 'CEO',
  children: [
    { label: 'CTO', children: [{ label: 'Engineer A' }, { label: 'Engineer B' }] },
    { label: 'CFO', selectable: false },
  ],
};

@Component({
  standalone: true,
  imports: [OrganizationChartComponent],
  template: `<med-organization-chart [value]="value" [selectionMode]="selectionMode" [(selection)]="selection" (nodeExpand)="onNodeExpand($event)" (nodeCollapse)="onNodeCollapse($event)" />`,
})
class HostComponent {
  value: OrgChartNode | null = TREE;
  selectionMode: OrgChartSelectionMode = null;
  selection: OrgChartNode | readonly OrgChartNode[] | null = null;
  onNodeExpand = jest.fn();
  onNodeCollapse = jest.fn();
}

function nodeBoxes(fixture: { nativeElement: HTMLElement }): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('med-org-chart-node > div > div'));
}

function nodeBoxByLabel(fixture: { nativeElement: HTMLElement }, label: string): HTMLElement {
  return nodeBoxes(fixture).find((el) => el.textContent?.includes(label)) as HTMLElement;
}

function create(configure?: (h: HostComponent) => void) {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

describe('OrganizationChartComponent', () => {
  it('renders the root and all expanded descendant nodes', () => {
    const fixture = create();
    const labels = fixture.nativeElement.querySelectorAll('med-org-chart-node');
    expect(labels.length).toBe(5); // CEO, CTO, CFO, Engineer A, Engineer B
    expect(fixture.nativeElement.textContent).toContain('CEO');
    expect(fixture.nativeElement.textContent).toContain('Engineer A');
  });

  it('renders nothing when value is null', () => {
    const fixture = create((h) => (h.value = null));
    expect(fixture.nativeElement.querySelector('med-org-chart-node')).toBeNull();
  });

  it('collapsing a node hides its descendants but keeps the node itself', () => {
    const fixture = create();
    const ctoExpandButton = nodeBoxByLabel(fixture, 'CTO').querySelector('button') as HTMLButtonElement;
    ctoExpandButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('CTO');
    expect(fixture.nativeElement.textContent).not.toContain('Engineer A');
  });

  it('a leaf node has no expand/collapse button', () => {
    const fixture = create();
    const engineerBox = nodeBoxByLabel(fixture, 'Engineer A');
    expect(engineerBox.querySelector('button')).toBeNull();
  });

  it('renders no role="button" anywhere when selectionMode is null', () => {
    const fixture = create();
    expect(fixture.nativeElement.querySelector('[role="button"]')).toBeNull();
  });

  describe('single selection', () => {
    it('clicking a selectable node selects it', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      nodeBoxByLabel(fixture, 'CTO').click();
      fixture.detectChanges();

      expect(fixture.componentInstance.selection).toBe(TREE.children![0]);
      expect(nodeBoxByLabel(fixture, 'CTO').getAttribute('aria-pressed')).toBe('true');
    });

    it('a node marked selectable: false cannot be selected', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      const cfoBox = nodeBoxByLabel(fixture, 'CFO');
      expect(cfoBox.getAttribute('role')).toBeNull();

      cfoBox.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.selection).toBeNull();
    });

    it('clicking the already-selected node again is a no-op', () => {
      const fixture = create((h) => {
        h.selectionMode = 'single';
        h.selection = TREE;
      });
      nodeBoxByLabel(fixture, 'CEO').click();
      fixture.detectChanges();
      expect(fixture.componentInstance.selection).toBe(TREE);
    });

    it('Enter selects a focused node', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      const box = nodeBoxByLabel(fixture, 'CTO');
      box.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(fixture.componentInstance.selection).toBe(TREE.children![0]);
    });
  });

  describe('keyboard navigation (Wave 2 fix — 2026-08-19)', () => {
    function dispatchKey(el: HTMLElement, key: string): void {
      el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    }

    it('ArrowDown from the root moves focus to its first child', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      const ceoBox = nodeBoxByLabel(fixture, 'CEO');
      dispatchKey(ceoBox, 'ArrowDown');
      fixture.detectChanges();
      expect(document.activeElement).toBe(nodeBoxByLabel(fixture, 'CTO'));
    });

    it('ArrowDown on a collapsed node expands it instead of moving focus', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      const ctoExpandButton = nodeBoxByLabel(fixture, 'CTO').querySelector('button') as HTMLButtonElement;
      ctoExpandButton.click();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Engineer A');

      const ctoBox = nodeBoxByLabel(fixture, 'CTO');
      ctoBox.focus();
      dispatchKey(ctoBox, 'ArrowDown');
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Engineer A');
      expect(document.activeElement).toBe(ctoBox);
    });

    it('ArrowUp moves focus from a child to its parent', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      const ctoBox = nodeBoxByLabel(fixture, 'CTO');
      dispatchKey(ctoBox, 'ArrowUp');
      fixture.detectChanges();
      expect(document.activeElement).toBe(nodeBoxByLabel(fixture, 'CEO'));
    });

    it('ArrowUp from the root is a no-op (no parent to move to)', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      const ceoBox = nodeBoxByLabel(fixture, 'CEO');
      ceoBox.focus();
      dispatchKey(ceoBox, 'ArrowUp');
      fixture.detectChanges();
      expect(document.activeElement).toBe(ceoBox);
    });

    it('ArrowRight/ArrowLeft move focus between selectable siblings', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      const engineerA = nodeBoxByLabel(fixture, 'Engineer A');
      dispatchKey(engineerA, 'ArrowRight');
      fixture.detectChanges();
      expect(document.activeElement).toBe(nodeBoxByLabel(fixture, 'Engineer B'));

      const engineerB = nodeBoxByLabel(fixture, 'Engineer B');
      dispatchKey(engineerB, 'ArrowLeft');
      fixture.detectChanges();
      expect(document.activeElement).toBe(engineerA);
    });

    it('Home/End jump to the first/last selectable sibling', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      const engineerB = nodeBoxByLabel(fixture, 'Engineer B');
      dispatchKey(engineerB, 'Home');
      fixture.detectChanges();
      expect(document.activeElement).toBe(nodeBoxByLabel(fixture, 'Engineer A'));

      const engineerA = nodeBoxByLabel(fixture, 'Engineer A');
      dispatchKey(engineerA, 'End');
      fixture.detectChanges();
      expect(document.activeElement).toBe(engineerB);
    });

    it('a selectable: false sibling (CFO) is skipped as a navigation target', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      const ctoBox = nodeBoxByLabel(fixture, 'CTO');
      ctoBox.focus();
      dispatchKey(ctoBox, 'ArrowRight');
      fixture.detectChanges();
      // CTO's only sibling is CFO (selectable: false, no role="button"), so
      // there is no valid ArrowRight target and focus stays put.
      expect(document.activeElement).toBe(ctoBox);
    });
  });

  describe('multiple selection', () => {
    it('toggles nodes in and out of the selection array', () => {
      const fixture = create((h) => (h.selectionMode = 'multiple'));
      nodeBoxByLabel(fixture, 'CTO').click();
      fixture.detectChanges();
      nodeBoxByLabel(fixture, 'Engineer A').click();
      fixture.detectChanges();

      expect(fixture.componentInstance.selection).toEqual([TREE.children![0], TREE.children![0].children![0]]);

      nodeBoxByLabel(fixture, 'CTO').click();
      fixture.detectChanges();
      expect(fixture.componentInstance.selection).toEqual([TREE.children![0].children![0]]);
    });
  });

  describe('checkbox selection (cascading)', () => {
    const cto = TREE.children![0];
    const engineerA = cto.children![0];
    const engineerB = cto.children![1];

    function selection(fixture: { componentInstance: HostComponent }): readonly OrgChartNode[] {
      return fixture.componentInstance.selection as readonly OrgChartNode[];
    }

    it('checking a leaf selects only that leaf, leaving its parent indeterminate', () => {
      const fixture = create((h) => (h.selectionMode = 'checkbox'));
      nodeBoxByLabel(fixture, 'Engineer A').click();
      fixture.detectChanges();

      expect(selection(fixture)).toEqual([engineerA]);
      expect(nodeBoxByLabel(fixture, 'Engineer A').getAttribute('aria-checked')).toBe('true');
      expect(nodeBoxByLabel(fixture, 'CTO').getAttribute('aria-checked')).toBe('mixed');
    });

    it('checking a parent cascades down, checking every selectable child (and cascades further up: CEO\'s only selectable child is CTO, so CEO ends up fully checked too)', () => {
      const fixture = create((h) => (h.selectionMode = 'checkbox'));
      nodeBoxByLabel(fixture, 'CTO').click();
      fixture.detectChanges();

      expect(selection(fixture)).toEqual(expect.arrayContaining([TREE, cto, engineerA, engineerB]));
      expect(selection(fixture).length).toBe(4);
      expect(nodeBoxByLabel(fixture, 'Engineer A').getAttribute('aria-checked')).toBe('true');
      expect(nodeBoxByLabel(fixture, 'Engineer B').getAttribute('aria-checked')).toBe('true');
      expect(nodeBoxByLabel(fixture, 'CEO').getAttribute('aria-checked')).toBe('true');
    });

    it('checking every child cascades up, checking the parent too (and CEO, since CTO is its only selectable child)', () => {
      const fixture = create((h) => (h.selectionMode = 'checkbox'));
      nodeBoxByLabel(fixture, 'Engineer A').click();
      fixture.detectChanges();
      nodeBoxByLabel(fixture, 'Engineer B').click();
      fixture.detectChanges();

      expect(selection(fixture)).toEqual(expect.arrayContaining([TREE, cto, engineerA, engineerB]));
      expect(nodeBoxByLabel(fixture, 'CTO').getAttribute('aria-checked')).toBe('true');
      expect(nodeBoxByLabel(fixture, 'CEO').getAttribute('aria-checked')).toBe('true');
    });

    it('unchecking one child un-cascades the parent, back to indeterminate', () => {
      const fixture = create((h) => (h.selectionMode = 'checkbox'));
      nodeBoxByLabel(fixture, 'CTO').click();
      fixture.detectChanges();
      nodeBoxByLabel(fixture, 'Engineer A').click(); // uncheck just this one
      fixture.detectChanges();

      expect(selection(fixture)).toEqual([engineerB]);
      expect(nodeBoxByLabel(fixture, 'CTO').getAttribute('aria-checked')).toBe('mixed');
      expect(nodeBoxByLabel(fixture, 'CTO').getAttribute('aria-pressed')).toBeNull(); // checkbox mode never sets aria-pressed
    });

    it('unchecking a fully-checked parent cascades down, unchecking every child', () => {
      const fixture = create((h) => (h.selectionMode = 'checkbox'));
      nodeBoxByLabel(fixture, 'CTO').click();
      fixture.detectChanges();
      nodeBoxByLabel(fixture, 'CTO').click(); // toggle back off
      fixture.detectChanges();

      expect(selection(fixture)).toEqual([]);
      expect(nodeBoxByLabel(fixture, 'Engineer A').getAttribute('aria-checked')).toBe('false');
    });

    it('checking the root cascades through every selectable descendant, but skips a selectable: false branch (CFO)', () => {
      const fixture = create((h) => (h.selectionMode = 'checkbox'));
      nodeBoxByLabel(fixture, 'CEO').click();
      fixture.detectChanges();

      expect(selection(fixture)).toEqual(expect.arrayContaining([TREE, cto, engineerA, engineerB]));
      expect(selection(fixture).length).toBe(4); // CFO never enters the selection, selectable: false
      expect(nodeBoxByLabel(fixture, 'CEO').getAttribute('aria-checked')).toBe('true');
    });
  });

  describe('nodeExpand/nodeCollapse', () => {
    it('clicking the toggle button on an expanded node emits nodeCollapse with that node', () => {
      const fixture = create();
      const ctoToggle = nodeBoxByLabel(fixture, 'CTO').querySelector('button') as HTMLButtonElement;
      ctoToggle.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.onNodeCollapse).toHaveBeenCalledWith(TREE.children![0]);
      expect(fixture.componentInstance.onNodeExpand).not.toHaveBeenCalled();
    });

    it('clicking the toggle button again on a collapsed node emits nodeExpand with that node', () => {
      const fixture = create();
      const ctoToggle = nodeBoxByLabel(fixture, 'CTO').querySelector('button') as HTMLButtonElement;
      ctoToggle.click(); // collapse
      fixture.detectChanges();
      ctoToggle.click(); // expand again
      fixture.detectChanges();

      expect(fixture.componentInstance.onNodeExpand).toHaveBeenCalledWith(TREE.children![0]);
    });

    it('ArrowDown expanding a collapsed node also emits nodeExpand', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      const ctoToggle = nodeBoxByLabel(fixture, 'CTO').querySelector('button') as HTMLButtonElement;
      ctoToggle.click(); // collapse first
      fixture.detectChanges();
      fixture.componentInstance.onNodeExpand.mockClear();

      const ctoBox = nodeBoxByLabel(fixture, 'CTO');
      ctoBox.focus();
      ctoBox.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
      fixture.detectChanges();

      expect(fixture.componentInstance.onNodeExpand).toHaveBeenCalledWith(TREE.children![0]);
    });
  });
});
