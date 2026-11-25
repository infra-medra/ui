import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { DatePickerBasicDemo } from './demos/date-picker-basic.demo';
import { DatePickerFormatDemo } from './demos/date-picker-format.demo';
import { DatePickerLocaleDemo } from './demos/date-picker-locale.demo';
import { DatePickerMinMaxDemo } from './demos/date-picker-min-max.demo';
import { DatePickerMultipleDemo } from './demos/date-picker-multiple.demo';
import { DatePickerRangeDemo } from './demos/date-picker-range.demo';
import { DatePickerShowTimeDemo } from './demos/date-picker-show-time.demo';
import { DatePickerTimeOnlyDemo } from './demos/date-picker-time-only.demo';
import { DatePickerMonthPickerDemo } from './demos/date-picker-month-picker.demo';
import { DatePickerYearPickerDemo } from './demos/date-picker-year-picker.demo';
import { DatePickerMultipleMonthsDemo } from './demos/date-picker-multiple-months.demo';
import { DatePickerDrilldownDemo } from './demos/date-picker-drilldown.demo';
import { DatePickerInlineDemo } from './demos/date-picker-inline.demo';
import { DatePickerButtonBarDemo } from './demos/date-picker-button-bar.demo';
import { DatePickerDateTemplateDemo } from './demos/date-picker-date-template.demo';
import { DatePickerClearIconDemo } from './demos/date-picker-clear-icon.demo';
import { DatePickerSizesDemo } from './demos/date-picker-sizes.demo';
import { DatePickerFluidDemo } from './demos/date-picker-fluid.demo';
import { DatePickerFilledDemo } from './demos/date-picker-filled.demo';
import { DatePickerDisabledDemo } from './demos/date-picker-disabled.demo';
import { DatePickerInvalidDemo } from './demos/date-picker-invalid.demo';
import { DatePickerFloatLabelDemo } from './demos/date-picker-float-label.demo';
import { DatePickerIftaLabelDemo } from './demos/date-picker-ifta-label.demo';
import { DatePickerSignalFormsDemo } from './demos/date-picker-signal-forms.demo';
import { DatePickerTemplateDrivenDemo } from './demos/date-picker-template-driven.demo';
import { DatePickerReactiveFormsDemo } from './demos/date-picker-reactive-forms.demo';

