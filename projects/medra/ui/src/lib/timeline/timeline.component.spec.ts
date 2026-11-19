import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TimelineComponent } from './timeline.component';

interface Event {
  title: string;
}

@Component({
  standalone: true,
  imports: [TimelineComponent],
  template: `
    <med-timeline [value]="events">
      <ng-template #content let-event>{{ event.title }}</ng-template>
    </med-timeline>
  `,
})
class HostComponent {
  events: Event[] = [{ title: 'Ordered' }, { title: 'Shipped' }, { title: 'Delivered' }];
}

function items(fixture: { nativeElement: HTMLElement }): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('li'));
}

function markers(fixture: { nativeElement: HTMLElement }): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('li > div > span:first-child'));
}

function connectors(fixture: { nativeElement: HTMLElement }): HTMLElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('li > div > span:nth-child(2)'));
}

function create(configure?: (h: HostComponent) => void) {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

describe('TimelineComponent', () => {
  it('renders one <li> per event, with the projected content', () => {
    const fixture = create();
    const rows = items(fixture);
    expect(rows).toHaveLength(3);
    expect(rows.map((el) => el.textContent?.trim())).toEqual(['Ordered', 'Shipped', 'Delivered']);
  });

  it('renders a marker for every event', () => {
    const fixture = create();
    expect(markers(fixture)).toHaveLength(3);
  });

  it('renders a connector between every event except after the last one', () => {
    const fixture = create();
    expect(connectors(fixture)).toHaveLength(2);
  });

  it('renders nothing when the value is empty', () => {
    const fixture = create((h) => (h.events = []));
    expect(items(fixture)).toHaveLength(0);
  });
});

describe('TimelineComponent (marker/opposite templates)', () => {
  @Component({
    standalone: true,
    imports: [TimelineComponent],
    template: `
      <med-timeline [value]="events">
        @if (withOpposite) {
          <ng-template #opposite let-event>
            <span class="opposite-marker">{{ event.title }}-opposite</span>
          </ng-template>
        }
        @if (withMarker) {
          <ng-template #marker>
            <span class="custom-marker"></span>
          </ng-template>
        }
        <ng-template #content let-event>{{ event.title }}</ng-template>
      </med-timeline>
    `,
  })
  class TemplatesHostComponent {
    events: Event[] = [{ title: 'Ordered' }, { title: 'Shipped' }];
    withOpposite = false;
    withMarker = false;
  }

  function createWithTemplates(configure?: (h: TemplatesHostComponent) => void) {
    const fixture = TestBed.createComponent(TemplatesHostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  it('falls back to the default dot marker when no #marker template is projected', () => {
    const fixture = createWithTemplates();
    expect(fixture.nativeElement.querySelectorAll('.rounded-full.border-2')).toHaveLength(2);
    expect(fixture.nativeElement.querySelector('.custom-marker')).toBeNull();
  });

  it('renders the #marker template instead of the default dot when projected', () => {
    const fixture = createWithTemplates((h) => (h.withMarker = true));
    expect(fixture.nativeElement.querySelectorAll('.custom-marker')).toHaveLength(2);
    expect(fixture.nativeElement.querySelector('.rounded-full.border-2')).toBeNull();
  });

  it('renders no opposite column when no #opposite template is projected', () => {
    const fixture = createWithTemplates();
    expect(fixture.nativeElement.querySelector('.opposite-marker')).toBeNull();
  });

  it('renders the #opposite template, bound to the event, in its own column before the marker', () => {
    const fixture = createWithTemplates((h) => (h.withOpposite = true));
    const opposites = fixture.nativeElement.querySelectorAll('.opposite-marker');
    expect(Array.from(opposites).map((el) => (el as HTMLElement).textContent)).toEqual(['Ordered-opposite', 'Shipped-opposite']);

    const firstLi = fixture.nativeElement.querySelector('li') as HTMLElement;
    expect(firstLi.firstElementChild?.querySelector('.opposite-marker')).not.toBeNull();
  });

  // @scenario UI-008.S2
  describe('layout and align (Wave 2)', () => {
    @Component({
      standalone: true,
      imports: [TimelineComponent],
      template: `
        <med-timeline [value]="events" [layout]="layout" [align]="align">
          <ng-template #content let-e>{{ e }}</ng-template>
        </med-timeline>
      `,
    })
    class LayoutHostComponent {
      events = ['One', 'Two', 'Three'];
      layout: 'vertical' | 'horizontal' = 'vertical';
      align: 'left' | 'right' | 'alternate' | 'top' | 'bottom' = 'left';
    }

    it('renders horizontal flex-row list when layout is horizontal', () => {
      const fixture = TestBed.createComponent(LayoutHostComponent);
      fixture.componentInstance.layout = 'horizontal';
      fixture.detectChanges();

      const ul = fixture.nativeElement.querySelector('ul') as HTMLElement;
      expect(ul.className).toContain('flex-row');
    });

    it('applies right and alternate row alignment', () => {
      const fixture = TestBed.createComponent(LayoutHostComponent);
      fixture.componentInstance.align = 'alternate';
      fixture.detectChanges();

      const items = Array.from(fixture.nativeElement.querySelectorAll('li')) as HTMLElement[];
      expect(items[0].className).not.toContain('flex-row-reverse');
      expect(items[1].className).toContain('flex-row-reverse');
    });
  });
});
