import { ApplicationRef, Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { ConfirmPopupService } from './confirm-popup.service';
import { ConfirmPopupOptions } from './confirm-popup.types';

@Component({
  standalone: true,
  template: `<button #trigger type="button">Delete</button>`,
})
class HostComponent {
  @ViewChild('trigger') trigger!: ElementRef<HTMLButtonElement>;
}

function getOverlayContainerElement(): HTMLElement {
  return document.querySelector('.cdk-overlay-container') as HTMLElement;
}

function acceptButton(): HTMLButtonElement {
  return [...getOverlayContainerElement().querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Yes') as HTMLButtonElement;
}

function rejectButton(): HTMLButtonElement {
  return [...getOverlayContainerElement().querySelectorAll('button')].find((b) => b.textContent?.trim() === 'No') as HTMLButtonElement;
}

describe('ConfirmPopupService', () => {
  let service: ConfirmPopupService;
  let host: HostComponent;
  let appRef: ApplicationRef;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule, HostComponent] });
    service = TestBed.inject(ConfirmPopupService);
    appRef = TestBed.inject(ApplicationRef);
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    host = fixture.componentInstance;
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  // Zoneless: the freshly-attached overlay component needs an explicit tick
  // to render its bindings, same as confirm-dialog.service.spec.ts.
  function confirm(options: ConfirmPopupOptions) {
    const handle = service.confirm(host.trigger.nativeElement, options);
    appRef.tick();
    return handle;
  }

  it('renders the message', () => {
    confirm({ message: "This can't be undone." });
    expect(getOverlayContainerElement().textContent).toContain("This can't be undone.");
  });

  it('defaults accept/reject labels to Yes/No', () => {
    confirm({ message: 'Proceed?' });
    expect(acceptButton()).toBeDefined();
    expect(rejectButton()).toBeDefined();
  });

  it('supports custom accept/reject labels', () => {
    confirm({ message: 'Proceed?', acceptLabel: 'Delete', rejectLabel: 'Keep' });
    const container = getOverlayContainerElement();
    expect([...container.querySelectorAll('button')].some((b) => b.textContent?.trim() === 'Delete')).toBe(true);
    expect([...container.querySelectorAll('button')].some((b) => b.textContent?.trim() === 'Keep')).toBe(true);
  });

  it('resolves closed$ with true on accept, and removes the panel', (done) => {
    const handle = confirm({ message: 'Proceed?' });
    handle!.closed$.subscribe((result) => {
      expect(result).toBe(true);
      expect(getOverlayContainerElement().querySelector('med-confirm-popup-content')).toBeNull();
      done();
    });
    acceptButton().click();
  });

  it('resolves closed$ with false on reject', (done) => {
    const handle = confirm({ message: 'Proceed?' });
    handle!.closed$.subscribe((result) => {
      expect(result).toBe(false);
      done();
    });
    rejectButton().click();
  });

  it('resolves closed$ with undefined when dismissed via Escape', (done) => {
    const handle = confirm({ message: 'Proceed?' });
    handle!.closed$.subscribe((result) => {
      expect(result).toBeUndefined();
      done();
    });
    getOverlayContainerElement().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  });

  it('focuses the reject button on open (dismissal is the safe default)', () => {
    confirm({ message: 'Proceed?' });
    expect(document.activeElement).toBe(rejectButton());
  });

  it('defaults the accept button to danger severity when severity is danger', () => {
    confirm({ message: 'Delete forever?', severity: 'danger' });
    expect(acceptButton().className).toContain('bg-danger-500');
  });

  it('defaults the accept button to primary severity for other severities', () => {
    confirm({ message: 'Proceed?', severity: 'warn' });
    expect(acceptButton().className).toContain('bg-brand-500');
  });

  it('lets acceptSeverity override the severity-derived default', () => {
    confirm({ message: 'Proceed?', severity: 'danger', acceptSeverity: 'success' });
    expect(acceptButton().className).toContain('bg-success-500');
  });

  it('shows a severity icon', () => {
    confirm({ message: 'Proceed?' });
    expect(getOverlayContainerElement().querySelector('svg')).not.toBeNull();
  });

  it('has role="alertdialog" with aria-describedby pointing at the message', () => {
    confirm({ message: 'Proceed?' });
    const content = getOverlayContainerElement().querySelector('med-confirm-popup-content') as HTMLElement;
    expect(content.getAttribute('role')).toBe('alertdialog');
    const describedById = content.getAttribute('aria-describedby');
    expect(describedById).toBeTruthy();
    const describedByElement = getOverlayContainerElement().querySelector(`#${describedById}`);
    expect(describedByElement?.textContent).toContain('Proceed?');
  });

  it('is anchored to the origin element, not centered/global like ConfirmDialog', () => {
    confirm({ message: 'Proceed?' });
    // A connected overlay's pane sits inside a `.cdk-overlay-connected-position-bounding-box`, never the global positioning wrapper ConfirmDialog uses.
    expect(getOverlayContainerElement().querySelector('.cdk-overlay-connected-position-bounding-box')).not.toBeNull();
  });

  describe('acceptVisible / rejectVisible / defaultFocus', () => {
    it('both buttons visible by default', () => {
      confirm({ message: 'Proceed?' });
      expect(acceptButton()).toBeDefined();
      expect(rejectButton()).toBeDefined();
    });

    it('acceptVisible: false hides the accept button, keeps reject', () => {
      confirm({ message: 'Proceed?', acceptVisible: false });
      expect(acceptButton()).toBeUndefined();
      expect(rejectButton()).toBeDefined();
    });

    it('rejectVisible: false hides the reject button, keeps accept', () => {
      confirm({ message: 'Proceed?', rejectVisible: false });
      expect(rejectButton()).toBeUndefined();
      expect(acceptButton()).toBeDefined();
    });

    it('defaultFocus defaults to reject (unchanged)', () => {
      confirm({ message: 'Proceed?' });
      expect(document.activeElement).toBe(rejectButton());
    });

    it('defaultFocus: "accept" focuses the accept button instead', () => {
      confirm({ message: 'Proceed?', defaultFocus: 'accept' });
      expect(document.activeElement).toBe(acceptButton());
    });

    it('defaultFocus: "none" focuses neither button', () => {
      confirm({ message: 'Proceed?', defaultFocus: 'none' });
      expect(document.activeElement).not.toBe(acceptButton());
      expect(document.activeElement).not.toBe(rejectButton());
    });

    it('falls back to whichever button is actually visible when the requested one is hidden', () => {
      confirm({ message: 'Proceed?', defaultFocus: 'reject', rejectVisible: false });
      expect(document.activeElement).toBe(acceptButton());
    });
  });

  describe('contentTemplate / headlessTemplate', () => {
    @Component({
      standalone: true,
      template: `
        <ng-template #contentTpl let-data>
          <p class="custom-content">Custom: {{ data.message }}</p>
        </ng-template>
        <ng-template #headlessTpl let-data let-onAccept="onAccept" let-onReject="onReject">
          <div class="custom-headless">
            <p>{{ data.message }}</p>
            <button type="button" class="custom-accept" (click)="onAccept()">Go</button>
            <button type="button" class="custom-reject" (click)="onReject()">Nope</button>
          </div>
        </ng-template>
      `,
    })
    class TemplateHostComponent {
      @ViewChild('contentTpl') contentTpl!: TemplateRef<any>;
      @ViewChild('headlessTpl') headlessTpl!: TemplateRef<any>;
    }

    function createTemplateHost() {
      const fixture = TestBed.createComponent(TemplateHostComponent);
      fixture.detectChanges();
      return fixture;
    }

    it('renders contentTemplate instead of the default icon+message, keeping the default buttons', () => {
      const fixture = createTemplateHost();
      confirm({ message: 'Proceed?', contentTemplate: fixture.componentInstance.contentTpl });
      const content = getOverlayContainerElement().querySelector('med-confirm-popup-content') as HTMLElement;

      expect(content.querySelector('.custom-content')?.textContent).toBe('Custom: Proceed?');
      expect(content.querySelector('med-icon')).toBeNull();
      expect(acceptButton()).toBeDefined();
      expect(rejectButton()).toBeDefined();
    });

    it('renders headlessTemplate instead of everything, including the default buttons', () => {
      const fixture = createTemplateHost();
      confirm({ message: 'Proceed?', headlessTemplate: fixture.componentInstance.headlessTpl });
      const content = getOverlayContainerElement().querySelector('med-confirm-popup-content') as HTMLElement;

      expect(content.querySelector('.custom-headless')).not.toBeNull();
      expect(acceptButton()).toBeUndefined();
      expect(rejectButton()).toBeUndefined();
    });

    it('headlessTemplate onAccept resolves the handle with true, same as the default accept button', (done) => {
      const fixture = createTemplateHost();
      const handle = confirm({ message: 'Proceed?', headlessTemplate: fixture.componentInstance.headlessTpl });
      handle!.closed$.subscribe((result) => {
        expect(result).toBe(true);
        done();
      });
      (getOverlayContainerElement().querySelector('.custom-accept') as HTMLButtonElement).click();
    });

    it('headlessTemplate onReject resolves the handle with false, same as the default reject button', (done) => {
      const fixture = createTemplateHost();
      const handle = confirm({ message: 'Proceed?', headlessTemplate: fixture.componentInstance.headlessTpl });
      handle!.closed$.subscribe((result) => {
        expect(result).toBe(false);
        done();
      });
      (getOverlayContainerElement().querySelector('.custom-reject') as HTMLButtonElement).click();
    });
  });
});
