import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { DrawerComponent } from './drawer.component';
import { DrawerPosition, ENTER_TRANSFORM_CLASS, EXIT_TRANSFORM_CLASS, drawerPanelVariants } from './drawer.styles';

// Matches EXIT_TRANSITION_MS in drawer.component.ts — the delay OverlayService's
// beforeClose hook awaits before actually disposing the overlay.
const EXIT_TRANSITION_MS = 200;
// Matches the double requestAnimationFrame drawer.component.ts uses to trigger
// its slide-in transition one frame after attaching.
const ENTER_FRAME_MS = 32;

@Component({
  standalone: true,
  imports: [DrawerComponent],
  template: `
    <button type="button" (click)="open = true">Open</button>
    <med-drawer
      [(visible)]="open"
      [position]="position"
      [modal]="modal"
      [header]="header"
      [closable]="closable"
      [fullScreen]="fullScreen"
      [closeOnEscape]="closeOnEscape"
      [blockScroll]="blockScroll"
    >
      <p>Drawer content</p>
    </med-drawer>
  `,
})
class HostComponent {
  open = false;
  position: DrawerPosition = 'left';
  modal = true;
  header: string | null = null;
  closable = true;
  fullScreen = false;
  closeOnEscape = true;
  blockScroll = false;
}

function panel(): HTMLElement | null {
  return document.querySelector('[role="dialog"]');
}

// Opening always goes through a real dispatched click (never a raw `open = true`
// field write): `visible` is a `model()`, and Angular's two-way-binding runtime
// compares its value across the check/checkNoChanges passes of a *single*
// `detectChanges()` call — writing the bound host field directly from test code
// between two separate `detectChanges()` calls reproduces NG0100
// (ExpressionChangedAfterItHasBeenCheckedError) for *any* model()-bound field,
// with or without a Drawer involved (verified in isolation). A dispatched click,
// like every other model()-bound component's own spec in this library (see
// PanelComponent's `[(collapsed)]` test), doesn't hit this because the write
// happens inside real event handling, not a bare test-code assignment.
function openDrawer(fixture: { nativeElement: HTMLElement; detectChanges(): void }): void {
  fixture.nativeElement.querySelector<HTMLButtonElement>('button')!.click();
  fixture.detectChanges();
}

async function flush(fixture: { detectChanges(): void }, ms = EXIT_TRANSITION_MS): Promise<void> {
  jest.advanceTimersByTime(ms);
  await Promise.resolve();
  fixture.detectChanges();
}

describe('drawerPanelVariants', () => {
  it('bakes the closed (exit) transform into each position, matching EXIT_TRANSFORM_CLASS', () => {
    expect(drawerPanelVariants({ position: 'left' })).toContain(EXIT_TRANSFORM_CLASS.left);
    expect(drawerPanelVariants({ position: 'right' })).toContain(EXIT_TRANSFORM_CLASS.right);
    expect(drawerPanelVariants({ position: 'right' })).not.toContain('-translate-x-full');
    expect(drawerPanelVariants({ position: 'top' })).toContain(EXIT_TRANSFORM_CLASS.top);
    expect(drawerPanelVariants({ position: 'bottom' })).toContain(EXIT_TRANSFORM_CLASS.bottom);
    expect(drawerPanelVariants({ position: 'bottom' })).not.toContain('-translate-y-full');
  });
});

describe('ENTER_TRANSFORM_CLASS / EXIT_TRANSFORM_CLASS', () => {
  it('never share the same class for a given position (always something to transition)', () => {
    (['left', 'right', 'top', 'bottom'] as const).forEach((position) => {
      expect(ENTER_TRANSFORM_CLASS[position]).not.toBe(EXIT_TRANSFORM_CLASS[position]);
    });
  });
});

