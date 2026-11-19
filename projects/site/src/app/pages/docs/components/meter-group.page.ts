import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { MeterGroupBasicDemo } from './demos/meter-group-basic.demo';
import { MeterGroupVerticalDemo } from './demos/meter-group-vertical.demo';

import meterGroupBasicCode from './demos/meter-group-basic.demo.html?raw';
import meterGroupVerticalCode from './demos/meter-group-vertical.demo.html?raw';
import apiEntries from '../../../../content/api/meter-group.json';
import introContent from '../../../../content/docs/meter-group-intro.txt?raw';
import verticalContent from '../../../../content/docs/meter-group-vertical.txt?raw';

const IMPORT_CODE = `import { MeterGroupComponent, type MeterItem } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'MeterGroup — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'MeterGroup component docs: a segmented bar summarizing several related quantities as proportional-width, severity-colored segments, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-meter-group',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, MeterGroupBasicDemo, MeterGroupVerticalDemo],
  template: `
    <app-component-doc title="MeterGroup" slug="meter-group">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-meter-group-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="meterGroupBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="verticalContent" />
    <div class="mt-4"><app-meter-group-vertical-demo /></div>
    <div class="mt-3"><app-code-block [code]="meterGroupVerticalCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsMeterGroup {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly verticalContent = verticalContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly meterGroupBasicCode = meterGroupBasicCode;
  protected readonly meterGroupVerticalCode = meterGroupVerticalCode;
}
