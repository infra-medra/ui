import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { TextareaBasicDemo } from './demos/textarea-basic.demo';
import { TextareaAutoresizeDemo } from './demos/textarea-autoresize.demo';
import { TextareaFloatLabelDemo } from './demos/textarea-float-label.demo';
import { TextareaIftaLabelDemo } from './demos/textarea-ifta-label.demo';
import { TextareaSizesDemo } from './demos/textarea-sizes.demo';
import { TextareaFluidDemo } from './demos/textarea-fluid.demo';
import { TextareaFilledDemo } from './demos/textarea-filled.demo';
import { TextareaDisabledDemo } from './demos/textarea-disabled.demo';
import { TextareaInvalidDemo } from './demos/textarea-invalid.demo';
import { TextareaSignalFormsDemo } from './demos/textarea-signal-forms.demo';
import { TextareaTemplateDrivenDemo } from './demos/textarea-template-driven.demo';
import { TextareaReactiveFormsDemo } from './demos/textarea-reactive-forms.demo';

import textareaBasicCode from './demos/textarea-basic.demo.html?raw';
import textareaAutoresizeCode from './demos/textarea-autoresize.demo.html?raw';
import textareaFloatLabelCode from './demos/textarea-float-label.demo.html?raw';
import textareaIftaLabelCode from './demos/textarea-ifta-label.demo.html?raw';
import textareaSizesCode from './demos/textarea-sizes.demo.html?raw';
import textareaFluidCode from './demos/textarea-fluid.demo.html?raw';
import textareaFilledCode from './demos/textarea-filled.demo.html?raw';
import textareaDisabledCode from './demos/textarea-disabled.demo.html?raw';
import textareaInvalidCode from './demos/textarea-invalid.demo.html?raw';
import textareaSignalFormsCode from './demos/textarea-signal-forms.demo.html?raw';
import textareaTemplateDrivenCode from './demos/textarea-template-driven.demo.html?raw';
import textareaReactiveFormsCode from './demos/textarea-reactive-forms.demo.html?raw';

import apiEntries from '../../../../content/api/textarea.json';
import introContent from '../../../../content/docs/textarea-intro.txt?raw';
import basicContent from '../../../../content/docs/textarea-basic.txt?raw';
import autoresizeContent from '../../../../content/docs/textarea-autoresize.txt?raw';
import floatLabelContent from '../../../../content/docs/textarea-float-label.txt?raw';
import iftaLabelContent from '../../../../content/docs/textarea-ifta-label.txt?raw';
import sizesContent from '../../../../content/docs/textarea-sizes.txt?raw';
import fluidContent from '../../../../content/docs/textarea-fluid.txt?raw';
import filledContent from '../../../../content/docs/textarea-filled.txt?raw';
import disabledContent from '../../../../content/docs/textarea-disabled.txt?raw';
import invalidContent from '../../../../content/docs/textarea-invalid.txt?raw';
import signalFormsContent from '../../../../content/docs/textarea-signal-forms.txt?raw';
import templateDrivenContent from '../../../../content/docs/textarea-template-driven.txt?raw';
import reactiveFormsContent from '../../../../content/docs/textarea-reactive-forms.txt?raw';

const EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-auto-resize', label: 'Auto Resize' },
  { id: 'example-float-label', label: 'Float Label' },
  { id: 'example-ifta-label', label: 'Ifta Label' },
  { id: 'example-sizes', label: 'Sizes' },
  { id: 'example-fluid', label: 'Fluid' },
  { id: 'example-filled', label: 'Filled' },
  { id: 'example-disabled', label: 'Disabled' },
  { id: 'example-invalid', label: 'Invalid' },
  { id: 'example-signal-forms', label: 'Signal Forms' },
  { id: 'example-template-driven', label: 'Template Driven' },
  { id: 'example-reactive-forms', label: 'Reactive Forms' },
] as const;

