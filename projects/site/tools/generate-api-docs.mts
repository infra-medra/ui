/**
 * Generates one JSON file per documented component under
 * `src/content/api/`, read by each component doc page's `<api-table>`.
 *
 * Runs against `@medra/ui`'s own source (never third-party docs) via the
 * TypeScript Compiler API rather than a regex/comment parser: the lib mixes
 * `input()`/`input.required()`/`output()`/`model()` signal syntax with
 * inconsistent per-property JSDoc coverage (some properties documented, some
 * not — see button.directive.ts), and a regex parser breaks the moment that
 * syntax varies. Falls back to "no description" when JSDoc is missing rather
 * than blocking the build.
 *
 * `@Injectable` services (Dialog, Toast) have no signal inputs at all — their
 * API is public methods instead. Extraction dispatches on the class's own
 * decorator (`@Component`/`@Directive` vs `@Injectable`) rather than trying
 * to guess from shape.
 */
import * as ts from 'typescript';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ApiEntry } from '../src/app/shared/api-entry.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const libRoot = resolve(__dirname, '../../medra/ui/src/lib');
const outDir = resolve(__dirname, '../src/content/api');

/** Components documented on the site (roadmap/roadmap-execucao.md, Trilha 6) — grows as coverage grows past the original 5 pilots. */
/** `optionTypes` names exported option interfaces whose members are consumer-facing (e.g. `ConfirmDialogOptions`), emitted as `option` rows. */
const COMPONENTS: { slug: string; files: string[]; optionTypes?: string[] }[] = [
  { slug: 'button', files: [resolve(libRoot, 'button/button.directive.ts')] },
  { slug: 'checkbox', files: [resolve(libRoot, 'checkbox/checkbox.component.ts')] },
  { slug: 'input-text', files: [resolve(libRoot, 'input-text/input-text.directive.ts')] },
  { slug: 'dialog', files: [resolve(libRoot, 'dialog/dialog.component.ts'), resolve(libRoot, 'dialog/dialog.service.ts')] },
  {
    slug: 'message-toast',
    files: [resolve(libRoot, 'message/message.component.ts'), resolve(libRoot, 'toast/toast.component.ts'), resolve(libRoot, 'toast/toast.service.ts'), resolve(libRoot, 'toast/toast.types.ts')],
    optionTypes: ['ToastOptions'],
  },
  { slug: 'split-button', files: [resolve(libRoot, 'split-button/split-button.component.ts')] },
  { slug: 'speed-dial', files: [resolve(libRoot, 'speed-dial/speed-dial.component.ts')] },
  {
    slug: 'confirm-dialog',
    files: [resolve(libRoot, 'confirm-dialog/confirm-dialog.component.ts'), resolve(libRoot, 'confirm-dialog/confirm-dialog.service.ts'), resolve(libRoot, 'confirm-dialog/confirm-dialog.types.ts')],
    optionTypes: ['ConfirmDialogOptions'],
  },
  {
    slug: 'confirm-popup',
    files: [resolve(libRoot, 'confirm-popup/confirm-popup.component.ts'), resolve(libRoot, 'confirm-popup/confirm-popup.service.ts'), resolve(libRoot, 'confirm-popup/confirm-popup.types.ts')],
    optionTypes: ['ConfirmPopupOptions'],
  },
  { slug: 'drawer', files: [resolve(libRoot, 'drawer/drawer.component.ts')] },
  { slug: 'popover', files: [resolve(libRoot, 'popover/popover.component.ts')] },
  { slug: 'tooltip', files: [resolve(libRoot, 'tooltip/tooltip.directive.ts')] },
  { slug: 'inline-message', files: [resolve(libRoot, 'inline-message/inline-message.component.ts')] },
  { slug: 'progress-bar', files: [resolve(libRoot, 'progress-bar/progress-bar.component.ts')] },
  { slug: 'progress-spinner', files: [resolve(libRoot, 'progress-spinner/progress-spinner.component.ts')] },
  { slug: 'panel', files: [resolve(libRoot, 'panel/panel.component.ts')] },
  { slug: 'fieldset', files: [resolve(libRoot, 'fieldset/fieldset.component.ts'), resolve(libRoot, 'fieldset/fieldset.directives.ts')] },
  {
    slug: 'accordion',
    files: [
      resolve(libRoot, 'accordion/accordion.component.ts'),
      resolve(libRoot, 'accordion/accordion-tab.component.ts'),
      resolve(libRoot, 'accordion/accordion-tab.directives.ts'),
    ],
  },
  { slug: 'block-ui', files: [resolve(libRoot, 'block-ui/block-ui.component.ts')] },
  { slug: 'divider', files: [resolve(libRoot, 'divider/divider.component.ts')] },
  { slug: 'inplace', files: [resolve(libRoot, 'inplace/inplace.component.ts')] },
  { slug: 'scroll-panel', files: [resolve(libRoot, 'scroll-panel/scroll-panel.component.ts')] },
  {
    slug: 'splitter',
    files: [
      resolve(libRoot, 'splitter/splitter.component.ts'),
      resolve(libRoot, 'splitter/splitter-panel.component.ts'),
      resolve(libRoot, 'splitter/splitter-gutter.component.ts'),
    ],
  },
  { slug: 'toolbar', files: [resolve(libRoot, 'toolbar/toolbar.component.ts')] },
  { slug: 'breadcrumb', files: [resolve(libRoot, 'breadcrumb/breadcrumb.component.ts')] },
  { slug: 'paginator', files: [resolve(libRoot, 'paginator/paginator.component.ts')] },
  { slug: 'tabs', files: [resolve(libRoot, 'tabs/tabs.component.ts'), resolve(libRoot, 'tabs/tab.component.ts')] },
  { slug: 'tab-menu', files: [resolve(libRoot, 'tab-menu/tab-menu.component.ts'), resolve(libRoot, 'menu/menu.types.ts')], optionTypes: ['MenuItem'] },
  { slug: 'steps', files: [resolve(libRoot, 'steps/steps.component.ts')] },
  { slug: 'stepper', files: [resolve(libRoot, 'stepper/stepper.component.ts'), resolve(libRoot, 'stepper/step-panel.component.ts')] },
  { slug: 'menu', files: [resolve(libRoot, 'menu/menu.component.ts'), resolve(libRoot, 'menu/menu.types.ts')], optionTypes: ['MenuItem'] },
  { slug: 'menubar', files: [resolve(libRoot, 'menubar/menubar.component.ts'), resolve(libRoot, 'menu/menu.types.ts')], optionTypes: ['MenuItem'] },
  { slug: 'tiered-menu', files: [resolve(libRoot, 'tiered-menu/tiered-menu.component.ts'), resolve(libRoot, 'menu/menu.types.ts')], optionTypes: ['MenuItem'] },
  { slug: 'mega-menu', files: [resolve(libRoot, 'mega-menu/mega-menu.component.ts'), resolve(libRoot, 'menu/menu.types.ts')], optionTypes: ['MenuItem'] },
  { slug: 'panel-menu', files: [resolve(libRoot, 'panel-menu/panel-menu.component.ts'), resolve(libRoot, 'menu/menu.types.ts')], optionTypes: ['MenuItem'] },
  { slug: 'context-menu', files: [resolve(libRoot, 'context-menu/context-menu.directive.ts')] },
  { slug: 'dock', files: [resolve(libRoot, 'dock/dock.component.ts')] },
  { slug: 'autocomplete', files: [resolve(libRoot, 'autocomplete/autocomplete.component.ts')] },
  { slug: 'cascade-select', files: [resolve(libRoot, 'cascade-select/cascade-select.component.ts')] },
  { slug: 'color-picker', files: [resolve(libRoot, 'color-picker/color-picker.component.ts')] },
  { slug: 'date-picker', files: [resolve(libRoot, 'date-picker/date-picker.component.ts')] },
  { slug: 'editor', files: [resolve(libRoot, 'editor/editor.component.ts')] },
  {
    slug: 'float-label',
    files: [resolve(libRoot, 'float-label/float-label.component.ts'), resolve(libRoot, 'float-label/float-label-text.directive.ts')],
  },
  {
    slug: 'icon-field',
    files: [resolve(libRoot, 'icon-field/icon-field.component.ts'), resolve(libRoot, 'icon-field/icon-field-icon.directive.ts')],
  },
  {
    slug: 'ifta-label',
    files: [resolve(libRoot, 'ifta-label/ifta-label.component.ts'), resolve(libRoot, 'ifta-label/ifta-label-text.directive.ts')],
  },
  { slug: 'file-upload', files: [resolve(libRoot, 'file-upload/file-upload.component.ts')] },
  { slug: 'input-chips', files: [resolve(libRoot, 'input-chips/input-chips.component.ts')] },
  {
    slug: 'input-group',
    files: [resolve(libRoot, 'input-group/input-group.component.ts'), resolve(libRoot, 'input-group/input-group-addon.directive.ts')],
  },
  { slug: 'input-number', files: [resolve(libRoot, 'input-number/input-number.component.ts')] },
  { slug: 'input-otp', files: [resolve(libRoot, 'input-otp/input-otp.component.ts')] },
  { slug: 'knob', files: [resolve(libRoot, 'knob/knob.component.ts')] },
  { slug: 'listbox', files: [resolve(libRoot, 'listbox/listbox.component.ts')] },
  { slug: 'multi-select', files: [resolve(libRoot, 'multi-select/multi-select.component.ts')] },
  { slug: 'password', files: [resolve(libRoot, 'password/password.component.ts')] },
  { slug: 'radio-button', files: [resolve(libRoot, 'radio-button/radio-button.component.ts')] },
  { slug: 'rating', files: [resolve(libRoot, 'rating/rating.component.ts')] },
  { slug: 'select', files: [resolve(libRoot, 'select/select.component.ts')] },
  { slug: 'select-button', files: [resolve(libRoot, 'select-button/select-button.component.ts')] },
  { slug: 'slider', files: [resolve(libRoot, 'slider/slider.component.ts')] },
  { slug: 'textarea', files: [resolve(libRoot, 'textarea/textarea.directive.ts')] },
  { slug: 'toggle-button', files: [resolve(libRoot, 'toggle-button/toggle-button.component.ts')] },
  { slug: 'toggle-switch', files: [resolve(libRoot, 'toggle-switch/toggle-switch.component.ts')] },
  { slug: 'avatar', files: [resolve(libRoot, 'avatar/avatar.component.ts')] },
  { slug: 'avatar-group', files: [resolve(libRoot, 'avatar/avatar-group.component.ts')] },
  { slug: 'badge', files: [resolve(libRoot, 'badge/badge.component.ts')] },
  { slug: 'overlay-badge', files: [resolve(libRoot, 'overlay-badge/overlay-badge.component.ts')] },
  { slug: 'card', files: [resolve(libRoot, 'card/card.component.ts'), resolve(libRoot, 'card/card.directives.ts')] },
  { slug: 'carousel', files: [resolve(libRoot, 'carousel/carousel.component.ts')] },
  { slug: 'chip', files: [resolve(libRoot, 'chip/chip.component.ts')] },
  {
    slug: 'data-table',
    files: [resolve(libRoot, 'data-table/data-table.component.ts'), resolve(libRoot, 'data-table/table-column.component.ts')],
  },
  { slug: 'data-view', files: [resolve(libRoot, 'data-view/data-view.component.ts')] },
  { slug: 'galleria', files: [resolve(libRoot, 'galleria/galleria.component.ts')] },
  { slug: 'image', files: [resolve(libRoot, 'image/image.component.ts')] },
  { slug: 'image-compare', files: [resolve(libRoot, 'image-compare/image-compare.component.ts')] },
  { slug: 'order-list', files: [resolve(libRoot, 'order-list/order-list.component.ts')] },
  { slug: 'organization-chart', files: [resolve(libRoot, 'organization-chart/organization-chart.component.ts')] },
  { slug: 'pick-list', files: [resolve(libRoot, 'pick-list/pick-list.component.ts')] },
  { slug: 'skeleton', files: [resolve(libRoot, 'skeleton/skeleton.component.ts')] },
  { slug: 'tag', files: [resolve(libRoot, 'tag/tag.component.ts')] },
  { slug: 'timeline', files: [resolve(libRoot, 'timeline/timeline.component.ts')] },
  { slug: 'tree', files: [resolve(libRoot, 'tree/tree.component.ts')] },
  {
    slug: 'tree-table',
    files: [resolve(libRoot, 'tree-table/tree-table.component.ts'), resolve(libRoot, 'data-table/table-column.component.ts')],
  },
  { slug: 'tree-select', files: [resolve(libRoot, 'tree-select/tree-select.component.ts')] },
  { slug: 'virtual-scroller', files: [resolve(libRoot, 'virtual-scroller/virtual-scroller.component.ts')] },
  { slug: 'meter-group', files: [resolve(libRoot, 'meter-group/meter-group.component.ts')] },
];

