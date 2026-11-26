import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { SliderBasicDemo } from './demos/slider-basic.demo';
import { SliderStepDemo } from './demos/slider-step.demo';
import { SliderRangeDemo } from './demos/slider-range.demo';
import { SliderRangeConstraintsDemo } from './demos/slider-range-constraints.demo';
import { SliderVerticalDemo } from './demos/slider-vertical.demo';
import { SliderSizesDemo } from './demos/slider-sizes.demo';
import { SliderDisabledDemo } from './demos/slider-disabled.demo';
import { SliderInvalidDemo } from './demos/slider-invalid.demo';
import { SliderControlledDemo } from './demos/slider-controlled.demo';
import { SliderCustomDemo } from './demos/slider-custom.demo';
import { SliderFilterDemo } from './demos/slider-filter.demo';
import { SliderSignalFormsDemo } from './demos/slider-signal-forms.demo';
import { SliderTemplateDrivenDemo } from './demos/slider-template-driven.demo';
import { SliderReactiveFormsDemo } from './demos/slider-reactive-forms.demo';

import sliderBasicCode from './demos/slider-basic.demo.html?raw';
import sliderStepCode from './demos/slider-step.demo.html?raw';
import sliderRangeCode from './demos/slider-range.demo.html?raw';
import sliderRangeConstraintsCode from './demos/slider-range-constraints.demo.html?raw';
import sliderVerticalCode from './demos/slider-vertical.demo.html?raw';
import sliderSizesCode from './demos/slider-sizes.demo.html?raw';
import sliderDisabledCode from './demos/slider-disabled.demo.html?raw';
import sliderInvalidCode from './demos/slider-invalid.demo.html?raw';
import sliderControlledCode from './demos/slider-controlled.demo.html?raw';
import sliderCustomCode from './demos/slider-custom.demo.html?raw';
import sliderFilterCode from './demos/slider-filter.demo.html?raw';
import sliderSignalFormsCode from './demos/slider-signal-forms.demo.html?raw';
import sliderTemplateDrivenCode from './demos/slider-template-driven.demo.html?raw';
import sliderReactiveFormsCode from './demos/slider-reactive-forms.demo.html?raw';
import apiEntries from '../../../../content/api/slider.json';
import introContent from '../../../../content/docs/slider-intro.txt?raw';
import basicContent from '../../../../content/docs/slider-basic.txt?raw';
import stepContent from '../../../../content/docs/slider-step.txt?raw';
import rangeContent from '../../../../content/docs/slider-range.txt?raw';
import rangeConstraintsContent from '../../../../content/docs/slider-range-constraints.txt?raw';
import verticalContent from '../../../../content/docs/slider-vertical.txt?raw';
import sizesContent from '../../../../content/docs/slider-sizes.txt?raw';
import disabledContent from '../../../../content/docs/slider-disabled.txt?raw';
import invalidContent from '../../../../content/docs/slider-invalid.txt?raw';
import controlledContent from '../../../../content/docs/slider-controlled.txt?raw';
import customContent from '../../../../content/docs/slider-custom.txt?raw';
import filterContent from '../../../../content/docs/slider-filter.txt?raw';
import signalFormsContent from '../../../../content/docs/slider-signal-forms.txt?raw';
import templateDrivenContent from '../../../../content/docs/slider-template-driven.txt?raw';
import reactiveFormsContent from '../../../../content/docs/slider-reactive-forms.txt?raw';

const IMPORT_CODE = `import { SliderComponent } from '@medra.dev/ui';`;

const EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-step', label: 'Step' },
  { id: 'example-range', label: 'Range' },
  { id: 'example-range-constraints', label: 'Range Constraints' },
  { id: 'example-vertical', label: 'Vertical' },
  { id: 'example-sizes', label: 'Sizes' },
  { id: 'example-disabled', label: 'Disabled' },
  { id: 'example-invalid', label: 'Invalid' },
  { id: 'example-controlled', label: 'Controlled' },
  { id: 'example-custom', label: 'Custom' },
  { id: 'example-filter', label: 'Filter' },
  { id: 'example-signal-forms', label: 'Signal Forms' },
  { id: 'example-template-driven', label: 'Template Driven' },
  { id: 'example-reactive-forms', label: 'Reactive Forms' },
] as const;

