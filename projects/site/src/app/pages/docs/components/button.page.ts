import { Component } from '@angular/core';
import type { RouteMeta } from '@analogjs/router';
import { ApiTableComponent } from '../../../shared/api-table';
import { ComponentDocComponent } from '../../../shared/component-doc';
import { ProseComponent } from '../../../shared/prose';
import { CodeBlockComponent } from '../../../shared/code-block';
import type { ApiEntry } from '../../../shared/api-entry';
import { ButtonBasicDemo } from './demos/button-basic.demo';
import { ButtonIconsDemo } from './demos/button-icons.demo';
import { ButtonLoadingDemo } from './demos/button-loading.demo';
import { ButtonLinkDemo } from './demos/button-link.demo';
import { ButtonSeveritiesDemo } from './demos/button-severities.demo';
import { ButtonRoundedDemo } from './demos/button-rounded.demo';
import { ButtonTextDemo } from './demos/button-text.demo';
import { ButtonRaisedTextDemo } from './demos/button-raised-text.demo';
import { ButtonOutlinedDemo } from './demos/button-outlined.demo';
import { ButtonIconOnlyDemo } from './demos/button-icon-only.demo';
import { ButtonBadgeDemo } from './demos/button-badge.demo';
import { ButtonSizesDemo } from './demos/button-sizes.demo';
import { ButtonFluidDemo } from './demos/button-fluid.demo';
import { ButtonDisabledDemo } from './demos/button-disabled.demo';
import { ButtonTemplateDemo } from './demos/button-template.demo';
import { ButtonGroupDemo } from './demos/button-group.demo';

import buttonBasicCode from './demos/button-basic.demo.html?raw';
import buttonIconsCode from './demos/button-icons.demo.html?raw';
import buttonLoadingCode from './demos/button-loading.demo.html?raw';
import buttonLinkCode from './demos/button-link.demo.html?raw';
import buttonSeveritiesCode from './demos/button-severities.demo.html?raw';
import buttonRoundedCode from './demos/button-rounded.demo.html?raw';
import buttonTextCode from './demos/button-text.demo.html?raw';
import buttonRaisedTextCode from './demos/button-raised-text.demo.html?raw';
import buttonOutlinedCode from './demos/button-outlined.demo.html?raw';
import buttonIconOnlyCode from './demos/button-icon-only.demo.html?raw';
import buttonBadgeCode from './demos/button-badge.demo.html?raw';
import buttonSizesCode from './demos/button-sizes.demo.html?raw';
import buttonFluidCode from './demos/button-fluid.demo.html?raw';
import buttonDisabledCode from './demos/button-disabled.demo.html?raw';
import buttonTemplateCode from './demos/button-template.demo.html?raw';
import buttonGroupCode from './demos/button-group.demo.html?raw';

import apiEntries from '../../../../content/api/button.json';
import introContent from '../../../../content/docs/button-intro.txt?raw';
import basicContent from '../../../../content/docs/button-basic.txt?raw';
import iconsContent from '../../../../content/docs/button-icons.txt?raw';
import loadingContent from '../../../../content/docs/button-loading.txt?raw';
import linkContent from '../../../../content/docs/button-link.txt?raw';
import severitiesContent from '../../../../content/docs/button-severities.txt?raw';
import roundedContent from '../../../../content/docs/button-rounded.txt?raw';
import textContent from '../../../../content/docs/button-text.txt?raw';
import raisedTextContent from '../../../../content/docs/button-raised-text.txt?raw';
import outlinedContent from '../../../../content/docs/button-outlined.txt?raw';
import iconOnlyContent from '../../../../content/docs/button-icon-only.txt?raw';
import badgeContent from '../../../../content/docs/button-badge.txt?raw';
import sizesContent from '../../../../content/docs/button-sizes.txt?raw';
import fluidContent from '../../../../content/docs/button-fluid.txt?raw';
import disabledContent from '../../../../content/docs/button-disabled.txt?raw';
import templateContent from '../../../../content/docs/button-template.txt?raw';
import buttonGroupContent from '../../../../content/docs/button-group.txt?raw';