const SIGNAL_FACTORY_NAMES = new Set(['input', 'output', 'model']);

function isExported(node: ts.ClassDeclaration): boolean {
  return (ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export) !== 0;
}

function isPublic(node: ts.ClassElement): boolean {
  const flags = ts.getCombinedModifierFlags(node as unknown as ts.Declaration);
  return (flags & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected)) === 0;
}

/** The Angular decorator name on a class declaration (`Component`, `Directive`, `Injectable`, ...), if any. */
function decoratorName(node: ts.ClassDeclaration): string | null {
  for (const decorator of ts.getDecorators(node) ?? []) {
    const expr = decorator.expression;
    if (ts.isCallExpression(expr) && ts.isIdentifier(expr.expression)) return expr.expression.text;
    if (ts.isIdentifier(expr)) return expr.text;
  }
  return null;
}

/**
 * True when the class `implements` an interface whose name ends in `Host` —
 * this codebase's own convention (`AccordionHost`, `SplitterHost`,
 * `TreeHost`, `OrgChartHost`, ...) for a child content-child to reach back
 * up to its parent via DI instead of a template event binding. Those
 * interface methods (`requestToggle`, `startResize`, ...) are public only
 * because TypeScript requires it to satisfy the interface — not real
 * consumer-facing API — so method extraction skips them entirely rather
 * than trying to name each one individually.
 */