const IMPORT_CODE = `import { TextareaDirective } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Textarea — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Textarea component docs: auto-resize, labels, sizes, variants, states, ControlValueAccessor forms integration, and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-textarea',
  imports: [
    ComponentDocComponent,
    ProseComponent,
    ApiTableComponent,
    CodeBlockComponent,
    TextareaBasicDemo,
    TextareaAutoresizeDemo,
    TextareaFloatLabelDemo,
    TextareaIftaLabelDemo,
    TextareaSizesDemo,
    TextareaFluidDemo,
    TextareaFilledDemo,
    TextareaDisabledDemo,
    TextareaInvalidDemo,
    TextareaSignalFormsDemo,
    TextareaTemplateDrivenDemo,
    TextareaReactiveFormsDemo,
  ],
  template: `
    <app-component-doc title="Textarea" slug="textarea" [examples]="examples">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />

    <app-prose id="example-basic" class="mt-10 block scroll-mt-24" [content]="basicContent" />
    <div class="mt-4">
      <app-textarea-basic-demo />
      <div class="mt-3"><app-code-block [code]="textareaBasicCode" /></div>
    </div>

    <app-prose id="example-auto-resize" class="mt-10 block scroll-mt-24" [content]="autoresizeContent" />
    <div class="mt-4">
      <app-textarea-autoresize-demo />
      <div class="mt-3"><app-code-block [code]="textareaAutoresizeCode" /></div>
    </div>

    <app-prose id="example-float-label" class="mt-10 block scroll-mt-24" [content]="floatLabelContent" />
    <div class="mt-4">
      <app-textarea-float-label-demo />
      <div class="mt-3"><app-code-block [code]="textareaFloatLabelCode" /></div>
    </div>

    <app-prose id="example-ifta-label" class="mt-10 block scroll-mt-24" [content]="iftaLabelContent" />
    <div class="mt-4">
      <app-textarea-ifta-label-demo />
      <div class="mt-3"><app-code-block [code]="textareaIftaLabelCode" /></div>
    </div>

    <app-prose id="example-sizes" class="mt-10 block scroll-mt-24" [content]="sizesContent" />
    <div class="mt-4">
      <app-textarea-sizes-demo />
      <div class="mt-3"><app-code-block [code]="textareaSizesCode" /></div>
    </div>

    <app-prose id="example-fluid" class="mt-10 block scroll-mt-24" [content]="fluidContent" />
    <div class="mt-4">
      <app-textarea-fluid-demo />
      <div class="mt-3"><app-code-block [code]="textareaFluidCode" /></div>
    </div>

    <app-prose id="example-filled" class="mt-10 block scroll-mt-24" [content]="filledContent" />
    <div class="mt-4">
      <app-textarea-filled-demo />
      <div class="mt-3"><app-code-block [code]="textareaFilledCode" /></div>
    </div>

    <app-prose id="example-disabled" class="mt-10 block scroll-mt-24" [content]="disabledContent" />
    <div class="mt-4">
      <app-textarea-disabled-demo />
      <div class="mt-3"><app-code-block [code]="textareaDisabledCode" /></div>
    </div>

    <app-prose id="example-invalid" class="mt-10 block scroll-mt-24" [content]="invalidContent" />
    <div class="mt-4">
      <app-textarea-invalid-demo />
      <div class="mt-3"><app-code-block [code]="textareaInvalidCode" /></div>
    </div>

    <app-prose id="example-signal-forms" class="mt-10 block scroll-mt-24" [content]="signalFormsContent" />
    <div class="mt-4">
      <app-textarea-signal-forms-demo />
      <div class="mt-3"><app-code-block [code]="textareaSignalFormsCode" /></div>
    </div>

    <app-prose id="example-template-driven" class="mt-10 block scroll-mt-24" [content]="templateDrivenContent" />
    <div class="mt-4">
      <app-textarea-template-driven-demo />
      <div class="mt-3"><app-code-block [code]="textareaTemplateDrivenCode" /></div>
    </div>

    <app-prose id="example-reactive-forms" class="mt-10 block scroll-mt-24" [content]="reactiveFormsContent" />
    <div class="mt-4">
      <app-textarea-reactive-forms-demo />
      <div class="mt-3"><app-code-block [code]="textareaReactiveFormsCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsTextarea {
  protected readonly examples = EXAMPLES;
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly basicContent = basicContent;
  protected readonly autoresizeContent = autoresizeContent;
  protected readonly floatLabelContent = floatLabelContent;
  protected readonly iftaLabelContent = iftaLabelContent;
  protected readonly sizesContent = sizesContent;
  protected readonly fluidContent = fluidContent;
  protected readonly filledContent = filledContent;
  protected readonly disabledContent = disabledContent;
  protected readonly invalidContent = invalidContent;
  protected readonly signalFormsContent = signalFormsContent;
  protected readonly templateDrivenContent = templateDrivenContent;
  protected readonly reactiveFormsContent = reactiveFormsContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly textareaBasicCode = textareaBasicCode;
  protected readonly textareaAutoresizeCode = textareaAutoresizeCode;
  protected readonly textareaFloatLabelCode = textareaFloatLabelCode;
  protected readonly textareaIftaLabelCode = textareaIftaLabelCode;
  protected readonly textareaSizesCode = textareaSizesCode;
  protected readonly textareaFluidCode = textareaFluidCode;
  protected readonly textareaFilledCode = textareaFilledCode;
  protected readonly textareaDisabledCode = textareaDisabledCode;
  protected readonly textareaInvalidCode = textareaInvalidCode;
  protected readonly textareaSignalFormsCode = textareaSignalFormsCode;
  protected readonly textareaTemplateDrivenCode = textareaTemplateDrivenCode;
  protected readonly textareaReactiveFormsCode = textareaReactiveFormsCode;
}
