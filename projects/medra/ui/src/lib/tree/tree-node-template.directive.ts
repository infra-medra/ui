import { Directive, TemplateRef, inject, input } from '@angular/core';
import { TreeNode } from './tree.types';

/**
 * Marks an `<ng-template>` projected into `<med-tree>` as the content for nodes whose own `type`
 * matches this directive's value — e.g. `<ng-template medTreeNodeTemplate="folder" let-node>`. A
 * directive on the template itself (not a named `contentChild` per type, the idiom this library
 * otherwise uses for one-of-a-few-known-names slots like `medCardHeader`) because the set of `type`
 * values is open-ended and consumer-defined, not a fixed list this component could name in advance.
 *
 * No value at all (`<ng-template medTreeNodeTemplate let-node>`) registers
 * the default template, used for any node whose own `type` is unset or
 * doesn't match another registered one.
 */
@Directive({ selector: '[medTreeNodeTemplate]', standalone: true })
export class TreeNodeTemplateDirective {
  readonly type = input('', { alias: 'medTreeNodeTemplate' });
  readonly templateRef = inject<TemplateRef<{ $implicit: TreeNode }>>(TemplateRef);
}
