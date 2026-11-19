import { TestBed } from '@angular/core/testing';
import { PaginatorComponent } from './paginator.component';

function create(totalRecords: number, rows = 10) {
  const fixture = TestBed.createComponent(PaginatorComponent);
  fixture.componentRef.setInput('totalRecords', totalRecords);
  fixture.componentRef.setInput('rows', rows);
  fixture.detectChanges();
  return fixture;
}

function pageButtons(fixture: { nativeElement: HTMLElement }): HTMLButtonElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('button[aria-label^="Page "]'));
}

function prevButton(fixture: { nativeElement: HTMLElement }): HTMLButtonElement {
  return fixture.nativeElement.querySelector('button[aria-label="Previous page"]') as HTMLButtonElement;
}

function nextButton(fixture: { nativeElement: HTMLElement }): HTMLButtonElement {
  return fixture.nativeElement.querySelector('button[aria-label="Next page"]') as HTMLButtonElement;
}

describe('PaginatorComponent', () => {
  it('renders one page button per page when total fits within pageLinkCount', () => {
    const fixture = create(35, 10); // 4 pages
    expect(pageButtons(fixture)).toHaveLength(4);
    expect(pageButtons(fixture).map((b) => b.textContent?.trim())).toEqual(['1', '2', '3', '4']);
  });

  it('disables Previous on the first page and Next on the last page', () => {
    const fixture = create(35, 10);
    expect(prevButton(fixture).disabled).toBe(true);
    expect(nextButton(fixture).disabled).toBe(false);
  });

  it('marks the current page with aria-current="page"', () => {
    const fixture = create(35, 10);
    const current = fixture.nativeElement.querySelector('[aria-current="page"]');
    expect(current?.textContent?.trim()).toBe('1');
  });

  it('clicking a page number updates first and emits pageChange', () => {
    const fixture = create(35, 10);
    const received: unknown[] = [];
    fixture.componentInstance.pageChange.subscribe((event) => received.push(event));

    pageButtons(fixture)[2].click(); // page 3 (0-based index 2)
    fixture.detectChanges();

    expect(fixture.componentInstance.first()).toBe(20);
    expect(received).toEqual([{ first: 20, rows: 10, page: 2, pageCount: 4 }]);
  });

  it('Next/Previous move one page at a time', () => {
    const fixture = create(35, 10);
    nextButton(fixture).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.first()).toBe(10);

    nextButton(fixture).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.first()).toBe(20);

    prevButton(fixture).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.first()).toBe(10);
  });

  it('first supports two-way binding via [(first)]', () => {
    const fixture = create(35, 10);
    fixture.componentRef.setInput('first', 20);
    fixture.detectChanges();

    const current = fixture.nativeElement.querySelector('[aria-current="page"]');
    expect(current?.textContent?.trim()).toBe('3');
  });

  it('windows the page-number range around the current page when there are more pages than pageLinkCount', () => {
    const fixture = create(200, 10); // 20 pages
    fixture.componentRef.setInput('pageLinkCount', 5);
    fixture.componentRef.setInput('first', 90); // page index 9 (page 10)
    fixture.detectChanges();

    expect(pageButtons(fixture).map((b) => b.textContent?.trim())).toEqual(['8', '9', '10', '11', '12']);
  });

  it('clamps the window at the last page instead of running past it', () => {
    const fixture = create(200, 10); // 20 pages
    fixture.componentRef.setInput('pageLinkCount', 5);
    fixture.componentRef.setInput('first', 190); // last page (index 19)
    fixture.detectChanges();

    expect(pageButtons(fixture).map((b) => b.textContent?.trim())).toEqual(['16', '17', '18', '19', '20']);
  });

  it('shows a "Showing X-Y of Z" summary by default', () => {
    const fixture = create(35, 10);
    expect(fixture.nativeElement.textContent).toContain('Showing 1-10 of 35');
  });

  it('the summary caps the upper bound at totalRecords on the last (partial) page', () => {
    const fixture = create(35, 10);
    fixture.componentRef.setInput('first', 30);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Showing 31-35 of 35');
  });

  it('hides the summary when showSummary is false', () => {
    const fixture = create(35, 10);
    fixture.componentRef.setInput('showSummary', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Showing');
  });

  it('treats zero total records as a single, empty page and does not crash', () => {
    const fixture = create(0, 10);
    expect(pageButtons(fixture)).toHaveLength(1);
    expect(prevButton(fixture).disabled).toBe(true);
    expect(nextButton(fixture).disabled).toBe(true);
  });

  it('overrides previousLabel/nextLabel/pageLabel via their aria-label inputs', () => {
    const fixture = create(35, 10);
    fixture.componentRef.setInput('previousLabel', 'Página anterior');
    fixture.componentRef.setInput('nextLabel', 'Próxima página');
    fixture.componentRef.setInput('pageLabel', 'Página');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('button[aria-label="Página anterior"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('button[aria-label="Próxima página"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('button[aria-label="Página 1"]')).not.toBeNull();
  });

  it('overrides the summary text via summaryLabelTemplate', () => {
    const fixture = create(35, 10);
    fixture.componentRef.setInput('summaryLabelTemplate', (first: number, last: number, total: number) => `${first}–${last} / ${total} items`);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('1–10 / 35 items');
    expect(fixture.nativeElement.textContent).not.toContain('Showing');
  });

  it('role="toolbar" wraps Prev, the page buttons, and Next as a single group', () => {
    const fixture = create(35, 10);
    expect(fixture.nativeElement.querySelector('ul[role="toolbar"]')).not.toBeNull();
  });

  it('roving tabindex: only one control is in the Tab order at a time, defaulting to the current page', () => {
    const fixture = create(35, 10); // 4 pages, on page 1: Prev disabled
    const all = [prevButton(fixture), ...pageButtons(fixture), nextButton(fixture)];
    expect(all.map((b) => b.tabIndex)).toEqual([-1, 0, -1, -1, -1, -1]);
  });

  it('ArrowRight moves the roving tab stop across page buttons and onto Next', () => {
    const fixture = create(35, 10); // 4 pages
    const pages = pageButtons(fixture);
    pages[0].dispatchEvent(new Event('focus'));
    fixture.detectChanges();

    pages[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(pages[1]);

    pages[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    pages[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    pages[3].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    // Page 4 (last page) -> ArrowRight reaches Next.
    expect(document.activeElement).toBe(nextButton(fixture));
  });

  it('ArrowLeft from the first page skips the disabled Prev and wraps to Next', () => {
    const fixture = create(35, 10); // 4 pages, on page 1: Prev is disabled
    const pages = pageButtons(fixture);
    pages[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(nextButton(fixture));
  });

  it('Home/End jump the roving tab stop to the first/last enabled control', () => {
    const fixture = create(35, 10); // 4 pages, Prev disabled on page 1
    const pages = pageButtons(fixture);
    pages[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(nextButton(fixture));

    nextButton(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    fixture.detectChanges();
    // Prev is disabled, so Home lands on the first enabled control: page 1.
    expect(document.activeElement).toBe(pages[0]);
  });

  describe('rowsPerPageOptions', () => {
    function select(fixture: { nativeElement: HTMLElement }): HTMLSelectElement {
      return fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    }

    function chooseRows(fixture: { nativeElement: HTMLElement }, rows: number) {
      const el = select(fixture);
      el.value = String(rows);
      el.dispatchEvent(new Event('change'));
    }

    it('renders no <select> when rowsPerPageOptions is not set (default)', () => {
      const fixture = create(35, 10);
      expect(select(fixture)).toBeNull();
    });

    it('renders a <select> with one <option> per value, current rows selected', () => {
      const fixture = create(35, 10);
      fixture.componentRef.setInput('rowsPerPageOptions', [10, 20, 50]);
      fixture.detectChanges();

      const el = select(fixture);
      expect(el).not.toBeNull();
      expect(Array.from(el.options).map((o) => o.value)).toEqual(['10', '20', '50']);
      expect(el.value).toBe('10');
    });

    it('choosing a new page size updates rows, resets first to 0, and emits pageChange', () => {
      const fixture = create(95, 10); // 10 pages, starting on page 1
      fixture.componentRef.setInput('rowsPerPageOptions', [10, 20, 50]);
      fixture.componentInstance.first.set(30); // page 4
      fixture.detectChanges();
      const emitted = jest.fn();
      fixture.componentInstance.pageChange.subscribe(emitted);

      chooseRows(fixture, 20);
      fixture.detectChanges();

      expect(fixture.componentInstance.rows()).toBe(20);
      expect(fixture.componentInstance.first()).toBe(0);
      expect(emitted).toHaveBeenCalledWith({ first: 0, rows: 20, page: 0, pageCount: 5 });
    });

    it('an unbound consumer using [rows] one-way is unaffected by rows becoming a model()', () => {
      const fixture = create(35, 10);
      expect(fixture.componentInstance.rows()).toBe(10);
      // re-setting the same input value (simulating a stable one-way binding across
      // change detection) must not clobber a value the dropdown may have set locally
      fixture.componentRef.setInput('rowsPerPageOptions', [10, 20]);
      fixture.detectChanges();
      chooseRows(fixture, 20);
      fixture.detectChanges();
      expect(fixture.componentInstance.rows()).toBe(20);
    });

    it('uses a custom rowsPerPageLabel', () => {
      const fixture = create(35, 10);
      fixture.componentRef.setInput('rowsPerPageOptions', [10, 20]);
      fixture.componentRef.setInput('rowsPerPageLabel', 'Per page');
      fixture.detectChanges();
      expect(select(fixture).getAttribute('aria-label')).toBe('Per page');
      expect(fixture.nativeElement.textContent).toContain('Per page');
    });
  });

  describe('showFirstLastIcon', () => {
    function firstButton(fixture: { nativeElement: HTMLElement }): HTMLButtonElement | null {
      return fixture.nativeElement.querySelector('button[aria-label="First page"]');
    }

    function lastButton(fixture: { nativeElement: HTMLElement }): HTMLButtonElement | null {
      return fixture.nativeElement.querySelector('button[aria-label="Last page"]');
    }

    it('renders no First/Last buttons by default (see class doc)', () => {
      const fixture = create(35, 10);
      expect(firstButton(fixture)).toBeNull();
      expect(lastButton(fixture)).toBeNull();
    });

    it('renders First/Last buttons when enabled, disabled together with Prev/Next', () => {
      const fixture = create(35, 10); // page 1 of 4
      fixture.componentRef.setInput('showFirstLastIcon', true);
      fixture.detectChanges();

      expect(firstButton(fixture)?.disabled).toBe(true); // on the first page
      expect(lastButton(fixture)?.disabled).toBe(false);
    });

    it('clicking Last jumps straight to the last page; First jumps back to the first', () => {
      const fixture = create(35, 10); // 4 pages
      fixture.componentRef.setInput('showFirstLastIcon', true);
      fixture.detectChanges();

      lastButton(fixture)!.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.first()).toBe(30); // page 4

      firstButton(fixture)!.click();
      fixture.detectChanges();
      expect(fixture.componentInstance.first()).toBe(0); // page 1
    });

    it('joins the roving toolbar as [First, Prev, ...pages, Next, Last] — Home/End land on First/Last, not Prev/Next', () => {
      const fixture = create(35, 10); // 4 pages
      fixture.componentRef.setInput('showFirstLastIcon', true);
      fixture.componentRef.setInput('first', 10); // page 2, so Prev/Next are both enabled
      fixture.detectChanges();

      const pages = pageButtons(fixture);
      pages[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
      fixture.detectChanges();
      expect(document.activeElement).toBe(firstButton(fixture));

      firstButton(fixture)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
      fixture.detectChanges();
      expect(document.activeElement).toBe(lastButton(fixture));
    });

    it('uses custom firstPageLabel/lastPageLabel', () => {
      const fixture = create(35, 10);
      fixture.componentRef.setInput('showFirstLastIcon', true);
      fixture.componentRef.setInput('firstPageLabel', 'Primeira página');
      fixture.componentRef.setInput('lastPageLabel', 'Última página');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('button[aria-label="Primeira página"]')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('button[aria-label="Última página"]')).not.toBeNull();
    });
  });

  describe('showJumpToPageInput', () => {
    function jumpInput(fixture: { nativeElement: HTMLElement }): HTMLInputElement | null {
      return fixture.nativeElement.querySelector('input[type="number"]');
    }

    it('renders no jump-to-page input by default', () => {
      const fixture = create(35, 10);
      expect(jumpInput(fixture)).toBeNull();
    });

    it('shows the 1-based current page as its value', () => {
      const fixture = create(35, 10);
      fixture.componentRef.setInput('showJumpToPageInput', true);
      fixture.componentRef.setInput('first', 10); // page 2
      fixture.detectChanges();
      expect(jumpInput(fixture)?.value).toBe('2');
    });

    it('committing a new value navigates to that page (1-based) and emits pageChange', () => {
      const fixture = create(95, 10); // 10 pages
      fixture.componentRef.setInput('showJumpToPageInput', true);
      fixture.detectChanges();
      const emitted = jest.fn();
      fixture.componentInstance.pageChange.subscribe(emitted);

      const input = jumpInput(fixture)!;
      input.value = '7';
      input.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(fixture.componentInstance.first()).toBe(60); // page 7, 0-based index 6
      expect(emitted).toHaveBeenCalledWith({ first: 60, rows: 10, page: 6, pageCount: 10 });
    });

    it('clamps an out-of-range value to the valid page range', () => {
      const fixture = create(35, 10); // 4 pages
      fixture.componentRef.setInput('showJumpToPageInput', true);
      fixture.detectChanges();

      const input = jumpInput(fixture)!;
      input.value = '999';
      input.dispatchEvent(new Event('change'));
      fixture.detectChanges();

      expect(fixture.componentInstance.first()).toBe(30); // clamped to the last page (4)
    });

    it('uses a custom jumpToPageLabel', () => {
      const fixture = create(35, 10);
      fixture.componentRef.setInput('showJumpToPageInput', true);
      fixture.componentRef.setInput('jumpToPageLabel', 'Ir para a página');
      fixture.detectChanges();
      expect(jumpInput(fixture)?.getAttribute('aria-label')).toBe('Ir para a página');
    });
  });

  // @scenario UI-007.S2
  describe('alwaysShow and currentPageReportTemplate (Wave 2)', () => {
    it('hides the paginator when alwaysShow is false and there is only one page', () => {
      const fixture = create(5, 10);
      fixture.componentRef.setInput('alwaysShow', false);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('nav')).toBeNull();
    });

    it('keeps the paginator visible when alwaysShow is false and there are multiple pages', () => {
      const fixture = create(25, 10);
      fixture.componentRef.setInput('alwaysShow', false);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('nav')).not.toBeNull();
    });

    it('formats the page report using currentPageReportTemplate placeholders', () => {
      const fixture = create(35, 10);
      fixture.componentRef.setInput('first', 10);
      fixture.componentRef.setInput('currentPageReportTemplate', 'Page {currentPage} of {totalPages} ({first}-{last} / {totalRecords})');
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Page 2 of 4 (11-20 / 35)');
    });
  });
});