function implementsHostInterface(node: ts.ClassDeclaration): boolean {
  for (const clause of node.heritageClauses ?? []) {
    if (clause.token !== ts.SyntaxKind.ImplementsKeyword) continue;
    for (const type of clause.types) {
      const name = ts.isIdentifier(type.expression) ? type.expression.text : null;
      if (name?.endsWith('Host')) return true;
    }
  }
  return false;
}

function jsDocDescription(node: ts.Node): string | null {
  const jsDoc = ts.getJSDocCommentsAndTags(node).find(ts.isJSDoc);
  return jsDoc?.comment ? (ts.getTextOfJSDocComment(jsDoc.comment) ?? null) : null;
}

/** Base factory identifier for `input(...)`, `input.required(...)`, `output(...)`, etc. */
function signalFactoryName(expression: ts.LeftHandSideExpression): string | null {
  if (ts.isIdentifier(expression)) {
    return SIGNAL_FACTORY_NAMES.has(expression.text) ? expression.text : null;
  }
  if (ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.expression)) {
    return SIGNAL_FACTORY_NAMES.has(expression.expression.text) ? expression.expression.text : null;
  }
  return null;
}

/** Extracts the first top-level generic argument of e.g. `InputSignal<T, WriteT>`, respecting nested `<>`. */
function firstTypeArgument(typeString: string): string | null {
  const open = typeString.indexOf('<');
  if (open === -1) return null;
  let depth = 0;
  for (let i = open; i < typeString.length; i++) {
    if (typeString[i] === '<') depth++;
    else if (typeString[i] === '>') {
      depth--;
      if (depth === 0) return typeString.slice(open + 1, i).split(',')[0]?.trim() ?? null;
    } else if (typeString[i] === ',' && depth === 1) {
      return typeString.slice(open + 1, i).trim();
    }
  }
  return null;
}

