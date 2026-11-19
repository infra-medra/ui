export type FileRejectionReason = 'type' | 'size';

export interface RejectedFile {
  readonly file: File;
  readonly reason: FileRejectionReason;
}

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

/** `1536` → `"1.5 KB"`. Whole bytes print without decimals (`"512 B"`), everything above gets one. */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) {
    return '0 B';
  }
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${exponent === 0 ? value : value.toFixed(1)} ${UNITS[exponent]}`;
}

/**
 * Matches the same three pattern kinds the native `<input accept>` attribute
 * supports (extension, `type/subtype`, `type/*`) — client-side, since
 * drag-and-drop bypasses the browser's own `accept` filtering entirely, and
 * even for the native file picker not every OS enforces it strictly. An
 * empty/blank `accept` matches everything (no restriction configured).
 */
export function matchesAccept(file: File, accept: string): boolean {
  const patterns = accept
    .split(',')
    .map((pattern) => pattern.trim())
    .filter(Boolean);
  if (patterns.length === 0) {
    return true;
  }
  return patterns.some((pattern) => {
    if (pattern.startsWith('.')) {
      return file.name.toLowerCase().endsWith(pattern.toLowerCase());
    }
    if (pattern.endsWith('/*')) {
      return file.type.startsWith(pattern.slice(0, -1));
    }
    return file.type === pattern;
  });
}
