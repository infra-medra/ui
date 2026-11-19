import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TreeComponent } from './tree.component';
import { TreeNodeTemplateDirective } from './tree-node-template.directive';
import { TreeNode, TreeSelectionMode } from './tree.types';

const NODES: TreeNode[] = [
  {
    label: 'Documents',
    children: [{ label: 'Resume.pdf' }, { label: 'Invoice.pdf' }],
  },
  { label: 'Photos', selectable: false },
  { label: 'README.md' },
];

@Component({
  standalone: true,
  imports: [TreeComponent],
  template: `
    <med-tree
      [value]="value"
      [selectionMode]="selectionMode"
      [(selection)]="selection"
      [filterable]="filterable"
      [virtualScroll]="virtualScroll"
    />
  `,
})
class HostComponent {
  value: TreeNode[] = NODES;
  selectionMode: TreeSelectionMode = null;
  selection: TreeNode | readonly TreeNode[] | null = null;
  filterable = false;
  virtualScroll = false;
}

function rows(fixture: { nativeElement: HTMLElement }): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('med-tree-node > div'));
}

function rowByLabel(fixture: { nativeElement: HTMLElement }, label: string): HTMLElement {
  return rows(fixture).find((el) => el.textContent?.includes(label)) as HTMLElement;
}

function create(configure?: (h: HostComponent) => void) {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

describe('TreeComponent', () => {
  it('renders every expanded node, root and nested', () => {
    const fixture = create();
    const nodeCount = fixture.nativeElement.querySelectorAll('med-tree-node').length;
    expect(nodeCount).toBe(5); // Documents, Resume.pdf, Invoice.pdf, Photos, README.md
    expect(fixture.nativeElement.textContent).toContain('Resume.pdf');
  });

  it('collapsing a node hides its descendants but keeps the node itself', () => {
    const fixture = create();
    const toggle = rowByLabel(fixture, 'Documents').querySelector('button') as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Documents');
    expect(fixture.nativeElement.textContent).not.toContain('Resume.pdf');
  });

  it('a leaf node has no expand/collapse button', () => {
    const fixture = create();
    expect(rowByLabel(fixture, 'README.md').querySelector('button')).toBeNull();
  });

  it('renders no role="button" anywhere when selectionMode is null', () => {
    const fixture = create();
    expect(fixture.nativeElement.querySelector('[role="button"]')).toBeNull();
  });

  describe('single selection', () => {
    it('clicking a selectable node selects it', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      rowByLabel(fixture, 'README.md').click();
      fixture.detectChanges();
      expect(fixture.componentInstance.selection).toBe(NODES[2]);
    });

    it('a node marked selectable: false cannot be selected', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      const photosRow = rowByLabel(fixture, 'Photos');
      expect(photosRow.getAttribute('role')).toBeNull();
      photosRow.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.selection).toBeNull();
    });

    it('clicking the already-selected node again is a no-op', () => {
      const fixture = create((h) => {
        h.selectionMode = 'single';
        h.selection = NODES[2];
      });
      rowByLabel(fixture, 'README.md').click();
      fixture.detectChanges();
      expect(fixture.componentInstance.selection).toBe(NODES[2]);
    });
  });

  describe('multiple selection', () => {
    it('toggles nodes in and out of the selection array, including nested nodes', () => {
      const fixture = create((h) => (h.selectionMode = 'multiple'));
      rowByLabel(fixture, 'Resume.pdf').click();
      fixture.detectChanges();
      rowByLabel(fixture, 'README.md').click();
      fixture.detectChanges();

      expect(fixture.componentInstance.selection).toEqual([NODES[0].children![0], NODES[2]]);

      rowByLabel(fixture, 'Resume.pdf').click();
      fixture.detectChanges();
      expect(fixture.componentInstance.selection).toEqual([NODES[2]]);
    });
  });

  describe('checkbox selection', () => {
    it('behaves like multiple selection, with aria-checked reflecting membership', () => {
      const fixture = create((h) => (h.selectionMode = 'checkbox'));
      const row = rowByLabel(fixture, 'README.md');
      expect(row.getAttribute('aria-checked')).toBe('false');

      row.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.selection).toEqual([NODES[2]]);
      expect(rowByLabel(fixture, 'README.md').getAttribute('aria-checked')).toBe('true');
    });

    // Regression: the decorative box previously reused Checkbox's own
    // `checkboxBoxVariants`, which only fills via a real sibling
    // `<input class="peer">`'s native :checked state (peer-checked:*) --
    // there's no such input here (selection is driven by the row's own
    // click), so the box never actually filled and the white checkmark
    // icon was invisible against its own unpainted background.
    it('the checkbox glyph visually fills when checked, not just aria-checked', () => {
      const fixture = create((h) => (h.selectionMode = 'checkbox'));
      const row = rowByLabel(fixture, 'README.md');
      const box = row.querySelector('span[aria-hidden="true"]') as HTMLElement;
      expect(box.className).toContain('bg-transparent');

      row.click();
      fixture.detectChanges();
      const boxAfter = rowByLabel(fixture, 'README.md').querySelector('span[aria-hidden="true"]') as HTMLElement;
      expect(boxAfter.className).toContain('bg-brand-500');
      expect(boxAfter.className).not.toContain('bg-transparent');
      expect(boxAfter.querySelector('med-icon')).not.toBeNull();
    });
  });

  it('Enter selects a focused node', () => {
    const fixture = create((h) => (h.selectionMode = 'single'));
    const row = rowByLabel(fixture, 'README.md');
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.selection).toBe(NODES[2]);
  });

  describe('ARIA tree roles (Wave 2 fix — upgraded from role="button" rows with no tree semantics)', () => {
    it('the root list is role="tree", nested children are role="group"', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      expect(fixture.nativeElement.querySelector('ul[role="tree"]')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('ul[role="group"]')).not.toBeNull();
    });

    it('a selectable row is role="treeitem" with aria-level/aria-setsize/aria-posinset', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      const documents = rowByLabel(fixture, 'Documents');
      expect(documents.getAttribute('role')).toBe('treeitem');
      expect(documents.getAttribute('aria-level')).toBe('1');
      expect(documents.getAttribute('aria-setsize')).toBe('3'); // 3 root nodes
      expect(documents.getAttribute('aria-posinset')).toBe('1');

      const resume = rowByLabel(fixture, 'Resume.pdf');
      expect(resume.getAttribute('aria-level')).toBe('2'); // nested one level under Documents
      expect(resume.getAttribute('aria-setsize')).toBe('2'); // 2 children under Documents
      expect(resume.getAttribute('aria-posinset')).toBe('1');
    });

    it('a node with children reflects its expanded state via aria-expanded on the row itself', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      const documents = rowByLabel(fixture, 'Documents');
      expect(documents.getAttribute('aria-expanded')).toBe('true');

      documents.querySelector('button')!.click();
      fixture.detectChanges();
      expect(rowByLabel(fixture, 'Documents').getAttribute('aria-expanded')).toBe('false');
    });

    it('a leaf node has no aria-expanded', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      expect(rowByLabel(fixture, 'README.md').getAttribute('aria-expanded')).toBeNull();
    });
  });

  describe('keyboard tree navigation (Wave 2 fix)', () => {
    it('ArrowDown/ArrowUp move focus across visible rows, including into and out of an expanded branch', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      const documents = rowByLabel(fixture, 'Documents');
      documents.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(document.activeElement).toBe(rowByLabel(fixture, 'Resume.pdf'));

      rowByLabel(fixture, 'Resume.pdf').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(document.activeElement).toBe(rowByLabel(fixture, 'Documents'));
    });

    it('ArrowRight on a collapsed parent expands it without moving focus; on an already-expanded parent it moves focus to the first child', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      // Collapse Documents first (it starts expanded).
      rowByLabel(fixture, 'Documents').querySelector('button')!.click();
      fixture.detectChanges();

      rowByLabel(fixture, 'Documents').focus(); // dispatchEvent alone doesn't move real focus in jsdom — a real keydown implies the row was already focused
      rowByLabel(fixture, 'Documents').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(rowByLabel(fixture, 'Documents').getAttribute('aria-expanded')).toBe('true');
      expect(document.activeElement).toBe(rowByLabel(fixture, 'Documents')); // ArrowRight on an already-collapsed-then-expanded node stays put, doesn't jump into the (now-visible) children yet

      rowByLabel(fixture, 'Documents').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(document.activeElement).toBe(rowByLabel(fixture, 'Resume.pdf'));
    });

    it('ArrowLeft on an expanded parent collapses it; on a leaf/collapsed node it moves focus to the parent', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      rowByLabel(fixture, 'Documents').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(rowByLabel(fixture, 'Documents').getAttribute('aria-expanded')).toBe('false');

      // Re-expand and move into the child to test the "jump to parent" path.
      rowByLabel(fixture, 'Documents').querySelector('button')!.click();
      fixture.detectChanges();
      rowByLabel(fixture, 'Resume.pdf').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(document.activeElement).toBe(rowByLabel(fixture, 'Documents'));
    });

    it('Home/End jump focus to the first/last visible row', () => {
      const fixture = create((h) => (h.selectionMode = 'single'));
      rowByLabel(fixture, 'Documents').dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(document.activeElement).toBe(rowByLabel(fixture, 'README.md'));

      rowByLabel(fixture, 'README.md').dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(document.activeElement).toBe(rowByLabel(fixture, 'Documents'));
    });
  });

  describe('filterable', () => {
    function filterInput(fixture: { nativeElement: HTMLElement }): HTMLInputElement | null {
      return fixture.nativeElement.querySelector('input[type="text"]');
    }

    function typeFilter(fixture: ComponentFixture<HostComponent>, text: string): void {
      const input = filterInput(fixture)!;
      input.value = text;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    }

    function treeComponent(fixture: ComponentFixture<HostComponent>): TreeComponent {
      return fixture.debugElement.query(By.directive(TreeComponent)).componentInstance as TreeComponent;
    }

    it('does not render a search box by default', () => {
      const fixture = create();
      expect(filterInput(fixture)).toBeNull();
    });

    it('filterable renders a search box', () => {
      const fixture = create((h) => (h.filterable = true));
      expect(filterInput(fixture)).not.toBeNull();
    });

    it('typing a match keeps the ancestor chain of a match visible, hiding everything else', () => {
      const fixture = create((h) => (h.filterable = true));
      typeFilter(fixture, 'resume');

      expect(fixture.nativeElement.textContent).toContain('Documents'); // ancestor of the match
      expect(fixture.nativeElement.textContent).toContain('Resume.pdf'); // the match itself
      expect(fixture.nativeElement.textContent).not.toContain('Invoice.pdf');
      expect(fixture.nativeElement.textContent).not.toContain('Photos');
      expect(fixture.nativeElement.textContent).not.toContain('README.md');
    });

    it('force-expands a collapsed ancestor of a match while filtering, restoring the real collapsed state once cleared', () => {
      const fixture = create((h) => (h.filterable = true));
      rowByLabel(fixture, 'Documents').querySelector('button')!.click();
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Resume.pdf');

      typeFilter(fixture, 'resume');
      expect(fixture.nativeElement.textContent).toContain('Resume.pdf');

      typeFilter(fixture, '');
      expect(fixture.nativeElement.textContent).not.toContain('Resume.pdf');
    });

    it('aria-posinset/aria-setsize count only the currently-visible siblings', () => {
      const fixture = create((h) => {
        h.filterable = true;
        h.selectionMode = 'single';
      });
      typeFilter(fixture, 'resume');
      // Only "Documents" remains among the 3 root nodes (ancestor of the one match).
      expect(rowByLabel(fixture, 'Documents').getAttribute('aria-setsize')).toBe('1');
      expect(rowByLabel(fixture, 'Documents').getAttribute('aria-posinset')).toBe('1');
    });

    it('nodeVisible()/filterText() are exposed publicly as part of the TreeHost contract', () => {
      const fixture = create((h) => (h.filterable = true));
      typeFilter(fixture, 'resume');
      const tree = treeComponent(fixture);

      expect(tree.filterText()).toBe('resume');
      expect(tree.nodeVisible(NODES[0])).toBe(true); // Documents: ancestor of a match
      expect(tree.nodeVisible(NODES[1])).toBe(false); // Photos: matches nothing
    });
  });

  describe('virtualScroll', () => {
    function viewport(fixture: { nativeElement: HTMLElement }): HTMLElement | null {
      return fixture.nativeElement.querySelector('cdk-virtual-scroll-viewport');
    }

    it('renders a cdk-virtual-scroll-viewport with role="tree" instead of the recursive <ul>, and never instantiates TreeNodeComponent', () => {
      const fixture = create((h) => (h.virtualScroll = true));
      expect(viewport(fixture)).not.toBeNull();
      expect(viewport(fixture)!.getAttribute('role')).toBe('tree');
      expect(fixture.nativeElement.querySelector('ul[role="tree"]')).toBeNull();
      expect(fixture.nativeElement.querySelector('med-tree-node')).toBeNull();
    });

    it('does not throw flattening a large tree', () => {
      const bigTree: TreeNode[] = Array.from({ length: 2000 }, (_, i) => ({ label: `Node ${i}` }));
      expect(() =>
        create((h) => {
          h.virtualScroll = true;
          h.value = bigTree;
        }),
      ).not.toThrow();
    });
  });
});

