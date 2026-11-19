import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { TimelineBasicDemo } from './demos/timeline-basic.demo';
import { TimelineMarkerOppositeDemo } from './demos/timeline-marker-opposite.demo';

import timelineBasicCode from './demos/timeline-basic.demo.html?raw';
import timelineMarkerOppositeCode from './demos/timeline-marker-opposite.demo.html?raw';
import apiEntries from '../../../../content/api/timeline.json';
import introContent from '../../../../content/docs/timeline-intro.txt?raw';
import markerOppositeContent from '../../../../content/docs/timeline-marker-opposite.txt?raw';

const IMPORT_CODE = `import { TimelineComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Timeline — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Timeline component docs: a vertical list of connected events with a single content-projection template per item, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-timeline',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, TimelineBasicDemo, TimelineMarkerOppositeDemo],
  template: `
    <app-component-doc title="Timeline" slug="timeline">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-timeline-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="timelineBasicCode" /></div>

    <app-prose class="mt-10 block" [content]="markerOppositeContent" />
    <div class="mt-4"><app-timeline-marker-opposite-demo /></div>
    <div class="mt-3"><app-code-block [code]="timelineMarkerOppositeCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsTimeline {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly markerOppositeContent = markerOppositeContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly timelineBasicCode = timelineBasicCode;
  protected readonly timelineMarkerOppositeCode = timelineMarkerOppositeCode;
}
