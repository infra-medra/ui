import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { AvatarGroupBasicDemo } from './demos/avatar-group-basic.demo';

import avatarGroupBasicCode from './demos/avatar-group-basic.demo.html?raw';
import apiEntries from '../../../../content/api/avatar-group.json';
import introContent from '../../../../content/docs/avatar-group-intro.txt?raw';

const IMPORT_CODE = `import { AvatarGroupComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'AvatarGroup — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'AvatarGroup component docs: a thin flex wrapper that overlaps projected Avatar children into a stacked facepile, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-avatar-group',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, AvatarGroupBasicDemo],
  template: `
    <app-component-doc title="AvatarGroup" slug="avatar-group">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-avatar-group-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="avatarGroupBasicCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsAvatarGroup {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly avatarGroupBasicCode = avatarGroupBasicCode;
}
