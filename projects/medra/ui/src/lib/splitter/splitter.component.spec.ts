import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SplitterGutterComponent } from './splitter-gutter.component';
import { SplitterPanelComponent } from './splitter-panel.component';
import { SplitterComponent } from './splitter.component';
import { SplitterOrientation } from './splitter.types';

@Component({
  standalone: true,
  imports: [SplitterComponent, SplitterPanelComponent, SplitterGutterComponent],
  template: `
    <med-splitter class="h-64 w-[200px]" [orientation]="orientation" [(sizes)]="sizes">
      <med-splitter-panel [minSize]="minSizeA" [maxSize]="maxSizeA" [collapsible]="collapsibleA">A</med-splitter-panel>
      <med-splitter-gutter [disabled]="gutterDisabled" />
      <med-splitter-panel [minSize]="minSizeB" [maxSize]="maxSizeB" [collapsible]="collapsibleB">B</med-splitter-panel>
    </med-splitter>
  `,
})
class HostComponent {
  orientation: SplitterOrientation = 'horizontal';
  sizes: readonly number[] | null = null;
  minSizeA = 5;
  minSizeB = 5;
  maxSizeA = 100;
  maxSizeB = 100;
  collapsibleA = false;
  collapsibleB = false;
  gutterDisabled = false;
}

@Component({
  standalone: true,
  imports: [SplitterComponent, SplitterPanelComponent, SplitterGutterComponent],
  template: `
    <med-splitter class="h-64 w-[200px]" [(sizes)]="sizes">
      <med-splitter-panel>A</med-splitter-panel>
      <med-splitter-gutter disabled />
      <med-splitter-panel>B</med-splitter-panel>
    </med-splitter>
  `,
})
class DisabledGutterHostComponent {
  sizes: readonly number[] | null = null;
}

function create(configure?: (host: HostComponent) => void): ComponentFixture<HostComponent> {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

function panels(fixture: { nativeElement: HTMLElement }): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('med-splitter-panel'));
}

function gutter(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('[role="separator"]') as HTMLElement;
}

function splitterHost(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('med-splitter') as HTMLElement;
}

