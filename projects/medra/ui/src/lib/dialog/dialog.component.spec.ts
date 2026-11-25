import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { DialogComponent } from './dialog.component';

@Component({
  standalone: true,
  imports: [DialogComponent],
  template: `
    <med-dialog
      [(visible)]="visible"
      [header]="dialogHeader()"
      [maximizable]="true"
      [position]="'top'"
      (onShow)="showCount = showCount + 1"
      (onHide)="hideCount = hideCount + 1"
    >
      <ng-template #header>
        <span data-testid="custom-header">Custom Header</span>
      </ng-template>
      <p data-testid="dialog-body">Dialog Body Content</p>
      <ng-template #footer>
        <button type="button" data-testid="custom-footer-btn" (click)="visible.set(false)">Done</button>
      </ng-template>
    </med-dialog>
  `,
})
class DeclarativeDialogHostComponent {
  readonly visible = signal(false);
  readonly dialogHeader = signal('Edit Profile');
  showCount = 0;
  hideCount = 0;
}

@Component({
  standalone: true,
  imports: [DialogComponent],
  template: `
    <med-dialog [(visible)]="visible" [header]="header()">
      <p>{{ bodyText() }}</p>
    </med-dialog>
  `,
})
class UnsafeTextDialogHostComponent {
  readonly visible = signal(true);
  readonly header = signal('<img src=x onerror="alert(1)">');
  readonly bodyText = signal('<script>window.__xss = true</script>');
}

@Component({
  standalone: true,
  imports: [DialogComponent],
  template: `
    <med-dialog [(visible)]="visible" [modal]="false" header="Non-Modal">
      <p>Non-modal body</p>
    </med-dialog>
  `,
})
class NonModalDialogHostComponent {
  readonly visible = signal(true);
}

@Component({
  standalone: true,
  imports: [DialogComponent],
  template: `
    <med-dialog [(visible)]="visible" [modal]="false" [dismissableMask]="false" header="Non-Modal Sticky">
      <p>Non-modal sticky body</p>
    </med-dialog>
  `,
})
class NonModalStickyDialogHostComponent {
  readonly visible = signal(true);
}

@Component({
  standalone: true,
  imports: [DialogComponent],
  template: `
    <med-dialog [(visible)]="open" header="Closable">
      <p>Closable body</p>
    </med-dialog>
  `,
})
class ClosableDialogHostComponent {
  open = true;
}

function getOverlayContainer(): HTMLElement {
  return document.querySelector('.cdk-overlay-container') as HTMLElement;
}

describe('DialogComponent (UI-009.S1)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        OverlayModule,
        DeclarativeDialogHostComponent,
        UnsafeTextDialogHostComponent,
        NonModalDialogHostComponent,
        NonModalStickyDialogHostComponent,
        ClosableDialogHostComponent,
      ],
    });
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => {
      el.innerHTML = '';
    });
  });

  it('[UI-009.S1] opens declaratively via [(visible)], projects #header and #footer, and supports maximize', () => {
    const fixture = TestBed.createComponent(DeclarativeDialogHostComponent);
    fixture.detectChanges();

    expect(getOverlayContainer()?.querySelector('[role="dialog"]') ?? null).toBeNull();

    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();

    const dialog = getOverlayContainer().querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();
    expect(dialog.querySelector('[data-testid="custom-header"]')?.textContent).toContain('Custom Header');
    expect(dialog.querySelector('[data-testid="dialog-body"]')?.textContent).toContain('Dialog Body Content');
    expect(dialog.querySelector('[data-testid="custom-footer-btn"]')).not.toBeNull();
    expect(fixture.componentInstance.showCount).toBe(1);

    const maxBtn = dialog.querySelector('button[aria-label="Maximize"]') as HTMLButtonElement;
    expect(maxBtn).not.toBeNull();
    maxBtn.click();
    fixture.detectChanges();
    expect(dialog.getAttribute('data-maximized')).toBe('true');

    const doneBtn = dialog.querySelector('[data-testid="custom-footer-btn"]') as HTMLButtonElement;
    doneBtn.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.visible()).toBe(false);
    expect(fixture.componentInstance.hideCount).toBe(1);
    expect(getOverlayContainer()?.querySelector('[role="dialog"]') ?? null).toBeNull();
  });

  // DLD-005.S2
  it('[DLD-005.S2] closing the dialog from its close button sets the bound visible value to false', () => {
    const fixture = TestBed.createComponent(ClosableDialogHostComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.open).toBe(true);
    const dialog = getOverlayContainer().querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();

    (dialog.querySelector('button[aria-label="Close"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.open).toBe(false);
    expect(getOverlayContainer().querySelector('[role="dialog"]')).toBeNull();
  });

  it('[UI-009.S1][M-03] escapes header and body text without injecting HTML DOM elements', () => {
    const fixture = TestBed.createComponent(UnsafeTextDialogHostComponent);
    fixture.detectChanges();

    const dialog = getOverlayContainer().querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();
    expect(dialog.querySelector('img')).toBeNull();
    expect(dialog.querySelector('script')).toBeNull();
    expect(dialog.textContent).toContain('<img src=x onerror="alert(1)">');
    expect(dialog.textContent).toContain('<script>window.__xss = true</script>');
  });

  it('[DLD-002.S1] retains .cdk-overlay-backdrop and aria-modal="true" when modal defaults to true', () => {
    const fixture = TestBed.createComponent(DeclarativeDialogHostComponent);
    fixture.detectChanges();
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();

    const dialog = getOverlayContainer().querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();
    expect(document.querySelectorAll('.cdk-overlay-backdrop')).toHaveLength(1);
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('[DLD-002.S1] opens [modal]="false" with zero .cdk-overlay-backdrop, omits aria-modal, and closes on outside click by default', () => {
    const fixture = TestBed.createComponent(NonModalDialogHostComponent);
    fixture.detectChanges();

    const dialog = getOverlayContainer().querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();
    expect(document.querySelectorAll('.cdk-overlay-backdrop')).toHaveLength(0);
    expect(dialog.getAttribute('aria-modal')).toBeNull();

    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.visible()).toBe(false);
    expect(getOverlayContainer()?.querySelector('[role="dialog"]') ?? null).toBeNull();
  });

  it('[DLD-002.S1] keeps [modal]="false" dialog open on outside click when [dismissableMask]="false"', () => {
    const fixture = TestBed.createComponent(NonModalStickyDialogHostComponent);
    fixture.detectChanges();

    const dialog = getOverlayContainer().querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();
    expect(document.querySelectorAll('.cdk-overlay-backdrop')).toHaveLength(0);
    expect(dialog.getAttribute('aria-modal')).toBeNull();

    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.visible()).toBe(true);
    expect(getOverlayContainer().querySelector('[role="dialog"]')).not.toBeNull();
  });
});
