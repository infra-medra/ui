import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { ImageBasicDemo } from './demos/image-basic.demo';
import { ImageDimensionsDemo } from './demos/image-dimensions.demo';

import imageBasicCode from './demos/image-basic.demo.html?raw';
import imageDimensionsCode from './demos/image-dimensions.demo.html?raw';
import apiEntries from '../../../../content/api/image.json';
import introContent from '../../../../content/docs/image-intro.txt?raw';
import dimensionsContent from '../../../../content/docs/image-dimensions.txt?raw';

const IMPORT_CODE = `import { ImageComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Image — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Image component docs: an img wrapper with an optional full-screen zoom preview and a broken-image fallback, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-image',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, ImageBasicDemo, ImageDimensionsDemo],
  template: `
    <app-component-doc title="Image" slug="image">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-image-basic-demo />
      <div class="mt-3"><app-code-block [code]="imageBasicCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="dimensionsContent" />
    <div class="mt-4">
      <app-image-dimensions-demo />
      <div class="mt-3"><app-code-block [code]="imageDimensionsCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsImage {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly dimensionsContent = dimensionsContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly imageBasicCode = imageBasicCode;
  protected readonly imageDimensionsCode = imageDimensionsCode;
}
