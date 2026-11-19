import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { CascadeSelectComponent } from './cascade-select.component';
import { CascadeSelectOption } from './cascade-select.types';

/**
 * UI-024: consumer templates by named reference (#value, #option, #header, #footer, #triggerIcon,
 * #loadingIcon, #groupIcon, #clearIcon). The scenarios assert what is rendered on screen (L-006).
 */

const OPTIONS: CascadeSelectOption<string>[] = [
  { label: 'USA', value: 'usa', children: [{ label: 'California', value: 'california' }] },
  { label: 'Brazil', value: 'brazil' },
];

@Component({
  standalone: true,
  imports: [CascadeSelectComponent],
  template: `
    <med-cascade-select [options]="options" [showClear]="true" [loading]="loading()">
      <ng-template #value let-value let-path="path">
        <b class="custom-value">{{ value }}|{{ path.join('>') }}</b>
      </ng-template>
      <ng-template #option let-option let-path="path" let-hasChildren="hasChildren">
        <i class="custom-option" [attr.data-has-children]="hasChildren">{{ option.label }}@{{ path.length }}</i>
      </ng-template>
      <ng-template #header><div class="custom-header">Header</div></ng-template>
      <ng-template #footer><div class="custom-footer">Footer</div></ng-template>
      <ng-template #triggerIcon><span class="custom-trigger-icon"></span></ng-template>
      <ng-template #loadingIcon><span class="custom-loading-icon"></span></ng-template>
      <ng-template #groupIcon><span class="custom-group-icon"></span></ng-template>
      <ng-template #clearIcon><span class="custom-clear-icon"></span></ng-template>
    </med-cascade-select>
  `,
})
class HostComponent {
  readonly options = OPTIONS;
  readonly loading = signal(false);
}

@Component({
  standalone: true,
  imports: [CascadeSelectComponent],
  template: `<med-cascade-select [options]="options" [showClear]="true" />`,
})
class PlainHostComponent {
  readonly options = OPTIONS;
}

function trigger(fixture: ComponentFixture<unknown>): HTMLElement {
  return fixture.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
}

function panels(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[role="listbox"]'));
}

function keydown(el: HTMLElement, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('CascadeSelectComponent consumer templates', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function open(fixture: ComponentFixture<unknown>) {
    trigger(fixture).click();
    fixture.detectChanges();
  }

  /** Opens the panel and picks the California leaf, leaving the field with a value. */
  function pickCalifornia(fixture: ComponentFixture<unknown>) {
    open(fixture);
    keydown(panels()[0], 'ArrowRight');
    fixture.detectChanges();
    keydown(panels()[1], 'Enter');
    fixture.detectChanges();
  }

  it('UI-024.S1: the #value template replaces the default path and receives the value and the path', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    pickCalifornia(fixture);

    const custom = fixture.nativeElement.querySelector('.custom-value') as HTMLElement;
    expect(custom).not.toBeNull();
    expect(custom.textContent).toBe('california|USA>California');
    expect(trigger(fixture).textContent).not.toContain('USA / California');
  });

  it('UI-024.S2: the #option template renders every row and the rows keep role="option" and keyboard', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    open(fixture);

    const rows = Array.from(panels()[0].querySelectorAll('[role="option"]'));
    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.querySelector('.custom-option')?.textContent)).toEqual(['USA@0', 'Brazil@0']);
    expect(rows[0].querySelector('.custom-option')?.getAttribute('data-has-children')).toBe('true');
    expect(rows[1].querySelector('.custom-option')?.getAttribute('data-has-children')).toBe('false');

    keydown(panels()[0], 'ArrowRight');
    fixture.detectChanges();
    expect(panels()).toHaveLength(2);
    expect(panels()[1].querySelector('.custom-option')?.textContent).toBe('California@1');
  });

  it('UI-024.S3: the #header template renders above the list and the #footer template below it', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    open(fixture);

    const panel = panels()[0].closest('med-cascade-select-panel') as HTMLElement;
    const header = panel.querySelector('.custom-header') as HTMLElement;
    const footer = panel.querySelector('.custom-footer') as HTMLElement;
    expect(header).not.toBeNull();
    expect(footer).not.toBeNull();
    expect(header.compareDocumentPosition(panels()[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(footer.compareDocumentPosition(panels()[0]) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  });

  it('UI-024.S4: #triggerIcon, #groupIcon and #clearIcon replace the default icons', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.custom-trigger-icon')).not.toBeNull();
    expect(el.querySelector('med-icon[name="chevron-down"]')).toBeNull();

    open(fixture);
    expect(panels()[0].querySelector('.custom-group-icon')).not.toBeNull();
    expect(panels()[0].querySelector('med-icon[name="chevron-right"]')).toBeNull();

    keydown(panels()[0], 'ArrowRight');
    fixture.detectChanges();
    keydown(panels()[1], 'Enter');
    fixture.detectChanges();

    expect(el.querySelector('.custom-clear-icon')).not.toBeNull();
    expect(el.querySelector('med-icon[name="x-mark"]')).toBeNull();
  });

  it('UI-024.S5: the #loadingIcon template replaces the spinner while loading', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.custom-loading-icon')).not.toBeNull();
    expect(el.querySelector('med-progress-spinner')).toBeNull();
  });

  it('UI-024.S6: without templates the default rendering is used', () => {
    const fixture = TestBed.createComponent(PlainHostComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('med-icon[name="chevron-down"]')).not.toBeNull();
    open(fixture);
    expect(panels()[0].querySelector('med-icon[name="chevron-right"]')).not.toBeNull();
    expect(panels()[0].querySelectorAll('[role="option"]')[0].textContent).toContain('USA');

    keydown(panels()[0], 'ArrowRight');
    fixture.detectChanges();
    keydown(panels()[1], 'Enter');
    fixture.detectChanges();

    expect(trigger(fixture).textContent).toContain('USA / California');
    expect(el.querySelector('med-icon[name="x-mark"]')).not.toBeNull();
  });
});
