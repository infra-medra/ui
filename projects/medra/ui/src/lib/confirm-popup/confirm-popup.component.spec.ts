import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { ConfirmPopupComponent } from './confirm-popup.component';
import { ConfirmPopupService } from './confirm-popup.service';

@Component({
  standalone: true,
  imports: [ConfirmPopupComponent],
  template: `
    <button type="button" id="trigger-btn">Trigger</button>
    <med-confirm-popup key="row-action">
      <ng-template #headless let-data let-onAccept="onAccept" let-onReject="onReject">
        <div data-testid="popup-headless">
          <span>{{ data.message }}</span>
          <button type="button" data-testid="popup-accept" (click)="onAccept()">Yes</button>
          <button type="button" data-testid="popup-reject" (click)="onReject()">No</button>
        </div>
      </ng-template>
    </med-confirm-popup>
  `,
})
class KeyedConfirmPopupHostComponent {}

function getOverlayContainer(): HTMLElement {
  return document.querySelector('.cdk-overlay-container') as HTMLElement;
}

describe('ConfirmPopupComponent (UI-009.S1)', () => {
  let service: ConfirmPopupService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule, KeyedConfirmPopupHostComponent],
    });
    service = TestBed.inject(ConfirmPopupService);
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => {
      el.innerHTML = '';
    });
  });

  it('[UI-009.S1][M-04] routes keyed confirm() to matching declarative <med-confirm-popup>', () => {
    const fixture = TestBed.createComponent(KeyedConfirmPopupHostComponent);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('#trigger-btn') as HTMLElement;
    const results: Array<boolean | undefined> = [];
    const handle = service.confirm(trigger, {
      key: 'row-action',
      message: 'Remove item?',
    });
    expect(handle).not.toBeNull();
    handle!.closed$.subscribe((r) => results.push(r));
    fixture.detectChanges();

    const container = getOverlayContainer();
    expect(container.querySelector('[data-testid="popup-headless"]')).not.toBeNull();
    (container.querySelector('[data-testid="popup-accept"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(results).toEqual([true]);
  });

  it('[UI-009.S1][M-04] ignores calls whose key does not match exactly', () => {
    const fixture = TestBed.createComponent(KeyedConfirmPopupHostComponent);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('#trigger-btn') as HTMLElement;
    const handle = service.confirm(trigger, {
      key: 'row-action-2',
      message: 'Fallback popup',
    });
    fixture.detectChanges();

    const container = getOverlayContainer();
    expect(container.querySelector('[data-testid="popup-headless"]')).toBeNull();
    expect(container.textContent).toContain('Fallback popup');
    handle?.close(false);
  });
});
