import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';

/** Supported Chart.js chart types. */
export type ChartType =
  | 'bar'
  | 'line'
  | 'scatter'
  | 'bubble'
  | 'pie'
  | 'doughnut'
  | 'polarArea'
  | 'radar';

/** Event payload emitted when a chart data element is clicked. */
export interface ChartDataSelectEvent {
  originalEvent: Event;
  element: unknown;
  dataset: unknown;
  datasetIndex: number;
  index: number;
}

interface ChartLike {
  update(mode?: string): void;
  destroy(): void;
  toBase64Image(type?: string, quality?: number): string;
}

/**
 * Wrapper component around Chart.js with optional dynamic loading,
 * SSR-safe lifecycle, and reactive input synchronization.
 */
@Component({
  selector: 'med-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="containerClass()" [style.width]="width()" [style.height]="height()">
      <canvas
        #canvas
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-labelledby]="ariaLabelledBy() || null"
        role="img"
      ></canvas>
    </div>
  `,
})
export class ChartComponent {
  readonly type = input<ChartType>('bar');
  readonly data = input<unknown>(undefined);
  readonly options = input<unknown>(undefined);
  readonly plugins = input<unknown[]>([]);
  readonly width = input<string | undefined>(undefined);
  readonly height = input<string | undefined>(undefined);
  readonly responsive = input<boolean>(true);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly styleClass = input<string | undefined>(undefined);

  readonly onDataSelect = output<ChartDataSelectEvent>();

  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  private chartInstance: ChartLike | null = null;
  private destroyed = false;

  readonly containerClass = computed(() => mergeClasses('relative block', this.styleClass()));

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.destroyChart();
    });

    effect(() => {
      this.type();
      this.data();
      this.options();
      this.plugins();
      this.responsive();

      if (!isPlatformBrowser(this.platformId)) {
        return;
      }

      if (this.chartInstance) {
        this.reinit();
      } else {
        void this.initChart();
      }
    });
  }

  /** Re-renders the current Chart.js instance when data or options mutate in place. */
  refresh(): void {
    this.chartInstance?.update();
  }

  /** Destroys and recreates the Chart.js instance. */
  reinit(): void {
    this.destroyChart();
    if (isPlatformBrowser(this.platformId) && !this.destroyed) {
      void this.initChart();
    }
  }

  /** Returns a base64-encoded PNG data URL of the chart canvas, or undefined if unavailable. */
  getBase64Image(): string | undefined {
    return this.chartInstance?.toBase64Image();
  }

  private destroyChart(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }

  private async initChart(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this.destroyed) {
      return;
    }

    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) {
      return;
    }

    try {
      const chartModuleId = 'chart.js/auto';
      const mod = (await import(/* @vite-ignore */ chartModuleId)) as {
        default?: new (canvas: HTMLCanvasElement, config: Record<string, unknown>) => ChartLike;
        Chart?: new (canvas: HTMLCanvasElement, config: Record<string, unknown>) => ChartLike;
      };
      const ChartCtor = mod?.default ?? mod?.Chart;
      if (!ChartCtor || this.destroyed) {
        return;
      }

      const rawOptions = (this.options() as Record<string, unknown> | undefined) ?? {};
      const userOnClick =
        typeof rawOptions['onClick'] === 'function'
          ? (rawOptions['onClick'] as (event: Event, elements: unknown[], chart: unknown) => void)
          : undefined;

      const mergedOptions: Record<string, unknown> = {
        responsive: this.responsive(),
        ...rawOptions,
        onClick: (
          event: Event,
          elements: Array<{ datasetIndex?: number; index?: number }>,
          chart: unknown,
        ) => {
          userOnClick?.(event, elements, chart);
          const first = elements?.[0];
          if (first) {
            const datasetIndex = first.datasetIndex ?? 0;
            const index = first.index ?? 0;
            const dataObj = this.data() as { datasets?: unknown[] } | undefined;
            const dataset = dataObj?.datasets?.[datasetIndex];
            this.onDataSelect.emit({
              originalEvent: event,
              element: first,
              dataset,
              datasetIndex,
              index,
            });
          }
        },
      };

      this.destroyChart();
      this.chartInstance = new ChartCtor(canvas, {
        type: this.type(),
        data: this.data() ?? {},
        options: mergedOptions,
        plugins: this.plugins(),
      });
    } catch {
      this.chartInstance = null;
    }
  }
}