const EXAMPLES = [
  { id: 'example-basic', label: 'Basic' },
  { id: 'example-icons', label: 'Icons' },
  { id: 'example-loading', label: 'Loading' },
  { id: 'example-link', label: 'Link' },
  { id: 'example-severity', label: 'Severity' },
  { id: 'example-rounded', label: 'Rounded' },
  { id: 'example-text', label: 'Text' },
  { id: 'example-raised-text', label: 'Raised Text' },
  { id: 'example-outlined', label: 'Outlined' },
  { id: 'example-icon-only', label: 'Icon Only' },
  { id: 'example-badge', label: 'Badge' },
  { id: 'example-sizes', label: 'Sizes' },
  { id: 'example-fluid', label: 'Fluid' },
  { id: 'example-disabled', label: 'Disabled' },
  { id: 'example-template', label: 'Template' },
  { id: 'example-button-group', label: 'Button Group' },
] as const;

const IMPORT_CODE = `import { ButtonDirective, ButtonGroupComponent } from '@medra.dev/ui';`;

export const routeMeta: RouteMeta = {
  title: 'Button — MedraUi',
  meta: [
    {
      name: 'description',
      content: 'Button component docs: severities, variants, sizes, icons, badges, loading, and states, with live examples and the full API reference.',
    },
  ],
};

