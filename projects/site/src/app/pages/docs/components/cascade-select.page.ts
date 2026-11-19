import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { CascadeSelectBasicDemo } from './demos/cascade-select-basic.demo';
import { CascadeSelectDataModelDemo } from './demos/cascade-select-data-model.demo';
import { CascadeSelectTemplateValueDemo } from './demos/cascade-select-template-value.demo';
import { CascadeSelectTemplateOptionDemo } from './demos/cascade-select-template-option.demo';
import { CascadeSelectTemplateHeaderFooterDemo } from './demos/cascade-select-template-header-footer.demo';
import { CascadeSelectTemplateIconsDemo } from './demos/cascade-select-template-icons.demo';
import { CascadeSelectLoadingDemo } from './demos/cascade-select-loading.demo';
import { CascadeSelectEventsDemo } from './demos/cascade-select-events.demo';
import { CascadeSelectClearIconDemo } from './demos/cascade-select-clear-icon.demo';
import { CascadeSelectSizesDemo } from './demos/cascade-select-sizes.demo';
import { CascadeSelectFluidDemo } from './demos/cascade-select-fluid.demo';
import { CascadeSelectFilledDemo } from './demos/cascade-select-filled.demo';
import { CascadeSelectDisabledDemo } from './demos/cascade-select-disabled.demo';
import { CascadeSelectInvalidDemo } from './demos/cascade-select-invalid.demo';
import { CascadeSelectFloatLabelDemo } from './demos/cascade-select-float-label.demo';
import { CascadeSelectIftaLabelDemo } from './demos/cascade-select-ifta-label.demo';
import { CascadeSelectSignalFormsDemo } from './demos/cascade-select-signal-forms.demo';
import { CascadeSelectTemplateDrivenDemo } from './demos/cascade-select-template-driven.demo';
import { CascadeSelectReactiveFormsDemo } from './demos/cascade-select-reactive-forms.demo';

import cascadeSelectBasicCode from './demos/cascade-select-basic.demo.html?raw';
import cascadeSelectDataModelHtml from './demos/cascade-select-data-model.demo.html?raw';
import cascadeSelectDataModelTs from './demos/cascade-select-data-model.demo.ts?raw';
import cascadeSelectTemplateValueCode from './demos/cascade-select-template-value.demo.html?raw';
import cascadeSelectTemplateOptionCode from './demos/cascade-select-template-option.demo.html?raw';
import cascadeSelectTemplateHeaderFooterCode from './demos/cascade-select-template-header-footer.demo.html?raw';
import cascadeSelectTemplateIconsCode from './demos/cascade-select-template-icons.demo.html?raw';
import cascadeSelectLoadingCode from './demos/cascade-select-loading.demo.html?raw';
import cascadeSelectEventsCode from './demos/cascade-select-events.demo.html?raw';
import cascadeSelectClearIconCode from './demos/cascade-select-clear-icon.demo.html?raw';
import cascadeSelectSizesCode from './demos/cascade-select-sizes.demo.html?raw';
import cascadeSelectFluidCode from './demos/cascade-select-fluid.demo.html?raw';
import cascadeSelectFilledCode from './demos/cascade-select-filled.demo.html?raw';
import cascadeSelectDisabledCode from './demos/cascade-select-disabled.demo.html?raw';
import cascadeSelectInvalidCode from './demos/cascade-select-invalid.demo.html?raw';
import cascadeSelectFloatLabelCode from './demos/cascade-select-float-label.demo.html?raw';
import cascadeSelectIftaLabelCode from './demos/cascade-select-ifta-label.demo.html?raw';
import cascadeSelectSignalFormsCode from './demos/cascade-select-signal-forms.demo.html?raw';
import cascadeSelectTemplateDrivenCode from './demos/cascade-select-template-driven.demo.html?raw';
import cascadeSelectReactiveFormsCode from './demos/cascade-select-reactive-forms.demo.html?raw';
import apiEntries from '../../../../content/api/cascade-select.json';
import introContent from '../../../../content/docs/cascade-select-intro.txt?raw';
import loadingContent from '../../../../content/docs/cascade-select-loading.txt?raw';
import eventsContent from '../../../../content/docs/cascade-select-events.txt?raw';
import clearIconContent from '../../../../content/docs/cascade-select-clear-icon.txt?raw';
import sizesContent from '../../../../content/docs/cascade-select-sizes.txt?raw';
import fluidContent from '../../../../content/docs/cascade-select-fluid.txt?raw';
import filledContent from '../../../../content/docs/cascade-select-filled.txt?raw';
import disabledContent from '../../../../content/docs/cascade-select-disabled.txt?raw';
import invalidContent from '../../../../content/docs/cascade-select-invalid.txt?raw';
import floatLabelContent from '../../../../content/docs/cascade-select-float-label.txt?raw';
import iftaLabelContent from '../../../../content/docs/cascade-select-ifta-label.txt?raw';
import signalFormsContent from '../../../../content/docs/cascade-select-signal-forms.txt?raw';
import templateDrivenContent from '../../../../content/docs/cascade-select-template-driven.txt?raw';
import reactiveFormsContent from '../../../../content/docs/cascade-select-reactive-forms.txt?raw';
import dataModelContent from '../../../../content/docs/cascade-select-data-model.txt?raw';
import templateValueContent from '../../../../content/docs/cascade-select-template-value.txt?raw';
import templateOptionContent from '../../../../content/docs/cascade-select-template-option.txt?raw';
import templateHeaderFooterContent from '../../../../content/docs/cascade-select-template-header-footer.txt?raw';
import templateIconsContent from '../../../../content/docs/cascade-select-template-icons.txt?raw';

