import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { StepperBasicDemo } from './demos/stepper-basic.demo';
import { StepperVerticalDemo } from './demos/stepper-vertical.demo';

import stepperBasicCode from './demos/stepper-basic.demo.html?raw';
import stepperVerticalCode from './demos/stepper-vertical.demo.html?raw';
import apiEntries from '../../../../content/api/stepper.json';
import introContent from '../../../../content/docs/stepper-intro.txt?raw';
import verticalContent from '../../../../content/docs/stepper-vertical.txt?raw';

const IMPORT_CODE = `import { StepPanelComponent, StepperComponent } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Stepper — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Stepper component docs: a wizard built on Steps with linear and free navigation modes, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-stepper',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, StepperBasicDemo, StepperVerticalDemo],
  template: `
    <app-component-doc title="Stepper" slug="stepper">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-stepper-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="stepperBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="verticalContent" />
    <div class="mt-4"><app-stepper-vertical-demo /></div>
    <div class="mt-3"><app-code-block [code]="stepperVerticalCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsStepper {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly verticalContent = verticalContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly stepperBasicCode = stepperBasicCode;
  protected readonly stepperVerticalCode = stepperVerticalCode;
}
