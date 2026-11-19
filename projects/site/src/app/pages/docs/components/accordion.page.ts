import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { AccordionBasicDemo } from './demos/accordion-basic.demo';
import { AccordionMultipleDemo } from './demos/accordion-multiple.demo';
import { AccordionRichHeaderDemo } from './demos/accordion-rich-header.demo';
import { AccordionEventsDemo } from './demos/accordion-events.demo';

import accordionBasicCode from './demos/accordion-basic.demo.html?raw';
import accordionMultipleCode from './demos/accordion-multiple.demo.html?raw';
import accordionRichHeaderCode from './demos/accordion-rich-header.demo.html?raw';
import accordionEventsCode from './demos/accordion-events.demo.html?raw';
import apiEntries from '../../../../content/api/accordion.json';
import introContent from '../../../../content/docs/accordion-intro.txt?raw';
import multipleContent from '../../../../content/docs/accordion-multiple.txt?raw';
import richHeaderContent from '../../../../content/docs/accordion-rich-header.txt?raw';
import eventsContent from '../../../../content/docs/accordion-events.txt?raw';

const IMPORT_CODE = `import { AccordionComponent, AccordionTabComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Accordion — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Accordion component docs: collapsible panels with single and multiple modes, with live examples and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-accordion',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, AccordionBasicDemo, AccordionMultipleDemo, AccordionRichHeaderDemo, AccordionEventsDemo],
  template: `
    <app-component-doc title="Accordion" slug="accordion">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-accordion-basic-demo />
      <div class="mt-3"><app-code-block [code]="accordionBasicCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="multipleContent" />
    <div class="mt-4">
      <app-accordion-multiple-demo />
      <div class="mt-3"><app-code-block [code]="accordionMultipleCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="richHeaderContent" />
    <div class="mt-4">
      <app-accordion-rich-header-demo />
      <div class="mt-3"><app-code-block [code]="accordionRichHeaderCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="eventsContent" />
    <div class="mt-4">
      <app-accordion-events-demo />
      <div class="mt-3"><app-code-block [code]="accordionEventsCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsAccordion {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly multipleContent = multipleContent;
  protected readonly richHeaderContent = richHeaderContent;
  protected readonly eventsContent = eventsContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly accordionBasicCode = accordionBasicCode;
  protected readonly accordionMultipleCode = accordionMultipleCode;
  protected readonly accordionRichHeaderCode = accordionRichHeaderCode;
  protected readonly accordionEventsCode = accordionEventsCode;
}
