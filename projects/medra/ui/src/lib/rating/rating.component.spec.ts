import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { RatingComponent } from './rating.component';

function buttons(fixture: { nativeElement: HTMLElement }): HTMLButtonElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('button'));
}

function group(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('[role]') as HTMLElement;
}

function keydown(button: HTMLButtonElement, key: string) {
  button.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

function starVariants(fixture: ComponentFixture<unknown>): string[] {
  return fixture.debugElement
    .queryAll(By.directive(IconComponent))
    .map((el) => el.componentInstance as IconComponent)
    .filter((icon) => icon.name() === 'star')
    .map((icon) => icon.variant());
}

describe('RatingComponent (interactive, default cancel=true)', () => {
  function create(): ComponentFixture<RatingComponent> {
    const fixture = TestBed.createComponent(RatingComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders 5 stars plus a clear option by default', () => {
    const fixture = create();
    expect(buttons(fixture).length).toBe(6);
  });

  it('sets role="radiogroup" on the container and role="radio" on each button', () => {
    const fixture = create();
    expect(group(fixture).getAttribute('role')).toBe('radiogroup');
    expect(buttons(fixture).every((b) => b.getAttribute('role') === 'radio')).toBe(true);
  });

  it('nothing rated: the clear option starts checked, with roving tabindex 0', () => {
    const fixture = create();
    const btns = buttons(fixture);
    expect(btns[0].getAttribute('aria-checked')).toBe('true');
    expect(btns.slice(1).every((b) => b.getAttribute('aria-checked') === 'false')).toBe(true);
    expect(btns.map((b) => b.tabIndex)).toEqual([0, -1, -1, -1, -1, -1]);
  });

  it('clicking a star selects it, updates aria-checked/tabindex, and calls onChange', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    buttons(fixture)[3].click(); // 3rd star (index 0 is the clear option)
    fixture.detectChanges();

    expect(onChange).toHaveBeenCalledWith(3);
    const btns = buttons(fixture);
    expect(btns[3].getAttribute('aria-checked')).toBe('true');
    expect(btns[0].getAttribute('aria-checked')).toBe('false');
    expect(btns.map((b) => b.tabIndex)).toEqual([-1, -1, -1, 0, -1, -1]);
  });

  it('clicking the already-selected star is a no-op (radio semantics, never deselects)', () => {
    const fixture = create();
    fixture.componentInstance.writeValue(3);
    fixture.detectChanges();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    buttons(fixture)[3].click();
    fixture.detectChanges();

    expect(onChange).not.toHaveBeenCalled();
    expect(buttons(fixture)[3].getAttribute('aria-checked')).toBe('true');
  });

  it('clicking the clear option resets the rating to null', () => {
    const fixture = create();
    fixture.componentInstance.writeValue(4);
    fixture.detectChanges();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    buttons(fixture)[0].click();
    fixture.detectChanges();

    expect(onChange).toHaveBeenCalledWith(null);
    expect(buttons(fixture)[0].getAttribute('aria-checked')).toBe('true');
  });

  it('marks stars up to the current value as filled (solid), the rest as empty (outline)', () => {
    const fixture = create();
    fixture.componentInstance.writeValue(3);
    fixture.detectChanges();
    expect(starVariants(fixture)).toEqual(['solid', 'solid', 'solid', 'outline', 'outline']);
  });

  it('hovering a star previews the fill without committing a value', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    buttons(fixture)[2].dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(starVariants(fixture)).toEqual(['solid', 'solid', 'outline', 'outline', 'outline']);
    expect(onChange).not.toHaveBeenCalled();

    buttons(fixture)[2].dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    expect(starVariants(fixture)).toEqual(['outline', 'outline', 'outline', 'outline', 'outline']);
  });

  it('ArrowRight moves to the next option, wrapping around the whole row (clear included)', () => {
    const fixture = create();
    const btns = buttons(fixture);

    keydown(btns[0], 'ArrowRight');
    fixture.detectChanges();
    expect(buttons(fixture)[1].getAttribute('aria-checked')).toBe('true'); // star 1

    keydown(buttons(fixture)[5], 'ArrowRight');
    fixture.detectChanges();
    expect(buttons(fixture)[0].getAttribute('aria-checked')).toBe('true'); // wraps to clear
  });

  it('Home selects the clear option, End selects the last star', () => {
    const fixture = create();
    const btns = buttons(fixture);

    keydown(btns[3], 'End');
    fixture.detectChanges();
    expect(buttons(fixture)[5].getAttribute('aria-checked')).toBe('true');

    keydown(buttons(fixture)[5], 'Home');
    fixture.detectChanges();
    expect(buttons(fixture)[0].getAttribute('aria-checked')).toBe('true');
  });

  it('disabled: no interaction happens and every option is aria-disabled', () => {
    const fixture = create();
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    const btns = buttons(fixture);
    expect(btns.every((b) => b.getAttribute('aria-disabled') === 'true')).toBe(true);

    btns[3].click();
    fixture.detectChanges();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables via setDisabledState (Reactive Forms disable())', () => {
    const fixture = create();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    expect(buttons(fixture).every((b) => b.getAttribute('aria-disabled') === 'true')).toBe(true);
  });

  it('a FormControl initialized with a value renders it selected', () => {
    @Component({
      standalone: true,
      imports: [RatingComponent, ReactiveFormsModule],
      template: `<med-rating [formControl]="control" />`,
    })
    class HostComponent {
      readonly control = new FormControl<number | null>(4);
    }

    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(buttons(fixture)[4].getAttribute('aria-checked')).toBe('true');
  });

  it('sets aria-label on the group when provided', () => {
    const fixture = create();
    fixture.componentRef.setInput('ariaLabel', 'Rate this product');
    fixture.detectChanges();
    expect(group(fixture).getAttribute('aria-label')).toBe('Rate this product');
  });

  it('supports a custom clearLabel', () => {
    const fixture = create();
    fixture.componentRef.setInput('clearLabel', 'No rating');
    fixture.detectChanges();
    expect(buttons(fixture)[0].getAttribute('aria-label')).toBe('No rating');
  });

  it('merges a consumer class override onto the group', () => {
    const fixture = create();
    fixture.componentRef.setInput('class', 'w-full');
    fixture.detectChanges();
    expect(group(fixture).className).toContain('w-full');
  });

  it('supports a custom star count', () => {
    const fixture = create();
    fixture.componentRef.setInput('stars', 10);
    fixture.detectChanges();
    expect(buttons(fixture).length).toBe(11); // 10 stars + clear
  });
});

