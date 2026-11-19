import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MeterGroupComponent } from './meter-group.component';
import { MeterItem } from './meter-group.types';

const ITEMS: MeterItem[] = [
  { label: 'Documents', value: 40, severity: 'info' },
  { label: 'Photos', value: 30, severity: 'success' },
  { label: 'Other', value: 10 },
];

@Component({
  standalone: true,
  imports: [MeterGroupComponent],
  // A static `class="..."` attribute, not `[class]="expr"` — see
  // ScrollPanelComponent's own doc for why that distinction matters for the
  // class-merge regression test below.
  template: `<med-meter-group [value]="items" [max]="max" [showLegend]="showLegend" [unit]="unit" class="max-w-lg" />`,
})
class HostComponent {
  items: MeterItem[] = ITEMS;
  max = 100;
  showLegend = true;
  unit = '%';
}

function track(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('[aria-hidden="true"]') as HTMLElement;
}

function segments(fixture: { nativeElement: HTMLElement }): HTMLElement[] {
  return Array.from(track(fixture).children) as HTMLElement[];
}

function legendItems(fixture: { nativeElement: HTMLElement }): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('ul li'));
}

function create(configure?: (h: HostComponent) => void) {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

describe('MeterGroupComponent', () => {
  it('renders one segment per item, sized proportionally to max', () => {
    const fixture = create();
    const segs = segments(fixture);
    expect(segs.length).toBe(3);
    expect(segs[0].style.width).toBe('40%');
    expect(segs[1].style.width).toBe('30%');
    expect(segs[2].style.width).toBe('10%');
  });

  it('the bar is aria-hidden — the legend carries the accessible info', () => {
    const fixture = create();
    expect(track(fixture).getAttribute('aria-hidden')).toBe('true');
  });

  it('renders a legend row per item with label + value + unit', () => {
    const fixture = create();
    const rows = legendItems(fixture);
    expect(rows.length).toBe(3);
    expect(rows[0].textContent).toContain('Documents');
    expect(rows[0].textContent).toContain('40');
    expect(rows[0].textContent).toContain('%');
  });

  it('honors a custom unit suffix', () => {
    const fixture = create((h) => (h.unit = ' GB'));
    expect(legendItems(fixture)[0].textContent).toContain('40 GB');
  });

  it('visually hides the legend when showLegend is false, but keeps it sr-only accessible (Wave 2 fix — the bar itself is always aria-hidden, so this is the only accessible content in that mode)', () => {
    const fixture = create((h) => (h.showLegend = false));
    const list = fixture.nativeElement.querySelector('ul');
    expect(list).not.toBeNull();
    expect(list?.className).toBe('sr-only');
    expect(list?.textContent).toContain('Documents');
  });

  it('renders no legend list at all when there are no items, regardless of showLegend', () => {
    const fixture = create((h) => {
      h.items = [];
      h.showLegend = false;
    });
    expect(fixture.nativeElement.querySelector('ul')).toBeNull();
  });

  it('clamps a percentage above 100 (value exceeding max)', () => {
    const fixture = create((h) => {
      h.items = [{ label: 'Overflow', value: 150 }];
      h.max = 100;
    });
    expect(segments(fixture)[0].style.width).toBe('100%');
  });

  it('renders nothing crashing with an empty value array, and no legend', () => {
    const fixture = create((h) => (h.items = []));
    expect(segments(fixture).length).toBe(0);
    expect(fixture.nativeElement.querySelector('ul')).toBeNull();
  });

  it('items without an explicit severity fall back to a rotating default palette by position', () => {
    const fixture = create();
    const segs = segments(fixture);
    // item[2] ('Other') has no severity — still gets some solid background color class, not none.
    expect(segs[2].className.trim().length).toBeGreaterThan(0);
  });

  it('merges a consumer class onto the host, sizing the whole widget (bar + legend), not just the bar', () => {
    const fixture = create();
    const host = fixture.nativeElement.querySelector('med-meter-group') as HTMLElement;
    expect(host.className).toContain('max-w-lg');
    expect(track(fixture).className).not.toContain('max-w-lg');
  });
});

describe('MeterGroupComponent (min, orientation, labelPosition)', () => {
  @Component({
    standalone: true,
    imports: [MeterGroupComponent],
    template: `<med-meter-group [value]="items" [min]="min" [max]="max" [orientation]="orientation" [labelPosition]="labelPosition" verticalHeight="200px" />`,
  })
  class HostComponent {
    items: MeterItem[] = ITEMS;
    min = 0;
    max = 100;
    orientation: 'horizontal' | 'vertical' = 'horizontal';
    labelPosition: 'start' | 'end' = 'end';
  }

  function create(configure?: (h: HostComponent) => void) {
    const fixture = TestBed.createComponent(HostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  function track(fixture: { nativeElement: HTMLElement }): HTMLElement {
    return fixture.nativeElement.querySelector('[aria-hidden="true"]') as HTMLElement;
  }

  it('min shifts the percent formula to (value - min) / (max - min)', () => {
    const fixture = create((h) => {
      h.items = [{ label: 'A', value: 60 }];
      h.min = 50;
      h.max = 100;
    });
    // (60 - 50) / (100 - 50) * 100 = 20%
    expect((track(fixture).children[0] as HTMLElement).style.width).toBe('20%');
  });

  it('min === max renders every segment at 100% rather than dividing by zero', () => {
    const fixture = create((h) => {
      h.items = [{ label: 'A', value: 5 }];
      h.min = 10;
      h.max = 10;
    });
    expect((track(fixture).children[0] as HTMLElement).style.width).toBe('100%');
  });

  it('orientation="vertical" sizes segments by height instead of width, and sets the explicit verticalHeight', () => {
    const fixture = create((h) => (h.orientation = 'vertical'));
    const bar = track(fixture);
    expect(bar.style.height).toBe('200px');
    const firstSegment = bar.children[0] as HTMLElement;
    expect(firstSegment.style.height).toBe('40%');
    expect(firstSegment.style.width).toBe('');
  });

  it('labelPosition="start" renders the legend before the bar', () => {
    const fixture = create((h) => (h.labelPosition = 'start'));
    const root = fixture.nativeElement.querySelector('med-meter-group') as HTMLElement;
    const ul = root.querySelector('ul') as HTMLElement;
    const bar = track(fixture);
    // DOCUMENT_POSITION_FOLLOWING means `bar` comes after `ul` in the DOM.
    expect(ul.compareDocumentPosition(bar) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('labelPosition="end" (default) renders the legend after the bar', () => {
    const fixture = create();
    const root = fixture.nativeElement.querySelector('med-meter-group') as HTMLElement;
    const ul = root.querySelector('ul') as HTMLElement;
    const bar = track(fixture);
    expect(bar.compareDocumentPosition(ul) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe('MeterGroupComponent (label/meter/start/end/icon templates)', () => {
  @Component({
    standalone: true,
    imports: [MeterGroupComponent],
    template: `
      <med-meter-group [value]="items">
        @if (withStart) {
          <ng-template #start>
            <span class="start-marker">Start</span>
          </ng-template>
        }
        @if (withEnd) {
          <ng-template #end>
            <span class="end-marker">End</span>
          </ng-template>
        }
        @if (withMeter) {
          <ng-template #meter let-item let-percent="percent">
            <span class="meter-marker">{{ item.label }}:{{ percent }}</span>
          </ng-template>
        }
        @if (withIcon) {
          <ng-template #icon let-item>
            <span class="icon-marker">{{ item.label }}-icon</span>
          </ng-template>
        }
        @if (withLabel) {
          <ng-template #label let-items let-totalPercent="totalPercent">
            <div class="label-marker">{{ items.length }} items, {{ totalPercent }}%</div>
          </ng-template>
        }
      </med-meter-group>
    `,
  })
  class TemplatesHostComponent {
    items: MeterItem[] = ITEMS;
    withStart = false;
    withEnd = false;
    withMeter = false;
    withIcon = false;
    withLabel = false;
  }

  function create(configure?: (h: TemplatesHostComponent) => void) {
    const fixture = TestBed.createComponent(TemplatesHostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  it('renders #start/#end around the bar when projected', () => {
    const fixture = create((h) => {
      h.withStart = true;
      h.withEnd = true;
    });
    expect(fixture.nativeElement.querySelector('.start-marker')?.textContent).toBe('Start');
    expect(fixture.nativeElement.querySelector('.end-marker')?.textContent).toBe('End');
  });

  it('renders #meter instead of the default colored segment when projected', () => {
    const fixture = create((h) => (h.withMeter = true));
    const markers = fixture.nativeElement.querySelectorAll('.meter-marker');
    expect(markers.length).toBe(3);
    expect((markers[0] as HTMLElement).textContent).toBe('Documents:40');
  });

  it('renders #icon instead of the plain MeterItem.icon in the legend when projected', () => {
    const fixture = create((h) => {
      h.withIcon = true;
      h.items = [{ label: 'X', value: 1, icon: 'star' }];
    });
    expect(fixture.nativeElement.querySelector('.icon-marker')?.textContent).toBe('X-icon');
    expect(fixture.nativeElement.querySelector('med-icon')).toBeNull();
  });

  it('renders #label instead of the default legend list when projected', () => {
    const fixture = create((h) => (h.withLabel = true));
    expect(fixture.nativeElement.querySelector('.label-marker')?.textContent).toBe('3 items, 80%');
    expect(fixture.nativeElement.querySelector('ul')).toBeNull();
  });
});
