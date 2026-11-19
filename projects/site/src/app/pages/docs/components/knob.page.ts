import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { KnobBasicDemo } from './demos/knob-basic.demo';
import { KnobColorsTemplateDemo } from './demos/knob-colors-template.demo';

import knobBasicCode from './demos/knob-basic.demo.html?raw';
import knobColorsTemplateCode from './demos/knob-colors-template.demo.html?raw';
import apiEntries from '../../../../content/api/knob.json';
import introContent from '../../../../content/docs/knob-intro.txt?raw';
import colorsTemplateContent from '../../../../content/docs/knob-colors-template.txt?raw';

const IMPORT_CODE = `import { KnobComponent } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Knob — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Knob component docs: a circular numeric dial with min/max/step, keyboard support, and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-knob',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, KnobBasicDemo, KnobColorsTemplateDemo],
  template: `
    <app-component-doc title="Knob" slug="knob">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-knob-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="knobBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="colorsTemplateContent" />
    <div class="mt-4"><app-knob-colors-template-demo /></div>
    <div class="mt-3"><app-code-block [code]="knobColorsTemplateCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsKnob {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly colorsTemplateContent = colorsTemplateContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly knobBasicCode = knobBasicCode;
  protected readonly knobColorsTemplateCode = knobColorsTemplateCode;
}
