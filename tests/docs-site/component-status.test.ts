import {
  COMPONENT_STATUS,
  resolveStatus,
  type ComponentStatus,
} from '../../projects/site/src/app/nav/component-status';

describe('component-status', () => {
  const map: Record<string, ComponentStatus> = {
    button: 'stable',
    'speed-dial': 'beta',
    'fresh-widget': 'new',
  };

  // SITE-013.S4
  it('SITE-013.S4 returns beta for a component classified as beta', () => {
    expect(resolveStatus('speed-dial', map)).toBe('beta');
  });

  // SITE-013.S4
  it('SITE-013.S4 returns new for a component classified as new', () => {
    expect(resolveStatus('fresh-widget', map)).toBe('new');
  });

  // SITE-013.S4
  it('SITE-013.S4 returns stable for a component classified as stable', () => {
    expect(resolveStatus('button', map)).toBe('stable');
  });

  // SITE-013.S4
  it('SITE-013.S4 falls back to stable for a slug missing from the map', () => {
    expect(resolveStatus('unknown-slug', map)).toBe('stable');
  });

  // SITE-013.S4
  it('SITE-013.S4 ignores inherited object keys such as __proto__ and constructor', () => {
    expect(resolveStatus('__proto__', map)).toBe('stable');
    expect(resolveStatus('constructor', map)).toBe('stable');
    expect(resolveStatus('toString', map)).toBe('stable');
  });

  // SITE-013.S4
  it('SITE-013.S4 uses the shipped map by default and every shipped entry is a valid status', () => {
    const valid: ComponentStatus[] = ['stable', 'beta', 'new'];
    for (const status of Object.values(COMPONENT_STATUS)) {
      expect(valid).toContain(status);
    }
    expect(resolveStatus('button')).toBe(COMPONENT_STATUS['button'] ?? 'stable');
  });
});
