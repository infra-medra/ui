import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { CascadeSelectComponent } from './cascade-select.component';
import { CascadeSelectOption } from './cascade-select.types';

/** UI-023: loading state of the field. */

const OPTIONS: CascadeSelectOption<string>[] = [{ label: 'USA', value: 'usa' }];

function trigger(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('[role="combobox"]') as HTMLElement;
}

describe('CascadeSelectComponent loading', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
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

  it('UI-023.S1: with loading, the spinner replaces the open icon and the field is aria-busy', () => {
    const fixture = create({ loading: true });
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('med-progress-spinner')).not.toBeNull();
    expect(el.querySelector('med-icon[name="chevron-down"]')).toBeNull();
    expect(trigger(fixture).getAttribute('aria-busy')).toBe('true');
  });

  it('UI-023.S2: by default the open icon shows and the spinner does not', () => {
    const fixture = create();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('med-icon[name="chevron-down"]')).not.toBeNull();
    expect(el.querySelector('med-progress-spinner')).toBeNull();
    expect(trigger(fixture).getAttribute('aria-busy')).toBeNull();
  });
});
