import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { CascadeSelectComponent } from './cascade-select.component';

/** UI-021: mapping of the consumer's own data (optionLabel, optionValue, optionGroupLabel, optionGroupChildren, optionDisabled, dataKey). */

function trigger(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
}

function panels(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[role="listbox"]'));
}

function labelsIn(panel: HTMLElement): string[] {
  return Array.from(panel.querySelectorAll('[role="option"]')).map((el) => el.textContent?.trim() ?? '');
}

function keydown(el: HTMLElement, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('CascadeSelectComponent data mapping', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function create(inputs: Record<string, unknown>): ComponentFixture<CascadeSelectComponent<any>> {
    const fixture = TestBed.createComponent(CascadeSelectComponent<any>);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    return fixture;
  }

  /** Opens the root panel, then each first row down to a leaf, and presses Enter on it. */
  function pickFirstLeaf(fixture: ComponentFixture<CascadeSelectComponent<any>>, depth: number): void {
    trigger(fixture).click();
    fixture.detectChanges();
    for (let level = 0; level < depth; level++) {
      keydown(panels()[level], 'ArrowRight');
      fixture.detectChanges();
    }
    keydown(panels()[depth], 'Enter');
    fixture.detectChanges();
  }

  const GEO = [
    {
      name: 'USA',
      states: [{ name: 'California', cities: [{ name: 'Los Angeles', code: 'la' }] }],
      cities: [{ name: 'WRONG LEVEL', code: 'wrong' }],
    },
  ];

  it('UI-021.S1: optionLabel and optionValue read the consumer fields', () => {
    const fixture = create({ options: GEO, optionLabel: 'name', optionValue: 'code', optionGroupChildren: ['states', 'cities'] });
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    pickFirstLeaf(fixture, 2);

    expect(trigger(fixture).textContent?.trim()).toBe('USA / California / Los Angeles');
    expect(onChange).toHaveBeenCalledWith('la');
  });

  it('UI-021.S2: optionGroupChildren with one key per level lists the children of that level', () => {
    const fixture = create({ options: GEO, optionLabel: 'name', optionValue: 'code', optionGroupChildren: ['states', 'cities'] });

    trigger(fixture).click();
    fixture.detectChanges();
    keydown(panels()[0], 'ArrowRight');
    fixture.detectChanges();
    expect(labelsIn(panels()[1])).toEqual(['California']);

    keydown(panels()[1], 'ArrowRight');
    fixture.detectChanges();
    expect(labelsIn(panels()[2])).toEqual(['Los Angeles']);
  });

  it('UI-021.S3: optionGroupLabel names the rows with children, optionLabel names the leaves', () => {
    const fixture = create({
      options: [{ title: 'Group A', children: [{ label: 'Leaf', value: 1 }] }],
      optionLabel: 'label',
      optionGroupLabel: 'title',
    });

    trigger(fixture).click();
    fixture.detectChanges();
    expect(labelsIn(panels()[0])).toEqual(['Group A']);

    keydown(panels()[0], 'ArrowRight');
    fixture.detectChanges();
    expect(labelsIn(panels()[1])).toEqual(['Leaf']);
  });

  it('UI-021.S4: optionDisabled as a function blocks the leaf it flags', () => {
    const fixture = create({
      options: [{ label: 'Group', children: [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }] }],
      optionDisabled: (option: { value?: string }) => option.value === 'b',
    });
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    trigger(fixture).click();
    fixture.detectChanges();
    keydown(panels()[0], 'ArrowRight');
    fixture.detectChanges();
    const rowB = panels()[1].querySelectorAll('[role="option"]')[1] as HTMLElement;
    expect(rowB.getAttribute('aria-disabled')).toBe('true');
    rowB.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(onChange).not.toHaveBeenCalled();
  });

  it('UI-021.S5: dataKey matches an object value by its key instead of by reference', () => {
    const fixture = create({
      options: [{ label: 'Group', children: [{ label: 'Los Angeles', value: { id: 1, name: 'LA' } }] }],
      dataKey: 'id',
    });

    fixture.componentInstance.writeValue({ id: 1, name: 'stale copy' });
    fixture.detectChanges();

    expect(trigger(fixture).textContent?.trim()).toBe('Group / Los Angeles');
  });

  it('UI-021.S6: with no mapping input the label, value, children and disabled fields are used', () => {
    const fixture = create({ options: [{ label: 'Group', children: [{ label: 'Leaf', value: 'leaf' }] }] });
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    pickFirstLeaf(fixture, 1);

    expect(trigger(fixture).textContent?.trim()).toBe('Group / Leaf');
    expect(onChange).toHaveBeenCalledWith('leaf');
  });
});
