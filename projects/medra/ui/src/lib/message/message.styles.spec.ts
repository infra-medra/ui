import { MESSAGE_SEVERITY_ICON, MESSAGE_SEVERITY_ICON_CLASS, messageCardVariants } from './message.styles';

describe('messageCardVariants', () => {
  it('defaults to the info severity', () => {
    expect(messageCardVariants()).toContain('bg-info-50');
  });

  it.each([
    ['info', 'bg-info-50'],
    ['success', 'bg-success-50'],
    ['warn', 'bg-warn-50'],
    ['danger', 'bg-danger-50'],
  ] as const)('severity=%s sets %s', (severity, expectedClass) => {
    expect(messageCardVariants({ severity })).toContain(expectedClass);
  });

  describe('size', () => {
    it('defaults to size=default', () => {
      expect(messageCardVariants()).toContain('p-4');
    });

    it.each([
      ['sm', 'p-2'],
      ['default', 'p-4'],
      ['lg', 'p-5'],
    ] as const)('size=%s sets %s', (size, expectedClass) => {
      expect(messageCardVariants({ size })).toContain(expectedClass);
    });
  });
});

describe('MESSAGE_SEVERITY_ICON / MESSAGE_SEVERITY_ICON_CLASS', () => {
  it('has an icon name and color class for every severity', () => {
    (['info', 'success', 'warn', 'danger'] as const).forEach((severity) => {
      expect(MESSAGE_SEVERITY_ICON[severity]).toBeTruthy();
      expect(MESSAGE_SEVERITY_ICON_CLASS[severity]).toBeTruthy();
    });
  });
});
