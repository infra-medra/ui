import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { SpeedDialBasicDemo } from './demos/speed-dial-basic.demo';
import { SpeedDialDirectionDemo } from './demos/speed-dial-direction.demo';
import { SpeedDialMaskDemo } from './demos/speed-dial-mask.demo';

import speedDialBasicCode from './demos/speed-dial-basic.demo.html?raw';
import speedDialDirectionCode from './demos/speed-dial-direction.demo.html?raw';
import speedDialMaskCode from './demos/speed-dial-mask.demo.html?raw';
import apiEntries from '../../../../content/api/speed-dial.json';
import introContent from '../../../../content/docs/speed-dial-intro.txt?raw';
import directionContent from '../../../../content/docs/speed-dial-direction.txt?raw';
import maskContent from '../../../../content/docs/speed-dial-mask.txt?raw';

const IMPORT_CODE = `import { SpeedDialComponent, type MenuItem } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'SpeedDial — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'SpeedDial component docs: a floating action button that reveals related actions, with live examples and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-speed-dial',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, SpeedDialBasicDemo, SpeedDialDirectionDemo, SpeedDialMaskDemo],
  template: `
    <app-component-doc title="SpeedDial" slug="speed-dial">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4">
      <app-speed-dial-basic-demo />
      <div class="mt-3"><app-code-block [code]="speedDialBasicCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="directionContent" />
    <div class="mt-4">
      <app-speed-dial-direction-demo />
      <div class="mt-3"><app-code-block [code]="speedDialDirectionCode" /></div>
    </div>

    <app-prose class="mt-10 block" [content]="maskContent" />
    <div class="mt-4">
      <app-speed-dial-mask-demo />
      <div class="mt-3"><app-code-block [code]="speedDialMaskCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsSpeedDial {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly directionContent = directionContent;
  protected readonly maskContent = maskContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly speedDialBasicCode = speedDialBasicCode;
  protected readonly speedDialDirectionCode = speedDialDirectionCode;
  protected readonly speedDialMaskCode = speedDialMaskCode;
}
