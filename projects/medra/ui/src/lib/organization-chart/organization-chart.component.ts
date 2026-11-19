import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { mergeClasses } from '../utils/merge-classes';
import { OrgChartNodeComponent } from './org-chart-node.component';
import { OrgChartHost } from './organization-chart.tokens';
import { OrgChartNode, OrgChartSelectionMode } from './organization-chart.types';

/** Selectable (i.e. not explicitly opted out) direct children of `node`. */
function selectableChildren(node: OrgChartNode): readonly OrgChartNode[] {
  return (node.children ?? []).filter((child) => child.selectable !== false);
}

/** Every selectable descendant of `node`, at any depth — not including `node` itself. */
function selectableDescendants(node: OrgChartNode): OrgChartNode[] {
  const result: OrgChartNode[] = [];
  for (const child of selectableChildren(node)) {
    result.push(child, ...selectableDescendants(child));
  }
  return result;
}

/** Path from `root` down to (but excluding) `target`, or `[]` if `target` is `root` itself or isn't in the tree. */
function findAncestors(root: OrgChartNode, target: OrgChartNode): OrgChartNode[] {
  function search(node: OrgChartNode, path: readonly OrgChartNode[]): OrgChartNode[] | null {
    if (node === target) {
      return [...path];
    }
    for (const child of node.children ?? []) {
      const found = search(child, [...path, node]);
      if (found) {
        return found;
      }
    }
    return null;
  }
  return search(root, []) ?? [];
}

/**
 * OrganizationChart primitive (Tier 4, first item): a single-root
 * hierarchy (`value`, one `OrgChartNode`, not an array — an org chart only
 * ever has one top box) rendered with connector lines between a node and
 * its children, via the classic pure-CSS technique (each child `<li>` draws
 * its own half of the horizontal line above it, so the line only ever spans
 * between siblings, never past the outermost ones) rather than SVG or a
 * `<table>`-based layout — no extra rendering dependency, and the whole
 * tree stays real, selectable/focusable HTML.
 *
 * Selection (`selectionMode`/`selection`) is centralized here — one
 * `model()` for the whole tree — while each node's own expand/collapse
 * state is local to its own recursively-nested `OrgChartNodeComponent` (see
 * that file's doc for why, and for `OrgChartHost`'s doc for how a click deep
 * in the tree reaches back up to this component's `selection`).
 *
 * **`selectionMode: 'checkbox'`** (a niche but well-known pattern in
 * permission-style org charts). Unlike `TreeComponent`'s own `'checkbox'` mode
 * (still a flat `'multiple'`-equivalent toggle, no cascade — a separate,
 * still-open cut on that component), this one actually cascades: checking
 * a node checks every selectable descendant too, and an ancestor is only
 * added to `selection` once *all* of its own selectable children are
 * checked — recomputed one level at a time up the chain on every toggle,
 * not stored as some separate "fully checked" flag. A branch with only
 * *some* descendants checked reads as indeterminate purely by *not* being
 * in `selection` while still having a checked descendant somewhere below
 * it (`isIndeterminate()`) — no separate tri-state bookkeeping, just that
 * one invariant. `selection`'s shape is unchanged from `'multiple'` mode
 * (`readonly OrgChartNode[]`): a consumer reading it back sees exactly the
 * nodes whose checkbox is fully (not partially) checked, parents included.
 *
 * **Partly real**: it asked for `value` to become an array (multiple roots), persistable
 * `collapsedKeys`/`selectionKeys`, and `onNodeExpand`/`onNodeCollapse` events. The single-root
 * shape this component already has is kept, and `collapsedKeys`/`selectionKeys` are not added — no
 * code change for either of those three. **`onNodeExpand`/`onNodeCollapse` are real** (confirmed
 * `@Output() onNodeExpand`/`onNodeCollapse`, firing from the per-node toggle), so those two are the
 * only part actually implemented here — as `nodeExpand`/`nodeCollapse`, emitting the bare
 * `OrgChartNode` (this library's own single-primitive-payload convention, not the reference
 * library's `{ originalEvent, node }` object) whenever a node's expand state actually changes, from
 * either the toggle button or ArrowDown expanding a collapsed node.
 */
@Component({
  selector: 'med-organization-chart',
  standalone: true,
  imports: [OrgChartNodeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClass()' },
  providers: [{ provide: OrgChartHost, useExisting: OrganizationChartComponent }],
  template: `
    @if (value(); as root) {
      <med-org-chart-node [node]="root" [expandLabel]="expandLabel()" [collapseLabel]="collapseLabel()" />
    }
  `,
})
export class OrganizationChartComponent implements OrgChartHost {
  readonly value = input<OrgChartNode | null>(null);
  readonly selectionMode = input<OrgChartSelectionMode>(null);
  readonly selection = model<OrgChartNode | readonly OrgChartNode[] | null>(null);
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly expandLabel = input('Expand');
  readonly collapseLabel = input('Collapse');
  readonly class = input('', { alias: 'class' });

  readonly nodeExpand = output<OrgChartNode>();
  readonly nodeCollapse = output<OrgChartNode>();

  protected readonly hostClass = computed(() => mergeClasses('inline-flex overflow-x-auto p-4', this.class()));

  mode(): OrgChartSelectionMode {
    return this.selectionMode();
  }

  reportExpandedChange(node: OrgChartNode, expanded: boolean): void {
    (expanded ? this.nodeExpand : this.nodeCollapse).emit(node);
  }

  isSelected(node: OrgChartNode): boolean {
    const sel = this.selection();
    const mode = this.selectionMode();
    return mode === 'multiple' || mode === 'checkbox' ? Array.isArray(sel) && (sel as readonly OrgChartNode[]).includes(node) : sel === node;
  }

  isIndeterminate(node: OrgChartNode): boolean {
    if (this.selectionMode() !== 'checkbox' || this.isSelected(node)) {
      return false;
    }
    return selectableDescendants(node).some((descendant) => this.isSelected(descendant));
  }

  toggleSelect(node: OrgChartNode): void {
    if (this.selectionMode() === 'checkbox') {
      this.toggleCheckbox(node);
      return;
    }
    if (this.selectionMode() === 'multiple') {
      const current = (this.selection() as readonly OrgChartNode[] | null) ?? [];
      this.selection.set(current.includes(node) ? current.filter((n) => n !== node) : [...current, node]);
      return;
    }
    if (this.selection() === node) {
      return;
    }
    this.selection.set(node);
  }

  private toggleCheckbox(node: OrgChartNode): void {
    const root = this.value();
    if (!root) {
      return;
    }
    const current = new Set((this.selection() as readonly OrgChartNode[] | null) ?? []);
    const nowChecking = !current.has(node);
    const descendants = selectableDescendants(node);

    if (nowChecking) {
      current.add(node);
      for (const descendant of descendants) {
        current.add(descendant);
      }
    } else {
      current.delete(node);
      for (const descendant of descendants) {
        current.delete(descendant);
      }
    }

    // Recompute each ancestor's own full-checked membership, from the
    // closest parent up to the root: an ancestor belongs in `selection`
    // only once every one of its own selectable children does.
    const ancestors = findAncestors(root, node);
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const ancestor = ancestors[i];
      const kids = selectableChildren(ancestor);
      const allChecked = kids.length > 0 && kids.every((kid) => current.has(kid));
      if (allChecked) {
        current.add(ancestor);
      } else {
        current.delete(ancestor);
      }
    }

    this.selection.set([...current]);
  }
}
