import { ApplicationRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { ToastService } from './toast.service';

function getContainer(): HTMLElement {
  return document.querySelector('med-toast-container') as HTMLElement;
}

function wrapperStyle(): CSSStyleDeclaration {
  return (document.querySelector('.cdk-global-overlay-wrapper') as HTMLElement).style;
}

describe('ToastService', () => {
  let service: ToastService;
  let appRef: ApplicationRef;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
    service = TestBed.inject(ToastService);
    appRef = TestBed.inject(ApplicationRef);
  });

  afterEach(() => {
    jest.useRealTimers();
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function show(...args: Parameters<ToastService['show']>) {
    const id = service.show(...args);
    appRef.tick();
    return id;
  }

  it('creates the container lazily on the first show() call', () => {
    expect(getContainer()).toBeNull();

    show({ detail: 'Saved' });

    expect(getContainer()).not.toBeNull();
    expect(getContainer().textContent).toContain('Saved');
  });

  it('stacks multiple messages', () => {
    show({ detail: 'First' });
    show({ detail: 'Second' });

    const container = getContainer();
    expect(container.textContent).toContain('First');
    expect(container.textContent).toContain('Second');
    expect(container.querySelectorAll('med-message').length).toBe(2);
  });

  it('has no backdrop and is not modal (a page click elsewhere must not dismiss it)', () => {
    show({ detail: 'Saved' });

    expect(document.querySelector('.cdk-overlay-backdrop')).toBeNull();

    document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    appRef.tick();

    expect(getContainer().querySelectorAll('med-message').length).toBe(1);
  });

  it('does not close on Escape (only individual messages dismiss)', () => {
    show({ detail: 'Saved' });

    getContainer().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    appRef.tick();

    expect(getContainer()).not.toBeNull();
    expect(getContainer().querySelectorAll('med-message').length).toBe(1);
  });

  it('auto-dismisses after the given life', () => {
    jest.useFakeTimers();
    show({ detail: 'Saved', life: 1000 });
    expect(getContainer().querySelectorAll('med-message').length).toBe(1);

    jest.advanceTimersByTime(1000);
    appRef.tick();

    expect(getContainer().querySelectorAll('med-message').length).toBe(0);
  });

  it('life: 0 means sticky (never auto-dismisses)', () => {
    jest.useFakeTimers();
    show({ detail: 'Saved', life: 0 });

    jest.advanceTimersByTime(60_000);
    appRef.tick();

    expect(getContainer().querySelectorAll('med-message').length).toBe(1);
  });

  it('dismiss(id) removes a specific message manually', () => {
    const firstId = show({ detail: 'First' });
    show({ detail: 'Second' });

    service.dismiss(firstId);
    appRef.tick();

    const container = getContainer();
    expect(container.textContent).not.toContain('First');
    expect(container.textContent).toContain('Second');
  });

  it('clicking a message close button removes only that message', () => {
    show({ detail: 'First' });
    show({ detail: 'Second' });

    const closeButtons = getContainer().querySelectorAll('[aria-label="Close"]');
    (closeButtons[0] as HTMLButtonElement).click();
    appRef.tick();

    const container = getContainer();
    expect(container.textContent).not.toContain('First');
    expect(container.textContent).toContain('Second');
  });

  it.each([
    ['success', 'success' as const, 'Saved!'],
    ['error', 'danger' as const, 'Failed!'],
    ['warn', 'warn' as const, 'Careful!'],
    ['info', 'info' as const, 'FYI'],
  ])('%s() shows a toast with the right severity and detail', (method, severityClassToken, text) => {
    (service as unknown as Record<string, (detail: string) => number>)[method](text);
    appRef.tick();

    const container = getContainer();
    expect(container.textContent).toContain(text);
    expect(container.querySelector(`med-message > div.bg-${severityClassToken}-50`)).not.toBeNull();
  });

  it('uses a custom closeLabel', () => {
    show({ detail: 'Saved', closeLabel: 'Fechar' });
    expect(getContainer().querySelector('[aria-label="Fechar"]')).not.toBeNull();
  });

  it('hides the close button when closable is false', () => {
    show({ detail: 'Saved', closable: false });
    expect(getContainer().querySelector('[aria-label]')).toBeNull();
  });

  it('the container is a role="region" aria-live="polite" landmark', () => {
    show({ detail: 'Saved' });
    const container = getContainer();
    expect(container.getAttribute('role')).toBe('region');
    expect(container.getAttribute('aria-live')).toBe('polite');
  });

  it('an info/success toast stays role="status" aria-live="polite" on its own message', () => {
    show({ detail: 'Saved', severity: 'info' });
    const message = getContainer().querySelector('med-message') as HTMLElement;
    expect(message.getAttribute('role')).toBe('status');
    expect(message.getAttribute('aria-live')).toBe('polite');
  });

  it('error() escalates the per-toast message to role="alert" aria-live="assertive"', () => {
    service.error('Failed!');
    appRef.tick();
    const message = getContainer().querySelector('med-message') as HTMLElement;
    expect(message.getAttribute('role')).toBe('alert');
    expect(message.getAttribute('aria-live')).toBe('assertive');
  });

  describe('position', () => {
    it('defaults to top-right', () => {
      show({ detail: 'Saved' });
      expect(wrapperStyle().justifyContent).toBe('flex-end');
      expect(wrapperStyle().alignItems).toBe('flex-start');
    });

    it('the first call picks the stack position', () => {
      show({ detail: 'Saved', position: 'bottom-left' });
      expect(wrapperStyle().justifyContent).toBe('flex-start');
      expect(wrapperStyle().alignItems).toBe('flex-end');
    });

    it('a later call with a different position moves the existing stack, without opening a second one', () => {
      show({ detail: 'First' });
      show({ detail: 'Second', position: 'bottom-left' });

      expect(document.querySelectorAll('med-toast-container').length).toBe(1);
      expect(wrapperStyle().justifyContent).toBe('flex-start');
      expect(wrapperStyle().alignItems).toBe('flex-end');
      // both messages survived the reposition — it's a move, not a recreate
      expect(getContainer().textContent).toContain('First');
      expect(getContainer().textContent).toContain('Second');
    });

    it('a later call with the same position is a no-op (no unnecessary reposition)', () => {
      show({ detail: 'First' });
      const styleBefore = wrapperStyle().cssText;
      show({ detail: 'Second', position: 'top-right' });
      expect(wrapperStyle().cssText).toBe(styleBefore);
    });
  });

  describe('messageTemplate / headlessTemplate', () => {
    @Component({
      standalone: true,
      template: `
        <ng-template #messageTpl let-message>
          <p class="custom-message">Custom: {{ message.detail }}</p>
        </ng-template>
        <ng-template #headlessTpl let-message let-onClose="onClose">
          <div class="custom-headless">
            <p>{{ message.detail }}</p>
            <button type="button" class="custom-close" (click)="onClose()">Dismiss</button>
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

    it('renders messageTemplate instead of the plain summary/detail, keeping the med-message chrome and close button', () => {
      const fixture = createTemplateHost();
      show({ detail: 'Saved', messageTemplate: fixture.componentInstance.messageTpl });
      const container = getContainer();

      expect(container.querySelector('.custom-message')?.textContent).toBe('Custom: Saved');
      expect(container.querySelector('med-message')).not.toBeNull();
      expect(container.querySelector('[aria-label="Close"]')).not.toBeNull();
    });

    it('renders headlessTemplate instead of everything, including med-message itself', () => {
      const fixture = createTemplateHost();
      show({ detail: 'Saved', headlessTemplate: fixture.componentInstance.headlessTpl });
      const container = getContainer();

      expect(container.querySelector('.custom-headless')).not.toBeNull();
      expect(container.querySelector('med-message')).toBeNull();
    });

    it('headlessTemplate onClose dismisses just that message', () => {
      const fixture = createTemplateHost();
      show({ detail: 'First', headlessTemplate: fixture.componentInstance.headlessTpl });
      show({ detail: 'Second' });

      (getContainer().querySelector('.custom-close') as HTMLButtonElement).click();
      appRef.tick();

      const container = getContainer();
      expect(container.querySelector('.custom-headless')).toBeNull();
      expect(container.textContent).toContain('Second');
    });
  });
});
