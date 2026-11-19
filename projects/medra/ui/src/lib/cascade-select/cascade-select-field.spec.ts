import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { CascadeSelectComponent } from './cascade-select.component';
import { CascadeSelectOption } from './cascade-select.types';

/** UI-025: field attributes and appearance. */

const OPTIONS: CascadeSelectOption<string>[] = [
  { label: 'USA', value: 'usa' },
  { label: 'Brazil', value: 'brazil' },
];

function trigger(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
}

describe('CascadeSelectComponent field attributes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function create(inputs: Record<string, unknown> = {}): ComponentFixture<CascadeSelectComponent<string>> {
    const fixture = TestBed.createComponent(CascadeSelectComponent<string>);
    document.body.appendChild(fixture.nativeElement);
    fixture.componentRef.setInput('options', OPTIONS);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => {
    document.body.querySelectorAll('med-cascade-select').forEach((el) => el.remove());
  });

  it('UI-025.S1: inputId, ariaLabel and required reach the field and name reaches the form', () => {
    const fixture = create({ inputId: 'country', name: 'country', ariaLabel: 'Country', required: true });
    fixture.componentInstance.writeValue('brazil');
    fixture.detectChanges();

    expect(trigger(fixture).id).toBe('country');
    expect(trigger(fixture).getAttribute('aria-label')).toBe('Country');
    expect(trigger(fixture).getAttribute('aria-required')).toBe('true');
    const hidden = fixture.nativeElement.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden.name).toBe('country');
    expect(hidden.value).toBe('brazil');
  });

  it('UI-025.S1: ariaLabelledBy reaches the field', () => {
    const fixture = create({ ariaLabelledBy: 'country-label' });

    expect(trigger(fixture).getAttribute('aria-labelledby')).toBe('country-label');
  });

  it('UI-025.S2: tabindex sets the tab order and autofocus focuses the field', () => {
    const fixture = create({ tabindex: 3, autofocus: true });

    expect(trigger(fixture).getAttribute('tabindex')).toBe('3');
    expect(document.activeElement).toBe(trigger(fixture));
  });

  it('UI-025.S3: variant filled uses the filled style of the theme', () => {
    const fixture = create({ variant: 'filled' });

    expect(trigger(fixture).classList.contains('bg-surface-100')).toBe(true);
    expect(trigger(fixture).classList.contains('border-transparent')).toBe(true);
  });

  it('UI-025.S4: fluid marks the host and makes the field fill the container', () => {
    const fixture = create({ fluid: true });

    expect((fixture.nativeElement as HTMLElement).classList.contains('block')).toBe(true);
    expect(trigger(fixture).classList.contains('w-full')).toBe(true);
  });

  it('UI-025.S5: the panel gets panelStyleClass and is attached to the body', () => {
    const fixture = create({ panelStyleClass: 'my-panel', appendTo: 'body' });

    trigger(fixture).click();
    fixture.detectChanges();

    const panel = document.querySelector('.my-panel') as HTMLElement;
    expect(panel).not.toBeNull();
    expect(panel.querySelector('[role="option"]')).not.toBeNull();
    expect(panel.closest('.cdk-overlay-container')?.parentElement).toBe(document.body);
  });

  describe('UI-025.S5: appendTo outside the body', () => {
    const NESTED: CascadeSelectOption<string>[] = [
      { label: 'Americas', children: [{ label: 'Brazil', value: 'brazil' }] },
    ];

    function expectPanelsInside(target: HTMLElement, fixture: ComponentFixture<CascadeSelectComponent<string>>): void {
      trigger(fixture).click();
      fixture.detectChanges();

      const group = document.querySelector('[role="option"][aria-haspopup]') as HTMLElement;
      expect(group).not.toBeNull();
      group.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }));
      fixture.detectChanges();

      const panels = Array.from(document.querySelectorAll<HTMLElement>('.cdk-overlay-pane'));
      expect(panels.length).toBe(2);
      for (const pane of panels) {
        expect(target.contains(pane)).toBe(true);
      }
    }

    it('appendTo="self" places the panel and its submenus inside the component host, next to the trigger', () => {
      const fixture = create({ options: NESTED, appendTo: 'self' });

      expectPanelsInside(fixture.nativeElement as HTMLElement, fixture);
    });

    it('appendTo as an HTMLElement places the panel and its submenus inside that element', () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      try {
        const fixture = create({ options: NESTED, appendTo: container });

        expectPanelsInside(container, fixture);
      } finally {
        container.remove();
      }
    });
  });

  it('UI-025.S6: with none of the inputs the field keeps the current behavior', () => {
    const fixture = create();

    expect(trigger(fixture).hasAttribute('aria-label')).toBe(false);
    expect(trigger(fixture).hasAttribute('aria-required')).toBe(false);
    expect(trigger(fixture).getAttribute('tabindex')).toBe('0');
    expect(document.activeElement).not.toBe(trigger(fixture));
    expect(fixture.nativeElement.querySelector('input[type="hidden"]')).toBeNull();
  });
});