export const routeMeta: RouteMeta = {
  title: 'Slider — MedraUi',
  meta: [
    {
      name: 'description',
      content:
        'Slider component docs: single and range sliders with step, handle constraints, vertical orientation, sizes, states, custom styling, Angular forms integration, and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-slider',
  imports: [
    ComponentDocComponent,
    ProseComponent,
    ApiTableComponent,
    CodeBlockComponent,
    SliderBasicDemo,
    SliderStepDemo,
    SliderRangeDemo,
    SliderRangeConstraintsDemo,
    SliderVerticalDemo,
    SliderSizesDemo,
    SliderDisabledDemo,
    SliderInvalidDemo,
    SliderControlledDemo,
    SliderCustomDemo,
    SliderFilterDemo,
    SliderSignalFormsDemo,
    SliderTemplateDrivenDemo,
    SliderReactiveFormsDemo,
  ],
  template: `
    <app-component-doc title="Slider" slug="slider" [examples]="examples">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />

    <app-prose id="example-basic" class="mt-10 block scroll-mt-24" [content]="basicContent" />
    <div class="mt-4">
      <app-slider-basic-demo />
      <div class="mt-3"><app-code-block [code]="sliderBasicCode" /></div>
    </div>

    <app-prose id="example-step" class="mt-10 block scroll-mt-24" [content]="stepContent" />
    <div class="mt-4">
      <app-slider-step-demo />
      <div class="mt-3"><app-code-block [code]="sliderStepCode" /></div>
    </div>

    <app-prose id="example-range" class="mt-10 block scroll-mt-24" [content]="rangeContent" />
    <div class="mt-4">
      <app-slider-range-demo />
      <div class="mt-3"><app-code-block [code]="sliderRangeCode" /></div>
    </div>

    <app-prose id="example-range-constraints" class="mt-10 block scroll-mt-24" [content]="rangeConstraintsContent" />
    <div class="mt-4">
      <app-slider-range-constraints-demo />
      <div class="mt-3"><app-code-block [code]="sliderRangeConstraintsCode" /></div>
    </div>

    <app-prose id="example-vertical" class="mt-10 block scroll-mt-24" [content]="verticalContent" />
    <div class="mt-4">
      <app-slider-vertical-demo />
      <div class="mt-3"><app-code-block [code]="sliderVerticalCode" /></div>
    </div>

    <app-prose id="example-sizes" class="mt-10 block scroll-mt-24" [content]="sizesContent" />
    <div class="mt-4">
      <app-slider-sizes-demo />
      <div class="mt-3"><app-code-block [code]="sliderSizesCode" /></div>
    </div>

    <app-prose id="example-disabled" class="mt-10 block scroll-mt-24" [content]="disabledContent" />
    <div class="mt-4">
      <app-slider-disabled-demo />
      <div class="mt-3"><app-code-block [code]="sliderDisabledCode" /></div>
    </div>

    <app-prose id="example-invalid" class="mt-10 block scroll-mt-24" [content]="invalidContent" />
    <div class="mt-4">
      <app-slider-invalid-demo />
      <div class="mt-3"><app-code-block [code]="sliderInvalidCode" /></div>
    </div>

    <app-prose id="example-controlled" class="mt-10 block scroll-mt-24" [content]="controlledContent" />
    <div class="mt-4">
      <app-slider-controlled-demo />
      <div class="mt-3"><app-code-block [code]="sliderControlledCode" /></div>
    </div>

    <app-prose id="example-custom" class="mt-10 block scroll-mt-24" [content]="customContent" />
    <div class="mt-4">
      <app-slider-custom-demo />
      <div class="mt-3"><app-code-block [code]="sliderCustomCode" /></div>
    </div>

    <app-prose id="example-filter" class="mt-10 block scroll-mt-24" [content]="filterContent" />
    <div class="mt-4">
      <app-slider-filter-demo />
      <div class="mt-3"><app-code-block [code]="sliderFilterCode" /></div>
    </div>

    <app-prose id="example-signal-forms" class="mt-10 block scroll-mt-24" [content]="signalFormsContent" />
    <div class="mt-4">
      <app-slider-signal-forms-demo />
      <div class="mt-3"><app-code-block [code]="sliderSignalFormsCode" /></div>
    </div>

    <app-prose id="example-template-driven" class="mt-10 block scroll-mt-24" [content]="templateDrivenContent" />
    <div class="mt-4">
      <app-slider-template-driven-demo />
      <div class="mt-3"><app-code-block [code]="sliderTemplateDrivenCode" /></div>
    </div>

    <app-prose id="example-reactive-forms" class="mt-10 block scroll-mt-24" [content]="reactiveFormsContent" />
    <div class="mt-4">
      <app-slider-reactive-forms-demo />
      <div class="mt-3"><app-code-block [code]="sliderReactiveFormsCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsSlider {
  protected readonly examples = EXAMPLES;
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly basicContent = basicContent;
  protected readonly sliderBasicCode = sliderBasicCode;
  protected readonly stepContent = stepContent;
  protected readonly sliderStepCode = sliderStepCode;
  protected readonly rangeContent = rangeContent;
  protected readonly sliderRangeCode = sliderRangeCode;
  protected readonly rangeConstraintsContent = rangeConstraintsContent;
  protected readonly sliderRangeConstraintsCode = sliderRangeConstraintsCode;
  protected readonly verticalContent = verticalContent;
  protected readonly sliderVerticalCode = sliderVerticalCode;
  protected readonly sizesContent = sizesContent;
  protected readonly sliderSizesCode = sliderSizesCode;
  protected readonly disabledContent = disabledContent;
  protected readonly sliderDisabledCode = sliderDisabledCode;
  protected readonly invalidContent = invalidContent;
  protected readonly sliderInvalidCode = sliderInvalidCode;
  protected readonly controlledContent = controlledContent;
  protected readonly sliderControlledCode = sliderControlledCode;
  protected readonly customContent = customContent;
  protected readonly sliderCustomCode = sliderCustomCode;
  protected readonly filterContent = filterContent;
  protected readonly sliderFilterCode = sliderFilterCode;
  protected readonly signalFormsContent = signalFormsContent;
  protected readonly sliderSignalFormsCode = sliderSignalFormsCode;
  protected readonly templateDrivenContent = templateDrivenContent;
  protected readonly sliderTemplateDrivenCode = sliderTemplateDrivenCode;
  protected readonly reactiveFormsContent = reactiveFormsContent;
  protected readonly sliderReactiveFormsCode = sliderReactiveFormsCode;
}
