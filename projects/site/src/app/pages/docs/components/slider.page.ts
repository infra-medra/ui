import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { SliderBasicDemo } from './demos/slider-basic.demo';
import { SliderRangeConstraintsDemo } from './demos/slider-range-constraints.demo';

import sliderBasicCode from './demos/slider-basic.demo.html?raw';
import sliderRangeConstraintsCode from './demos/slider-range-constraints.demo.html?raw';
import apiEntries from '../../../../content/api/slider.json';
import introContent from '../../../../content/docs/slider-intro.txt?raw';
import rangeConstraintsContent from '../../../../content/docs/slider-range-constraints.txt?raw';

const IMPORT_CODE = `import { SliderComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Slider — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Slider component docs: a track-driven single or two-thumb range slider with keyboard support, and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-slider',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, SliderBasicDemo, SliderRangeConstraintsDemo],
  template: `
    <app-component-doc title="Slider" slug="slider">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-slider-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="sliderBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="rangeConstraintsContent" />
    <div class="mt-4"><app-slider-range-constraints-demo /></div>
    <div class="mt-3"><app-code-block [code]="sliderRangeConstraintsCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsSlider {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly rangeConstraintsContent = rangeConstraintsContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly sliderBasicCode = sliderBasicCode;
  protected readonly sliderRangeConstraintsCode = sliderRangeConstraintsCode;
}