describe('RatingComponent (cancel=false)', () => {
  function create(): ComponentFixture<RatingComponent> {
    const fixture = TestBed.createComponent(RatingComponent);
    fixture.componentRef.setInput('cancel', false);
    fixture.detectChanges();
    return fixture;
  }

  it('renders only the stars, no clear option', () => {
    const fixture = create();
    expect(buttons(fixture).length).toBe(5);
  });

  it('nothing rated: no option is checked, but the first star gets the roving tabindex', () => {
    const fixture = create();
    const btns = buttons(fixture);
    expect(btns.every((b) => b.getAttribute('aria-checked') === 'false')).toBe(true);
    expect(btns.map((b) => b.tabIndex)).toEqual([0, -1, -1, -1, -1]);
  });

  it('Home selects the first star (there is no clear option to land on)', () => {
    const fixture = create();
    keydown(buttons(fixture)[3], 'Home');
    fixture.detectChanges();
    expect(buttons(fixture)[0].getAttribute('aria-checked')).toBe('true');
  });
});

describe('RatingComponent (allowHalf)', () => {
  function create(): ComponentFixture<RatingComponent> {
    const fixture = TestBed.createComponent(RatingComponent);
    fixture.componentRef.setInput('allowHalf', true);
    fixture.detectChanges();
    return fixture;
  }

  function mockRectWidth(button: HTMLButtonElement, width: number): void {
    jest.spyOn(button, 'getBoundingClientRect').mockReturnValue({ left: 0, width, top: 0, height: 0, right: width, bottom: 0, x: 0, y: 0, toJSON: () => ({}) });
  }

  function clickAt(button: HTMLButtonElement, clientX: number): void {
    button.dispatchEvent(new MouseEvent('click', { clientX, bubbles: true, cancelable: true }));
  }

  it('clicking the left half of a star commits a half value', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    const star4 = buttons(fixture)[4]; // clear(0) + star1..3(1-3) + star4(4)

    mockRectWidth(star4, 20);
    clickAt(star4, 5); // left half (< 10)
    fixture.detectChanges();

    expect(onChange).toHaveBeenCalledWith(3.5);
  });

  it('clicking the right half of a star commits the whole value, same as without allowHalf', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    const star4 = buttons(fixture)[4];

    mockRectWidth(star4, 20);
    clickAt(star4, 15); // right half (>= 10)
    fixture.detectChanges();

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('a half value renders the owning star as half (outline base + clipped solid overlay) and the rest normally', () => {
    const fixture = create();
    fixture.componentInstance.writeValue(3.5);
    fixture.detectChanges();

    const starIcons = fixture.debugElement
      .queryAll(By.directive(IconComponent))
      .map((el) => el.componentInstance as IconComponent)
      .filter((icon) => icon.name() === 'star');
    // stars 1-3 solid (full), star 4 renders TWO icons (outline base + solid overlay, the half), star 5 outline (empty)
    expect(starIcons.map((icon) => icon.variant())).toEqual(['solid', 'solid', 'solid', 'outline', 'solid', 'outline']);
  });

  it('a half value marks the owning star (not any other) as aria-checked, with a fractional aria-label', () => {
    const fixture = create();
    fixture.componentInstance.writeValue(3.5);
    fixture.detectChanges();
    const btns = buttons(fixture);

    expect(btns[4].getAttribute('aria-checked')).toBe('true'); // star 4 owns 3.5
    expect(btns[4].getAttribute('aria-label')).toBe('3.5 stars');
    expect(btns.filter((b) => b.getAttribute('aria-checked') === 'true').length).toBe(1);
  });

  it('a half value keeps exactly one button in the roving tabindex sequence (the owning star)', () => {
    const fixture = create();
    fixture.componentInstance.writeValue(3.5);
    fixture.detectChanges();
    expect(buttons(fixture).map((b) => b.tabIndex)).toEqual([-1, -1, -1, -1, 0, -1]);
  });

  it('without allowHalf, a click always commits the whole star regardless of click position', () => {
    const fixture = TestBed.createComponent(RatingComponent);
    fixture.detectChanges();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    const star4 = buttons(fixture)[4];

    mockRectWidth(star4, 20);
    clickAt(star4, 2); // would be a left-half click, but allowHalf is off
    fixture.detectChanges();

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('a readonly half value renders correctly even when allowHalf is off (display is not gated on the input)', () => {
    const fixture = TestBed.createComponent(RatingComponent);
    fixture.componentRef.setInput('readonly', true);
    fixture.componentInstance.writeValue(3.5);
    fixture.detectChanges();

    const starIcons = fixture.debugElement
      .queryAll(By.directive(IconComponent))
      .map((el) => el.componentInstance as IconComponent)
      .filter((icon) => icon.name() === 'star');
    expect(starIcons.map((icon) => icon.variant())).toEqual(['solid', 'solid', 'solid', 'outline', 'solid', 'outline']);
    expect(group(fixture).getAttribute('aria-label')).toBe('3.5 out of 5 stars');
  });

  it('keyboard navigation still moves by whole stars even with allowHalf on', () => {
    const fixture = create();
    fixture.componentInstance.writeValue(3.5);
    fixture.detectChanges();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    keydown(buttons(fixture)[4], 'ArrowRight'); // focus is on star 4's button (owns 3.5)
    fixture.detectChanges();

    expect(onChange).toHaveBeenCalledWith(5);
  });
});

describe('RatingComponent (readonly)', () => {
  it('renders no buttons, only a static role="img" summary', () => {
    const fixture = TestBed.createComponent(RatingComponent);
    fixture.componentRef.setInput('readonly', true);
    fixture.componentInstance.writeValue(3);
    fixture.detectChanges();

    expect(buttons(fixture).length).toBe(0);
    expect(group(fixture).getAttribute('role')).toBe('img');
    expect(group(fixture).getAttribute('aria-label')).toBe('3 out of 5 stars');
    expect(starVariants(fixture)).toEqual(['solid', 'solid', 'solid', 'outline', 'outline']);
  });

  it('a custom ariaLabel overrides the generated summary', () => {
    const fixture = TestBed.createComponent(RatingComponent);
    fixture.componentRef.setInput('readonly', true);
    fixture.componentRef.setInput('ariaLabel', 'Average rating: 3 stars');
    fixture.detectChanges();
    expect(group(fixture).getAttribute('aria-label')).toBe('Average rating: 3 stars');
  });

  it('[UI-010.S2] renders custom #onicon, #officon, and #cancelicon templates', () => {
    @Component({
      standalone: true,
      imports: [RatingComponent],
      template: `
        <med-rating [stars]="3" [cancel]="true">
          <ng-template #onicon><span data-testid="custom-on">ON</span></ng-template>
          <ng-template #officon><span data-testid="custom-off">OFF</span></ng-template>
          <ng-template #cancelicon><span data-testid="custom-cancel">CLR</span></ng-template>
        </med-rating>
      `,
    })
    class CustomRatingHost {}

    const fixture = TestBed.createComponent(CustomRatingHost);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('[data-testid="custom-off"]').length).toBe(3);
    expect(fixture.nativeElement.querySelector('[data-testid="custom-cancel"]')).not.toBeNull();
  });
});
