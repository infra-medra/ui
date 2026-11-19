import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { AvatarBasicDemo } from './demos/avatar-basic.demo';

import avatarBasicCode from './demos/avatar-basic.demo.html?raw';
import apiEntries from '../../../../content/api/avatar.json';
import introContent from '../../../../content/docs/avatar-intro.txt?raw';

const IMPORT_CODE = `import { AvatarComponent } from '@medra/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Avatar — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Avatar component docs: image/initials/icon fallback chain with automatic broken-image recovery, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-avatar',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, AvatarBasicDemo],
  template: `
    <app-component-doc title="Avatar" slug="avatar">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div class="mt-4"><app-avatar-basic-demo /></div>
    <div class="mt-3"><app-code-block [code]="avatarBasicCode" /></div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsAvatar {
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly avatarBasicCode = avatarBasicCode;
}
