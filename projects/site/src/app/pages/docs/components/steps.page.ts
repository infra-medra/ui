import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { StepsBasicDemo } from './demos/steps-basic.demo';

import stepsBasicCode from './demos/steps-basic.demo.html?raw';
import apiEntries from '../../../../content/api/steps.json';
import introContent from '../../../../content/docs/steps-intro.txt?raw';

const IMPORT_CODE = `import { ButtonDirective, StepsComponent, type StepItem } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Steps — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Steps component docs: a numbered progress/navigation indicator with roving-tabindex keyboard support, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-steps',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, StepsBasicDemo],
  template: `
    <app-component-doc title="Steps" slug="steps">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-steps-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="stepsBasicCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsSteps {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly stepsBasicCode = stepsBasicCode;
}
