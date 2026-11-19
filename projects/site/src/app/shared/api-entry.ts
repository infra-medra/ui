/**
 * One row of a component's generated API reference table (see
 * tools/generate-api-docs.mts). `input`/`output`/`model` rows come from
 * `@Component`/`@Directive` classes; `method` rows come from `@Injectable`
 * service classes (DialogService, ToastService) — those have no signal
 * inputs, their API is imperative methods instead. `template` rows are
 * `<ng-template #name>` slots (named `#name`) read through `contentChild`.
 */
export type ApiEntry = ApiPropertyEntry | ApiMethodEntry;

export interface ApiPropertyEntry {
  name: string;
  kind: 'input' | 'output' | 'model' | 'template' | 'option';
  type: string;
  default: string | null;
  description: string | null;
}

export interface ApiMethodEntry {
  name: string;
  kind: 'method';
  /** Full signature text, e.g. `open<T, TResult = unknown>(component: ComponentType<T>, options?: DialogOptions): DialogRef<TResult>`. */
  signature: string;
  description: string | null;
}
