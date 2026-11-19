import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { SelectBasicDemo } from './demos/select-basic.demo';
import { SelectGroupedDemo } from './demos/select-grouped.demo';
import { SelectEditableDemo } from './demos/select-editable.demo';
import { SelectLazyDemo } from './demos/select-lazy.demo';
import { SelectDataModelDemo } from './demos/select-data-model.demo';
import { SelectTemplateValueDemo } from './demos/select-template-value.demo';
import { SelectTemplateOptionDemo } from './demos/select-template-option.demo';
import { SelectTemplateGroupDemo } from './demos/select-template-group.demo';
import { SelectTemplateHeaderFooterDemo } from './demos/select-template-header-footer.demo';
import { SelectTemplateEmptyDemo } from './demos/select-template-empty.demo';
import { SelectTemplateIconsDemo } from './demos/select-template-icons.demo';
import { SelectFilterDemo } from './demos/select-filter.demo';
import { SelectLoadingDemo } from './demos/select-loading.demo';
import { SelectEventsDemo } from './demos/select-events.demo';
import { SelectClearIconDemo } from './demos/select-clear-icon.demo';
import { SelectSizesDemo } from './demos/select-sizes.demo';
import { SelectFluidDemo } from './demos/select-fluid.demo';
import { SelectFilledDemo } from './demos/select-filled.demo';
import { SelectDisabledDemo } from './demos/select-disabled.demo';
import { SelectInvalidDemo } from './demos/select-invalid.demo';
import { SelectFloatLabelDemo } from './demos/select-float-label.demo';
import { SelectIftaLabelDemo } from './demos/select-ifta-label.demo';
import { SelectSignalFormsDemo } from './demos/select-signal-forms.demo';
import { SelectTemplateDrivenDemo } from './demos/select-template-driven.demo';
import { SelectReactiveFormsDemo } from './demos/select-reactive-forms.demo';

import selectBasicCode from './demos/select-basic.demo.html?raw';
import selectGroupedCode from './demos/select-grouped.demo.html?raw';
import selectEditableCode from './demos/select-editable.demo.html?raw';
import selectLazyCode from './demos/select-lazy.demo.html?raw';
import selectDataModelHtml from './demos/select-data-model.demo.html?raw';
import selectDataModelTs from './demos/select-data-model.demo.ts?raw';
import selectTemplateValueCode from './demos/select-template-value.demo.html?raw';
import selectTemplateOptionCode from './demos/select-template-option.demo.html?raw';
import selectTemplateGroupCode from './demos/select-template-group.demo.html?raw';
import selectTemplateHeaderFooterCode from './demos/select-template-header-footer.demo.html?raw';
import selectTemplateEmptyCode from './demos/select-template-empty.demo.html?raw';
import selectTemplateIconsCode from './demos/select-template-icons.demo.html?raw';
import selectFilterCode from './demos/select-filter.demo.html?raw';
import selectLoadingCode from './demos/select-loading.demo.html?raw';
import selectEventsCode from './demos/select-events.demo.html?raw';
import selectClearIconCode from './demos/select-clear-icon.demo.html?raw';
import selectSizesCode from './demos/select-sizes.demo.html?raw';
import selectFluidCode from './demos/select-fluid.demo.html?raw';
import selectFilledCode from './demos/select-filled.demo.html?raw';
import selectDisabledCode from './demos/select-disabled.demo.html?raw';
import selectInvalidCode from './demos/select-invalid.demo.html?raw';
import selectFloatLabelCode from './demos/select-float-label.demo.html?raw';
import selectIftaLabelCode from './demos/select-ifta-label.demo.html?raw';
import selectSignalFormsCode from './demos/select-signal-forms.demo.html?raw';
import selectTemplateDrivenCode from './demos/select-template-driven.demo.html?raw';
import selectReactiveFormsCode from './demos/select-reactive-forms.demo.html?raw';
import apiEntries from '../../../../content/api/select.json';
import introContent from '../../../../content/docs/select-intro.txt?raw';
import groupedContent from '../../../../content/docs/select-grouped.txt?raw';
import basicContent from '../../../../content/docs/select-basic.txt?raw';
import editableContent from '../../../../content/docs/select-editable.txt?raw';
import lazyContent from '../../../../content/docs/select-lazy.txt?raw';
import dataModelContent from '../../../../content/docs/select-data-model.txt?raw';
import signalFormsContent from '../../../../content/docs/select-signal-forms.txt?raw';
import templateDrivenContent from '../../../../content/docs/select-template-driven.txt?raw';
import reactiveFormsContent from '../../../../content/docs/select-reactive-forms.txt?raw';
import floatLabelContent from '../../../../content/docs/select-float-label.txt?raw';
import iftaLabelContent from '../../../../content/docs/select-ifta-label.txt?raw';
import filterContent from '../../../../content/docs/select-filter.txt?raw';
import loadingContent from '../../../../content/docs/select-loading.txt?raw';
import eventsContent from '../../../../content/docs/select-events.txt?raw';
import clearIconContent from '../../../../content/docs/select-clear-icon.txt?raw';
import sizesContent from '../../../../content/docs/select-sizes.txt?raw';
import fluidContent from '../../../../content/docs/select-fluid.txt?raw';
import filledContent from '../../../../content/docs/select-filled.txt?raw';
import disabledContent from '../../../../content/docs/select-disabled.txt?raw';
import invalidContent from '../../../../content/docs/select-invalid.txt?raw';
import templateValueContent from '../../../../content/docs/select-template-value.txt?raw';
import templateOptionContent from '../../../../content/docs/select-template-option.txt?raw';
import templateGroupContent from '../../../../content/docs/select-template-group.txt?raw';
import templateHeaderFooterContent from '../../../../content/docs/select-template-header-footer.txt?raw';
import templateEmptyContent from '../../../../content/docs/select-template-empty.txt?raw';
import templateIconsContent from '../../../../content/docs/select-template-icons.txt?raw';

