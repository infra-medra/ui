import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { OrganizationChartBasicDemo } from './demos/organization-chart-basic.demo';
import { OrganizationChartCheckboxDemo } from './demos/organization-chart-checkbox.demo';

import organizationChartBasicCode from './demos/organization-chart-basic.demo.html?raw';
import organizationChartCheckboxCode from './demos/organization-chart-checkbox.demo.html?raw';
import apiEntries from '../../../../content/api/organization-chart.json';
import introContent from '../../../../content/docs/organization-chart-intro.txt?raw';
import checkboxContent from '../../../../content/docs/organization-chart-checkbox.txt?raw';

const IMPORT_CODE = `import { OrganizationChartComponent, type OrgChartNode } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'OrganizationChart — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'OrganizationChart component docs: a single-root hierarchy rendered as a recursive, pure-CSS connector tree with optional single/multiple/cascading-checkbox node selection, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-organization-chart',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, OrganizationChartBasicDemo, OrganizationChartCheckboxDemo],
  template: `
    <app-component-doc title="OrganizationChart" slug="organization-chart">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-organization-chart-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="organizationChartBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="checkboxContent" />
    <div class="mt-4">
      <app-organization-chart-checkbox-demo />
      <div class="mt-3"><app-code-block [code]="organizationChartCheckboxCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsOrganizationChart {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly checkboxContent = checkboxContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly organizationChartBasicCode = organizationChartBasicCode;
  protected readonly organizationChartCheckboxCode = organizationChartCheckboxCode;
}
