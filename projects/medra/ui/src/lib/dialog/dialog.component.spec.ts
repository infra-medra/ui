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

function getOverlayContainer(): HTMLElement {
  return document.querySelector('.cdk-overlay-container') as HTMLElement;
}

describe('DialogComponent (UI-009.S1)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule, DeclarativeDialogHostComponent, UnsafeTextDialogHostComponent],
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
});
