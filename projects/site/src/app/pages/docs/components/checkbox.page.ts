import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { CheckboxBasicDemo } from './demos/checkbox-basic.demo';
import { CheckboxGroupDemo } from './demos/checkbox-group.demo';
import { CheckboxIndeterminateDemo } from './demos/checkbox-indeterminate.demo';
import { CheckboxDynamicDemo } from './demos/checkbox-dynamic.demo';
import { CheckboxSizesDemo } from './demos/checkbox-sizes.demo';
import { CheckboxFilledDemo } from './demos/checkbox-filled.demo';
import { CheckboxDisabledDemo } from './demos/checkbox-disabled.demo';
import { CheckboxInvalidDemo } from './demos/checkbox-invalid.demo';
import { CheckboxSignalFormsDemo } from './demos/checkbox-signal-forms.demo';
import { CheckboxTemplateDrivenDemo } from './demos/checkbox-template-driven.demo';
import { CheckboxReactiveFormsDemo } from './demos/checkbox-reactive-forms.demo';

import checkboxBasicCode from './demos/checkbox-basic.demo.html?raw';
import checkboxGroupCode from './demos/checkbox-group.demo.html?raw';
import checkboxIndeterminateCode from './demos/checkbox-indeterminate.demo.html?raw';
import checkboxDynamicCode from './demos/checkbox-dynamic.demo.html?raw';
import checkboxSizesCode from './demos/checkbox-sizes.demo.html?raw';
import checkboxFilledCode from './demos/checkbox-filled.demo.html?raw';
import checkboxDisabledCode from './demos/checkbox-disabled.demo.html?raw';
import checkboxInvalidCode from './demos/checkbox-invalid.demo.html?raw';
import checkboxSignalFormsCode from './demos/checkbox-signal-forms.demo.html?raw';
import checkboxTemplateDrivenCode from './demos/checkbox-template-driven.demo.html?raw';
import checkboxReactiveFormsCode from './demos/checkbox-reactive-forms.demo.html?raw';

import apiEntries from '../../../../content/api/checkbox.json';
import introContent from '../../../../content/docs/checkbox-intro.txt?raw';
import basicContent from '../../../../content/docs/checkbox-basic.txt?raw';
import groupContent from '../../../../content/docs/checkbox-group.txt?raw';
import indeterminateContent from '../../../../content/docs/checkbox-indeterminate.txt?raw';
import dynamicContent from '../../../../content/docs/checkbox-dynamic.txt?raw';
import sizesContent from '../../../../content/docs/checkbox-sizes.txt?raw';
import filledContent from '../../../../content/docs/checkbox-filled.txt?raw';
import disabledContent from '../../../../content/docs/checkbox-disabled.txt?raw';
import invalidContent from '../../../../content/docs/checkbox-invalid.txt?raw';
import signalFormsContent from '../../../../content/docs/checkbox-signal-forms.txt?raw';
import templateDrivenContent from '../../../../content/docs/checkbox-template-driven.txt?raw';
import reactiveFormsContent from '../../../../content/docs/checkbox-reactive-forms.txt?raw';

const EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-group', label: 'Group' },
  { id: 'example-indeterminate', label: 'Indeterminate' },
  { id: 'example-dynamic', label: 'Dynamic' },
  { id: 'example-sizes', label: 'Sizes' },
  { id: 'example-filled', label: 'Filled' },
  { id: 'example-disabled', label: 'Disabled' },
  { id: 'example-invalid', label: 'Invalid' },
  { id: 'example-signal-forms', label: 'Signal Forms' },
  { id: 'example-template-driven', label: 'Template Driven' },
  { id: 'example-reactive-forms', label: 'Reactive Forms' },
] as const;