/** The name a consumer binds: an `alias: '...'` option wins over the class field name. */
function bindingName(member: ts.PropertyDeclaration, sourceFile: ts.SourceFile): string {
  const call = member.initializer as ts.CallExpression;
  for (const arg of call.arguments) {
    if (!ts.isObjectLiteralExpression(arg)) continue;
    for (const prop of arg.properties) {
      if (ts.isPropertyAssignment(prop) && prop.name.getText(sourceFile) === 'alias' && ts.isStringLiteral(prop.initializer)) return prop.initializer.text;
    }
  }
  return member.name.getText(sourceFile);
}

function extractSignalProperties(classNode: ts.ClassDeclaration, sourceFile: ts.SourceFile, checker: ts.TypeChecker): ApiEntry[] {
  const entries: ApiEntry[] = [];
  for (const member of classNode.members) {
    if (!ts.isPropertyDeclaration(member) || !member.initializer || !ts.isCallExpression(member.initializer)) continue;

    const kind = signalFactoryName(member.initializer.expression);
    if (kind !== 'input' && kind !== 'output' && kind !== 'model') continue;

    const typeString = checker.typeToString(checker.getTypeAtLocation(member.name), member, ts.TypeFormatFlags.NoTruncation);
    const defaultArg = member.initializer.arguments[0];
    const isOptionsObject = defaultArg && ts.isObjectLiteralExpression(defaultArg);

    entries.push({
      name: bindingName(member, sourceFile),
      kind,
      type: firstTypeArgument(typeString) ?? typeString,
      default: defaultArg && !isOptionsObject ? defaultArg.getText(sourceFile) : null,
      description: jsDocDescription(member),
    });
    if (kind === 'model') {
      entries.push({
        name: `${bindingName(member, sourceFile)}Change`,
        kind: 'output',
        type: firstTypeArgument(typeString) ?? typeString,
        default: null,
        description: `Emits when \`${bindingName(member, sourceFile)}\` changes (the output half of the two-way \`model()\` binding).`,
      });
    }
  }
  return entries;
}

