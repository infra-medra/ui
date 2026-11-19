import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { InplaceComponent } from './inplace.component';
import { InplaceContentDirective, InplaceDisplayDirective } from './inplace.directives';

@Component({
  standalone: true,
  imports: [InplaceComponent, InplaceDisplayDirective, InplaceContentDirective],
  // A static `class="..."` attribute, not `[class]="expr"` — see
  // ScrollPanelComponent's own doc for why that distinction matters for the
  // class-merge regression test below.
  template: `
    <med-inplace [(active)]="active" [closable]="closable" [disabled]="disabled" class="max-w-64">
      <span medInplaceDisplay>{{ value }}</span>
      <input medInplaceContent type="text" [value]="value" />
    </med-inplace>
  `,
})
class HostComponent {
  active = false;
  closable = false;
  disabled = false;
  value = 'Jane Doe';
}

function displayButton(fixture: { nativeElement: HTMLElement }): HTMLButtonElement {
  return fixture.nativeElement.querySelector('button') as HTMLButtonElement;
}

function contentWrapper(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelectorAll('div')[0] as HTMLElement;
}

function closeButton(fixture: { nativeElement: HTMLElement }): HTMLButtonElement | null {
  return fixture.nativeElement.querySelector('button[aria-label="Close"]');
}

function create(configure?: (h: HostComponent) => void) {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

describe('InplaceComponent', () => {
  it('shows the display view and hides the content view by default', () => {
    const fixture = create();
    expect(displayButton(fixture).hidden).toBe(false);
    expect(contentWrapper(fixture).hidden).toBe(true);
    expect(displayButton(fixture).textContent).toContain('Jane Doe');
  });

  it('clicking the display button activates the content view', () => {
    const fixture = create();

    displayButton(fixture).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.active).toBe(true);
    expect(displayButton(fixture).hidden).toBe(true);
    expect(contentWrapper(fixture).hidden).toBe(false);
  });

  it('starts in the content view when active is initially true', () => {
    const fixture = create((h) => (h.active = true));
    expect(displayButton(fixture).hidden).toBe(true);
    expect(contentWrapper(fixture).hidden).toBe(false);
  });

  it('a disabled display button cannot be clicked open', () => {
    const fixture = create((h) => (h.disabled = true));
    expect(displayButton(fixture).disabled).toBe(true);
  });

  it('no close button is rendered unless closable is set', () => {
    const fixture = create((h) => (h.active = true));
    expect(closeButton(fixture)).toBeNull();
  });

  it('clicking the close button deactivates back to the display view', () => {
    const fixture = create((h) => {
      h.active = true;
      h.closable = true;
    });
    closeButton(fixture)!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.active).toBe(false);
    expect(displayButton(fixture).hidden).toBe(false);
  });

  it('the content <input> keeps its value across a close/reopen (stays in the DOM, not recreated)', () => {
    const fixture = create((h) => (h.closable = true));
    displayButton(fixture).click();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'Edited value';

    closeButton(fixture)!.click();
    fixture.detectChanges();
    displayButton(fixture).click();
    fixture.detectChanges();

    expect((fixture.nativeElement.querySelector('input') as HTMLInputElement).value).toBe('Edited value');
  });

  it('opening moves focus into the first focusable element in the content view (Wave 2 fix)', () => {
    const fixture = create();
    displayButton(fixture).click();
    fixture.detectChanges();

    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('input'));
  });

  it('closing returns focus to the display button', () => {
    const fixture = create((h) => (h.closable = true));
    displayButton(fixture).click();
    fixture.detectChanges();

    closeButton(fixture)!.click();
    fixture.detectChanges();

    expect(document.activeElement).toBe(displayButton(fixture));
  });

  it('merges a consumer class onto the host — the one element always present regardless of which view is showing', () => {
    const fixture = create();
    const host = fixture.nativeElement.querySelector('med-inplace') as HTMLElement;
    expect(host.className).toContain('max-w-64');
  });

  // @scenario UI-006.S2
  describe('preventClick, activate, deactivate and closeCallback (Wave 2)', () => {
    @Component({
      standalone: true,
      imports: [InplaceComponent, InplaceDisplayDirective],
      template: `
        <med-inplace
          [(active)]="active"
          [preventClick]="preventClick"
          (activate)="activatedCount = activatedCount + 1"
          (deactivate)="deactivatedCount = deactivatedCount + 1"
        >
          <span medInplaceDisplay>Click to edit</span>
          <ng-template #content let-closeCallback="closeCallback">
            <button type="button" class="custom-close" (click)="closeCallback()">Done</button>
          </ng-template>
        </med-inplace>
      `,
    })
    class Wave2InplaceHostComponent {
      active = false;
      preventClick = false;
      activatedCount = 0;
      deactivatedCount = 0;
    }

    it('prevents activation on click when preventClick is true', () => {
      const fixture = TestBed.createComponent(Wave2InplaceHostComponent);
      fixture.componentInstance.preventClick = true;
      fixture.detectChanges();

      displayButton(fixture).click();
      fixture.detectChanges();

      expect(fixture.componentInstance.active).toBe(false);
      expect(fixture.componentInstance.activatedCount).toBe(0);
    });

    it('emits activate/deactivate and exposes closeCallback to #content template', () => {
      const fixture = TestBed.createComponent(Wave2InplaceHostComponent);
      fixture.detectChanges();

      displayButton(fixture).click();
      fixture.detectChanges();
      expect(fixture.componentInstance.active).toBe(true);
      expect(fixture.componentInstance.activatedCount).toBe(1);

      const customClose = fixture.nativeElement.querySelector('.custom-close') as HTMLButtonElement;
      expect(customClose).not.toBeNull();
      customClose.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.active).toBe(false);
      expect(fixture.componentInstance.deactivatedCount).toBe(1);
    });
  });
});