/** The examples listed in "On this page", in page order; each `id` is the anchor of its block. */
const EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-grouped', label: 'Grouped' },
  { id: 'example-editable', label: 'Editable' },
  { id: 'example-lazy', label: 'Lazy' },
  { id: 'example-data-model', label: 'Data model' },
  { id: 'example-template-value', label: 'Value template' },
  { id: 'example-template-option', label: 'Option template' },
  { id: 'example-template-group', label: 'Group template' },
  { id: 'example-template-header-footer', label: 'Header and footer templates' },
  { id: 'example-template-empty', label: 'Empty template' },
  { id: 'example-template-icons', label: 'Icon templates' },
  { id: 'example-filter', label: 'Filter' },
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

const IMPORT_CODE = `import { SelectComponent, type SelectOption } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Select — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Select component docs: an ARIA select-only combobox with a virtualized, filterable overlay panel and forms integration, with a live example and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-select',
  imports: [ComponentDocComponent, ProseComponent, ApiTableComponent, CodeBlockComponent, SelectBasicDemo, SelectGroupedDemo, SelectEditableDemo, SelectLazyDemo, SelectDataModelDemo, SelectTemplateValueDemo, SelectTemplateOptionDemo, SelectTemplateGroupDemo, SelectTemplateHeaderFooterDemo, SelectTemplateEmptyDemo, SelectTemplateIconsDemo, SelectFilterDemo, SelectLoadingDemo, SelectEventsDemo, SelectClearIconDemo, SelectSizesDemo, SelectFluidDemo, SelectFilledDemo, SelectDisabledDemo, SelectInvalidDemo, SelectFloatLabelDemo, SelectIftaLabelDemo, SelectSignalFormsDemo, SelectTemplateDrivenDemo, SelectReactiveFormsDemo],
  template: `
    <app-component-doc title="Select" slug="select" [examples]="examples">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />
    <div id="example-basic" class="mt-4 scroll-mt-24">
      <app-prose class="block" [content]="basicContent" />
      <div class="mt-4">
        <app-select-basic-demo />
        <div class="mt-3"><app-code-block [code]="selectBasicCode" /></div>
      </div>
    </div>

    <div id="example-grouped" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="groupedContent" />
      <div class="mt-4">
        <app-select-grouped-demo />
        <div class="mt-3"><app-code-block [code]="selectGroupedCode" /></div>
      </div>
    </div>

    <div id="example-editable" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="editableContent" />
      <div class="mt-4">
        <app-select-editable-demo />
        <div class="mt-3"><app-code-block [code]="selectEditableCode" /></div>
      </div>
    </div>

    <div id="example-lazy" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="lazyContent" />
      <div class="mt-4">
        <app-select-lazy-demo />
        <div class="mt-3"><app-code-block [code]="selectLazyCode" /></div>
      </div>
    </div>

    <div id="example-data-model" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="dataModelContent" />
      <div class="mt-4">
        <app-select-data-model-demo />
        <div class="mt-3"><app-code-block [code]="selectDataModelHtml" /></div>
        <div class="mt-3"><app-code-block [code]="selectDataModelTs" /></div>
      </div>
    </div>

    <div id="example-template-value" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="templateValueContent" />
      <div class="mt-4">
        <app-select-template-value-demo />
        <div class="mt-3"><app-code-block [code]="selectTemplateValueCode" /></div>
      </div>
    </div>

    <div id="example-template-option" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="templateOptionContent" />
      <div class="mt-4">
        <app-select-template-option-demo />
        <div class="mt-3"><app-code-block [code]="selectTemplateOptionCode" /></div>
      </div>
    </div>

    <div id="example-template-group" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="templateGroupContent" />
      <div class="mt-4">
        <app-select-template-group-demo />
        <div class="mt-3"><app-code-block [code]="selectTemplateGroupCode" /></div>
      </div>
    </div>

    <div id="example-template-header-footer" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="templateHeaderFooterContent" />
      <div class="mt-4">
        <app-select-template-header-footer-demo />
        <div class="mt-3"><app-code-block [code]="selectTemplateHeaderFooterCode" /></div>
      </div>
    </div>

    <div id="example-template-empty" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="templateEmptyContent" />
      <div class="mt-4">
        <app-select-template-empty-demo />
        <div class="mt-3"><app-code-block [code]="selectTemplateEmptyCode" /></div>
      </div>
    </div>

    <div id="example-template-icons" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="templateIconsContent" />
      <div class="mt-4">
        <app-select-template-icons-demo />
        <div class="mt-3"><app-code-block [code]="selectTemplateIconsCode" /></div>
      </div>
    </div>

    <div id="example-filter" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="filterContent" />
      <div class="mt-4">
        <app-select-filter-demo />
        <div class="mt-3"><app-code-block [code]="selectFilterCode" /></div>
      </div>
    </div>

    <div id="example-loading" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="loadingContent" />
      <div class="mt-4">
        <app-select-loading-demo />
        <div class="mt-3"><app-code-block [code]="selectLoadingCode" /></div>
      </div>
    </div>

    <div id="example-events" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="eventsContent" />
      <div class="mt-4">
        <app-select-events-demo />
        <div class="mt-3"><app-code-block [code]="selectEventsCode" /></div>
      </div>
    </div>

    <div id="example-clear-icon" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="clearIconContent" />
      <div class="mt-4">
        <app-select-clear-icon-demo />
        <div class="mt-3"><app-code-block [code]="selectClearIconCode" /></div>
      </div>
    </div>

    <div id="example-sizes" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="sizesContent" />
      <div class="mt-4">
        <app-select-sizes-demo />
        <div class="mt-3"><app-code-block [code]="selectSizesCode" /></div>
      </div>
    </div>

    <div id="example-fluid" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="fluidContent" />
      <div class="mt-4">
        <app-select-fluid-demo />
        <div class="mt-3"><app-code-block [code]="selectFluidCode" /></div>
      </div>
    </div>

    <div id="example-filled" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="filledContent" />
      <div class="mt-4">
        <app-select-filled-demo />
        <div class="mt-3"><app-code-block [code]="selectFilledCode" /></div>
      </div>
    </div>

    <div id="example-disabled" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="disabledContent" />
      <div class="mt-4">
        <app-select-disabled-demo />
        <div class="mt-3"><app-code-block [code]="selectDisabledCode" /></div>
      </div>
    </div>

    <div id="example-invalid" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="invalidContent" />
      <div class="mt-4">
        <app-select-invalid-demo />
        <div class="mt-3"><app-code-block [code]="selectInvalidCode" /></div>
      </div>
    </div>

    <div id="example-float-label" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="floatLabelContent" />
      <div class="mt-4">
        <app-select-float-label-demo />
        <div class="mt-3"><app-code-block [code]="selectFloatLabelCode" /></div>
      </div>
    </div>

    <div id="example-ifta-label" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="iftaLabelContent" />
      <div class="mt-4">
        <app-select-ifta-label-demo />
        <div class="mt-3"><app-code-block [code]="selectIftaLabelCode" /></div>
      </div>
    </div>

    <div id="example-signal-forms" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="signalFormsContent" />
      <div class="mt-4">
        <app-select-signal-forms-demo />
        <div class="mt-3"><app-code-block [code]="selectSignalFormsCode" /></div>
      </div>
    </div>

    <div id="example-template-driven" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="templateDrivenContent" />
      <div class="mt-4">
        <app-select-template-driven-demo />
        <div class="mt-3"><app-code-block [code]="selectTemplateDrivenCode" /></div>
      </div>
    </div>

    <div id="example-reactive-forms" class="mt-10 scroll-mt-24">
      <app-prose class="block" [content]="reactiveFormsContent" />
      <div class="mt-4">
        <app-select-reactive-forms-demo />
        <div class="mt-3"><app-code-block [code]="selectReactiveFormsCode" /></div>
      </div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsSelect {
  protected readonly examples = EXAMPLES;
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly basicContent = basicContent;
  protected readonly groupedContent = groupedContent;
  protected readonly editableContent = editableContent;
  protected readonly lazyContent = lazyContent;
  protected readonly dataModelContent = dataModelContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly selectBasicCode = selectBasicCode;
  protected readonly selectGroupedCode = selectGroupedCode;
  protected readonly selectEditableCode = selectEditableCode;
  protected readonly selectLazyCode = selectLazyCode;
  protected readonly selectDataModelHtml = selectDataModelHtml;
  protected readonly selectDataModelTs = selectDataModelTs;
  protected readonly templateValueContent = templateValueContent;
  protected readonly selectTemplateValueCode = selectTemplateValueCode;
  protected readonly templateOptionContent = templateOptionContent;
  protected readonly selectTemplateOptionCode = selectTemplateOptionCode;
  protected readonly templateGroupContent = templateGroupContent;
  protected readonly selectTemplateGroupCode = selectTemplateGroupCode;
  protected readonly templateHeaderFooterContent = templateHeaderFooterContent;
  protected readonly selectTemplateHeaderFooterCode = selectTemplateHeaderFooterCode;
  protected readonly templateEmptyContent = templateEmptyContent;
  protected readonly selectTemplateEmptyCode = selectTemplateEmptyCode;
  protected readonly templateIconsContent = templateIconsContent;
  protected readonly selectTemplateIconsCode = selectTemplateIconsCode;
  protected readonly filterContent = filterContent;
  protected readonly selectFilterCode = selectFilterCode;
  protected readonly loadingContent = loadingContent;
  protected readonly selectLoadingCode = selectLoadingCode;
  protected readonly eventsContent = eventsContent;
  protected readonly selectEventsCode = selectEventsCode;
  protected readonly clearIconContent = clearIconContent;
  protected readonly selectClearIconCode = selectClearIconCode;
  protected readonly sizesContent = sizesContent;
  protected readonly selectSizesCode = selectSizesCode;
  protected readonly fluidContent = fluidContent;
  protected readonly selectFluidCode = selectFluidCode;
  protected readonly filledContent = filledContent;
  protected readonly selectFilledCode = selectFilledCode;
  protected readonly disabledContent = disabledContent;
  protected readonly selectDisabledCode = selectDisabledCode;
  protected readonly invalidContent = invalidContent;
  protected readonly selectInvalidCode = selectInvalidCode;
  protected readonly floatLabelContent = floatLabelContent;
  protected readonly selectFloatLabelCode = selectFloatLabelCode;
  protected readonly iftaLabelContent = iftaLabelContent;
  protected readonly selectIftaLabelCode = selectIftaLabelCode;
  protected readonly signalFormsContent = signalFormsContent;
  protected readonly selectSignalFormsCode = selectSignalFormsCode;
  protected readonly templateDrivenContent = templateDrivenContent;
  protected readonly selectTemplateDrivenCode = selectTemplateDrivenCode;
  protected readonly reactiveFormsContent = reactiveFormsContent;
  protected readonly selectReactiveFormsCode = selectReactiveFormsCode;
}
