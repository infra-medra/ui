import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { GalleriaBasicDemo } from './demos/galleria-basic.demo';
import { GalleriaAutoplayDemo } from './demos/galleria-autoplay.demo';

import galleriaBasicCode from './demos/galleria-basic.demo.html?raw';
import galleriaAutoplayCode from './demos/galleria-autoplay.demo.html?raw';
import apiEntries from '../../../../content/api/galleria.json';
import introContent from '../../../../content/docs/galleria-intro.txt?raw';
import autoplayContent from '../../../../content/docs/galleria-autoplay.txt?raw';

const IMPORT_CODE = `import { GalleriaComponent, type GalleriaItem } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Galleria — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Galleria component docs: a main image with a synchronized thumbnail strip, reusing Image’s own full-screen preview, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-galleria',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, GalleriaBasicDemo, GalleriaAutoplayDemo],
  template: `
    <app-component-doc title="Galleria" slug="galleria">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-galleria-basic-demo />
      <div class="mt-3"><app-code-block [code]="galleriaBasicCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="autoplayContent" />
    <div class="mt-4">
      <app-galleria-autoplay-demo />
      <div class="mt-3"><app-code-block [code]="galleriaAutoplayCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsGalleria {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly autoplayContent = autoplayContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly galleriaBasicCode = galleriaBasicCode;
  protected readonly galleriaAutoplayCode = galleriaAutoplayCode;
}
