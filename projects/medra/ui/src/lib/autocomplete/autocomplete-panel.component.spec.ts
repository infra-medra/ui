import { TestBed } from '@angular/core/testing';
import { AutocompletePanelComponent } from './autocomplete-panel.component';
import { SelectOption } from '../select/select.types';

const FRUITS: SelectOption<string>[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana', disabled: true },
  { label: 'Cherry', value: 'cherry' },
];

function createPanel(
  inputs: Partial<{
    options: SelectOption<string>[];
    activeIndex: number;
    selectedValue: string | null;
    emptyLabel: string;
  }> = {},
) {
  const fixture = TestBed.createComponent(AutocompletePanelComponent<string>);
  fixture.componentRef.setInput('panelId', 'med-autocomplete-panel-test');
  fixture.componentRef.setInput('options', inputs.options ?? FRUITS);
  if (inputs.activeIndex !== undefined) fixture.componentRef.setInput('activeIndex', inputs.activeIndex);
  if (inputs.selectedValue !== undefined) fixture.componentRef.setInput('selectedValue', inputs.selectedValue);
  if (inputs.emptyLabel !== undefined) fixture.componentRef.setInput('emptyLabel', inputs.emptyLabel);
  fixture.detectChanges();
  const list = fixture.nativeElement.querySelector('[role="listbox"]') as HTMLElement;
  const rows = () => Array.from(fixture.nativeElement.querySelectorAll('[role="option"]')) as HTMLElement[];
  return { fixture, list, rows };
}

describe('AutocompletePanelComponent', () => {
  it('renders one row per option with the right id', () => {
    const { rows } = createPanel();
    expect(rows()).toHaveLength(3);
    expect(rows()[0].id).toBe('med-autocomplete-panel-test-option-0');
    expect(rows()[2].id).toBe('med-autocomplete-panel-test-option-2');
  });

  it('shows the empty label when there are no options, instead of an empty listbox', () => {
    const { list } = createPanel({ options: [], emptyLabel: 'Nothing found' });
    expect(list.textContent).toContain('Nothing found');
    expect(list.querySelectorAll('[role="option"]')).toHaveLength(0);
  });

  it('marks the row at activeIndex, not any other', () => {
    const { rows } = createPanel({ activeIndex: 1 });
    expect(rows()[1].className).toContain('bg-brand-50');
    expect(rows()[0].className).not.toContain('bg-brand-50');
  });

  it('reflects selectedValue via aria-selected', () => {
    const { rows } = createPanel({ selectedValue: 'cherry' });
    expect(rows()[2].getAttribute('aria-selected')).toBe('true');
    expect(rows()[0].getAttribute('aria-selected')).toBe('false');
  });

  it('marks a disabled option with aria-disabled', () => {
    const { rows } = createPanel();
    expect(rows()[1].getAttribute('aria-disabled')).toBe('true');
  });

  it('pointerdown on an enabled row emits optionSelect with its value', () => {
    const { fixture, rows } = createPanel();
    const received: string[] = [];
    fixture.componentInstance.optionSelect.subscribe((option) => received.push(option.value));

    rows()[2].dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));

    expect(received).toEqual(['cherry']);
  });

  it('never emits optionSelect for a disabled row', () => {
    const { fixture, rows } = createPanel();
    const optionSelect = jest.fn();
    fixture.componentInstance.optionSelect.subscribe(optionSelect);

    rows()[1].dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true }));

    expect(optionSelect).not.toHaveBeenCalled();
  });

  it('pointerenter on an enabled row emits optionHover with its index', () => {
    const { fixture, rows } = createPanel();
    const received: number[] = [];
    fixture.componentInstance.optionHover.subscribe((index) => received.push(index));

    rows()[0].dispatchEvent(new MouseEvent('pointerenter', { bubbles: true }));

    expect(received).toEqual([0]);
  });

  it('never emits optionHover for a disabled row', () => {
    const { fixture, rows } = createPanel();
    const optionHover = jest.fn();
    fixture.componentInstance.optionHover.subscribe(optionHover);

    rows()[1].dispatchEvent(new MouseEvent('pointerenter', { bubbles: true }));

    expect(optionHover).not.toHaveBeenCalled();
  });

  describe('group', () => {
    const GROUPED: SelectOption<string>[] = [
      { label: 'Apple', value: 'apple', group: 'Fruits' },
      { label: 'Banana', value: 'banana', group: 'Fruits' },
      { label: 'Carrot', value: 'carrot', group: 'Vegetables' },
    ];

    it('renders one header per group, right above its first option', () => {
      const { fixture } = createPanel({ options: GROUPED });
      const headersAndRows = Array.from(fixture.nativeElement.querySelectorAll('[role="presentation"], [role="option"]')) as HTMLElement[];
      expect(headersAndRows.map((el) => el.textContent?.trim())).toEqual(['Fruits', 'Apple', 'Banana', 'Vegetables', 'Carrot']);
    });

    it('does not render a header when no option carries a group', () => {
      const { fixture } = createPanel();
      expect(fixture.nativeElement.querySelector('[role="presentation"]')).toBeNull();
    });
  });
});