import datePickerBasicCode from './demos/date-picker-basic.demo.html?raw';
import datePickerFormatCode from './demos/date-picker-format.demo.html?raw';
import datePickerLocaleCode from './demos/date-picker-locale.demo.html?raw';
import datePickerMinMaxCode from './demos/date-picker-min-max.demo.html?raw';
import datePickerMultipleCode from './demos/date-picker-multiple.demo.html?raw';
import datePickerRangeCode from './demos/date-picker-range.demo.html?raw';
import datePickerShowTimeCode from './demos/date-picker-show-time.demo.html?raw';
import datePickerTimeOnlyCode from './demos/date-picker-time-only.demo.html?raw';
import datePickerMonthPickerCode from './demos/date-picker-month-picker.demo.html?raw';
import datePickerYearPickerCode from './demos/date-picker-year-picker.demo.html?raw';
import datePickerMultipleMonthsCode from './demos/date-picker-multiple-months.demo.html?raw';
import datePickerDrilldownCode from './demos/date-picker-drilldown.demo.html?raw';
import datePickerInlineCode from './demos/date-picker-inline.demo.html?raw';
import datePickerButtonBarCode from './demos/date-picker-button-bar.demo.html?raw';
import datePickerDateTemplateCode from './demos/date-picker-date-template.demo.html?raw';
import datePickerClearIconCode from './demos/date-picker-clear-icon.demo.html?raw';
import datePickerSizesCode from './demos/date-picker-sizes.demo.html?raw';
import datePickerFluidCode from './demos/date-picker-fluid.demo.html?raw';
import datePickerFilledCode from './demos/date-picker-filled.demo.html?raw';
import datePickerDisabledCode from './demos/date-picker-disabled.demo.html?raw';
import datePickerInvalidCode from './demos/date-picker-invalid.demo.html?raw';
import datePickerFloatLabelCode from './demos/date-picker-float-label.demo.html?raw';
import datePickerIftaLabelCode from './demos/date-picker-ifta-label.demo.html?raw';
import datePickerSignalFormsCode from './demos/date-picker-signal-forms.demo.html?raw';
import datePickerTemplateDrivenCode from './demos/date-picker-template-driven.demo.html?raw';
import datePickerReactiveFormsCode from './demos/date-picker-reactive-forms.demo.html?raw';
import apiEntries from '../../../../content/api/date-picker.json';
import introContent from '../../../../content/docs/date-picker-intro.txt?raw';
import basicContent from '../../../../content/docs/date-picker-basic.txt?raw';
import formatContent from '../../../../content/docs/date-picker-format.txt?raw';
import localeContent from '../../../../content/docs/date-picker-locale.txt?raw';
import minMaxContent from '../../../../content/docs/date-picker-min-max.txt?raw';
import multipleContent from '../../../../content/docs/date-picker-multiple.txt?raw';
import rangeContent from '../../../../content/docs/date-picker-range.txt?raw';
import showTimeContent from '../../../../content/docs/date-picker-show-time.txt?raw';
import timeOnlyContent from '../../../../content/docs/date-picker-time-only.txt?raw';
import monthPickerContent from '../../../../content/docs/date-picker-month-picker.txt?raw';
import yearPickerContent from '../../../../content/docs/date-picker-year-picker.txt?raw';
import multipleMonthsContent from '../../../../content/docs/date-picker-multiple-months.txt?raw';
import drilldownContent from '../../../../content/docs/date-picker-drilldown.txt?raw';
import inlineContent from '../../../../content/docs/date-picker-inline.txt?raw';
import buttonBarContent from '../../../../content/docs/date-picker-button-bar.txt?raw';
import dateTemplateContent from '../../../../content/docs/date-picker-date-template.txt?raw';
import clearIconContent from '../../../../content/docs/date-picker-clear-icon.txt?raw';
import sizesContent from '../../../../content/docs/date-picker-sizes.txt?raw';
import fluidContent from '../../../../content/docs/date-picker-fluid.txt?raw';
import filledContent from '../../../../content/docs/date-picker-filled.txt?raw';
import disabledContent from '../../../../content/docs/date-picker-disabled.txt?raw';
import invalidContent from '../../../../content/docs/date-picker-invalid.txt?raw';
import floatLabelContent from '../../../../content/docs/date-picker-float-label.txt?raw';
import iftaLabelContent from '../../../../content/docs/date-picker-ifta-label.txt?raw';
import signalFormsContent from '../../../../content/docs/date-picker-signal-forms.txt?raw';
import templateDrivenContent from '../../../../content/docs/date-picker-template-driven.txt?raw';
import reactiveFormsContent from '../../../../content/docs/date-picker-reactive-forms.txt?raw';

const EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-format', label: 'Format' },
  { id: 'example-locale', label: 'Locale' },
  { id: 'example-min-max', label: 'Min / Max & Disabled Dates' },
  { id: 'example-multiple', label: 'Multiple' },
  { id: 'example-range', label: 'Range' },
  { id: 'example-time', label: 'Time' },
  { id: 'example-time-only', label: 'Time Only' },
  { id: 'example-month-picker', label: 'Month Picker' },
  { id: 'example-year-picker', label: 'Year Picker' },
  { id: 'example-multiple-months', label: 'Multiple Months' },
  { id: 'example-drilldown', label: 'Drilldown Navigation' },
  { id: 'example-inline', label: 'Inline' },
  { id: 'example-button-bar', label: 'Button Bar' },
  { id: 'example-date-template', label: 'Date Template' },
  { id: 'example-clear-icon', label: 'Clear Icon' },
  { id: 'example-sizes', label: 'Sizes' },
  { id: 'example-fluid', label: 'Fluid' },
  { id: 'example-filled', label: 'Filled' },
  { id: 'example-disabled', label: 'Disabled' },
  { id: 'example-invalid', label: 'Invalid' },
  { id: 'example-float-label', label: 'Float Label' },
  { id: 'example-ifta-label', label: 'Ifta Label' },
  { id: 'example-signal-forms', label: 'Signal Forms' },
  { id: 'example-template-driven', label: 'Template Driven' },
  { id: 'example-reactive-forms', label: 'Reactive Forms' },
] as const;