const IMPORT_CODE = `import { CheckboxComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Checkbox — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Checkbox component docs: groups, indeterminate state, sizes, variants, ControlValueAccessor forms integration, and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-checkbox',
  imports: [
    ComponentDocComponent,
    ProseComponent,
    ApiTableComponent,
    CodeBlockComponent,
    CheckboxBasicDemo,
    CheckboxGroupDemo,
    CheckboxIndeterminateDemo,
    CheckboxDynamicDemo,
    CheckboxSizesDemo,
    CheckboxFilledDemo,
    CheckboxDisabledDemo,
    CheckboxInvalidDemo,
    CheckboxSignalFormsDemo,
    CheckboxTemplateDrivenDemo,
    CheckboxReactiveFormsDemo,
  ],
  template: `
    <app-component-doc title="Checkbox" slug="checkbox" [examples]="examples">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />

    <app-prose id="example-basic" class="mt-10 block scroll-mt-24" [content]="basicContent" />
    <div class="mt-4">
      <app-checkbox-basic-demo />
      <div class="mt-3"><app-code-block [code]="checkboxBasicCode" /></div>
    </div>

    <app-prose id="example-group" class="mt-10 block scroll-mt-24" [content]="groupContent" />
    <div class="mt-4">
      <app-checkbox-group-demo />
      <div class="mt-3"><app-code-block [code]="checkboxGroupCode" /></div>
    </div>

    <app-prose id="example-indeterminate" class="mt-10 block scroll-mt-24" [content]="indeterminateContent" />
    <div class="mt-4">
      <app-checkbox-indeterminate-demo />
      <div class="mt-3"><app-code-block [code]="checkboxIndeterminateCode" /></div>
    </div>

    <app-prose id="example-dynamic" class="mt-10 block scroll-mt-24" [content]="dynamicContent" />
    <div class="mt-4">
      <app-checkbox-dynamic-demo />
      <div class="mt-3"><app-code-block [code]="checkboxDynamicCode" /></div>
    </div>

    <app-prose id="example-sizes" class="mt-10 block scroll-mt-24" [content]="sizesContent" />
    <div class="mt-4">
      <app-checkbox-sizes-demo />
      <div class="mt-3"><app-code-block [code]="checkboxSizesCode" /></div>
    </div>

    <app-prose id="example-filled" class="mt-10 block scroll-mt-24" [content]="filledContent" />
    <div class="mt-4">
      <app-checkbox-filled-demo />
      <div class="mt-3"><app-code-block [code]="checkboxFilledCode" /></div>
    </div>

    <app-prose id="example-disabled" class="mt-10 block scroll-mt-24" [content]="disabledContent" />
    <div class="mt-4">
      <app-checkbox-disabled-demo />
      <div class="mt-3"><app-code-block [code]="checkboxDisabledCode" /></div>
    </div>

    <app-prose id="example-invalid" class="mt-10 block scroll-mt-24" [content]="invalidContent" />
    <div class="mt-4">
      <app-checkbox-invalid-demo />
      <div class="mt-3"><app-code-block [code]="checkboxInvalidCode" /></div>
    </div>

    <app-prose id="example-signal-forms" class="mt-10 block scroll-mt-24" [content]="signalFormsContent" />
    <div class="mt-4">
      <app-checkbox-signal-forms-demo />
      <div class="mt-3"><app-code-block [code]="checkboxSignalFormsCode" /></div>
    </div>

    <app-prose id="example-template-driven" class="mt-10 block scroll-mt-24" [content]="templateDrivenContent" />
    <div class="mt-4">
      <app-checkbox-template-driven-demo />
      <div class="mt-3"><app-code-block [code]="checkboxTemplateDrivenCode" /></div>
    </div>

    <app-prose id="example-reactive-forms" class="mt-10 block scroll-mt-24" [content]="reactiveFormsContent" />
    <div class="mt-4">
      <app-checkbox-reactive-forms-demo />
      <div class="mt-3"><app-code-block [code]="checkboxReactiveFormsCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsCheckbox {
  protected readonly examples = EXAMPLES;
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly basicContent = basicContent;
  protected readonly groupContent = groupContent;
  protected readonly indeterminateContent = indeterminateContent;
  protected readonly dynamicContent = dynamicContent;
  protected readonly sizesContent = sizesContent;
  protected readonly filledContent = filledContent;
  protected readonly disabledContent = disabledContent;
  protected readonly invalidContent = invalidContent;
  protected readonly signalFormsContent = signalFormsContent;
  protected readonly templateDrivenContent = templateDrivenContent;
  protected readonly reactiveFormsContent = reactiveFormsContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly checkboxBasicCode = checkboxBasicCode;
  protected readonly checkboxGroupCode = checkboxGroupCode;
  protected readonly checkboxIndeterminateCode = checkboxIndeterminateCode;
  protected readonly checkboxDynamicCode = checkboxDynamicCode;
  protected readonly checkboxSizesCode = checkboxSizesCode;
  protected readonly checkboxFilledCode = checkboxFilledCode;
  protected readonly checkboxDisabledCode = checkboxDisabledCode;
  protected readonly checkboxInvalidCode = checkboxInvalidCode;
  protected readonly checkboxSignalFormsCode = checkboxSignalFormsCode;
  protected readonly checkboxTemplateDrivenCode = checkboxTemplateDrivenCode;
  protected readonly checkboxReactiveFormsCode = checkboxReactiveFormsCode;
}
