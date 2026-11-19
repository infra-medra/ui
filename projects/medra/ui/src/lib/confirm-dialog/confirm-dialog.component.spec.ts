import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  standalone: true,
  imports: [ConfirmDialogComponent],
  template: `
    <med-confirm-dialog key="delete-user" [acceptVisible]="true" [rejectVisible]="false">
      <ng-template #headless let-data let-onAccept="onAccept" let-onReject="onReject">
        <div data-testid="headless-confirm">
          <span>{{ data.message }}</span>
          <button type="button" data-testid="headless-accept" (click)="onAccept()">Confirm</button>
          <button type="button" data-testid="headless-reject" (click)="onReject()">Cancel</button>
        </div>
      </ng-template>
    </med-confirm-dialog>
  `,
})
class KeyedConfirmDialogHostComponent {}

function getOverlayContainer(): HTMLElement {
  return document.querySelector('.cdk-overlay-container') as HTMLElement;
}

describe('ConfirmDialogComponent (UI-009.S1)', () => {
  let service: ConfirmDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule, KeyedConfirmDialogHostComponent],
    });
    service = TestBed.inject(ConfirmDialogService);
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => {
      el.innerHTML = '';
    });
  });

  it('[UI-009.S1][M-04] matches exact key and renders #headless template safely', () => {
    const fixture = TestBed.createComponent(KeyedConfirmDialogHostComponent);
    fixture.detectChanges();

    const results: Array<boolean | undefined> = [];
    const ref = service.confirm({
      key: 'delete-user',
      message: '<b>Delete</b> user?',
      header: 'Confirm',
    });
    ref.closed$.subscribe((r) => results.push(r));
    fixture.detectChanges();

    const container = getOverlayContainer();
    const headless = container.querySelector('[data-testid="headless-confirm"]') as HTMLElement;
    expect(headless).not.toBeNull();
    expect(headless.querySelector('b')).toBeNull();
    expect(headless.textContent).toContain('<b>Delete</b> user?');

    (container.querySelector('[data-testid="headless-accept"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(results).toEqual([true]);
  });

  it('[UI-009.S1][M-04] does not intercept calls for a different or prefix-similar key', () => {
    const fixture = TestBed.createComponent(KeyedConfirmDialogHostComponent);
    fixture.detectChanges();

    const ref = service.confirm({
      key: 'delete-user-extra',
      message: 'Other confirmation',
    });
    fixture.detectChanges();

    const container = getOverlayContainer();
    expect(container.querySelector('[data-testid="headless-confirm"]')).toBeNull();
    expect(container.textContent).toContain('Other confirmation');
    ref.close(false);
  });
});