/** jsdom's layout engine always reports a 0-size rect — stub a real one so pointer-position math has something to work with. */
function stubHostRect(fixture: { nativeElement: HTMLElement }, width = 200, height = 200): void {
  jest.spyOn(splitterHost(fixture), 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    width,
    height,
    right: width,
    bottom: height,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
}

/** jsdom has no PointerEvent constructor — same plain-Event-cast pattern already used by Slider's spec. */
function pointer(type: string, clientX: number, clientY: number, pointerId = 1): PointerEvent {
  return Object.assign(new Event(type, { bubbles: true, cancelable: true }), { clientX, clientY, pointerId }) as PointerEvent;
}

function keydown(el: HTMLElement, key: string) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

function dblclick(el: HTMLElement) {
  el.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
}

describe('SplitterComponent', () => {
  it('splits panels equally by default', () => {
    const fixture = create();
    const [a, b] = panels(fixture);
    expect(a.style.flex).toBe('0 0 50%');
    expect(b.style.flex).toBe('0 0 50%');
  });

  it('honors an explicit initial split via sizes', () => {
    const fixture = create((host) => (host.sizes = [30, 70]));
    const [a, b] = panels(fixture);
    expect(a.style.flex).toBe('0 0 30%');
    expect(b.style.flex).toBe('0 0 70%');
  });

  it('falls back to an equal split when sizes length does not match the panel count', () => {
    const fixture = create((host) => (host.sizes = [10, 20, 70]));
    const [a, b] = panels(fixture);
    expect(a.style.flex).toBe('0 0 50%');
    expect(b.style.flex).toBe('0 0 50%');
  });

  it('the gutter reports role=separator with aria-orientation and aria-valuenow matching the panel before it', () => {
    const fixture = create((host) => (host.sizes = [30, 70]));
    const g = gutter(fixture);
    expect(g.getAttribute('role')).toBe('separator');
    expect(g.getAttribute('aria-orientation')).toBe('horizontal');
    expect(g.getAttribute('aria-valuenow')).toBe('30');
  });

  it('dragging the gutter resizes both neighboring panels and updates the sizes model', () => {
    const fixture = create();
    stubHostRect(fixture, 200, 200);
    const g = gutter(fixture);

    g.dispatchEvent(pointer('pointerdown', 100, 0));
    g.dispatchEvent(pointer('pointermove', 120, 0)); // +20px of 200px -> +10%
    fixture.detectChanges();

    expect(fixture.componentInstance.sizes).toEqual([60, 40]);
    const [a, b] = panels(fixture);
    expect(a.style.flex).toBe('0 0 60%');
    expect(b.style.flex).toBe('0 0 40%');
  });

  it('clamps a drag so neither panel goes below its minSize', () => {
    const fixture = create((host) => {
      host.sizes = [10, 90];
      host.minSizeA = 5;
    });
    stubHostRect(fixture, 200, 200);
    const g = gutter(fixture);

    g.dispatchEvent(pointer('pointerdown', 100, 0));
    g.dispatchEvent(pointer('pointermove', 0, 0)); // -100px of 200px -> -50%, would push A to -40%
    fixture.detectChanges();

    expect(fixture.componentInstance.sizes).toEqual([5, 95]);
  });

  it('pointerup ends the drag — further pointermove has no effect', () => {
    const fixture = create();
    stubHostRect(fixture, 200, 200);
    const g = gutter(fixture);

    g.dispatchEvent(pointer('pointerdown', 100, 0));
    g.dispatchEvent(pointer('pointerup', 120, 0));
    g.dispatchEvent(pointer('pointermove', 150, 0));
    fixture.detectChanges();

    expect(fixture.componentInstance.sizes).toBeNull();
  });

  it('ArrowRight/ArrowLeft step-resize the horizontal split by 1%', () => {
    const fixture = create((host) => (host.sizes = [50, 50]));
    const g = gutter(fixture);

    keydown(g, 'ArrowRight');
    fixture.detectChanges();
    expect(fixture.componentInstance.sizes).toEqual([51, 49]);

    keydown(g, 'ArrowLeft');
    keydown(g, 'ArrowLeft');
    fixture.detectChanges();
    expect(fixture.componentInstance.sizes).toEqual([49, 51]);
  });

  it('vertical orientation uses ArrowUp/ArrowDown and reports aria-orientation="vertical"', () => {
    const fixture = create((host) => {
      host.orientation = 'vertical';
      host.sizes = [50, 50];
    });
    const g = gutter(fixture);
    expect(g.getAttribute('aria-orientation')).toBe('vertical');

    keydown(g, 'ArrowDown');
    fixture.detectChanges();
    expect(fixture.componentInstance.sizes).toEqual([51, 49]);

    keydown(g, 'ArrowRight'); // wrong axis for vertical mode — no-op
    fixture.detectChanges();
    expect(fixture.componentInstance.sizes).toEqual([51, 49]);
  });

  it('a disabled gutter is not focusable and ignores pointer/keyboard input', () => {
    const fixture = TestBed.createComponent(DisabledGutterHostComponent);
    fixture.detectChanges();
    const g = gutter(fixture);
    expect(g.getAttribute('tabindex')).toBe('-1');

    keydown(g, 'ArrowRight');
    fixture.detectChanges();
    expect(fixture.componentInstance.sizes).toBeNull();
  });

  describe('maxSize', () => {
    it('clamps a drag so neither panel goes above its maxSize', () => {
      const fixture = create((host) => {
        host.sizes = [50, 50];
        host.maxSizeA = 60;
      });
      stubHostRect(fixture, 200, 200);
      const g = gutter(fixture);

      g.dispatchEvent(pointer('pointerdown', 100, 0));
      g.dispatchEvent(pointer('pointermove', 200, 0)); // +100px of 200px -> +50%, would push A to 100%
      fixture.detectChanges();

      expect(fixture.componentInstance.sizes).toEqual([60, 40]);
    });

    it('ArrowRight/ArrowLeft step-resize also respects maxSize', () => {
      const fixture = create((host) => {
        host.sizes = [59, 41];
        host.maxSizeA = 60;
      });
      const g = gutter(fixture);

      keydown(g, 'ArrowRight');
      keydown(g, 'ArrowRight');
      fixture.detectChanges();

      expect(fixture.componentInstance.sizes).toEqual([60, 40]);
    });
  });

  describe('collapsible — see class doc)', () => {
    it('double-clicking the gutter collapses a collapsible "before" panel to 0%, giving its space to the neighbor', () => {
      const fixture = create((host) => {
        host.sizes = [30, 70];
        host.collapsibleA = true;
      });
      dblclick(gutter(fixture));
      fixture.detectChanges();

      expect(fixture.componentInstance.sizes).toEqual([0, 100]);
    });

    it('double-clicking again restores the panel to its pre-collapse size', () => {
      const fixture = create((host) => {
        host.sizes = [30, 70];
        host.collapsibleA = true;
      });
      const g = gutter(fixture);
      dblclick(g);
      fixture.detectChanges();
      dblclick(g);
      fixture.detectChanges();

      expect(fixture.componentInstance.sizes).toEqual([30, 70]);
    });

    it('collapses the "after" panel instead when only it is collapsible', () => {
      const fixture = create((host) => {
        host.sizes = [30, 70];
        host.collapsibleB = true;
      });
      dblclick(gutter(fixture));
      fixture.detectChanges();

      expect(fixture.componentInstance.sizes).toEqual([100, 0]);
    });

    it('does nothing when neither adjacent panel is collapsible', () => {
      const fixture = create((host) => (host.sizes = [30, 70]));
      dblclick(gutter(fixture));
      fixture.detectChanges();

      expect(fixture.componentInstance.sizes).toEqual([30, 70]);
    });

    it('a disabled gutter ignores double-click even on a collapsible panel', () => {
      const fixture = create((host) => {
        host.sizes = [30, 70];
        host.collapsibleA = true;
        host.gutterDisabled = true;
      });
      dblclick(gutter(fixture));
      fixture.detectChanges();

      expect(fixture.componentInstance.sizes).toEqual([30, 70]);
    });
  });

  // @scenario UI-006.S2
  describe('stateKey, stateStorage, resizeStart and resizeEnd (Wave 2)', () => {
    @Component({
      standalone: true,
      imports: [SplitterComponent, SplitterPanelComponent, SplitterGutterComponent],
      template: `
        <med-splitter
          class="h-64 w-[200px]"
          [(sizes)]="sizes"
          [stateKey]="stateKey"
          [stateStorage]="stateStorage"
          (resizeStart)="starts.push($event)"
          (resizeEnd)="ends.push($event)"
        >
          <med-splitter-panel>A</med-splitter-panel>
          <med-splitter-gutter />
          <med-splitter-panel>B</med-splitter-panel>
        </med-splitter>
      `,
    })
    class PersistentHostComponent {
      sizes: readonly number[] | null = null;
      stateKey: string | null = 'test-splitter-key';
      stateStorage: 'session' | 'local' = 'session';
      starts: Array<{ sizes: readonly number[] }> = [];
      ends: Array<{ sizes: readonly number[] }> = [];
    }

    beforeEach(() => {
      sessionStorage.clear();
      localStorage.clear();
    });

    it('emits resizeStart and resizeEnd and persists sizes in sessionStorage', () => {
      const fixture = TestBed.createComponent(PersistentHostComponent);
      fixture.detectChanges();
      stubHostRect(fixture, 200, 200);

      const g = gutter(fixture);
      g.dispatchEvent(pointer('pointerdown', 100, 50));
      g.dispatchEvent(pointer('pointermove', 140, 50));
      g.dispatchEvent(pointer('pointerup', 140, 50));
      fixture.detectChanges();

      expect(fixture.componentInstance.starts.length).toBe(1);
      expect(fixture.componentInstance.ends.length).toBe(1);
      expect(fixture.componentInstance.ends[0].sizes).toEqual([70, 30]);
      expect(JSON.parse(sessionStorage.getItem('test-splitter-key')!)).toEqual([70, 30]);
    });

    it('restores persisted sizes from localStorage when stateStorage is local', () => {
      localStorage.setItem('local-splitter-key', JSON.stringify([25, 75]));
      const fixture = TestBed.createComponent(PersistentHostComponent);
      fixture.componentInstance.stateKey = 'local-splitter-key';
      fixture.componentInstance.stateStorage = 'local';
      fixture.detectChanges();

      const [a, b] = panels(fixture);
      expect(a.style.flex).toBe('0 0 25%');
      expect(b.style.flex).toBe('0 0 75%');
    });
  });
});
