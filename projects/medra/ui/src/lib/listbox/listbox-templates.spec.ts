import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ListboxComponent } from './listbox.component';

interface Country {
  name: string;
  code: string;
}

const COUNTRIES: Country[] = [
  { name: 'Brazil', code: 'BR' },
  { name: 'Argentina', code: 'AR' },
];

// jsdom has no layout, so `cdk-virtual-scroll-viewport` measures a zero-height
// viewport and renders no rows. Give it a real measured size so the rendered
// rows can be asserted from the DOM.
function fakeViewportLayout(): () => void {
  const clientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
  const clientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 300 });
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get: () => 300 });
  return () => {
    if (clientHeight) Object.defineProperty(HTMLElement.prototype, 'clientHeight', clientHeight);
    else delete (HTMLElement.prototype as unknown as Record<string, unknown>)['clientHeight'];
    if (clientWidth) Object.defineProperty(HTMLElement.prototype, 'clientWidth', clientWidth);
    else delete (HTMLElement.prototype as unknown as Record<string, unknown>)['clientWidth'];
  };
}

async function settle(fixture: ComponentFixture<unknown>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  await new Promise((resolve) => setTimeout(resolve, 0));
  fixture.detectChanges();
}

@Component({
  standalone: true,
  imports: [ListboxComponent, FormsModule],
  template: `
    <med-listbox
      [options]="options()"
      optionLabel="name"
      optionValue="code"
      [optionGroupLabel]="groupLabel()"
      [optionGroupChildren]="groupChildren()"
      [loading]="loading()"
      [dragdrop]="dragdrop()"
      [(ngModel)]="model"
    >
      @if (withOption()) {
        <ng-template #option let-option let-selected="selected"><i data-testid="tpl-option">{{ option.label }}-{{ selected }}</i></ng-template>
      }
      @if (withGroup()) {
        <ng-template #group let-label><u data-testid="tpl-group">G:{{ label }}</u></ng-template>
      }
      @if (withPanel()) {
        <ng-template #header><p data-testid="tpl-header">head</p></ng-template>
        <ng-template #footer><p data-testid="tpl-footer">foot</p></ng-template>
        <ng-template #empty><p data-testid="tpl-empty">nothing here</p></ng-template>
      }
      @if (withLoadingIcon()) {
        <ng-template #loadingIcon><span data-testid="tpl-loading-icon">L</span></ng-template>
      }
    </med-listbox>
  `,
})
class HostComponent {
  readonly options = signal<unknown[]>(COUNTRIES);
  readonly groupLabel = signal<string | null>(null);
  readonly groupChildren = signal<string | null>(null);
  readonly loading = signal(false);
  readonly dragdrop = signal(false);
  readonly withOption = signal(false);
  readonly withGroup = signal(false);
  readonly withPanel = signal(false);
  readonly withLoadingIcon = signal(false);
  model: string | null = null;
}

const GROUPED = [
  { label: 'South America', items: COUNTRIES },
  { label: 'Europe', items: [{ name: 'Spain', code: 'ES' }] },
];

describe('ListboxComponent — consumer templates', () => {
  let restoreLayout: () => void;

  beforeEach(() => {
    restoreLayout = fakeViewportLayout();
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  afterEach(() => {
    restoreLayout();
  });

  async function create(configure: (host: HostComponent) => void = () => {}): Promise<ComponentFixture<HostComponent>> {
    const fixture = TestBed.createComponent(HostComponent);
    configure(fixture.componentInstance);
    await settle(fixture);
    return fixture;
  }

  function q(fixture: ComponentFixture<unknown>, selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  // UI-039.S1
  it('UI-039.S1: #option replaces each row label and receives the option as context', async () => {
    const fixture = await create((h) => h.withOption.set(true));

    const rows = Array.from(fixture.nativeElement.querySelectorAll('[role="listbox"] [role="option"]')) as HTMLElement[];
    expect(rows.length).toBe(2);
    expect(rows.map((r) => r.querySelector('[data-testid="tpl-option"]')?.textContent)).toEqual(['Brazil-false', 'Argentina-false']);
  });

  // UI-039.S2
  it('UI-039.S2: #group replaces each group header and receives the group label', async () => {
    const fixture = await create((h) => {
      h.withGroup.set(true);
      h.groupLabel.set('label');
      h.groupChildren.set('items');
      h.options.set(GROUPED);
    });

    const headers = Array.from(fixture.nativeElement.querySelectorAll('[data-testid="tpl-group"]')).map((el) => (el as HTMLElement).textContent);
    expect(headers).toEqual(['G:South America', 'G:Europe']);
  });

  // UI-039.S3
  it('UI-039.S3: #header appears above the options and #footer below them', async () => {
    const fixture = await create((h) => h.withPanel.set(true));

    const header = q(fixture, '[data-testid="tpl-header"]');
    const footer = q(fixture, '[data-testid="tpl-footer"]');
    const list = q(fixture, '[role="listbox"]');
    expect(header).not.toBeNull();
    expect(footer).not.toBeNull();
    expect(header!.compareDocumentPosition(list!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(footer!.compareDocumentPosition(list!) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  });

  // UI-039.S4
  it('UI-039.S4: #empty replaces the default empty message', async () => {
    const fixture = await create((h) => {
      h.withPanel.set(true);
      h.options.set([]);
    });

    expect(q(fixture, '[data-testid="tpl-empty"]')?.textContent).toBe('nothing here');
    expect(fixture.nativeElement.textContent).not.toContain('No results found');
  });

  // UI-039.S5
  it('UI-039.S5: #loadingIcon replaces the default loading icon', async () => {
    const fixture = await create((h) => {
      h.withLoadingIcon.set(true);
      h.loading.set(true);
    });

    expect(q(fixture, '[data-testid="tpl-loading-icon"]')?.textContent).toBe('L');
  });

  // UI-039.S6
  it('UI-039.S6: renders the defaults without templates, and dragdrop ignores templates and groups', async () => {
    const fixture = await create((h) => {
      h.groupLabel.set('label');
      h.groupChildren.set('items');
      h.options.set(GROUPED);
    });

    // Default rendering of every part.
    const texts = Array.from(fixture.nativeElement.querySelectorAll('[role="listbox"] [role="option"]')).map((el) => ((el as HTMLElement).textContent ?? '').trim());
    expect(texts).toEqual(['Brazil', 'Argentina', 'Spain']);
    expect(fixture.nativeElement.textContent).toContain('South America');
    expect(q(fixture, '[data-testid^="tpl-"]')).toBeNull();

    // Same list with every template supplied: the templates take over.
    fixture.componentInstance.withOption.set(true);
    fixture.componentInstance.withGroup.set(true);
    fixture.componentInstance.withPanel.set(true);
    await settle(fixture);
    expect(q(fixture, '[data-testid="tpl-option"]')).not.toBeNull();
    expect(q(fixture, '[data-testid="tpl-group"]')).not.toBeNull();
    expect(q(fixture, '[data-testid="tpl-header"]')).not.toBeNull();

    // dragdrop keeps its own plain rows: no templates and no group headers.
    fixture.componentInstance.dragdrop.set(true);
    await settle(fixture);
    expect(q(fixture, '[data-testid^="tpl-"]')).toBeNull();
    const dragRows = Array.from(fixture.nativeElement.querySelectorAll('[role="listbox"] [role="option"]')).map((el) => ((el as HTMLElement).textContent ?? '').trim());
    expect(dragRows).toEqual(['Brazil', 'Argentina', 'Spain']);
    expect(fixture.nativeElement.textContent).not.toContain('South America');
  });
});