describe('DrawerComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
    jest.useFakeTimers();
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
    jest.useRealTimers();
  });

  function create(configure?: (host: HostComponent) => void) {
    const fixture = TestBed.createComponent(HostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  it('is closed initially, marks <med-drawer> itself as hidden, and never projects its content', () => {
    const fixture = create();
    expect(panel()).toBeNull();
    expect(fixture.nativeElement.querySelector('med-drawer')!.className).toContain('hidden');
    expect(document.body.textContent).not.toContain('Drawer content');
  });

  it('opening projects the content into the overlay', () => {
    const fixture = create();
    openDrawer(fixture);

    expect(panel()).not.toBeNull();
    expect(panel()!.textContent).toContain('Drawer content');
  });

  it('starts translated off-screen, then applies the entered transform one frame later', async () => {
    const fixture = create();
    openDrawer(fixture);

    expect(panel()!.className).toContain('-translate-x-full');

    await flush(fixture, ENTER_FRAME_MS);

    expect(panel()!.className).toContain('translate-x-0');
  });

  it('closing holds the panel in the DOM during the exit transition, then removes it', async () => {
    const fixture = create();
    openDrawer(fixture);
    await flush(fixture, ENTER_FRAME_MS);

    panel()!.querySelector<HTMLButtonElement>('button[aria-label="Close"]')!.click();
    fixture.detectChanges();

    expect(panel()).not.toBeNull();
    expect(panel()!.className).toContain('-translate-x-full');

    await flush(fixture);

    expect(panel()).toBeNull();
  });

  it('closing via the header close button syncs `visible` back to false (two-way binding)', async () => {
    const fixture = create((host) => (host.header = 'Filters'));
    openDrawer(fixture);

    panel()!.querySelector<HTMLButtonElement>('button[aria-label="Close"]')!.click();
    fixture.detectChanges();
    await flush(fixture);

    expect(fixture.componentInstance.open).toBe(false);
    expect(panel()).toBeNull();
  });

  it('closes on Escape', async () => {
    const fixture = create();
    openDrawer(fixture);

    panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    await flush(fixture);

    expect(panel()).toBeNull();
    expect(fixture.componentInstance.open).toBe(false);
  });

  it('modal (default) has a backdrop, and clicking it closes the drawer', async () => {
    const fixture = create();
    openDrawer(fixture);

    const backdrop = document.querySelector<HTMLElement>('.cdk-overlay-backdrop');
    expect(backdrop).not.toBeNull();

    backdrop!.click();
    fixture.detectChanges();
    await flush(fixture);

    expect(panel()).toBeNull();
  });

  it('modal=false has no backdrop', () => {
    const fixture = create((host) => (host.modal = false));
    openDrawer(fixture);

    expect(document.querySelector('.cdk-overlay-backdrop')).toBeNull();
    expect(panel()).not.toBeNull();
  });

  it('renders the header and links it via aria-labelledby when set', () => {
    const fixture = create((host) => (host.header = 'Filters'));
    openDrawer(fixture);

    const heading = panel()!.querySelector('h2')!;
    expect(heading.textContent).toContain('Filters');
    expect(panel()!.getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('omits aria-labelledby and the header row entirely without a header (not closable either)', () => {
    const fixture = create((host) => (host.closable = false));
    openDrawer(fixture);

    expect(panel()!.querySelector('h2')).toBeNull();
    expect(panel()!.getAttribute('aria-labelledby')).toBeNull();
  });

  it('omits the close button when closable is false', () => {
    const fixture = create((host) => {
      host.closable = false;
      host.header = 'Filters';
    });
    openDrawer(fixture);

    expect(panel()!.querySelector('button[aria-label="Close"]')).toBeNull();
  });

  it('destroying the host while open still disposes the overlay after the exit transition', async () => {
    const fixture = create();
    openDrawer(fixture);
    expect(panel()).not.toBeNull();

    fixture.destroy();

    jest.advanceTimersByTime(EXIT_TRANSITION_MS);
    await Promise.resolve();

    expect(panel()).toBeNull();
  });

  describe('fullScreen', () => {
    it('covers the viewport (opacity transition classes) regardless of position, not a directional slide', () => {
      const fixture = create((host) => {
        host.fullScreen = true;
        host.position = 'left';
      });
      openDrawer(fixture);

      expect(panel()!.className).toContain('w-screen');
      expect(panel()!.className).toContain('h-screen');
      expect(panel()!.className).toContain('opacity-0');
      expect(panel()!.className).not.toContain('-translate-x-full');
    });

    it('fades in one frame after attaching, same timing as the directional slide', async () => {
      const fixture = create((host) => (host.fullScreen = true));
      openDrawer(fixture);

      expect(panel()!.className).toContain('opacity-0');
      await flush(fixture, ENTER_FRAME_MS);
      expect(panel()!.className).toContain('opacity-100');
    });

    it('fades out during the exit transition, same as a normal drawer holds its slide-out', async () => {
      const fixture = create((host) => (host.fullScreen = true));
      openDrawer(fixture);
      await flush(fixture, ENTER_FRAME_MS);

      panel()!.querySelector<HTMLButtonElement>('button[aria-label="Close"]')!.click();
      fixture.detectChanges();

      expect(panel()).not.toBeNull();
      expect(panel()!.className).toContain('opacity-0');

      await flush(fixture);
      expect(panel()).toBeNull();
    });
  });

  describe('closeOnEscape', () => {
    it('defaults to true (unchanged) — Escape closes it', async () => {
      const fixture = create();
      openDrawer(fixture);

      panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
      fixture.detectChanges();
      await flush(fixture);

      expect(panel()).toBeNull();
    });

    it('false keeps the drawer open on Escape', () => {
      const fixture = create((host) => (host.closeOnEscape = false));
      openDrawer(fixture);

      panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
      fixture.detectChanges();

      expect(panel()).not.toBeNull();
    });
  });

  describe('blockScroll', () => {
    afterEach(() => {
      document.body.style.overflow = '';
    });

    it('defaults to false — does not touch body overflow', () => {
      const fixture = create();
      openDrawer(fixture);
      expect(document.body.style.overflow).toBe('');
    });

    it('true blocks body scroll while open, restoring it on close', async () => {
      const fixture = create((host) => (host.blockScroll = true));
      openDrawer(fixture);
      expect(document.body.style.overflow).toBe('hidden');

      panel()!.querySelector<HTMLButtonElement>('button[aria-label="Close"]')!.click();
      fixture.detectChanges();
      await flush(fixture);

      expect(document.body.style.overflow).toBe('');
    });

    it('restores whatever overflow value was already set, not just blank', async () => {
      document.body.style.overflow = 'scroll';
      const fixture = create((host) => (host.blockScroll = true));
      openDrawer(fixture);
      expect(document.body.style.overflow).toBe('hidden');

      panel()!.querySelector<HTMLButtonElement>('button[aria-label="Close"]')!.click();
      fixture.detectChanges();
      await flush(fixture);

      expect(document.body.style.overflow).toBe('scroll');
    });

    it('works independently of modal — a non-modal drawer can still block scroll', () => {
      const fixture = create((host) => {
        host.modal = false;
        host.blockScroll = true;
      });
      openDrawer(fixture);

      expect(document.querySelector('.cdk-overlay-backdrop')).toBeNull(); // still non-modal
      expect(document.body.style.overflow).toBe('hidden'); // but scroll is still blocked
    });
  });
});

describe('DrawerComponent #header/#footer/#headless', () => {
  @Component({
    standalone: true,
    imports: [DrawerComponent],
    template: `
      <button type="button" (click)="open = true">Open</button>
      <med-drawer [(visible)]="open" header="Filters">
        @if (!useHeadless) {
          <ng-template #header>
            <span class="header-marker">Icon</span>
          </ng-template>
          <ng-template #footer>
            <span class="footer-marker">Footer actions</span>
          </ng-template>
        }
        @if (useHeadless) {
          <ng-template #headless>
            <span class="headless-marker">Fully custom</span>
          </ng-template>
        }
        <p>Drawer content</p>
      </med-drawer>
    `,
  })
  class TemplatesHostComponent {
    open = false;
    useHeadless = false;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
  });

  function create(configure?: (host: TemplatesHostComponent) => void) {
    const fixture = TestBed.createComponent(TemplatesHostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  it('renders #header alongside the plain-string header, and #footer below the content', () => {
    const fixture = create();
    openDrawer(fixture);

    expect(panel()!.querySelector('.header-marker')).not.toBeNull();
    expect(panel()!.textContent).toContain('Filters'); // plain header() string still renders too
    expect(panel()!.querySelector('.footer-marker')?.textContent).toBe('Footer actions');
    expect(panel()!.textContent).toContain('Drawer content');
  });

  it('omits the footer row entirely when no #footer template is projected', () => {
    @Component({
      standalone: true,
      imports: [DrawerComponent],
      template: `
        <button type="button" (click)="open = true">Open</button>
        <med-drawer [(visible)]="open" header="Filters">
          <p>Drawer content</p>
        </med-drawer>
      `,
    })
    class NoFooterHostComponent {
      open = false;
    }

    const fixture = TestBed.createComponent(NoFooterHostComponent);
    fixture.detectChanges();
    openDrawer(fixture);

    expect(panel()!.querySelector('.footer-marker')).toBeNull();
  });

  it('#headless replaces the header row, body, and footer entirely', () => {
    const fixture = create((host) => (host.useHeadless = true));
    openDrawer(fixture);

    expect(panel()!.querySelector('.headless-marker')?.textContent).toBe('Fully custom');
    expect(panel()!.textContent).not.toContain('Filters');
    expect(panel()!.textContent).not.toContain('Drawer content');
    expect(panel()!.querySelector('button[aria-label="Close"]')).toBeNull();
  });

  it('[UI-009.S2] emits shown and hidden lifecycle events', async () => {
    jest.useFakeTimers();
    try {
      @Component({
        standalone: true,
        imports: [DrawerComponent],
        template: `
          <button type="button" (click)="visible = !visible">Toggle</button>
          <med-drawer [(visible)]="visible" (shown)="shownCount = shownCount + 1" (hidden)="hiddenCount = hiddenCount + 1">
            <p>Body</p>
          </med-drawer>
        `,
      })
      class LifecycleHost {
        visible = false;
        shownCount = 0;
        hiddenCount = 0;
      }

      const fixture = TestBed.createComponent(LifecycleHost);
      fixture.detectChanges();

      openDrawer(fixture);
      expect(fixture.componentInstance.shownCount).toBe(1);

      openDrawer(fixture);
      await flush(fixture);
      expect(fixture.componentInstance.hiddenCount).toBe(1);
    } finally {
      jest.useRealTimers();
    }
  });
});
