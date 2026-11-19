import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { AutocompleteComponent } from './autocomplete.component';
import { SelectOption } from '../select/select.types';

/** Consumer templates for the list: UI-019.S1 (#item), UI-019.S2 (#group), UI-019.S3 (#empty), UI-019.S4 (#loader). */

const FRUITS: SelectOption<string>[] = [
  { label: 'Apple', value: 'apple', group: 'Red' },
  { label: 'Cherry', value: 'cherry', group: 'Red' },
  { label: 'Banana', value: 'banana', group: 'Yellow' },
];

@Component({
  standalone: true,
  imports: [AutocompleteComponent],
  template: `
    <med-autocomplete [suggestions]="suggestions()" [loading]="loading()" (optionSelected)="picked.push($event)">
      <ng-template #item let-option let-index="index">
        <strong class="custom-item" [attr.data-index]="index">{{ option.label }}</strong>
      </ng-template>
      <ng-template #group let-label>
        <em class="custom-group">{{ label }}</em>
      </ng-template>
      <ng-template #empty><span class="custom-empty">Nothing here</span></ng-template>
      <ng-template #loader><span class="custom-loader">Fetching…</span></ng-template>
    </med-autocomplete>
  `,
})
class HostComponent {
  readonly suggestions = signal<readonly SelectOption<string>[]>(FRUITS);
  readonly loading = signal(false);
  readonly picked: unknown[] = [];
}

function trigger(fixture: ComponentFixture<unknown>): HTMLInputElement {
  return fixture.nativeElement.querySelector('[role="combobox"]') as HTMLInputElement;
}

describe('AutocompleteComponent consumer templates', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function create() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }

  function openPanel(fixture: ComponentFixture<HostComponent>) {
    const el = trigger(fixture);
    el.value = 'a';
    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    jest.runAllTimers();
    fixture.detectChanges();
  }

  it('UI-019.S1: every row uses the consumer item template and picking a row picks its suggestion', () => {
    const fixture = create();
    openPanel(fixture);

    const rows = Array.from(document.querySelectorAll('[role="option"]'));
    expect(rows.length).toBe(3);
    for (const row of rows) {
      expect(row.querySelector('strong.custom-item')).not.toBeNull();
    }
    expect(rows[2].querySelector('strong.custom-item')?.textContent).toBe('Banana');
    expect(rows[2].querySelector('strong.custom-item')?.getAttribute('data-index')).toBe('2');

    rows[2].dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(trigger(fixture).value).toBe('Banana');
  });

  it('UI-019.S1: keyboard Enter still picks the highlighted row rendered by the consumer template', () => {
    const fixture = create();
    openPanel(fixture);

    trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    trigger(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(document.querySelectorAll('[role="option"]').length).toBe(0);
    expect(trigger(fixture).value).toBe('Cherry');
    expect(fixture.componentInstance.picked).toEqual([FRUITS[1]]);
  });

  it('UI-019.S2: every group header uses the consumer group template', () => {
    const fixture = create();
    openPanel(fixture);

    const headers = Array.from(document.querySelectorAll('em.custom-group')).map((el) => el.textContent);
    expect(headers).toEqual(['Red', 'Yellow']);
  });

  it('UI-019.S3: an empty result shows the consumer empty template instead of the default message', () => {
    const fixture = create();
    fixture.componentInstance.suggestions.set([]);
    fixture.detectChanges();
    openPanel(fixture);

    expect(document.querySelector('.custom-empty')?.textContent).toBe('Nothing here');
    expect(document.body.textContent).not.toContain('No results found');
  });

  it('UI-019.S4: while loading with the panel open, the consumer loader template is shown', () => {
    const fixture = create();
    openPanel(fixture);
    expect(document.querySelector('.custom-loader')).toBeNull();

    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();
    jest.runAllTimers();
    fixture.detectChanges();

    expect(document.querySelector('.custom-loader')?.textContent).toBe('Fetching…');
  });
});