describe('TreeComponent (per-node/per-type templates)', () => {
  const TYPED_NODES: TreeNode[] = [
    { label: 'src', type: 'folder', children: [{ label: 'index.ts', type: 'file' }] },
    { label: 'README.md', type: 'file' },
    { label: 'Untyped node' },
  ];

  @Component({
    standalone: true,
    imports: [TreeComponent, TreeNodeTemplateDirective],
    template: `
      <med-tree [value]="value" [virtualScroll]="virtualScroll">
        <ng-template medTreeNodeTemplate="folder" let-node>
          <span class="folder-marker">📁 {{ node.label }}</span>
        </ng-template>
        <ng-template medTreeNodeTemplate="file" let-node>
          <span class="file-marker">📄 {{ node.label }}</span>
        </ng-template>
        <ng-template medTreeNodeTemplate let-node>
          <span class="default-marker">{{ node.label }}</span>
        </ng-template>
      </med-tree>
    `,
  })
  class TypedHostComponent {
    value: TreeNode[] = TYPED_NODES;
    virtualScroll = false;
  }

  function createTyped(configure?: (h: TypedHostComponent) => void) {
    const fixture = TestBed.createComponent(TypedHostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  it('recursive path: renders the template matching each node\'s own type', () => {
    const fixture = createTyped();
    expect(fixture.nativeElement.querySelector('.folder-marker')?.textContent).toContain('src');
    expect(fixture.nativeElement.querySelectorAll('.file-marker').length).toBe(2); // index.ts, README.md
  });

  it('recursive path: falls back to the untyped default template when a node has no type', () => {
    const fixture = createTyped();
    expect(fixture.nativeElement.querySelector('.default-marker')?.textContent).toContain('Untyped node');
  });

  it('virtualScroll path: does not throw resolving per-type templates (jsdom renders zero CDK virtual-scroll rows — see class doc; verified live via Playwright instead)', () => {
    expect(() => createTyped((h) => (h.virtualScroll = true))).not.toThrow();
  });

  it('falls back to the plain icon/label entirely when no template is projected at all', () => {
    @Component({
      standalone: true,
      imports: [TreeComponent],
      template: `<med-tree [value]="value" />`,
    })
    class NoTemplateHost {
      value: TreeNode[] = [{ label: 'Plain node', icon: 'folder' }];
    }
    const fixture = TestBed.createComponent(NoTemplateHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Plain node');
    expect(fixture.nativeElement.querySelector('med-icon')).not.toBeNull();
  });
});

// @scenario UI-008.S1
describe('TreeComponent Wave 2 (draggableNodes/droppableNodes, propagateSelectionUp/Down)', () => {
  const HIERARCHY: TreeNode[] = [
    {
      label: 'Parent',
      children: [{ label: 'Child A' }, { label: 'Child B' }],
    },
  ];

  @Component({
    standalone: true,
    imports: [TreeComponent],
    template: `
      <med-tree
        [value]="nodes"
        selectionMode="checkbox"
        [(selection)]="selection"
        [propagateSelectionUp]="propagateUp"
        [propagateSelectionDown]="propagateDown"
        [draggableNodes]="draggableNodes"
        [droppableNodes]="droppableNodes"
        (nodeDrop)="drops.push($event)"
      />
    `,
  })
  class Wave2TreeHostComponent {
    nodes: TreeNode[] = HIERARCHY;
    selection: TreeNode | readonly TreeNode[] | null = [];
    propagateUp = true;
    propagateDown = true;
    draggableNodes = true;
    droppableNodes = true;
    drops: Array<{ dragNode: TreeNode; dropNode: TreeNode }> = [];
  }

  it('propagates checkbox selection down to descendants and up to parent when enabled', () => {
    const fixture = TestBed.createComponent(Wave2TreeHostComponent);
    fixture.detectChanges();

    const rows = Array.from(fixture.nativeElement.querySelectorAll('[role="treeitem"]')) as HTMLElement[];
    const parentRow = rows.find((r) => r.textContent?.includes('Parent'))!;
    parentRow.click();
    fixture.detectChanges();

    const selected = fixture.componentInstance.selection as readonly TreeNode[];
    expect(selected).toContain(HIERARCHY[0]);
    expect(selected).toContain(HIERARCHY[0].children![0]);
    expect(selected).toContain(HIERARCHY[0].children![1]);
  });

  it('does not propagate selection down when propagateSelectionDown is false', () => {
    const fixture = TestBed.createComponent(Wave2TreeHostComponent);
    fixture.componentInstance.propagateDown = false;
    fixture.detectChanges();

    const rows = Array.from(fixture.nativeElement.querySelectorAll('[role="treeitem"]')) as HTMLElement[];
    rows.find((r) => r.textContent?.includes('Parent'))!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.selection).toEqual([HIERARCHY[0]]);
  });

  it('marks nodes draggable and emits nodeDrop on drag-and-drop', () => {
    const fixture = TestBed.createComponent(Wave2TreeHostComponent);
    fixture.detectChanges();

    const rows = Array.from(fixture.nativeElement.querySelectorAll('[role="treeitem"]')) as HTMLElement[];
    const childA = rows.find((r) => r.textContent?.includes('Child A'))!;
    const childB = rows.find((r) => r.textContent?.includes('Child B'))!;
    expect(childA.getAttribute('draggable')).toBe('true');

    childA.dispatchEvent(new Event('dragstart', { bubbles: true }));
    childB.dispatchEvent(new Event('dragover', { bubbles: true, cancelable: true }));
    childB.dispatchEvent(new Event('drop', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.drops).toHaveLength(1);
    expect(fixture.componentInstance.drops[0].dragNode).toBe(HIERARCHY[0].children![0]);
    expect(fixture.componentInstance.drops[0].dropNode).toBe(HIERARCHY[0].children![1]);
  });
});
