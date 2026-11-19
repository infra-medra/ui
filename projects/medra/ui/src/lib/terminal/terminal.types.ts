export interface TerminalLine {
  readonly type: 'command' | 'response';
  readonly text: string;
}
