import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { CascadeSelectComponent } from './cascade-select.component';
import { CascadeSelectOption } from './cascade-select.types';

/** UI-022: events of the field and of the panel. */

const OPTIONS: CascadeSelectOption<string>[] = [
  {
    label: 'USA',
    value: 'usa',
    children: [{ label: 'California', value: 'california', children: [{ label: 'Los Angeles', value: 'la' }] }],
  },
];

function trigger(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
}

function panels(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[role="listbox"]'));
}

function keydown(el: HTMLElement, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('CascadeSelectComponent events', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function create(inputs: Record<string, unknown> = {}): ComponentFixture<CascadeSelectComponent<string>> {
    const fixture = TestBed.createComponent(CascadeSelectComponent<string>);
    fixture.componentRef.setInput('options', OPTIONS);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    return fixture;
  }

  it('UI-022.S1: choosing a leaf emits optionSelected with the value and the path', () => {
    const fixture = create();
    const selected: unknown[] = [];
    fixture.componentInstance.optionSelected.subscribe((event) => selected.push(event));

    trigger(fixture).click();
    fixture.detectChanges();
    keydown(panels()[0], 'ArrowRight');
    fixture.detectChanges();
    keydown(panels()[1], 'ArrowRight');
    fixture.detectChanges();
    keydown(panels()[2], 'Enter');
    fixture.detectChanges();

    expect(selected).toEqual([{ value: 'la', path: ['USA', 'California', 'Los Angeles'] }]);
  });

  it('UI-022.S2: opening a group emits groupOpened with the value of that node', () => {
    const fixture = create();
    const opened: unknown[] = [];
    fixture.componentInstance.groupOpened.subscribe((event) => opened.push(event));

    trigger(fixture).click();
    fixture.detectChanges();
    keydown(panels()[0], 'ArrowRight');
    fixture.detectChanges();

    expect(opened).toEqual([{ value: 'usa', path: ['USA'] }]);
  });

  it('UI-022.S3: the panel events fire in order, before and after opening and before and after closing', () => {
    const fixture = create();
    const order: string[] = [];
    fixture.componentInstance.panelBeforeShow.subscribe(() => order.push('beforeShow'));
    fixture.componentInstance.panelShow.subscribe(() => order.push('show'));
    fixture.componentInstance.panelBeforeHide.subscribe(() => order.push('beforeHide'));
    fixture.componentInstance.panelHide.subscribe(() => order.push('hide'));

    trigger(fixture).click();
    fixture.detectChanges();
    expect(order).toEqual(['beforeShow', 'show']);

    trigger(fixture).click();
    fixture.detectChanges();
    expect(order).toEqual(['beforeShow', 'show', 'beforeHide', 'hide']);
  });

  it('UI-022.S4: the clear button emits cleared', () => {
    const fixture = create({ showClear: true, clearLabel: 'Clear' });
    const cleared = jest.fn();
    fixture.componentInstance.cleared.subscribe(cleared);
    fixture.componentInstance.writeValue('la');
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('button[aria-label="Clear"]') as HTMLElement).click();
    fixture.detectChanges();

    expect(cleared).toHaveBeenCalledTimes(1);
  });

  it('UI-022.S5: focusing the field emits inputFocus and leaving it emits inputBlur', () => {
    const fixture = create();
    const events: string[] = [];
    fixture.componentInstance.inputFocus.subscribe((event) => events.push(`focus:${event.type}`));
    fixture.componentInstance.inputBlur.subscribe((event) => events.push(`blur:${event.type}`));

    trigger(fixture).dispatchEvent(new FocusEvent('focus'));
    expect(events).toEqual(['focus:focus']);

    trigger(fixture).dispatchEvent(new FocusEvent('blur'));
    expect(events).toEqual(['focus:focus', 'blur:blur']);
  });

  it('UI-022.S6: a disabled field never opens, so it emits no panel event', () => {
    const fixture = create({ disabled: true });
    const order: string[] = [];
    fixture.componentInstance.panelBeforeShow.subscribe(() => order.push('beforeShow'));
    fixture.componentInstance.panelShow.subscribe(() => order.push('show'));

    trigger(fixture).click();
    fixture.detectChanges();

    expect(order).toEqual([]);
    expect(panels().length).toBe(0);
  });
});