/** Members of the named exported interfaces, e.g. the options object a service method takes. */
function extractOptionMembers(sourceFile: ts.SourceFile, optionTypes: readonly string[]): ApiEntry[] {
  const entries: ApiEntry[] = [];
  for (const statement of sourceFile.statements) {
    if (!ts.isInterfaceDeclaration(statement) || !optionTypes.includes(statement.name.text)) continue;
    for (const member of statement.members) {
      if (!ts.isPropertySignature(member) || !member.type) continue;
      entries.push({ name: member.name.getText(sourceFile), kind: 'option', type: member.type.getText(sourceFile), default: null, description: jsDocDescription(member) });
    }
  }
  return entries;
}

/**
 * Template slots a consumer fills with `<ng-template #name>`: a
 * `contentChild('name', { read: TemplateRef })` query becomes a `#name` row,
 * whatever its visibility, because the slot is consumer-facing even when the
 * query field itself is not.
 */
function extractTemplateSlots(classNode: ts.ClassDeclaration, sourceFile: ts.SourceFile): ApiEntry[] {
  const entries: ApiEntry[] = [];
  for (const member of classNode.members) {
    if (!ts.isPropertyDeclaration(member) || !member.initializer || !ts.isCallExpression(member.initializer)) continue;
    const call = member.initializer;
    if (!ts.isIdentifier(call.expression) || call.expression.text !== 'contentChild') continue;
    const ref = call.arguments[0];
    if (!ref || !ts.isStringLiteral(ref)) continue;
    const explicitRead = call.arguments[1] && ts.isObjectLiteralExpression(call.arguments[1]) ? call.arguments[1].getText(sourceFile) : '';
    const typeArg = call.typeArguments?.[0]?.getText(sourceFile) ?? '';
    // A string-ref query is a consumer-facing `<ng-template #name>` slot when it reads a TemplateRef.
    if (!/TemplateRef/.test(explicitRead) && !/^TemplateRef\b/.test(typeArg)) continue;
    entries.push({ name: `#${ref.text}`, kind: 'template', type: 'TemplateRef', default: null, description: jsDocDescription(member) });
  }
  return entries;
}

