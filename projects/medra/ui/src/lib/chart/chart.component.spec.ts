import { PLATFORM_ID, Component, ViewChild, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ChartComponent, ChartDataSelectEvent, ChartType } from './chart.component';

const mockChartUpdate = jest.fn();
const mockChartDestroy = jest.fn();
const mockChartToBase64Image = jest.fn(() => 'data:image/png;base64,MOCK_IMAGE');
let lastChartConfig: Record<string, unknown> | null = null;
let shouldThrowOnImport = false;

jest.mock(
  'chart.js/auto',
  () => {
    const MockChart = jest.fn().mockImplementation((_canvas: unknown, config: Record<string, unknown>) => {
      if (shouldThrowOnImport) {
        throw new Error('Cannot find module chart.js/auto');
      }
      lastChartConfig = config;
      return {
        update: mockChartUpdate,
        destroy: mockChartDestroy,
        toBase64Image: mockChartToBase64Image,
      };
    });
    return {
      __esModule: true,
      default: MockChart,
    };
  },
  { virtual: true },
);

@Component({
  standalone: true,
  imports: [ChartComponent],
  template: `
    <med-chart
      [type]="type()"
      [data]="data()"
      [options]="options()"
      [plugins]="plugins()"
      [ariaLabel]="ariaLabel()"
      (onDataSelect)="handleDataSelect($event)"
    />
  `,
})
class ChartHostComponent {
  readonly type = signal<ChartType>('bar');
  readonly data = signal<unknown>({
    labels: ['Jan', 'Feb'],
    datasets: [{ label: 'Sales', data: [10, 20] }],
  });
  readonly options = signal<unknown>({ responsive: true });
  readonly plugins = signal<unknown[]>([]);
  readonly ariaLabel = signal<string>('Monthly sales chart');
  readonly selectedEvents: ChartDataSelectEvent[] = [];

  @ViewChild(ChartComponent) chart!: ChartComponent;

  handleDataSelect(event: ChartDataSelectEvent): void {
    this.selectedEvents.push(event);
  }
}

describe('ChartComponent (UI-013.S1)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    lastChartConfig = null;
    shouldThrowOnImport = false;
  });

  it('renders a canvas, initializes Chart.js, emits onDataSelect, and exposes refresh/reinit/getBase64Image (UI-013.S1)', async () => {
    TestBed.configureTestingModule({
      imports: [ChartHostComponent],
    });
    const fixture = TestBed.createComponent(ChartHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 0));

    const canvas = fixture.nativeElement.querySelector('canvas') as HTMLCanvasElement | null;
    expect(canvas).toBeTruthy();
    expect(canvas?.getAttribute('aria-label')).toBe('Monthly sales chart');
    expect(lastChartConfig).toBeTruthy();
    expect(lastChartConfig?.['type']).toBe('bar');

    const { chart } = fixture.componentInstance;
    expect(chart.getBase64Image()).toBe('data:image/png;base64,MOCK_IMAGE');

    chart.refresh();
    expect(mockChartUpdate).toHaveBeenCalled();

    chart.reinit();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockChartDestroy).toHaveBeenCalled();

    // Simulate Chart.js onClick callback triggering onDataSelect
    const options = lastChartConfig?.['options'] as {
      onClick?: (event: Event, elements: Array<{ datasetIndex: number; index: number }>) => void;
    };
    expect(typeof options?.onClick).toBe('function');
    const clickEvent = new MouseEvent('click');
    options.onClick?.(clickEvent, [{ datasetIndex: 0, index: 1 }]);
    expect(fixture.componentInstance.selectedEvents.length).toBe(1);
    expect(fixture.componentInstance.selectedEvents[0].datasetIndex).toBe(0);
    expect(fixture.componentInstance.selectedEvents[0].index).toBe(1);
  });

  it('degrades safely in SSR without instantiating Chart.js (UI-013.S1, M-04)', async () => {
    TestBed.configureTestingModule({
      imports: [ChartHostComponent],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });
    const fixture = TestBed.createComponent(ChartHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(lastChartConfig).toBeNull();
    expect(fixture.componentInstance.chart.getBase64Image()).toBeUndefined();
    expect(() => fixture.componentInstance.chart.refresh()).not.toThrow();
    expect(() => fixture.componentInstance.chart.reinit()).not.toThrow();
  });

  it('degrades gracefully when chart.js is not installed (UI-013.S1, M-04)', async () => {
    shouldThrowOnImport = true;
    TestBed.configureTestingModule({
      imports: [ChartHostComponent],
    });
    const fixture = TestBed.createComponent(ChartHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fixture.componentInstance.chart.getBase64Image()).toBeUndefined();
    expect(() => fixture.componentInstance.chart.refresh()).not.toThrow();
  });
});