const IMPORT_CODE = `import { DatePickerComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'DatePicker — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'DatePicker component docs: a typeable date field with a calendar overlay, single and range selection modes, and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-date-picker',
  imports: [
    ComponentDocComponent,
    ProseComponent,
    ApiTableComponent,
    CodeBlockComponent,
    DatePickerBasicDemo,
    DatePickerFormatDemo,
    DatePickerLocaleDemo,
    DatePickerMinMaxDemo,
    DatePickerMultipleDemo,
    DatePickerRangeDemo,
    DatePickerShowTimeDemo,
    DatePickerTimeOnlyDemo,
    DatePickerMonthPickerDemo,
    DatePickerYearPickerDemo,
    DatePickerMultipleMonthsDemo,
    DatePickerDrilldownDemo,
    DatePickerInlineDemo,
    DatePickerButtonBarDemo,
    DatePickerDateTemplateDemo,
    DatePickerClearIconDemo,
    DatePickerSizesDemo,
    DatePickerFluidDemo,
    DatePickerFilledDemo,
    DatePickerDisabledDemo,
    DatePickerInvalidDemo,
    DatePickerFloatLabelDemo,
    DatePickerIftaLabelDemo,
    DatePickerSignalFormsDemo,
    DatePickerTemplateDrivenDemo,
    DatePickerReactiveFormsDemo,
  ],
  template: `
    <app-component-doc title="DatePicker" slug="date-picker" [examples]="examples">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />

    <app-prose id="example-basic" class="mt-10 block scroll-mt-24" [content]="basicContent" />
    <div class="mt-4">
      <app-date-picker-basic-demo />
      <div class="mt-3"><app-code-block [code]="datePickerBasicCode" /></div>
    </div>

    <app-prose id="example-format" class="mt-10 block scroll-mt-24" [content]="formatContent" />
    <div class="mt-4">
      <app-date-picker-format-demo />
      <div class="mt-3"><app-code-block [code]="datePickerFormatCode" /></div>
    </div>

    <app-prose id="example-locale" class="mt-10 block scroll-mt-24" [content]="localeContent" />
    <div class="mt-4">
      <app-date-picker-locale-demo />
      <div class="mt-3"><app-code-block [code]="datePickerLocaleCode" /></div>
    </div>

    <app-prose id="example-min-max" class="mt-10 block scroll-mt-24" [content]="minMaxContent" />
    <div class="mt-4">
      <app-date-picker-min-max-demo />
      <div class="mt-3"><app-code-block [code]="datePickerMinMaxCode" /></div>
    </div>

    <app-prose id="example-multiple" class="mt-10 block scroll-mt-24" [content]="multipleContent" />
    <div class="mt-4">
      <app-date-picker-multiple-demo />
      <div class="mt-3"><app-code-block [code]="datePickerMultipleCode" /></div>
    </div>

    <app-prose id="example-range" class="mt-10 block scroll-mt-24" [content]="rangeContent" />
    <div class="mt-4">
      <app-date-picker-range-demo />
      <div class="mt-3"><app-code-block [code]="datePickerRangeCode" /></div>
    </div>

    <app-prose id="example-time" class="mt-10 block scroll-mt-24" [content]="showTimeContent" />
    <div class="mt-4">
      <app-date-picker-show-time-demo />
      <div class="mt-3"><app-code-block [code]="datePickerShowTimeCode" /></div>
    </div>

    <app-prose id="example-time-only" class="mt-10 block scroll-mt-24" [content]="timeOnlyContent" />
    <div class="mt-4">
      <app-date-picker-time-only-demo />
      <div class="mt-3"><app-code-block [code]="datePickerTimeOnlyCode" /></div>
    </div>

    <app-prose id="example-month-picker" class="mt-10 block scroll-mt-24" [content]="monthPickerContent" />
    <div class="mt-4">
      <app-date-picker-month-picker-demo />
      <div class="mt-3"><app-code-block [code]="datePickerMonthPickerCode" /></div>
    </div>

    <app-prose id="example-year-picker" class="mt-10 block scroll-mt-24" [content]="yearPickerContent" />
    <div class="mt-4">
      <app-date-picker-year-picker-demo />
      <div class="mt-3"><app-code-block [code]="datePickerYearPickerCode" /></div>
    </div>

    <app-prose id="example-multiple-months" class="mt-10 block scroll-mt-24" [content]="multipleMonthsContent" />
    <div class="mt-4">
      <app-date-picker-multiple-months-demo />
      <div class="mt-3"><app-code-block [code]="datePickerMultipleMonthsCode" /></div>
    </div>

    <app-prose id="example-drilldown" class="mt-10 block scroll-mt-24" [content]="drilldownContent" />
    <div class="mt-4">
      <app-date-picker-drilldown-demo />
      <div class="mt-3"><app-code-block [code]="datePickerDrilldownCode" /></div>
    </div>

    <app-prose id="example-inline" class="mt-10 block scroll-mt-24" [content]="inlineContent" />
    <div class="mt-4">
      <app-date-picker-inline-demo />
      <div class="mt-3"><app-code-block [code]="datePickerInlineCode" /></div>
    </div>

    <app-prose id="example-button-bar" class="mt-10 block scroll-mt-24" [content]="buttonBarContent" />
    <div class="mt-4">
      <app-date-picker-button-bar-demo />
      <div class="mt-3"><app-code-block [code]="datePickerButtonBarCode" /></div>
    </div>

    <app-prose id="example-date-template" class="mt-10 block scroll-mt-24" [content]="dateTemplateContent" />
    <div class="mt-4">
      <app-date-picker-date-template-demo />
      <div class="mt-3"><app-code-block [code]="datePickerDateTemplateCode" /></div>
    </div>

    <app-prose id="example-clear-icon" class="mt-10 block scroll-mt-24" [content]="clearIconContent" />
    <div class="mt-4">
      <app-date-picker-clear-icon-demo />
      <div class="mt-3"><app-code-block [code]="datePickerClearIconCode" /></div>
    </div>

    <app-prose id="example-sizes" class="mt-10 block scroll-mt-24" [content]="sizesContent" />
    <div class="mt-4">
      <app-date-picker-sizes-demo />
      <div class="mt-3"><app-code-block [code]="datePickerSizesCode" /></div>
    </div>

    <app-prose id="example-fluid" class="mt-10 block scroll-mt-24" [content]="fluidContent" />
    <div class="mt-4">
      <app-date-picker-fluid-demo />
      <div class="mt-3"><app-code-block [code]="datePickerFluidCode" /></div>
    </div>

    <app-prose id="example-filled" class="mt-10 block scroll-mt-24" [content]="filledContent" />
    <div class="mt-4">
      <app-date-picker-filled-demo />
      <div class="mt-3"><app-code-block [code]="datePickerFilledCode" /></div>
    </div>

    <app-prose id="example-disabled" class="mt-10 block scroll-mt-24" [content]="disabledContent" />
    <div class="mt-4">
      <app-date-picker-disabled-demo />
      <div class="mt-3"><app-code-block [code]="datePickerDisabledCode" /></div>
    </div>

    <app-prose id="example-invalid" class="mt-10 block scroll-mt-24" [content]="invalidContent" />
    <div class="mt-4">
      <app-date-picker-invalid-demo />
      <div class="mt-3"><app-code-block [code]="datePickerInvalidCode" /></div>
    </div>

    <app-prose id="example-float-label" class="mt-10 block scroll-mt-24" [content]="floatLabelContent" />
    <div class="mt-4">
      <app-date-picker-float-label-demo />
      <div class="mt-3"><app-code-block [code]="datePickerFloatLabelCode" /></div>
    </div>

    <app-prose id="example-ifta-label" class="mt-10 block scroll-mt-24" [content]="iftaLabelContent" />
    <div class="mt-4">
      <app-date-picker-ifta-label-demo />
      <div class="mt-3"><app-code-block [code]="datePickerIftaLabelCode" /></div>
    </div>

    <app-prose id="example-signal-forms" class="mt-10 block scroll-mt-24" [content]="signalFormsContent" />
    <div class="mt-4">
      <app-date-picker-signal-forms-demo />
      <div class="mt-3"><app-code-block [code]="datePickerSignalFormsCode" /></div>
    </div>

    <app-prose id="example-template-driven" class="mt-10 block scroll-mt-24" [content]="templateDrivenContent" />
    <div class="mt-4">
      <app-date-picker-template-driven-demo />
      <div class="mt-3"><app-code-block [code]="datePickerTemplateDrivenCode" /></div>
    </div>

    <app-prose id="example-reactive-forms" class="mt-10 block scroll-mt-24" [content]="reactiveFormsContent" />
    <div class="mt-4">
      <app-date-picker-reactive-forms-demo />
      <div class="mt-3"><app-code-block [code]="datePickerReactiveFormsCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsDatePicker {
  protected readonly examples = EXAMPLES;
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly basicContent = basicContent;
  protected readonly formatContent = formatContent;
  protected readonly localeContent = localeContent;
  protected readonly minMaxContent = minMaxContent;
  protected readonly multipleContent = multipleContent;
  protected readonly rangeContent = rangeContent;
  protected readonly showTimeContent = showTimeContent;
  protected readonly timeOnlyContent = timeOnlyContent;
  protected readonly monthPickerContent = monthPickerContent;
  protected readonly yearPickerContent = yearPickerContent;
  protected readonly multipleMonthsContent = multipleMonthsContent;
  protected readonly drilldownContent = drilldownContent;
  protected readonly inlineContent = inlineContent;
  protected readonly buttonBarContent = buttonBarContent;
  protected readonly dateTemplateContent = dateTemplateContent;
  protected readonly clearIconContent = clearIconContent;
  protected readonly sizesContent = sizesContent;
  protected readonly fluidContent = fluidContent;
  protected readonly filledContent = filledContent;
  protected readonly disabledContent = disabledContent;
  protected readonly invalidContent = invalidContent;
  protected readonly floatLabelContent = floatLabelContent;
  protected readonly iftaLabelContent = iftaLabelContent;
  protected readonly signalFormsContent = signalFormsContent;
  protected readonly templateDrivenContent = templateDrivenContent;
  protected readonly reactiveFormsContent = reactiveFormsContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly datePickerBasicCode = datePickerBasicCode;
  protected readonly datePickerFormatCode = datePickerFormatCode;
  protected readonly datePickerLocaleCode = datePickerLocaleCode;
  protected readonly datePickerMinMaxCode = datePickerMinMaxCode;
  protected readonly datePickerMultipleCode = datePickerMultipleCode;
  protected readonly datePickerRangeCode = datePickerRangeCode;
  protected readonly datePickerShowTimeCode = datePickerShowTimeCode;
  protected readonly datePickerTimeOnlyCode = datePickerTimeOnlyCode;
  protected readonly datePickerMonthPickerCode = datePickerMonthPickerCode;
  protected readonly datePickerYearPickerCode = datePickerYearPickerCode;
  protected readonly datePickerMultipleMonthsCode = datePickerMultipleMonthsCode;
  protected readonly datePickerDrilldownCode = datePickerDrilldownCode;
  protected readonly datePickerInlineCode = datePickerInlineCode;
  protected readonly datePickerButtonBarCode = datePickerButtonBarCode;
  protected readonly datePickerDateTemplateCode = datePickerDateTemplateCode;
  protected readonly datePickerClearIconCode = datePickerClearIconCode;
  protected readonly datePickerSizesCode = datePickerSizesCode;
  protected readonly datePickerFluidCode = datePickerFluidCode;
  protected readonly datePickerFilledCode = datePickerFilledCode;
  protected readonly datePickerDisabledCode = datePickerDisabledCode;
  protected readonly datePickerInvalidCode = datePickerInvalidCode;
  protected readonly datePickerFloatLabelCode = datePickerFloatLabelCode;
  protected readonly datePickerIftaLabelCode = datePickerIftaLabelCode;
  protected readonly datePickerSignalFormsCode = datePickerSignalFormsCode;
  protected readonly datePickerTemplateDrivenCode = datePickerTemplateDrivenCode;
  protected readonly datePickerReactiveFormsCode = datePickerReactiveFormsCode;
}
