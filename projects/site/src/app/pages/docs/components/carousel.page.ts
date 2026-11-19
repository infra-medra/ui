import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { CarouselBasicDemo } from './demos/carousel-basic.demo';
import { CarouselNavIconsDemo } from './demos/carousel-nav-icons.demo';
import { CarouselResponsiveDemo } from './demos/carousel-responsive.demo';
import { CarouselVerticalDemo } from './demos/carousel-vertical.demo';

import carouselBasicCode from './demos/carousel-basic.demo.html?raw';
import carouselNavIconsCode from './demos/carousel-nav-icons.demo.html?raw';
import carouselResponsiveCode from './demos/carousel-responsive.demo.html?raw';
import carouselVerticalCode from './demos/carousel-vertical.demo.html?raw';
import apiEntries from '../../../../content/api/carousel.json';
import introContent from '../../../../content/docs/carousel-intro.txt?raw';
import navIconsContent from '../../../../content/docs/carousel-nav-icons.txt?raw';
import responsiveContent from '../../../../content/docs/carousel-responsive.txt?raw';
import verticalContent from '../../../../content/docs/carousel-vertical.txt?raw';

const IMPORT_CODE = `import { CarouselComponent } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Carousel — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Carousel component docs: a paged item track with consumer-templated content, optional autoplay, and clamped (non-looping) navigation, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-carousel',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, CarouselBasicDemo, CarouselNavIconsDemo, CarouselResponsiveDemo, CarouselVerticalDemo],
  template: `
    <app-component-doc title="Carousel" slug="carousel">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-carousel-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="carouselBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="navIconsContent" />
    <div class="mt-4"><app-carousel-nav-icons-demo /></div>
    <div class="mt-3"><app-code-block [code]="carouselNavIconsCode" /></div>

    <app-prose class="mt-10 block" [content]="responsiveContent" />
    <div class="mt-4">
      <app-carousel-responsive-demo />
      <div class="mt-3"><app-code-block [code]="carouselResponsiveCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="verticalContent" />
    <div class="mt-4">
      <app-carousel-vertical-demo />
      <div class="mt-3"><app-code-block [code]="carouselVerticalCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsCarousel {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly navIconsContent = navIconsContent;
  protected readonly responsiveContent = responsiveContent;
  protected readonly verticalContent = verticalContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly carouselBasicCode = carouselBasicCode;
  protected readonly carouselNavIconsCode = carouselNavIconsCode;
  protected readonly carouselResponsiveCode = carouselResponsiveCode;
  protected readonly carouselVerticalCode = carouselVerticalCode;
}
