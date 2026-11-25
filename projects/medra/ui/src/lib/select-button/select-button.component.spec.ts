import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FluidDirective } from '../fluid/fluid.directive';
import { SelectOption } from '../select/select.types';
import { SelectButtonComponent } from './select-button.component';

const OPTIONS: SelectOption<string>[] = [
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'md', disabled: true },
  { label: 'Large', value: 'lg' },
];

function buttons(fixture: { nativeElement: HTMLElement }): HTMLButtonElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('button'));
}

function keydown(button: HTMLButtonElement, key: string) {
  button.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

function selectedLabel(fixture: { nativeElement: HTMLElement }): string | undefined {
  return buttons(fixture)
    .find((b) => b.getAttribute('aria-checked') === 'true')
    ?.textContent?.trim();
}

function firePointerDown(el: HTMLElement) {
  const event = Object.assign(new Event('pointerdown', { bubbles: true }), { clientX: 5, clientY: 5 });
  el.dispatchEvent(event as PointerEvent);
}

describe('SelectButtonComponent (single mode)', () => {
  let animateSpy: jest.Mock;

  beforeEach(() => {
    animateSpy = jest.fn().mockReturnValue({ finished: Promise.resolve() });
    HTMLElement.prototype.animate = animateSpy as unknown as HTMLElement['animate'];
  });

  afterEach(() => {
    delete (HTMLElement.prototype as { animate?: unknown }).animate;
  });

  function create(): ComponentFixture<SelectButtonComponent<string>> {
    const fixture = TestBed.createComponent(SelectButtonComponent<string>);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();
    return fixture;
  }

  it('renders one button per option, labeled from the option', () => {
    const fixture = create();
    expect(buttons(fixture).map((b) => b.textContent?.trim())).toEqual(['Small', 'Medium', 'Large']);
  });

  it('triggers the ripple effect on pointerdown for an enabled option (Ripple adoption)', () => {
    const fixture = create();
    firePointerDown(buttons(fixture)[0]);
    expect(animateSpy).toHaveBeenCalledTimes(1);
  });

  it('does not trigger the ripple effect for a disabled option', () => {
    const fixture = create();
    firePointerDown(buttons(fixture)[1]); // 'Medium' is disabled
    expect(animateSpy).not.toHaveBeenCalled();
  });

  it('sets role="radiogroup" on the container and role="radio" on each button', () => {
    const fixture = create();
    expect(fixture.nativeElement.querySelector('[role="radiogroup"]')).not.toBeNull();
    expect(buttons(fixture).every((b) => b.getAttribute('role') === 'radio')).toBe(true);
  });

  it('nothing selected initially, first enabled option has tabIndex 0 (roving)', () => {
    const fixture = create();
    const btns = buttons(fixture);
    expect(btns.every((b) => b.getAttribute('aria-checked') === 'false')).toBe(true);
    expect(btns.map((b) => b.tabIndex)).toEqual([0, -1, -1]);
  });

  it('clicking an option selects it and updates the roving tabindex', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    buttons(fixture)[2].click();
    fixture.detectChanges();

    expect(onChange).toHaveBeenCalledWith('lg');
    expect(buttons(fixture)[2].getAttribute('aria-checked')).toBe('true');
    expect(buttons(fixture).map((b) => b.tabIndex)).toEqual([-1, -1, 0]);
  });

  it('clicking the already-selected option clears it back to null by default (allowEmpty defaults to true)', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.writeValue('sm');
    fixture.detectChanges();
    fixture.componentInstance.registerOnChange(onChange);

    buttons(fixture)[0].click();
    fixture.detectChanges();

    expect(onChange).toHaveBeenCalledWith(null);
    expect(buttons(fixture).every((b) => b.getAttribute('aria-checked') === 'false')).toBe(true);
  });

  it('allowEmpty=false makes clicking the already-selected option a no-op, never deselecting', () => {
    const fixture = create();
    fixture.componentRef.setInput('allowEmpty', false);
    const onChange = jest.fn();
    fixture.componentInstance.writeValue('sm');
    fixture.detectChanges();
    fixture.componentInstance.registerOnChange(onChange);

    buttons(fixture)[0].click();
    fixture.detectChanges();

    expect(onChange).not.toHaveBeenCalled();
    expect(buttons(fixture)[0].getAttribute('aria-checked')).toBe('true');
  });

  it('clicking a disabled option does nothing', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    buttons(fixture)[1].click();
    fixture.detectChanges();

    expect(onChange).not.toHaveBeenCalled();
  });

  // Regression: `buttonVariants`' dimming/`pointer-events-none` classes key
  // off the native `:disabled` pseudo-class, which this button never gets
  // (aria-disabled only) — a disabled option previously looked identical to
  // an enabled one, so clicking it silently did nothing with no visual cue.
  it('a disabled option is visually dimmed and not just functionally inert', () => {
    const fixture = create();
    const disabledButton = buttons(fixture)[1];
    expect(disabledButton.className).toContain('opacity-(--opacity-disabled)');
    expect(disabledButton.className).toContain('cursor-not-allowed');
  });

  it('ArrowRight moves to the next enabled option, wrapping and skipping disabled', () => {
    const fixture = create();
    const btns = buttons(fixture);

    keydown(btns[0], 'ArrowRight');
    fixture.detectChanges();
    expect(selectedLabel(fixture)).toBe('Large'); // skips disabled 'Medium'

    keydown(buttons(fixture)[2], 'ArrowRight');
    fixture.detectChanges();
    expect(selectedLabel(fixture)).toBe('Small'); // wraps
  });

  it('Home/End jump to the first/last enabled option', () => {
    const fixture = create();
    keydown(buttons(fixture)[0], 'End');
    fixture.detectChanges();
    expect(selectedLabel(fixture)).toBe('Large');

    keydown(buttons(fixture)[2], 'Home');
    fixture.detectChanges();
    expect(selectedLabel(fixture)).toBe('Small');
  });

  it('writeValue(null) shows nothing selected', () => {
    const fixture = create();
    fixture.componentInstance.writeValue('sm');
    fixture.detectChanges();
    fixture.componentInstance.writeValue(null);
    fixture.detectChanges();
    expect(buttons(fixture).every((b) => b.getAttribute('aria-checked') === 'false')).toBe(true);
  });

  it('a FormControl initialized with a value renders it selected', () => {
    @Component({
      standalone: true,
      imports: [SelectButtonComponent, ReactiveFormsModule],
      template: `<med-select-button [options]="options" [formControl]="control" />`,
    })
    class HostComponent {
      readonly options = OPTIONS;
      readonly control = new FormControl<string | null>('lg');
    }

    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(buttons(fixture)[2].getAttribute('aria-checked')).toBe('true');
  });

  it('disables all options via the disabled input', () => {
    const fixture = create();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(buttons(fixture).every((b) => b.getAttribute('aria-disabled') === 'true')).toBe(true);
  });

  it('sets aria-label on the group when provided', () => {
    const fixture = create();
    fixture.componentRef.setInput('ariaLabel', 'Size');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="radiogroup"]')?.getAttribute('aria-label')).toBe('Size');
  });
});

