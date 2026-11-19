import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '../..');
const API_DIR = path.join(REPO_ROOT, 'projects/site/src/content/api');

interface ApiEntry {
  name: string;
  kind: string;
  type?: string;
  signature?: string;
  default?: string | null;
  description: string | null;
}

function readApi(name: string): ApiEntry[] {
  const filePath = path.join(API_DIR, `${name}.json`);
  expect(fs.existsSync(filePath)).toBe(true);
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown;
  expect(Array.isArray(parsed)).toBe(true);
  const entries = parsed as ApiEntry[];
  expect(entries.length).toBeGreaterThan(0);
  for (const entry of entries) {
    expect(typeof entry.name).toBe('string');
    expect(typeof entry.kind).toBe('string');
    expect(typeof entry.type === 'string' || typeof entry.signature === 'string').toBe(true);
    expect(entry.default === undefined || entry.default === null || typeof entry.default === 'string').toBe(true);
    expect(entry.description === null || typeof entry.description === 'string').toBe(true);
  }
  return entries;
}

// @scenario SITE-004.S1
describe('Docs Site Wave 2 Coverage (SITE-004.S1)', () => {
  it('documents all 20 Wave 2 Layout, Navigation & Data Display API additions', () => {
    const expectedMembers: Record<string, string[]> = {
      divider: ['align'],
      'scroll-panel': ['scrollTop', 'refresh'],
      splitter: ['stateKey', 'stateStorage', 'resizeStart', 'resizeEnd'],
      inplace: ['preventClick', 'activate', 'deactivate', '#content'],
      menu: ['#start', '#end', '#item'],
      menubar: ['breakpoint', '#start', '#end', '#item'],
      breadcrumb: ['#separator'],
      paginator: ['alwaysShow', 'currentPageReportTemplate'],
      'data-table': ['resizableColumns', 'expandedRowKeys', 'rowExpand', 'rowCollapse', 'stateKey', 'stateStorage', 'scrollable', 'scrollHeight', '#rowexpansion'],
      tree: ['draggableNodes', 'droppableNodes', 'nodeDrop', 'propagateSelectionUp', 'propagateSelectionDown'],
      'tree-table': ['selectionMode', 'selection', 'sortMode', 'sortField', 'sortOrder', 'paginator', 'rows', 'first'],
      timeline: ['layout', 'align'],
      'order-list': ['filterBy', 'stripedRows'],
      'pick-list': ['stripedRows', 'showSourceControls', 'showTargetControls'],
      'virtual-scroller': ['orientation'],
      avatar: ['onImageError'],
      badge: ['value'],
      chip: ['label'],
      galleria: ['fullScreen', 'visible', 'showItemNavigators'],
      carousel: ['circular'],
    };

    expect(Object.keys(expectedMembers)).toHaveLength(20);

    for (const [component, requiredNames] of Object.entries(expectedMembers)) {
      const entries = readApi(component);
      const names = new Set(entries.map((e) => e.name));
      for (const member of requiredNames) {
        expect(names.has(member)).toBe(true);
      }
    }
  });
});
