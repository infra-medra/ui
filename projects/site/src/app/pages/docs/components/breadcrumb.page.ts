import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { BreadcrumbBasicDemo } from './demos/breadcrumb-basic.demo';
import { BreadcrumbHomeTemplatesDemo } from './demos/breadcrumb-home-templates.demo';

import breadcrumbBasicCode from './demos/breadcrumb-basic.demo.html?raw';
import breadcrumbHomeTemplatesCode from './demos/breadcrumb-home-templates.demo.html?raw';
import apiEntries from '../../../../content/api/breadcrumb.json';
import introContent from '../../../../content/docs/breadcrumb-intro.txt?raw';
import homeTemplatesContent from '../../../../content/docs/breadcrumb-home-templates.txt?raw';

const IMPORT_CODE = `import { BreadcrumbComponent, type BreadcrumbItem } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Breadcrumb — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Breadcrumb component docs: real navigable links with router-friendly item selection, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-breadcrumb',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, BreadcrumbBasicDemo, BreadcrumbHomeTemplatesDemo],
  template: `
    <app-component-doc title="Breadcrumb" slug="breadcrumb">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-breadcrumb-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="breadcrumbBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="homeTemplatesContent" />
    <div class="mt-4"><app-breadcrumb-home-templates-demo /></div>
    <div class="mt-3"><app-code-block [code]="breadcrumbHomeTemplatesCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsBreadcrumb {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly homeTemplatesContent = homeTemplatesContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly breadcrumbBasicCode = breadcrumbBasicCode;
  protected readonly breadcrumbHomeTemplatesCode = breadcrumbHomeTemplatesCode;
}