/**
 * Framework interface plumbing — publicly typed by TypeScript (Angular's
 * lifecycle/`ControlValueAccessor` interfaces can't be `protected`), but
 * never meant to be called directly by a consumer, so excluded even where
 * method extraction otherwise applies to `@Component`/`@Directive` classes.
 */
const FRAMEWORK_METHOD_NAMES = new Set([
  'ngOnInit',
  'ngOnDestroy',
  'ngOnChanges',
  'ngDoCheck',
  'ngAfterViewInit',
  'ngAfterViewChecked',
  'ngAfterContentInit',
  'ngAfterContentChecked',
  'writeValue',
  'registerOnChange',
  'registerOnTouched',
  'setDisabledState',
]);

/**
 * Public methods meant as real consumer-facing API — an `@Injectable`
 * service's methods always qualify (Dialog/Toast have no signal inputs at
 * all, methods are their whole API); a `@Component`/`@Directive`'s methods
 * only do when a consumer is meant to call them imperatively via a template
 * reference (Popover's `open()`/`close()`/`toggle()`, Menu's `open()`/
 * `close()`) rather than through inputs/outputs alone.
 */
function extractPublicMethods(classNode: ts.ClassDeclaration, sourceFile: ts.SourceFile, excludeFrameworkMethods: boolean): ApiEntry[] {
  const entries: ApiEntry[] = [];
  for (const member of classNode.members) {
    if (!ts.isMethodDeclaration(member) || !member.name || !isPublic(member)) continue;
    if (excludeFrameworkMethods && FRAMEWORK_METHOD_NAMES.has(member.name.getText(sourceFile))) continue;

    const typeParams = member.typeParameters?.length
      ? `<${member.typeParameters.map((t) => t.getText(sourceFile)).join(', ')}>`
      : '';
    const params = member.parameters.map((p) => p.getText(sourceFile)).join(', ');
    const returnType = member.type ? `: ${member.type.getText(sourceFile)}` : '';

    entries.push({
      name: member.name.getText(sourceFile),
      kind: 'method',
      signature: `${member.name.getText(sourceFile)}${typeParams}(${params})${returnType}`,
      description: jsDocDescription(member),
    });
  }
  return entries;
}

function extractEntries(sourceFile: ts.SourceFile, checker: ts.TypeChecker): ApiEntry[] {
  const entries: ApiEntry[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isClassDeclaration(node) && isExported(node)) {
      const decorator = decoratorName(node);
      if (decorator === 'Injectable') {
        entries.push(...extractPublicMethods(node, sourceFile, false));
      } else {
        entries.push(...extractSignalProperties(node, sourceFile, checker));
        entries.push(...extractTemplateSlots(node, sourceFile));
        if (!implementsHostInterface(node)) {
          entries.push(...extractPublicMethods(node, sourceFile, true));
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return entries;
}

function main(): void {
  const files = COMPONENTS.flatMap((c) => c.files);
  const program = ts.createProgram(files, {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    experimentalDecorators: true,
    skipLibCheck: true,
    strict: true,
  });
  const checker = program.getTypeChecker();

  mkdirSync(outDir, { recursive: true });

  for (const { slug, files: componentFiles, optionTypes } of COMPONENTS) {
    const entries: ApiEntry[] = [];
    for (const file of componentFiles) {
      const sourceFile = program.getSourceFile(file);
      if (!sourceFile) {
        throw new Error(`generate-api-docs: could not load source file for "${slug}" (${file})`);
      }
      entries.push(...extractEntries(sourceFile, checker));
      if (optionTypes) entries.push(...extractOptionMembers(sourceFile, optionTypes));
    }
    writeFileSync(resolve(outDir, `${slug}.json`), JSON.stringify(entries, null, 2) + '\n');
    console.log(`generate-api-docs: wrote ${entries.length} entries for "${slug}"`);
  }
}

main();
