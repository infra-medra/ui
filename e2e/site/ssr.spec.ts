import { expect, test } from '@playwright/test';

// These tests read the raw server HTML, with no JavaScript executed.
test.describe('Prerendered HTML', () => {
  // SITE-002.S1
  test('SITE-002.S1: raw HTML of a component page already has header and sidebar', async ({ request }) => {
    const response = await request.get('/docs/components/button');
    expect(response.ok()).toBe(true);
    const html = await response.text();

    expect(html).toMatch(/<header[\s>]/);
    for (const section of ['Getting started', 'Foundations', 'Components']) {
      expect(html).toContain(section);
    }
    expect(html).toMatch(/aria-label="Sections"/);
    expect(html).toMatch(/aria-label="Sidebar"/);
    expect(html).toContain('Checkbox');
  });

  // SITE-002.S2
  test('SITE-002.S2: raw HTML of a foundations page has content and the shell', async ({ request }) => {
    const response = await request.get('/docs/foundations/theming');
    expect(response.ok()).toBe(true);
    const html = await response.text();

    expect(html).toMatch(/<h1[\s>]/);
    expect(html).toMatch(/<header[\s>]/);
    expect(html).toMatch(/aria-label="Sidebar"/);
  });
});
