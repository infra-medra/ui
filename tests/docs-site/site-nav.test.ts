import {
  SECTIONS,
  filterGroups,
  isFoundationsSlug,
  sectionForUrl,
  visibleSections,
  type NavGroup,
  type NavSection,
} from '../../projects/site/src/app/nav/site-nav';

const componentGroups: NavGroup[] = [
  {
    label: 'Form / input',
    items: [
      { slug: 'checkbox', label: 'Checkbox' },
      { slug: 'input-text', label: 'InputText' },
    ],
  },
  {
    label: 'Buttons / actions',
    items: [
      { slug: 'button', label: 'Button' },
      { slug: 'check-list', label: 'CheckList' },
    ],
  },
];

describe('site-nav', () => {
  describe('visibleSections', () => {
    // SITE-009.S2
    it('SITE-009.S2: omits a section that has no published page', () => {
      const sections: NavSection[] = [
        { id: 'components', label: 'Components', groups: componentGroups },
        { id: 'guides', label: 'Guides', groups: [] },
        { id: 'reference', label: 'Reference', groups: [{ label: 'Empty', items: [] }] },
      ];
      expect(visibleSections(sections).map((s) => s.id)).toEqual(['components']);
    });

    it('SITE-009.S2: exposes the five top-level sections in order', () => {
      expect(SECTIONS.map((s) => s.id)).toEqual([
        'getting-started',
        'foundations',
        'components',
        'guides',
        'reference',
      ]);
    });
  });

  describe('filterGroups', () => {
    // SITE-010.S1
    it('SITE-010.S1: keeps only items whose name contains the text, ignoring case', () => {
      const result = filterGroups(componentGroups, 'CHECK');
      const labels = result.flatMap((g) => g.items.map((i) => i.label));
      expect(labels).toEqual(['Checkbox', 'CheckList']);
    });

    it('SITE-010.S1: drops groups left without items', () => {
      expect(filterGroups(componentGroups, 'input').map((g) => g.label)).toEqual(['Form / input']);
    });

    it('SITE-010.S1: returns every group for an empty or blank query', () => {
      expect(filterGroups(componentGroups, '')).toEqual(componentGroups);
      expect(filterGroups(componentGroups, '   ')).toEqual(componentGroups);
    });

    // SITE-010.S2
    it('SITE-010.S2: returns an empty list when nothing matches', () => {
      expect(filterGroups(componentGroups, 'zzz-no-match')).toEqual([]);
    });

    it('SITE-010.S2: treats regex characters as plain text', () => {
      expect(filterGroups(componentGroups, '.*')).toEqual([]);
      expect(filterGroups(componentGroups, '(')).toEqual([]);
    });
  });

  describe('sectionForUrl', () => {
    it('maps component, foundations and getting-started URLs to their section', () => {
      expect(sectionForUrl('/docs/components/button')).toBe('components');
      expect(sectionForUrl('/docs/foundations/theming')).toBe('foundations');
      expect(sectionForUrl('/docs/getting-started/installation')).toBe('getting-started');
      expect(sectionForUrl('/docs')).toBe('getting-started');
    });

    it('ignores query string and fragment', () => {
      expect(sectionForUrl('/docs/components/button?x=1#api')).toBe('components');
    });

    it('returns null for URLs outside the docs sections', () => {
      expect(sectionForUrl('/')).toBeNull();
      expect(sectionForUrl('/docs/componentsX/button')).toBeNull();
    });
  });

  describe('foundations slug allowlist (M-08)', () => {
    it('accepts the listed foundations slugs', () => {
      for (const slug of [
        'brand-identity',
        'design-tokens',
        'theming',
        'accessibility',
        'i18n',
        'overlays',
        'forms',
      ]) {
        expect(isFoundationsSlug(slug)).toBe(true);
      }
    });

    it('rejects prototype keys, empty and unknown slugs', () => {
      for (const slug of ['__proto__', 'constructor', 'toString', 'hasOwnProperty', '', 'nope', '../x']) {
        expect(isFoundationsSlug(slug)).toBe(false);
      }
    });
  });
});