describe('SelectButtonComponent (multiple mode)', () => {
  function create(): ComponentFixture<SelectButtonComponent<string>> {
    const fixture = TestBed.createComponent(SelectButtonComponent<string>);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.componentRef.setInput('multiple', true);
    fixture.detectChanges();
    return fixture;
  }

  it('sets role="group" on the container and no role on each button', () => {
    const fixture = create();
    expect(fixture.nativeElement.querySelector('[role="group"]')).not.toBeNull();
    expect(buttons(fixture).every((b) => b.getAttribute('role') === null)).toBe(true);
  });

  it('every enabled option has normal tabIndex 0 (no roving tabindex)', () => {
    const fixture = create();
    const btns = buttons(fixture);
    expect(btns[0].tabIndex).toBe(0);
    expect(btns[2].tabIndex).toBe(0);
  });

  it('clicking toggles an option independently, without affecting others', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    buttons(fixture)[0].click();
    fixture.detectChanges();
    expect(onChange).toHaveBeenLastCalledWith(['sm']);
    expect(buttons(fixture)[0].getAttribute('aria-pressed')).toBe('true');

    buttons(fixture)[2].click();
    fixture.detectChanges();
    expect(onChange).toHaveBeenLastCalledWith(['sm', 'lg']);

    buttons(fixture)[0].click();
    fixture.detectChanges();
    expect(onChange).toHaveBeenLastCalledWith(['lg']);
  });

  it('writeValue(null) normalizes to an empty selection, not a stray value', () => {
    const fixture = create();
    fixture.componentInstance.writeValue(null);
    fixture.detectChanges();
    expect(buttons(fixture).every((b) => b.getAttribute('aria-pressed') === 'false')).toBe(true);
  });

  it('allowEmpty=false blocks deselecting the last remaining option, but not the others', () => {
    const fixture = create();
    fixture.componentRef.setInput('allowEmpty', false);
    fixture.componentInstance.writeValue(['sm', 'lg']);
    fixture.detectChanges();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    buttons(fixture)[0].click(); // 'sm' — one selection remains ('lg'), allowed
    fixture.detectChanges();
    expect(onChange).toHaveBeenLastCalledWith(['lg']);

    buttons(fixture)[2].click(); // 'lg' — the last one, blocked
    fixture.detectChanges();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(buttons(fixture)[2].getAttribute('aria-pressed')).toBe('true');
  });

  // @scenario UI-005.S3
  it('supports custom optionLabel, optionValue, and optionDisabled field names', () => {
    const fixture = TestBed.createComponent(SelectButtonComponent<number>);
    fixture.componentRef.setInput('options', [
      { name: 'Monthly', code: 1, inactive: false },
      { name: 'Yearly', code: 12, inactive: true },
    ]);
    fixture.componentRef.setInput('optionLabel', 'name');
    fixture.componentRef.setInput('optionValue', 'code');
    fixture.componentRef.setInput('optionDisabled', 'inactive');
    fixture.detectChanges();

    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    const btns = buttons(fixture);
    expect(btns.map((b) => b.textContent?.trim())).toEqual(['Monthly', 'Yearly']);
    expect(btns[1].getAttribute('aria-disabled')).toBe('true');

    btns[1].click();
    expect(onChange).not.toHaveBeenCalled();

    btns[0].click();
    expect(onChange).toHaveBeenCalledWith(1);
  });
});

