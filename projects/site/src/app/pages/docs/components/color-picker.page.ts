import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { ColorPickerBasicDemo } from './demos/color-picker-basic.demo';
import { ColorPickerFormatInlineDemo } from './demos/color-picker-format-inline.demo';

import colorPickerBasicCode from './demos/color-picker-basic.demo.html?raw';
import colorPickerFormatInlineCode from './demos/color-picker-format-inline.demo.html?raw';
import apiEntries from '../../../../content/api/color-picker.json';
import introContent from '../../../../content/docs/color-picker-intro.txt?raw';
import formatInlineContent from '../../../../content/docs/color-picker-format-inline.txt?raw';

const IMPORT_CODE = `import { ColorPickerComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'ColorPicker — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'ColorPicker component docs: a hex-string value, a saturation/hue picker panel with live drag updates, and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-color-picker',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, ColorPickerBasicDemo, ColorPickerFormatInlineDemo],
  template: `
    <app-component-doc title="ColorPicker" slug="color-picker">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-color-picker-basic-demo />
      <div class="mt-3"><app-code-block [code]="colorPickerBasicCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="formatInlineContent" />
    <div class="mt-4">
      <app-color-picker-format-inline-demo />
      <div class="mt-3"><app-code-block [code]="colorPickerFormatInlineCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsColorPicker {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly formatInlineContent = formatInlineContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly colorPickerBasicCode = colorPickerBasicCode;
  protected readonly colorPickerFormatInlineCode = colorPickerFormatInlineCode;
}
