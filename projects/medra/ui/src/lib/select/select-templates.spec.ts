import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { SelectComponent } from './select.component';
import { FormsModule } from '@angular/forms';

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

function trigger(fixture: ComponentFixture<unknown>): HTMLElement {
  return fixture.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
}

function q(selector: string): HTMLElement | null {
  return document.querySelector(selector);
}

@Component({
  standalone: true,
  imports: [SelectComponent, FormsModule],
  template: `
    <med-select
      [options]="options()"
      optionLabel="name"
      optionValue="code"
      [optionGroupLabel]="groupLabel()"
      [optionGroupChildren]="groupChildren()"
      [showClear]="showClear()"
      [loading]="loading()"
      [(ngModel)]="model"
    >
      @if (withValue()) {
        <ng-template #value let-value let-option="option"><b data-testid="tpl-value">{{ value }}/{{ option.label }}</b></ng-template>
      }
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
      @if (withIcons()) {
        <ng-template #triggerIcon><span data-testid="tpl-trigger-icon">T</span></ng-template>
        <ng-template #clearIcon><span data-testid="tpl-clear-icon">C</span></ng-template>
        <ng-template #loadingIcon><span data-testid="tpl-loading-icon">L</span></ng-template>
      }
    </med-select>
  `,
})
class HostComponent {
  readonly options = signal<unknown[]>(COUNTRIES);
  readonly groupLabel = signal<string | null>(null);
  readonly groupChildren = signal<string | null>(null);
  readonly showClear = signal(false);
  readonly loading = signal(false);
  readonly withValue = signal(false);
  readonly withOption = signal(false);
  readonly withGroup = signal(false);
  readonly withPanel = signal(false);
  readonly withIcons = signal(false);
  model: string | null = null;
}

describe('SelectComponent — consumer templates', () => {
  let restoreLayout: () => void;

  beforeEach(() => {
    restoreLayout = fakeViewportLayout();
    TestBed.configureTestingModule({ imports: [OverlayModule, HostComponent] });
  });

  afterEach(() => {
    restoreLayout();
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  async function create(configure: (host: HostComponent) => void = () => {}): Promise<ComponentFixture<HostComponent>> {
    const fixture = TestBed.createComponent(HostComponent);
    configure(fixture.componentInstance);
    await settle(fixture);
    return fixture;
  }

  async function open(fixture: ComponentFixture<unknown>): Promise<void> {
    trigger(fixture).click();
    await settle(fixture);
  }

  // UI-029.S1
  it('UI-029.S1: #value replaces the default label and receives the chosen option', async () => {
    const fixture = await create((h) => {
      h.withValue.set(true);
      h.model = 'BR';
    });

    const tpl = fixture.nativeElement.querySelector('[data-testid="tpl-value"]') as HTMLElement | null;
    expect(tpl?.textContent).toBe('BR/Brazil');
    expect(trigger(fixture).querySelector('span.truncate')?.textContent ?? '').not.toContain('Brazil');
  });

  // UI-029.S2
  it('UI-029.S2: #option replaces each row label, keeps role="option" and keyboard selection', async () => {
    const fixture = await create((h) => {
      h.withOption.set(true);
    });
    await open(fixture);

    const rows = Array.from(document.querySelectorAll('[role="listbox"] [role="option"]'));
    expect(rows.length).toBe(2);
    expect(rows.map((r) => r.querySelector('[data-testid="tpl-option"]')?.textContent)).toEqual(['Brazil-false', 'Argentina-false']);

    q('[role="listbox"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    await settle(fixture);

    expect(fixture.componentInstance.model).toBe('BR');
  });

  // UI-029.S3
  it('UI-029.S3: #group replaces each group header and receives the group label', async () => {
    const fixture = await create((h) => {
      h.withGroup.set(true);
      h.groupLabel.set('label');
      h.groupChildren.set('items');
      h.options.set([
        { label: 'South America', items: COUNTRIES },
        { label: 'Europe', items: [{ name: 'Spain', code: 'ES' }] },
      ]);
    });
    await open(fixture);

    const headers = Array.from(document.querySelectorAll('[data-testid="tpl-group"]')).map((el) => el.textContent);
    expect(headers).toEqual(['G:South America', 'G:Europe']);
  });

  // UI-029.S4
  it('UI-029.S4: #header and #footer frame the list and #empty replaces the empty text', async () => {
    const fixture = await create((h) => {
      h.withPanel.set(true);
    });
    await open(fixture);

    const header = q('[data-testid="tpl-header"]');
    const footer = q('[data-testid="tpl-footer"]');
    const list = q('[role="listbox"]');
    expect(header).not.toBeNull();
    expect(footer).not.toBeNull();
    expect(header!.compareDocumentPosition(list!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(footer!.compareDocumentPosition(list!) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
    expect(q('[data-testid="tpl-empty"]')).toBeNull();

    // Reopen with no options.
    list!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await settle(fixture);
    fixture.componentInstance.options.set([]);
    await settle(fixture);
    await open(fixture);

    expect(q('[data-testid="tpl-empty"]')?.textContent).toBe('nothing here');
    expect(document.body.textContent).not.toContain('No results found');
  });

  // UI-029.S5
  it('UI-029.S5: #triggerIcon and #clearIcon replace the open and clear icons', async () => {
    const fixture = await create((h) => {
      h.withIcons.set(true);
      h.showClear.set(true);
      h.model = 'BR';
    });

    expect(fixture.nativeElement.querySelector('[data-testid="tpl-trigger-icon"]')?.textContent).toBe('T');
    expect(fixture.nativeElement.querySelector('[data-testid="tpl-clear-icon"]')?.textContent).toBe('C');
    expect(trigger(fixture).querySelector('med-icon')).toBeNull();
  });

  // UI-029.S6
  it('UI-029.S6: #loadingIcon replaces the loading indicator while loading', async () => {
    const fixture = await create((h) => {
      h.withIcons.set(true);
      h.loading.set(true);
    });
    await open(fixture);

    expect(q('[data-testid="tpl-loading-icon"]')?.textContent).toBe('L');
  });

  // UI-029.S7
  it('UI-029.S7: without templates the default value, rows, headers and icons render', async () => {
    const fixture = await create((h) => {
      h.groupLabel.set('label');
      h.groupChildren.set('items');
      h.showClear.set(true);
      h.options.set([{ label: 'South America', items: COUNTRIES }]);
      h.model = 'BR';
    });

    expect(trigger(fixture).textContent).toContain('Brazil');
    expect(trigger(fixture).querySelectorAll('med-icon').length).toBe(2);

    await open(fixture);

    const rows = Array.from(document.querySelectorAll('[role="listbox"] [role="option"]')).map((el) => (el.textContent ?? '').trim());
    expect(rows).toEqual(['Brazil', 'Argentina']);
    expect(document.body.textContent).toContain('South America');
    expect(document.querySelector('[data-testid^="tpl-"]')).toBeNull();
  });
});
