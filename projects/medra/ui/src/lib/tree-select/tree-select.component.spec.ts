import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { TreeSelectComponent } from './tree-select.component';
import { TreeNode } from '../tree/tree.types';

const OPTIONS: TreeNode[] = [
  {
    label: 'Documents',
    children: [{ label: 'Resume.pdf' }, { label: 'Invoice.pdf' }],
  },
  { label: 'Photos', selectable: false },
  { label: 'README.md' },
];

function trigger(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
}

function panelRows(): HTMLElement[] {
  return Array.from(document.querySelectorAll('med-tree-node > div'));
}

function rowByLabel(label: string): HTMLElement {
  return panelRows().find((el) => el.textContent?.includes(label)) as HTMLElement;
}

function keydown(el: HTMLElement, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('TreeSelectComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function create(): ComponentFixture<TreeSelectComponent> {
    const fixture = TestBed.createComponent(TreeSelectComponent);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
    return fixture;
  }

  it('shows the placeholder when nothing is selected', () => {
    const fixture = create();
    expect(trigger(fixture).textContent).toContain('Select an item');
  });

  it('clicking the trigger opens a panel with the tree rendered', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();

    expect(panelRows().map((el) => el.textContent?.trim())).toEqual(
      expect.arrayContaining(['Documents', 'Resume.pdf', 'Invoice.pdf', 'Photos', 'README.md']),
    );
  });

  it('the panel host stretches to fill the overlay pane (w-full) instead of shrink-wrapping its own content', () => {
    // Regression test: the overlay pane's own `display: flex` makes a
    // shrink-to-fit child (no `w-full`) size itself to its content's own
    // width rather than the pane's — the pane's width is set explicitly
    // from the trigger (see `open()`), so without `w-full` here the panel
    // renders far narrower than intended, leaving a large empty gap. Every
    // sibling overlay panel (SelectPanelComponent, AutocompletePanelComponent,
    // DatePickerPanelComponent, CascadeSelectPanelComponent) already carries
    // `w-full` for this exact reason.
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();

    const panelHost = document.querySelector('med-tree-select-panel');
    expect(panelHost?.classList.contains('w-full')).toBe(true);
  });

  it('picking a leaf node sets the value, shows its label, and closes the panel', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    trigger(fixture).click();
    fixture.detectChanges();
    rowByLabel('Resume.pdf').click();
    fixture.detectChanges();

    expect(onChange).toHaveBeenCalledWith(OPTIONS[0].children![0]);
    expect(trigger(fixture).textContent).toContain('Resume.pdf');
    expect(panelRows()).toHaveLength(0);
  });

  it('a node marked selectable: false cannot be picked', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();

    const photosRow = rowByLabel('Photos');
    expect(photosRow.getAttribute('role')).toBeNull();
    photosRow.click();
    fixture.detectChanges();

    expect(panelRows().length).toBeGreaterThan(0); // still open, nothing selected
  });

  it('writeValue displays the given node\'s label without opening the panel', () => {
    const fixture = create();
    fixture.componentInstance.writeValue(OPTIONS[2]);
    fixture.detectChanges();
    expect(trigger(fixture).textContent).toContain('README.md');
    expect(panelRows()).toHaveLength(0);
  });

  it('ArrowDown on the trigger opens the panel', () => {
    const fixture = create();
    keydown(trigger(fixture), 'ArrowDown');
    fixture.detectChanges();
    expect(panelRows().length).toBeGreaterThan(0);
  });

  it('setDisabledState(true) (Reactive Forms disable()) prevents opening', () => {
    const fixture = create();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(panelRows()).toHaveLength(0);
  });

  // Escape/outside-click dismissal and focus restoration below aren't
  // reimplemented by TreeSelect itself — they come for free from
  // OverlayService's own defaults (closeOnEscape/closeOnOutsideClick/
  // restoreFocus all default true for a non-backdrop openConnected() call,
  // see overlay.service.ts), unlike Select/CascadeSelect, which have nested
  // submenu overlays of their own to plumb closeRequested through. These
  // were previously untested at the TreeSelect level even though the
  // underlying service behavior is covered by overlay.service.spec.ts.
  describe('overlay dismissal (via OverlayService defaults)', () => {
    it('Escape closes the panel and returns focus to the trigger', () => {
      // CDK's OverlayKeyboardDispatcher listens for 'keydown' on <body>
      // itself (see @angular/cdk overlay's OverlayKeyboardDispatcher), so
      // the event has to be dispatched there (or on a body descendant, to
      // bubble up) for overlayRef.keydownEvents() to fire in a test — a
      // document-level dispatch never reaches it.
      const fixture = create();
      // jsdom's HTMLElement.click() doesn't synthesize a real focus the way
      // a browser click does, so OverlayService's captured "previously
      // focused" element would otherwise be document.body — focus the
      // trigger explicitly first, matching overlay.service.spec.ts's own
      // 'closing restores focus to whatever was focused before the overlay
      // opened' setup.
      trigger(fixture).focus();
      trigger(fixture).click();
      fixture.detectChanges();
      expect(panelRows().length).toBeGreaterThan(0);

      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
      fixture.detectChanges();

      expect(panelRows()).toHaveLength(0);
      expect(document.activeElement).toBe(trigger(fixture));
    });

    it('a pointerdown+click outside the panel closes it and returns focus to the trigger', () => {
      // CDK's OverlayOutsideClickDispatcher tracks the pointerdown target,
      // then resolves outsidePointerEvents() on the following 'click' (both
      // listened for on <body> with capture:true) — dispatching only one of
      // the two never resolves it. jsdom has no global PointerEvent, so
      // (matching toast.service.spec.ts's own outside-click test) a
      // MouseEvent stands in for it.
      const fixture = create();
      trigger(fixture).focus();
      trigger(fixture).click();
      fixture.detectChanges();
      expect(panelRows().length).toBeGreaterThan(0);

      document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      fixture.detectChanges();

      expect(panelRows()).toHaveLength(0);
      expect(document.activeElement).toBe(trigger(fixture));
    });
  });

  // In-panel Up/Down/Left/Right/Home/End traversal is TreeNodeComponent's
  // own keyboard model (tree-node.component.ts:158-203, Wave 2 fix),
  // reused unmodified here through TreeSelectPanelComponent -> TreeComponent
  // -> TreeNodeComponent — not reimplemented by TreeSelect, but previously
  // never exercised in the TreeSelect context either.
  describe('in-panel tree traversal (TreeNodeComponent, reused unmodified)', () => {
    it('ArrowDown moves focus to the next visible row; ArrowRight expands a collapsed node with children and moves into it', () => {
      const fixture = create();
      trigger(fixture).click();
      fixture.detectChanges();

      const documentsRow = rowByLabel('Documents');
      documentsRow.focus();

      keydown(documentsRow, 'ArrowRight'); // expand Documents (collapsed by default)
      fixture.detectChanges();
      expect(panelRows().map((el) => el.textContent?.trim())).toEqual(
        expect.arrayContaining(['Resume.pdf', 'Invoice.pdf']),
      );

      keydown(documentsRow, 'ArrowDown'); // move down into the now-visible child
      fixture.detectChanges();
      expect(document.activeElement).toBe(rowByLabel('Resume.pdf'));
    });

    it('Enter on a focused row selects it and closes the panel, same as a click', () => {
      const fixture = create();
      const onChange = jest.fn();
      fixture.componentInstance.registerOnChange(onChange);

      trigger(fixture).click();
      fixture.detectChanges();

      const readmeRow = rowByLabel('README.md');
      readmeRow.focus();
      keydown(readmeRow, 'Enter');
      fixture.detectChanges();

      expect(onChange).toHaveBeenCalledWith(OPTIONS[2]);
      expect(panelRows()).toHaveLength(0);
    });
  });

  describe('filterable', () => {
    function filterInput(): HTMLInputElement | null {
      return document.querySelector('input[type="text"]');
    }

    it('does not render a search box by default', () => {
      const fixture = create();
      trigger(fixture).click();
      fixture.detectChanges();
      expect(filterInput()).toBeNull();
    });

    it('forwards filterable/filterPlaceholder to the panel, narrowing visible options', () => {
      const fixture = create();
      fixture.componentRef.setInput('filterable', true);
      fixture.componentRef.setInput('filterPlaceholder', 'Find a file');
      fixture.detectChanges();

      trigger(fixture).click();
      fixture.detectChanges();

      const input = filterInput()!;
      expect(input).not.toBeNull();
      expect(input.placeholder).toBe('Find a file');

      input.value = 'resume';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const labels = panelRows().map((el) => el.textContent?.trim());
      expect(labels).toEqual(expect.arrayContaining(['Documents', 'Resume.pdf']));
      expect(labels).not.toContain('Photos');
      expect(labels).not.toContain('README.md');
    });
  });

  describe('showClear', () => {
    it('renders no clear button by default, even with a value selected', () => {
      const fixture = create();
      fixture.componentInstance.writeValue(OPTIONS[2]);
      fixture.detectChanges();
      expect(trigger(fixture).querySelector('[aria-label="Clear"]')).toBeNull();
    });

    it('renders no clear button when showClear is true but nothing is selected', () => {
      const fixture = create();
      fixture.componentRef.setInput('showClear', true);
      fixture.detectChanges();
      expect(trigger(fixture).querySelector('[aria-label="Clear"]')).toBeNull();
    });

    it('showClear renders a clear button once a value is selected, which resets the value and does not open the panel', () => {
      const fixture = create();
      fixture.componentRef.setInput('showClear', true);
      fixture.componentInstance.writeValue(OPTIONS[2]);
      fixture.detectChanges();

      const onChange = jest.fn();
      fixture.componentInstance.registerOnChange(onChange);

      const clearButton = trigger(fixture).querySelector('[aria-label="Clear"]') as HTMLButtonElement;
      expect(clearButton).not.toBeNull();
      clearButton.click();
      fixture.detectChanges();

      expect(onChange).toHaveBeenCalledWith(null);
      expect(trigger(fixture).textContent).toContain('Select an item');
      expect(panelRows()).toHaveLength(0); // clicking clear must not also open the panel
    });

    it('no clear button while disabled, even with a value selected', () => {
      const fixture = create();
      fixture.componentRef.setInput('showClear', true);
      fixture.componentInstance.writeValue(OPTIONS[2]);
      fixture.componentInstance.setDisabledState(true);
      fixture.detectChanges();
      expect(trigger(fixture).querySelector('[aria-label="Clear"]')).toBeNull();
    });
  });

  describe('loading', () => {
    it('shows the tree, not a loading row, by default', () => {
      const fixture = create();
      trigger(fixture).click();
      fixture.detectChanges();
      expect(panelRows().length).toBeGreaterThan(0);
      expect(document.querySelector('.cdk-overlay-container')?.textContent).not.toContain('Loading...');
    });

    it('loading replaces the tree with a loading row in the panel', () => {
      const fixture = create();
      fixture.componentRef.setInput('loading', true);
      fixture.detectChanges();

      trigger(fixture).click();
      fixture.detectChanges();

      expect(panelRows()).toHaveLength(0);
      expect(document.querySelector('.cdk-overlay-container')?.textContent).toContain('Loading...');
    });

    it('honors a custom loadingLabel', () => {
      const fixture = create();
      fixture.componentRef.setInput('loading', true);
      fixture.componentRef.setInput('loadingLabel', 'Fetching tree...');
      fixture.detectChanges();

      trigger(fixture).click();
      fixture.detectChanges();

      expect(document.querySelector('.cdk-overlay-container')?.textContent).toContain('Fetching tree...');
    });
  });
});
