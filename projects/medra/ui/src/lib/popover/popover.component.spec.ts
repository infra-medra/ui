import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { PopoverComponent } from './popover.component';

@Component({
  standalone: true,
  imports: [PopoverComponent],
  template: `
    <h2 #heading id="popover-heading">Filters</h2>
    <button #trigger type="button" (click)="pop.toggle(trigger)">Toggle</button>
    <div class="other">Elsewhere</div>
    <med-popover #pop [ariaLabel]="ariaLabel" [ariaLabelledBy]="ariaLabelledBy" [dismissable]="dismissable" class="custom-panel-class">
      <p class="content-marker">Arbitrary content</p>
      <button type="button" class="inner-button" (click)="innerClicked = true">Do a thing</button>
    </med-popover>
  `,
})
class HostComponent {
  @ViewChild(PopoverComponent) pop!: PopoverComponent;
  innerClicked = false;
  ariaLabel: string | null = null;
  ariaLabelledBy: string | null = null;
  dismissable = true;
}

function trigger(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('button') as HTMLElement;
}

describe('PopoverComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function create() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('is closed initially, marks <med-popover> itself as hidden, and never projects its content', () => {
    const fixture = create();
    expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
    expect(fixture.nativeElement.querySelector('med-popover')!.className).toContain('hidden');
    expect(document.body.textContent).not.toContain('Arbitrary content');
  });

  it('toggle() opens on the first call and closes on the second', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(document.querySelector('.cdk-overlay-pane')).not.toBeNull();
    expect(document.querySelector('.cdk-overlay-pane')!.textContent).toContain('Arbitrary content');

    trigger(fixture).click();
    fixture.detectChanges();
    expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
  });

  it('has no backdrop (non-modal, like Menu/Select)', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(document.querySelector('.cdk-overlay-backdrop')).toBeNull();
  });

  it('moves real focus onto the pane on open', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(document.activeElement).toBe(document.querySelector('.cdk-overlay-pane'));
  });

  it('gives the pane role="dialog"', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(document.querySelector('.cdk-overlay-pane')!.getAttribute('role')).toBe('dialog');
  });

  it('has no aria-label on the pane by default', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(document.querySelector('.cdk-overlay-pane')!.hasAttribute('aria-label')).toBe(false);
  });

  it('sets aria-label on the pane when ariaLabel is provided', () => {
    // Set before the first detectChanges() — mutating between two
    // detectChanges() calls trips NG0100 (expression-changed-after-checked).
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.ariaLabel = 'Filter options';
    fixture.detectChanges();

    trigger(fixture).click();
    fixture.detectChanges();
    expect(document.querySelector('.cdk-overlay-pane')!.getAttribute('aria-label')).toBe('Filter options');
  });

  it('closes on Escape', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();

    document.querySelector('.cdk-overlay-pane')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
  });

  it('projected content stays interactive (arbitrary buttons inside still work)', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();

    document.querySelector<HTMLButtonElement>('.inner-button')!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.innerClicked).toBe(true);
  });

  it('isOpen reflects the current state', () => {
    const fixture = create();
    expect(fixture.componentInstance.pop.isOpen).toBe(false);

    trigger(fixture).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.pop.isOpen).toBe(true);
  });

  it('close() closes it programmatically', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(document.querySelector('.cdk-overlay-pane')).not.toBeNull();

    fixture.componentInstance.pop.close();
    fixture.detectChanges();
    expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
  });

  it('destroying the host while open closes the overlay', () => {
    const fixture = create();
    trigger(fixture).click();
    fixture.detectChanges();
    expect(document.querySelector('.cdk-overlay-pane')).not.toBeNull();

    fixture.destroy();

    expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
  });

  describe('class', () => {
    it('merges the consumer class onto the pane without breaking panelClass (real bug: a merged multi-token string threw in CDK)', () => {
      const fixture = create();
      trigger(fixture).click();
      fixture.detectChanges();

      const pane = document.querySelector('.cdk-overlay-pane')!;
      expect(pane.classList.contains('custom-panel-class')).toBe(true);
      expect(pane.classList.contains('rounded-lg')).toBe(true); // internal default class still present
    });
  });

  describe('ariaLabelledBy', () => {
    it('has no aria-labelledby on the pane by default', () => {
      const fixture = create();
      trigger(fixture).click();
      fixture.detectChanges();
      expect(document.querySelector('.cdk-overlay-pane')!.hasAttribute('aria-labelledby')).toBe(false);
    });

    it('sets aria-labelledby on the pane when provided', () => {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.componentInstance.ariaLabelledBy = 'popover-heading';
      fixture.detectChanges();

      trigger(fixture).click();
      fixture.detectChanges();
      expect(document.querySelector('.cdk-overlay-pane')!.getAttribute('aria-labelledby')).toBe('popover-heading');
    });
  });

  describe('dismissable', () => {
    function outsideClick(): void {
      const event = new MouseEvent('click', { bubbles: true, cancelable: true });
      document.querySelector('.other')!.dispatchEvent(event);
    }

    it('defaults to true (unchanged) — an outside click closes it', () => {
      const fixture = create();
      trigger(fixture).click();
      fixture.detectChanges();
      expect(document.querySelector('.cdk-overlay-pane')).not.toBeNull();

      outsideClick();
      fixture.detectChanges();
      expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
    });

    it('false keeps the panel open on an outside click', () => {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.componentInstance.dismissable = false;
      fixture.detectChanges();

      trigger(fixture).click();
      fixture.detectChanges();
      outsideClick();
      fixture.detectChanges();

      expect(document.querySelector('.cdk-overlay-pane')).not.toBeNull();
    });

    it('Escape still closes it even when dismissable is false (only outside-click is gated)', () => {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.componentInstance.dismissable = false;
      fixture.detectChanges();

      trigger(fixture).click();
      fixture.detectChanges();
      document.querySelector('.cdk-overlay-pane')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
      fixture.detectChanges();

      expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
    });
  });

  describe('UI-009.S2 lifecycle and explicit target override', () => {
    it('[UI-009.S2] emits shown/hidden and supports show(event, target) override', () => {
      @Component({
        standalone: true,
        imports: [PopoverComponent],
        template: `
          <button type="button" id="btn-a" (click)="pop.show($event, anchor)">Open</button>
          <span id="explicit-anchor">Anchor</span>
          <med-popover #pop (shown)="shownCount = shownCount + 1" (hidden)="hiddenCount = hiddenCount + 1">
            <p>Popover content</p>
          </med-popover>
        `,
      })
      class OverrideHost {
        shownCount = 0;
        hiddenCount = 0;
        get anchor(): HTMLElement {
          return document.querySelector('#explicit-anchor') as HTMLElement;
        }
      }

      const fixture = TestBed.createComponent(OverrideHost);
      fixture.detectChanges();

      (fixture.nativeElement.querySelector('#btn-a') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(fixture.componentInstance.shownCount).toBe(1);
      expect(document.querySelector('.cdk-overlay-pane')?.textContent).toContain('Popover content');

      document.querySelector('.cdk-overlay-pane')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      expect(fixture.componentInstance.hiddenCount).toBe(1);
    });
  });
});
