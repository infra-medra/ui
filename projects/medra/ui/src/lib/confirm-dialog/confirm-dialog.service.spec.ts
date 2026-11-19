import { ApplicationRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { ConfirmDialogService } from './confirm-dialog.service';
import { ConfirmDialogOptions } from './confirm-dialog.types';

function getOverlayContainerElement(): HTMLElement {
  return document.querySelector('.cdk-overlay-container') as HTMLElement;
}

function acceptButton(): HTMLButtonElement {
  return [...getOverlayContainerElement().querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Yes') as HTMLButtonElement;
}

function rejectButton(): HTMLButtonElement {
  return [...getOverlayContainerElement().querySelectorAll('button')].find((b) => b.textContent?.trim() === 'No') as HTMLButtonElement;
}

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;
  let appRef: ApplicationRef;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
    service = TestBed.inject(ConfirmDialogService);
    appRef = TestBed.inject(ApplicationRef);
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function confirm(options: ConfirmDialogOptions) {
    const ref = service.confirm(options);
    appRef.tick();
    return ref;
  }

  it('renders the header and message', () => {
    confirm({ header: 'Delete item?', message: "This can't be undone." });
    const container = getOverlayContainerElement();

    expect(container.querySelector('h2')?.textContent).toBe('Delete item?');
    expect(container.textContent).toContain("This can't be undone.");
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

  it('resolves closed$ with true on accept', (done) => {
    const ref = confirm({ message: 'Proceed?' });
    ref.closed$.subscribe((result) => {
      expect(result).toBe(true);
      done();
    });
    acceptButton().click();
  });

  it('resolves closed$ with false on reject', (done) => {
    const ref = confirm({ message: 'Proceed?' });
    ref.closed$.subscribe((result) => {
      expect(result).toBe(false);
      done();
    });
    rejectButton().click();
  });

  it('resolves closed$ with undefined when dismissed via Escape', (done) => {
    const ref = confirm({ header: 'Title', message: 'Proceed?' });
    ref.closed$.subscribe((result) => {
      expect(result).toBeUndefined();
      done();
    });
    const shell = getOverlayContainerElement().querySelector('med-dialog-shell') as HTMLElement;
    shell.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  });

  it('defaults the accept button to danger severity when severity is danger', () => {
    confirm({ message: 'Delete forever?', severity: 'danger' });
    const button = acceptButton();
    expect(button.className).toContain('bg-danger-500');
  });

  it('defaults the accept button to primary severity for other severities', () => {
    confirm({ message: 'Proceed?', severity: 'warn' });
    const button = acceptButton();
    expect(button.className).toContain('bg-brand-500');
  });

  it('lets acceptSeverity override the severity-derived default', () => {
    confirm({ message: 'Proceed?', severity: 'danger', acceptSeverity: 'success' });
    const button = acceptButton();
    expect(button.className).toContain('bg-success-500');
  });

  it('shows the severity icon (warn by default has no severity override, defaults to info)', () => {
    confirm({ message: 'Proceed?' });
    const container = getOverlayContainerElement();
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('focuses the reject button on open (dismissal is the safe default, consistent with ConfirmPopup)', () => {
    confirm({ message: 'Proceed?' });
    expect(document.activeElement).toBe(rejectButton());
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

    it('defaultFocus: "accept" focuses the accept button instead of the default reject', () => {
      confirm({ message: 'Proceed?', defaultFocus: 'accept' });
      expect(document.activeElement).toBe(acceptButton());
    });

    it('defaultFocus: "none" focuses neither button', () => {
      confirm({ message: 'Proceed?', defaultFocus: 'none' });
      expect(document.activeElement).not.toBe(acceptButton());
      expect(document.activeElement).not.toBe(rejectButton());
    });

    it('defaultFocus: "close" focuses the header close button, which lives in the shell, not this content component', () => {
      confirm({ header: 'Title', message: 'Proceed?', defaultFocus: 'close' });
      const closeButton = getOverlayContainerElement().querySelector('[data-dialog-close]');
      expect(document.activeElement).toBe(closeButton);
    });

    it('falls back to whichever button is actually visible when the requested one is hidden', () => {
      confirm({ message: 'Proceed?', defaultFocus: 'reject', rejectVisible: false });
      expect(document.activeElement).toBe(acceptButton());
    });
  });

  describe('position / draggable passthrough', () => {
    function wrapperStyle(): CSSStyleDeclaration {
      return (document.querySelector('.cdk-global-overlay-wrapper') as HTMLElement).style;
    }

    function shell(): HTMLElement {
      return getOverlayContainerElement().querySelector('med-dialog-shell') as HTMLElement;
    }

    function header(): HTMLElement {
      return shell().querySelector('h2')!.parentElement as HTMLElement;
    }

    function pointer(type: string, clientX: number, clientY: number, pointerId = 1): PointerEvent {
      return Object.assign(new Event(type, { bubbles: true, cancelable: true }), { clientX, clientY, pointerId }) as PointerEvent;
    }

    it('position forwards straight through to DialogService.open()', () => {
      confirm({ message: 'Proceed?', position: 'bottom-left' });
      expect(wrapperStyle().justifyContent).toBe('flex-start');
      expect(wrapperStyle().alignItems).toBe('flex-end');
    });

    it('draggable forwards straight through, moving the shell via the header', () => {
      confirm({ header: 'Title', message: 'Proceed?', draggable: true });
      header().dispatchEvent(pointer('pointerdown', 100, 100));
      header().dispatchEvent(pointer('pointermove', 150, 130));
      appRef.tick();
      expect(shell().style.transform).toBe('translate(50px, 30px)');
    });
  });

  describe('messageTemplate / headlessTemplate', () => {
    @Component({
      standalone: true,
      template: `
        <ng-template #messageTpl let-data>
          <p class="custom-message">Custom: {{ data.message }}</p>
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
      @ViewChild('messageTpl') messageTpl!: TemplateRef<any>;
      @ViewChild('headlessTpl') headlessTpl!: TemplateRef<any>;
    }

    function createTemplateHost() {
      const fixture = TestBed.createComponent(TemplateHostComponent);
      fixture.detectChanges();
      return fixture;
    }

    it('renders messageTemplate instead of the plain message, keeping the icon and the default buttons', () => {
      const fixture = createTemplateHost();
      confirm({ message: 'Proceed?', messageTemplate: fixture.componentInstance.messageTpl });
      const container = getOverlayContainerElement();

      expect(container.querySelector('.custom-message')?.textContent).toBe('Custom: Proceed?');
      expect(container.querySelector('med-confirm-dialog-content med-icon')).not.toBeNull();
      expect(acceptButton()).toBeDefined();
      expect(rejectButton()).toBeDefined();
    });

    it('renders headlessTemplate instead of everything, including the default icon and buttons', () => {
      const fixture = createTemplateHost();
      confirm({ message: 'Proceed?', headlessTemplate: fixture.componentInstance.headlessTpl });
      // Scoped to the content component itself, not the whole overlay — the
      // dialog shell's own floating close button (unrelated to this
      // content) also renders an <svg>, see dialog-shell.component.ts.
      const content = getOverlayContainerElement().querySelector('med-confirm-dialog-content') as HTMLElement;

      expect(content.querySelector('.custom-headless')).not.toBeNull();
      expect(content.querySelector('med-icon')).toBeNull();
      expect(acceptButton()).toBeUndefined();
      expect(rejectButton()).toBeUndefined();
    });

    it('headlessTemplate ignores messageTemplate when both are set', () => {
      const fixture = createTemplateHost();
      confirm({
        message: 'Proceed?',
        messageTemplate: fixture.componentInstance.messageTpl,
        headlessTemplate: fixture.componentInstance.headlessTpl,
      });
      const container = getOverlayContainerElement();

      expect(container.querySelector('.custom-headless')).not.toBeNull();
      expect(container.querySelector('.custom-message')).toBeNull();
    });

    it('headlessTemplate onAccept resolves closed$ with true, same as the default accept button', (done) => {
      const fixture = createTemplateHost();
      const ref = confirm({ message: 'Proceed?', headlessTemplate: fixture.componentInstance.headlessTpl });
      ref.closed$.subscribe((result) => {
        expect(result).toBe(true);
        done();
      });
      (getOverlayContainerElement().querySelector('.custom-accept') as HTMLButtonElement).click();
    });

    it('headlessTemplate onReject resolves closed$ with false, same as the default reject button', (done) => {
      const fixture = createTemplateHost();
      const ref = confirm({ message: 'Proceed?', headlessTemplate: fixture.componentInstance.headlessTpl });
      ref.closed$.subscribe((result) => {
        expect(result).toBe(false);
        done();
      });
      (getOverlayContainerElement().querySelector('.custom-reject') as HTMLButtonElement).click();
    });
  });
});