describe('SelectButtonComponent (item template & fluid)', () => {
  // @scenario SLB-002.S1
  it('SLB-002.S1: renders <ng-template #item> with { $implicit, selected, index } and updates aria-checked and value on click and arrow keys', () => {
    @Component({
      standalone: true,
      imports: [SelectButtonComponent, ReactiveFormsModule],
      template: `
        <med-select-button [options]="options" [formControl]="control" ariaLabel="View mode">
          <ng-template #item let-option let-selected="selected" let-index="index">
            <span class="custom-item" [attr.data-selected]="selected" [attr.data-index]="index">
              {{ index }}: {{ option.label }}
            </span>
          </ng-template>
        </med-select-button>
      `,
    })
    class TemplateHostComponent {
      readonly options: SelectOption<string>[] = [
        { label: 'List', value: 'list' },
        { label: 'Grid', value: 'grid' },
        { label: 'Table', value: 'table' },
      ];
      readonly control = new FormControl<string | null>('list');
    }

    TestBed.configureTestingModule({ imports: [TemplateHostComponent] });
    const fixture = TestBed.createComponent(TemplateHostComponent);
    fixture.detectChanges();

    const btns = buttons(fixture);
    const items = btns
      .map((b) => b.querySelector('.custom-item') as HTMLElement | null)
      .filter((el): el is HTMLElement => el !== null);
    expect(items).toHaveLength(3);
    expect(items.map((el) => el.textContent?.trim())).toEqual(['0: List', '1: Grid', '2: Table']);
    expect(items.map((el) => el.getAttribute('data-index'))).toEqual(['0', '1', '2']);
    expect(items.map((el) => el.getAttribute('data-selected'))).toEqual(['true', 'false', 'false']);
    expect(btns.map((b) => b.getAttribute('aria-checked'))).toEqual(['true', 'false', 'false']);

    // Click second option
    btns[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe('grid');
    expect(btns.map((b) => b.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false']);
    const afterClickItems = Array.from(fixture.nativeElement.querySelectorAll('.custom-item')) as HTMLElement[];
    expect(afterClickItems.map((el) => el.getAttribute('data-selected'))).toEqual(['false', 'true', 'false']);

    // Navigate with ArrowRight to third option
    keydown(btns[1], 'ArrowRight');
    fixture.detectChanges();

    expect(fixture.componentInstance.control.value).toBe('table');
    expect(btns.map((b) => b.getAttribute('aria-checked'))).toEqual(['false', 'false', 'true']);
    const afterKeyItems = Array.from(fixture.nativeElement.querySelectorAll('.custom-item')) as HTMLElement[];
    expect(afterKeyItems.map((el) => el.getAttribute('data-selected'))).toEqual(['false', 'false', 'true']);
  });

  // @scenario SLB-003.S1
  it('SLB-003: stays inline-block by default and applies block/w-full/flex-1 when fluid input is set', () => {
    const fixture = TestBed.createComponent(SelectButtonComponent<string>);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.detectChanges();

    const hostEl = fixture.nativeElement as HTMLElement;
    const groupEl = hostEl.querySelector('[role="radiogroup"]') as HTMLElement;
    expect(hostEl.classList.contains('inline-block')).toBe(true);
    expect(hostEl.classList.contains('w-full')).toBe(false);
    expect(groupEl.className).toContain('inline-flex');
    expect(groupEl.className).not.toContain('w-full');
    expect(buttons(fixture).every((b) => !b.className.includes('flex-1'))).toBe(true);

    fixture.componentRef.setInput('fluid', true);
    fixture.detectChanges();

    expect(hostEl.classList.contains('block')).toBe(true);
    expect(hostEl.classList.contains('w-full')).toBe(true);
    expect(hostEl.classList.contains('inline-block')).toBe(false);
    expect(groupEl.className).toContain('flex');
    expect(groupEl.className).toContain('w-full');
    expect(groupEl.className).not.toContain('inline-flex');
    expect(buttons(fixture).every((b) => b.className.includes('flex-1') && b.className.includes('justify-center'))).toBe(true);
  });

  // @scenario SLB-003.S1
  it('SLB-003: inherits fluid layout from ancestor MED_FLUID_CONTEXT (<med-fluid>)', () => {
    @Component({
      standalone: true,
      imports: [FluidDirective, SelectButtonComponent],
      template: `
        <med-fluid>
          <med-select-button [options]="options" />
        </med-fluid>
      `,
    })
    class FluidHostComponent {
      readonly options = OPTIONS;
    }

    TestBed.configureTestingModule({ imports: [FluidHostComponent] });
    const fixture = TestBed.createComponent(FluidHostComponent);
    fixture.detectChanges();

    const selectBtnHost = fixture.nativeElement.querySelector('med-select-button') as HTMLElement;
    const groupEl = selectBtnHost.querySelector('[role="radiogroup"]') as HTMLElement;
    expect(selectBtnHost.classList.contains('block')).toBe(true);
    expect(selectBtnHost.classList.contains('w-full')).toBe(true);
    expect(groupEl.className).toContain('w-full');
    expect(buttons(fixture).every((b) => b.className.includes('flex-1') && b.className.includes('justify-center'))).toBe(true);
  });
});
