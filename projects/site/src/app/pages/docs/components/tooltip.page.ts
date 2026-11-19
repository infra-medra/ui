import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { TooltipBasicDemo } from './demos/tooltip-basic.demo';
import { TooltipStatesDemo } from './demos/tooltip-states.demo';
import { TooltipBehaviorDemo } from './demos/tooltip-behavior.demo';

import tooltipBasicCode from './demos/tooltip-basic.demo.html?raw';
import tooltipStatesCode from './demos/tooltip-states.demo.html?raw';
import tooltipBehaviorCode from './demos/tooltip-behavior.demo.html?raw';
import apiEntries from '../../../../content/api/tooltip.json';
import introContent from '../../../../content/docs/tooltip-intro.txt?raw';
import statesContent from '../../../../content/docs/tooltip-states.txt?raw';
import behaviorContent from '../../../../content/docs/tooltip-behavior.txt?raw';

const IMPORT_CODE = `import { ButtonDirective, TooltipDirective } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Tooltip — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Tooltip directive docs: hover/focus positioning, timing, and touch behavior, with live examples and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-tooltip',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, TooltipBasicDemo, TooltipStatesDemo, TooltipBehaviorDemo],
  template: `
    <app-component-doc title="Tooltip" slug="tooltip">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-tooltip-basic-demo />
      <div class="mt-3"><app-code-block [code]="tooltipBasicCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="statesContent" />
    <div class="mt-4">
      <app-tooltip-states-demo />
      <div class="mt-3"><app-code-block [code]="tooltipStatesCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="behaviorContent" />
    <div class="mt-4">
      <app-tooltip-behavior-demo />
      <div class="mt-3"><app-code-block [code]="tooltipBehaviorCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsTooltip {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly statesContent = statesContent;
  protected readonly behaviorContent = behaviorContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly tooltipBasicCode = tooltipBasicCode;
  protected readonly tooltipStatesCode = tooltipStatesCode;
  protected readonly tooltipBehaviorCode = tooltipBehaviorCode;
}
