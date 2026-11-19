import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { DatePickerBasicDemo } from './demos/date-picker-basic.demo';
import { DatePickerShowTimeDemo } from './demos/date-picker-show-time.demo';
import { DatePickerMultipleMonthDemo } from './demos/date-picker-multiple-month.demo';

import datePickerBasicCode from './demos/date-picker-basic.demo.html?raw';
import datePickerShowTimeCode from './demos/date-picker-show-time.demo.html?raw';
import datePickerMultipleMonthCode from './demos/date-picker-multiple-month.demo.html?raw';
import apiEntries from '../../../../content/api/date-picker.json';
import introContent from '../../../../content/docs/date-picker-intro.txt?raw';
import showTimeContent from '../../../../content/docs/date-picker-show-time.txt?raw';
import multipleMonthContent from '../../../../content/docs/date-picker-multiple-month.txt?raw';

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
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, DatePickerBasicDemo, DatePickerShowTimeDemo, DatePickerMultipleMonthDemo],
  template: `
    <app-component-doc title="DatePicker" slug="date-picker">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-date-picker-basic-demo />
      <div class="mt-3"><app-code-block [code]="datePickerBasicCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="showTimeContent" />
    <div class="mt-4">
      <app-date-picker-show-time-demo />
      <div class="mt-3"><app-code-block [code]="datePickerShowTimeCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="multipleMonthContent" />
    <div class="mt-4">
      <app-date-picker-multiple-month-demo />
      <div class="mt-3"><app-code-block [code]="datePickerMultipleMonthCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsDatePicker {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly showTimeContent = showTimeContent;
  protected readonly multipleMonthContent = multipleMonthContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly datePickerBasicCode = datePickerBasicCode;
  protected readonly datePickerShowTimeCode = datePickerShowTimeCode;
  protected readonly datePickerMultipleMonthCode = datePickerMultipleMonthCode;
}
