import { ButtonSeverity } from '../button/button.styles';

export interface MeterItem {
  readonly label: string;
  readonly value: number;
  /** Falls back to a rotating default palette (by position) when omitted. */
  readonly severity?: ButtonSeverity;
  readonly icon?: string;
}