@Component({
  selector: 'app-docs-button',
  imports: [
    ComponentDocComponent,
    ProseComponent,
    ApiTableComponent,
    CodeBlockComponent,
    ButtonBasicDemo,
    ButtonIconsDemo,
    ButtonLoadingDemo,
    ButtonLinkDemo,
    ButtonSeveritiesDemo,
    ButtonRoundedDemo,
    ButtonTextDemo,
    ButtonRaisedTextDemo,
    ButtonOutlinedDemo,
    ButtonIconOnlyDemo,
    ButtonBadgeDemo,
    ButtonSizesDemo,
    ButtonFluidDemo,
    ButtonDisabledDemo,
    ButtonTemplateDemo,
    ButtonGroupDemo,
  ],
  template: `
    <app-component-doc title="Button" slug="button" [examples]="examples">
    <app-prose class="mt-4 block" [content]="introContent" />

    <h2 class="mt-8 mb-3 font-display text-lg font-medium text-surface-900 dark:text-surface-50">Import</h2>
    <app-code-block [code]="importCode" />

    <app-prose id="example-basic" class="mt-10 block scroll-mt-24" [content]="basicContent" />
    <div class="mt-4">
      <app-button-basic-demo />
      <div class="mt-3"><app-code-block [code]="buttonBasicCode" /></div>
    </div>

    <app-prose id="example-icons" class="mt-10 block scroll-mt-24" [content]="iconsContent" />
    <div class="mt-4">
      <app-button-icons-demo />
      <div class="mt-3"><app-code-block [code]="buttonIconsCode" /></div>
    </div>

    <app-prose id="example-loading" class="mt-10 block scroll-mt-24" [content]="loadingContent" />
    <div class="mt-4">
      <app-button-loading-demo />
      <div class="mt-3"><app-code-block [code]="buttonLoadingCode" /></div>
    </div>

    <app-prose id="example-link" class="mt-10 block scroll-mt-24" [content]="linkContent" />
    <div class="mt-4">
      <app-button-link-demo />
      <div class="mt-3"><app-code-block [code]="buttonLinkCode" /></div>
    </div>

    <app-prose id="example-severity" class="mt-10 block scroll-mt-24" [content]="severitiesContent" />
    <div class="mt-4">
      <app-button-severities-demo />
      <div class="mt-3"><app-code-block [code]="buttonSeveritiesCode" /></div>
    </div>

    <app-prose id="example-rounded" class="mt-10 block scroll-mt-24" [content]="roundedContent" />
    <div class="mt-4">
      <app-button-rounded-demo />
      <div class="mt-3"><app-code-block [code]="buttonRoundedCode" /></div>
    </div>

    <app-prose id="example-text" class="mt-10 block scroll-mt-24" [content]="textContent" />
    <div class="mt-4">
      <app-button-text-demo />
      <div class="mt-3"><app-code-block [code]="buttonTextCode" /></div>
    </div>

    <app-prose id="example-raised-text" class="mt-10 block scroll-mt-24" [content]="raisedTextContent" />
    <div class="mt-4">
      <app-button-raised-text-demo />
      <div class="mt-3"><app-code-block [code]="buttonRaisedTextCode" /></div>
    </div>

    <app-prose id="example-outlined" class="mt-10 block scroll-mt-24" [content]="outlinedContent" />
    <div class="mt-4">
      <app-button-outlined-demo />
      <div class="mt-3"><app-code-block [code]="buttonOutlinedCode" /></div>
    </div>

    <app-prose id="example-icon-only" class="mt-10 block scroll-mt-24" [content]="iconOnlyContent" />
    <div class="mt-4">
      <app-button-icon-only-demo />
      <div class="mt-3"><app-code-block [code]="buttonIconOnlyCode" /></div>
    </div>

    <app-prose id="example-badge" class="mt-10 block scroll-mt-24" [content]="badgeContent" />
    <div class="mt-4">
      <app-button-badge-demo />
      <div class="mt-3"><app-code-block [code]="buttonBadgeCode" /></div>
    </div>

    <app-prose id="example-sizes" class="mt-10 block scroll-mt-24" [content]="sizesContent" />
    <div class="mt-4">
      <app-button-sizes-demo />
      <div class="mt-3"><app-code-block [code]="buttonSizesCode" /></div>
    </div>

    <app-prose id="example-fluid" class="mt-10 block scroll-mt-24" [content]="fluidContent" />
    <div class="mt-4">
      <app-button-fluid-demo />
      <div class="mt-3"><app-code-block [code]="buttonFluidCode" /></div>
    </div>

    <app-prose id="example-disabled" class="mt-10 block scroll-mt-24" [content]="disabledContent" />
    <div class="mt-4">
      <app-button-disabled-demo />
      <div class="mt-3"><app-code-block [code]="buttonDisabledCode" /></div>
    </div>

    <app-prose id="example-template" class="mt-10 block scroll-mt-24" [content]="templateContent" />
    <div class="mt-4">
      <app-button-template-demo />
      <div class="mt-3"><app-code-block [code]="buttonTemplateCode" /></div>
    </div>

    <app-prose id="example-button-group" class="mt-10 block scroll-mt-24" [content]="buttonGroupContent" />
    <div class="mt-4">
      <app-button-group-demo />
      <div class="mt-3"><app-code-block [code]="buttonGroupCode" /></div>
    </div>

    <app-api-table api [entries]="apiEntries" />
    </app-component-doc>
  `,
})
export default class DocsButton {
  protected readonly examples = EXAMPLES;
  protected readonly introContent = introContent;
  protected readonly importCode = IMPORT_CODE;
  protected readonly basicContent = basicContent;
  protected readonly iconsContent = iconsContent;
  protected readonly loadingContent = loadingContent;
  protected readonly linkContent = linkContent;
  protected readonly severitiesContent = severitiesContent;
  protected readonly roundedContent = roundedContent;
  protected readonly textContent = textContent;
  protected readonly raisedTextContent = raisedTextContent;
  protected readonly outlinedContent = outlinedContent;
  protected readonly iconOnlyContent = iconOnlyContent;
  protected readonly badgeContent = badgeContent;
  protected readonly sizesContent = sizesContent;
  protected readonly fluidContent = fluidContent;
  protected readonly disabledContent = disabledContent;
  protected readonly templateContent = templateContent;
  protected readonly buttonGroupContent = buttonGroupContent;
  protected readonly apiEntries = apiEntries as ApiEntry[];
  protected readonly buttonBasicCode = buttonBasicCode;
  protected readonly buttonIconsCode = buttonIconsCode;
  protected readonly buttonLoadingCode = buttonLoadingCode;
  protected readonly buttonLinkCode = buttonLinkCode;
  protected readonly buttonSeveritiesCode = buttonSeveritiesCode;
  protected readonly buttonRoundedCode = buttonRoundedCode;
  protected readonly buttonTextCode = buttonTextCode;
  protected readonly buttonRaisedTextCode = buttonRaisedTextCode;
  protected readonly buttonOutlinedCode = buttonOutlinedCode;
  protected readonly buttonIconOnlyCode = buttonIconOnlyCode;
  protected readonly buttonBadgeCode = buttonBadgeCode;
  protected readonly buttonSizesCode = buttonSizesCode;
  protected readonly buttonFluidCode = buttonFluidCode;
  protected readonly buttonDisabledCode = buttonDisabledCode;
  protected readonly buttonTemplateCode = buttonTemplateCode;
  protected readonly buttonGroupCode = buttonGroupCode;
}