/** The examples listed in "On this page", in page order; each `id` is the anchor of its block. */
const EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-data-model', label: 'Data model' },
  { id: 'example-template-value', label: 'Value template' },
  { id: 'example-template-option', label: 'Option template' },
  { id: 'example-template-header-footer', label: 'Header and footer templates' },
  { id: 'example-template-icons', label: 'Icon templates' },
  { id: 'example-loading', label: 'Loading' },
  { id: 'example-events', label: 'Events' },
  { id: 'example-clear-icon', label: 'Clear icon' },
  { id: 'example-sizes', label: 'Sizes' },
  { id: 'example-fluid', label: 'Fluid' },
  { id: 'example-filled', label: 'Filled' },
  { id: 'example-disabled', label: 'Disabled' },
  { id: 'example-invalid', label: 'Invalid' },
  { id: 'example-float-label', label: 'Float Label' },
  { id: 'example-ifta-label', label: 'Ifta Label' },
  { id: 'example-signal-forms', label: 'Signal Forms' },
  { id: 'example-template-driven', label: 'Template Driven' },
  { id: 'example-reactive-forms', label: 'Reactive Forms' },
] as const;

const IMPORT_CODE = `import { CascadeSelectComponent, type CascadeSelectOption } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'CascadeSelect — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'CascadeSelect component docs: a Select-style trigger that opens cascading side-panels for tree-shaped option data, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-cascade-select',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, CascadeSelectBasicDemo, CascadeSelectDataModelDemo, CascadeSelectTemplateValueDemo, CascadeSelectTemplateOptionDemo, CascadeSelectTemplateHeaderFooterDemo, CascadeSelectTemplateIconsDemo, CascadeSelectLoadingDemo, CascadeSelectEventsDemo, CascadeSelectClearIconDemo, CascadeSelectSizesDemo, CascadeSelectFluidDemo, CascadeSelectFilledDemo, CascadeSelectDisabledDemo, CascadeSelectInvalidDemo, CascadeSelectFloatLabelDemo, CascadeSelectIftaLabelDemo, CascadeSelectSignalFormsDemo, CascadeSelectTemplateDrivenDemo, CascadeSelectReactiveFormsDemo],
  template: `
    <app-component-doc title="CascadeSelect" slug="cascade-select" [examples]="examples">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div id="example-basic" class="mt-4 scroll-mt-24">
      <app-cascade-select-basic-demo />
      <div class="mt-3"><app-code-block [code]="cascadeSelectBasicCode" /></div>
    </div>

    <app-prose id="example-data-model" class="mt-10 block scroll-mt-24" [content]="dataModelContent" />
    <div class="mt-4">
      <app-cascade-select-data-model-demo />
      <div class="mt-3"><app-code-block [code]="cascadeSelectDataModelHtml" /></div>
      <div class="mt-3"><app-code-block [code]="cascadeSelectDataModelTs" /></div>
    </div>

    <app-prose id="example-template-value" class="mt-10 block scroll-mt-24" [content]="templateValueContent" />
    <div class="mt-4">
      <app-cascade-select-template-value-demo />
      <div class="mt-3"><app-code-block [code]="cascadeSelectTemplateValueCode" /></div>
    </div>

    <app-prose id="example-template-option" class="mt-10 block scroll-mt-24" [content]="templateOptionContent" />
    <div class="mt-4">
      <app-cascade-select-template-option-demo />
      <div class="mt-3"><app-code-block [code]="cascadeSelectTemplateOptionCode" /></div>
    </div>

    <app-prose id="example-template-header-footer" class="mt-10 block scroll-mt-24" [content]="templateHeaderFooterContent" />
    <div class="mt-4">
      <app-cascade-select-template-header-footer-demo />
      <div class="mt-3"><app-code-block [code]="cascadeSelectTemplateHeaderFooterCode" /></div>
    </div>

    <app-prose id="example-template-icons" class="mt-10 block scroll-mt-24" [content]="templateIconsContent" />
    <div class="mt-4">
      <app-cascade-select-template-icons-demo />
      <div class="mt-3"><app-code-block [code]="cascadeSelectTemplateIconsCode" /></div>
    </div>

    <app-prose id="example-loading" class="mt-10 block scroll-mt-24" [content]="loadingContent" />
    <div class="mt-4">
      <app-cascade-select-loading-demo />
      <div class="mt-3"><app-code-block [code]="cascadeSelectLoadingCode" /></div>
    </div>

    <app-prose id="example-events" class="mt-10 block scroll-mt-24" [content]="eventsContent" />
    <div class="mt-4">
      <app-cascade-select-events-demo />
      <div class="mt-3"><app-code-block [code]="cascadeSelectEventsCode" /></div>
    </div>

    <app-prose id="example-clear-icon" class="mt-10 block scroll-mt-24" [content]="clearIconContent" />
    <div class="mt-4">
      <app-cascade-select-clear-icon-demo />
      <div class="mt-3"><app-code-block [code]="cascadeSelectClearIconCode" /></div>
    </div>

    <app-prose id="example-sizes" class="mt-10 block scroll-mt-24" [content]="sizesContent" />
    <div class="mt-4">
      <app-cascade-select-sizes-demo />
      <div class="mt-3"><app-code-block [code]="cascadeSelectSizesCode" /></div>
    </div>

    <app-prose id="example-fluid" class="mt-10 block scroll-mt-24" [content]="fluidContent" />
    <div class="mt-4">
      <app-cascade-select-fluid-demo />
      <div class="mt-3"><app-code-block [code]="cascadeSelectFluidCode" /></div>
    </div>

    <app-prose id="example-filled" class="mt-10 block scroll-mt-24" [content]="filledContent" />
    <div class="mt-4">
      <app-cascade-select-filled-demo />
      <div class="mt-3"><app-code-block [code]="cascadeSelectFilledCode" /></div>
    </div>

    <app-prose id="example-disabled" class="mt-10 block scroll-mt-24" [content]="disabledContent" />
    <div class="mt-4">
      <app-cascade-select-disabled-demo />
      <div class="mt-3"><app-code-block [code]="cascadeSelectDisabledCode" /></div>
    </div>

    <app-prose id="example-invalid" class="mt-10 block scroll-mt-24" [content]="invalidContent" />
    <div class="mt-4">
      <app-cascade-select-invalid-demo />
      <div class="mt-3"><app-code-block [code]="cascadeSelectInvalidCode" /></div>
    </div>

    <app-prose id="example-float-label" class="mt-10 block scroll-mt-24" [content]="floatLabelContent" />
    <div class="mt-4">
      <app-cascade-select-float-label-demo />
      <div class="mt-3"><app-code-block [code]="cascadeSelectFloatLabelCode" /></div>
    </div>

    <app-prose id="example-ifta-label" class="mt-10 block scroll-mt-24" [content]="iftaLabelContent" />
    <div class="mt-4">
      <app-cascade-select-ifta-label-demo />
      <div class="mt-3"><app-code-block [code]="cascadeSelectIftaLabelCode" /></div>
    </div>

    <app-prose id="example-signal-forms" class="mt-10 block scroll-mt-24" [content]="signalFormsContent" />
    <div class="mt-4">
      <app-cascade-select-signal-forms-demo />
      <div class="mt-3"><app-code-block [code]="cascadeSelectSignalFormsCode" /></div>
    </div>

    <app-prose id="example-template-driven" class="mt-10 block scroll-mt-24" [content]="templateDrivenContent" />
    <div class="mt-4">
      <app-cascade-select-template-driven-demo />
      <div class="mt-3"><app-code-block [code]="cascadeSelectTemplateDrivenCode" /></div>
    </div>

    <app-prose id="example-reactive-forms" class="mt-10 block scroll-mt-24" [content]="reactiveFormsContent" />
    <div class="mt-4">
      <app-cascade-select-reactive-forms-demo />
      <div class="mt-3"><app-code-block [code]="cascadeSelectReactiveFormsCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsCascadeSelect {
  protected readonly examples = EXAMPLES;
  protected readonly introContent = introContent;
  protected readonly dataModelContent = dataModelContent;
  protected readonly cascadeSelectDataModelHtml = cascadeSelectDataModelHtml;
  protected readonly cascadeSelectDataModelTs = cascadeSelectDataModelTs;
  protected readonly signalFormsContent = signalFormsContent;
  protected readonly cascadeSelectSignalFormsCode = cascadeSelectSignalFormsCode;
  protected readonly templateDrivenContent = templateDrivenContent;
  protected readonly cascadeSelectTemplateDrivenCode = cascadeSelectTemplateDrivenCode;
  protected readonly reactiveFormsContent = reactiveFormsContent;
  protected readonly cascadeSelectReactiveFormsCode = cascadeSelectReactiveFormsCode;
  protected readonly floatLabelContent = floatLabelContent;
  protected readonly cascadeSelectFloatLabelCode = cascadeSelectFloatLabelCode;
  protected readonly iftaLabelContent = iftaLabelContent;
  protected readonly cascadeSelectIftaLabelCode = cascadeSelectIftaLabelCode;
  protected readonly loadingContent = loadingContent;
  protected readonly cascadeSelectLoadingCode = cascadeSelectLoadingCode;
  protected readonly eventsContent = eventsContent;
  protected readonly cascadeSelectEventsCode = cascadeSelectEventsCode;
  protected readonly clearIconContent = clearIconContent;
  protected readonly cascadeSelectClearIconCode = cascadeSelectClearIconCode;
  protected readonly sizesContent = sizesContent;
  protected readonly cascadeSelectSizesCode = cascadeSelectSizesCode;
  protected readonly fluidContent = fluidContent;
  protected readonly cascadeSelectFluidCode = cascadeSelectFluidCode;
  protected readonly filledContent = filledContent;
  protected readonly cascadeSelectFilledCode = cascadeSelectFilledCode;
  protected readonly disabledContent = disabledContent;
  protected readonly cascadeSelectDisabledCode = cascadeSelectDisabledCode;
  protected readonly invalidContent = invalidContent;
  protected readonly cascadeSelectInvalidCode = cascadeSelectInvalidCode;
  protected readonly templateValueContent = templateValueContent;
  protected readonly cascadeSelectTemplateValueCode = cascadeSelectTemplateValueCode;
  protected readonly templateOptionContent = templateOptionContent;
  protected readonly cascadeSelectTemplateOptionCode = cascadeSelectTemplateOptionCode;
  protected readonly templateHeaderFooterContent = templateHeaderFooterContent;
  protected readonly cascadeSelectTemplateHeaderFooterCode = cascadeSelectTemplateHeaderFooterCode;
  protected readonly templateIconsContent = templateIconsContent;
  protected readonly cascadeSelectTemplateIconsCode = cascadeSelectTemplateIconsCode;
  protected readonly importCode = IMPORT_CODE;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly cascadeSelectBasicCode = cascadeSelectBasicCode;
}
