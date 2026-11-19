import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { CascadeSelectComponent } from './cascade-select.component';
import { CascadeSelectOption } from './cascade-select.types';

const OPTIONS: CascadeSelectOption<string>[] = [
  {
    label: 'USA',
    children: [
      {
        label: 'California',
        children: [
          { label: 'Los Angeles', value: 'la' },
          { label: 'San Francisco', value: 'sf' },
        ],
      },
      { label: 'Texas', children: [{ label: 'Austin', value: 'austin' }] },
    ],
  },
  { label: 'Canada', children: [{ label: 'Ontario', children: [{ label: 'Toronto', value: 'toronto', disabled: true }] }] },
];

function trigger(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
}

function panels(): HTMLElement[] {
  return Array.from(document.querySelectorAll('[role="listbox"]'));
}

function optionsIn(panel: HTMLElement): HTMLElement[] {
  return Array.from(panel.querySelectorAll('[role="option"]'));
}

function keydown(el: HTMLElement, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('CascadeSelectComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function create(): ComponentFixture<CascadeSelectComponent<string>> {
    const fixture = TestBed.createComponent(CascadeSelectComponent<string>);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.componentRef.setInput('placeholder', 'Pick a city');
    fixture.detectChanges();
    return fixture;
  }

  it('shows the placeholder when nothing is selected', () => {
    const fixture = create();
    expect(trigger(fixture).textContent?.trim()).toBe('Pick a city');
  });

  it('opens the root panel on trigger click', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(panels().length).toBe(1);
    expect(optionsIn(panels()[0]).map((el) => el.textContent?.trim())).toEqual(['USA', 'Canada']);
  });

  it('drilling down through 3 levels and picking a leaf sets the value and closes the whole tree', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    trigger(fixture).click();
    fixture.detectChanges();
    keydown(panels()[0], 'ArrowRight'); // open USA's children
    fixture.detectChanges();
    keydown(panels()[1], 'ArrowRight'); // open California's children
    fixture.detectChanges();
    expect(panels().length).toBe(3);

    keydown(panels()[2], 'Enter'); // Los Angeles (first enabled leaf)
    fixture.detectChanges();

    expect(onChange).toHaveBeenCalledWith('la');
    expect(panels().length).toBe(0);
    expect(trigger(fixture).textContent?.trim()).toBe('USA / California / Los Angeles');
  });

  it('ArrowLeft collapses just the deepest level, not the whole tree', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    keydown(panels()[0], 'ArrowRight');
    fixture.detectChanges();
    expect(panels().length).toBe(2);

    keydown(panels()[1], 'ArrowLeft');
    fixture.detectChanges();
    expect(panels().length).toBe(1);
  });

  it('a disabled leaf never resolves a value', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    trigger(fixture).click();
    fixture.detectChanges();
    keydown(panels()[0], 'ArrowDown'); // move active from USA to Canada
    keydown(panels()[0], 'ArrowRight'); // open Canada's children
    fixture.detectChanges();
    keydown(panels()[1], 'ArrowRight'); // open Ontario's children
    fixture.detectChanges();
    keydown(panels()[2], 'Enter'); // Toronto is disabled

    expect(onChange).not.toHaveBeenCalled();
  });

  it('closes on Escape at the deepest level only', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    keydown(panels()[0], 'ArrowRight');
    fixture.detectChanges();

    panels()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(panels().length).toBe(1);
  });

  it('writeValue reconstructs the breadcrumb by searching the tree for the matching leaf', () => {
    const fixture = create();
    fixture.componentInstance.writeValue('sf');
    fixture.detectChanges();
    expect(trigger(fixture).textContent?.trim()).toBe('USA / California / San Francisco');
  });

  it('writeValue(null/undefined) clears the display, never throwing', () => {
    const fixture = create();
    const cmp = fixture.componentInstance;
    cmp.writeValue('la');
    fixture.detectChanges();
    expect(() => cmp.writeValue(null)).not.toThrow();
    fixture.detectChanges();
    expect(trigger(fixture).textContent?.trim()).toBe('Pick a city');
  });

  it('a custom separator joins the breadcrumb differently', () => {
    const fixture = create();
    fixture.componentRef.setInput('separator', ' > ');
    fixture.componentInstance.writeValue('austin');
    fixture.detectChanges();
    expect(trigger(fixture).textContent?.trim()).toBe('USA > Texas > Austin');
  });

  it('disabled: the trigger never opens', () => {
    const fixture = create();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(panels().length).toBe(0);
  });

  it('Home/End jump the active row to the first/last enabled option in the root panel', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();

    keydown(panels()[0], 'ArrowDown'); // move active from USA to Canada
    fixture.detectChanges();
    keydown(panels()[0], 'Home');
    fixture.detectChanges();
    expect(panels()[0].getAttribute('aria-activedescendant')).toBe(optionsIn(panels()[0])[0].id);

    keydown(panels()[0], 'End');
    fixture.detectChanges();
    expect(panels()[0].getAttribute('aria-activedescendant')).toBe(optionsIn(panels()[0])[1].id);
  });

  it('Tab closes the whole panel chain, not just the deepest level', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    keydown(panels()[0], 'ArrowRight'); // open USA's children
    fixture.detectChanges();
    expect(panels().length).toBe(2);

    panels()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(panels().length).toBe(0);
  });

  describe('showClear', () => {
    it('is not shown when nothing is selected', () => {
      const fixture = create();
      expect(fixture.nativeElement.querySelector('button[aria-label="Clear"]')).toBeNull();
    });

    it('shows once a value is selected, and clears it back to the placeholder on click', () => {
      const fixture = create();
      fixture.componentRef.setInput('showClear', true);
      fixture.componentInstance.writeValue('la');
      const onChange = jest.fn();
      fixture.componentInstance.registerOnChange(onChange);
      fixture.detectChanges();

      const clearButton = fixture.nativeElement.querySelector('button[aria-label="Clear"]') as HTMLButtonElement;
      expect(clearButton).not.toBeNull();
      clearButton.click();
      fixture.detectChanges();

      expect(onChange).toHaveBeenCalledWith(null);
      expect(trigger(fixture).textContent?.trim()).toBe('Pick a city');
      expect(fixture.nativeElement.querySelector('button[aria-label="Clear"]')).toBeNull();
    });

    it('is never shown while disabled, even with a value', () => {
      const fixture = create();
      fixture.componentRef.setInput('showClear', true);
      fixture.componentRef.setInput('disabled', true);
      fixture.componentInstance.writeValue('la');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('button[aria-label="Clear"]')).toBeNull();
    });
  });

  describe('breakpoint (responsive submenu layout)', () => {
    it('above the breakpoint, a submenu overlay is left to shrink-wrap its own content (no explicit width)', () => {
      const fixture = create(); // jsdom's default innerWidth (1024) is above the 960px default breakpoint
      trigger(fixture).click();
      fixture.detectChanges();
      keydown(panels()[0], 'ArrowRight');
      fixture.detectChanges();

      const submenuPane = panels()[1].closest('.cdk-overlay-pane') as HTMLElement;
      expect(submenuPane.style.width).toBe('');
    });

    it('a custom breakpoint can force the stacked mobile layout even on a nominally wide viewport', () => {
      const fixture = create();
      fixture.componentRef.setInput('breakpoint', '2000px'); // wider than jsdom's default innerWidth
      trigger(fixture).click();
      fixture.detectChanges();
      keydown(panels()[0], 'ArrowRight');
      fixture.detectChanges();

      const submenuPane = panels()[1].closest('.cdk-overlay-pane') as HTMLElement;
      expect(submenuPane.style.width).not.toBe('');
    });

    it('the mobile layout is forwarded down to a third nested level too, not just the first submenu', () => {
      const fixture = create();
      fixture.componentRef.setInput('breakpoint', '2000px');
      trigger(fixture).click();
      fixture.detectChanges();
      keydown(panels()[0], 'ArrowRight');
      fixture.detectChanges();
      keydown(panels()[1], 'ArrowRight');
      fixture.detectChanges();

      const deepestPane = panels()[2].closest('.cdk-overlay-pane') as HTMLElement;
      expect(deepestPane.style.width).not.toBe('');
    });
  });

  it('destroying the host while nested panels are open closes the whole tree', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    keydown(panels()[0], 'ArrowRight');
    fixture.detectChanges();
    expect(panels().length).toBe(2);

    fixture.destroy();
    expect(panels().length).toBe(0);
  });
});
