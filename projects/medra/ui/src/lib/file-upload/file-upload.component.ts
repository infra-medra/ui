import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, booleanAttribute, computed, forwardRef, inject, input, output, signal, viewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { ButtonDirective } from '../button/button.directive';
import { IconComponent } from '../icon/icon.component';
import { mergeClasses } from '../utils/merge-classes';
import { RejectedFile, formatFileSize, matchesAccept } from './file-upload.utils';

export type FileUploadStatus = 'pending' | 'uploading' | 'done' | 'error';

export interface FileUploadEntry {
  readonly file: File;
  readonly status: FileUploadStatus;
  /** 0-100, meaningful only while `status` is `'uploading'` or after it settles. */
  readonly progress: number;
}

/**
 * FileUpload primitive (Tier 2). At its core, a validated file *picker* +
 * pending-file list — `File[]` via `ControlValueAccessor`, like
 * InputNumber/Password — that never touches the network unless `url()` is
 * set. **`url` is genuinely optional**: every consumer that only wants a
 * validated picker (the original v1 scope) keeps working exactly as
 * before, unaffected by anything below.
 *
 * Client-side `accept`/`maxFileSize` validation runs regardless of the
 * native `<input accept>` filter, because drag-and-drop bypasses that
 * filter entirely and not every OS enforces it strictly for the picker
 * either. Rejections replace (not accumulate on top of) whatever was
 * rejected by the previous attempt — the inline list always reflects only
 * the most recent selection/drop gesture.
 *
 * **Real HTTP upload, reopening a documented cut**. `HttpClient` is injected with
 * `optional: true` — a consumer who never sets `url()` never needs
 * `provideHttpClient()` at all; one who does and forgets it gets a clear
 * thrown error the first time an upload is actually attempted, not a
 * constructor-time `NullInjectorError` for a feature they aren't using.
 * `method` (`'POST'`/`'PUT'`), `fileFieldName` (the `FormData` field name),
 * and `withCredentials` cover the common server contracts without
 * hardcoding one; `auto` uploads immediately on selection/drop instead of
 * requiring the toolbar's "Upload" button. Per-file state
 * (`FileUploadEntry`: `'pending' | 'uploading' | 'done' | 'error'` plus a
 * 0-100 `progress`) is tracked in a `Map<File, ...>` keyed by the same
 * `File` object identity `removeFile()` already relies on — reported via
 * `HttpClient`'s `reportProgress`/`observe: 'events'` (`HttpEventType.
 * UploadProgress`/`Response`), the same low-level API every hand-rolled
 * Angular upload already uses, not a bespoke transport. A failed upload
 * stays in the list as `'error'` (not silently dropped) so the same
 * "Upload" button can retry it; an in-flight one can be cancelled (its
 * `Subscription` torn down, same effect as an XHR `abort()`) without
 * affecting sibling uploads. Removing a file mid-upload cancels its
 * request the same way. None of this changes the committed model value's
 * shape — `File[]` via `writeValue`/`onChange` is unaffected; upload
 * outcomes surface only through the new `progress`/`uploaded`/
 * `uploadError` outputs, exactly the same "value vs. side-channel events"
 * split every other overlay-driving component in this library already
 * uses.
 */
@Component({
  selector: 'med-file-upload',
  standalone: true,
  imports: [ButtonDirective, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block', '[attr.data-mode]': 'mode()' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true,
    },
  ],
  template: `
    <div class="flex flex-col gap-3">
      <div
        [class]="dropzoneClass()"
        role="button"
        [attr.tabindex]="isDisabled() ? -1 : 0"
        [attr.aria-disabled]="isDisabled() ? 'true' : null"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [attr.aria-label]="chooseLabel()"
        (click)="openFilePicker()"
        (keydown)="onDropzoneKeydown($event)"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
      >
        <med-icon name="cloud-arrow-up" class="size-8 text-surface-400" />
        <button medButton type="button" variant="outlined" size="sm" tabindex="-1" [disabled]="isDisabled()">
          {{ chooseLabel() }}
        </button>
        <p class="text-sm text-surface-500 dark:text-surface-400">{{ dropzoneHint() }}</p>
        <input
          #fileInput
          type="file"
          class="hidden"
          [accept]="accept()"
          [multiple]="multiple()"
          [disabled]="isDisabled()"
          tabindex="-1"
          (click)="$event.stopPropagation()"
          (change)="onInputChange($event)"
        />
      </div>

      <span class="sr-only" role="status" aria-live="polite">{{ statusMessage() }}</span>

      @if (rejectedFileList().length > 0) {
        <ul class="flex flex-col gap-1 text-sm text-danger-600 dark:text-danger-400">
          @for (rejected of rejectedFileList(); track rejected.file) {
            <li>{{ rejected.file.name }} — {{ rejected.reason === 'type' ? invalidTypeLabel() : invalidSizeLabel() }}</li>
          }
        </ul>
      }

      @if (fileList().length > 0) {
        @if ((url() || customUpload()) && !auto()) {
          <div class="flex justify-end">
            <button data-testid="upload-btn" medButton type="button" variant="outlined" size="sm" [disabled]="isDisabled() || !hasUploadableFiles()" (click)="uploadAll()">
              {{ uploadLabel() }}
            </button>
          </div>
        }
        <ul class="flex flex-col gap-2">
          @for (file of fileList(); track file) {
            <li class="flex flex-col gap-1.5 rounded-md border border-surface-200 px-3 py-2 dark:border-surface-700">
              <div class="flex items-center gap-3">
                <span data-testid="file-name" class="min-w-0 flex-1 truncate break-all text-sm text-surface-900 dark:text-surface-50">{{ file.name }}</span>
                <span class="shrink-0 text-xs text-surface-500 dark:text-surface-400">{{ formatFileSize(file.size) }}</span>
                @if (uploadEntry(file); as entry) {
                  <span class="shrink-0 text-xs" [class]="statusClass(entry.status)">{{ statusText(entry) }}</span>
                }
                <button
                  medButton
                  type="button"
                  variant="text"
                  severity="secondary"
                  iconOnly
                  class="size-6 shrink-0 p-1"
                  [disabled]="isDisabled()"
                  [attr.aria-label]="(uploadEntry(file)?.status === 'uploading' ? cancelLabel() : removeLabel()) + ': ' + file.name"
                  (click)="uploadEntry(file)?.status === 'uploading' ? cancelUpload(file) : removeFile(file)"
                >
                  <med-icon name="x-mark" variant="mini" class="size-3.5" />
                </button>
              </div>
              @if (uploadEntry(file)?.status === 'uploading') {
                <div class="h-1 w-full overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700">
                  <div class="h-full bg-brand-500 transition-[width]" [style.width.%]="uploadEntry(file)!.progress"></div>
                </div>
              }
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class FileUploadComponent implements ControlValueAccessor, OnDestroy {
  /** Client-side UX filter only; always validate file type/extension and magic bytes on the server. */
  readonly accept = input('');
  readonly multiple = input(false, { transform: booleanAttribute });
  /** Client-side UX limit in bytes only; always enforce upload size limits on the server. */
  readonly maxFileSize = input<number | null>(null);
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Defaults are English — see roadmap/decisoes-produto.md, Phase 2, "i18n support". */
  readonly chooseLabel = input('Choose');
  readonly removeLabel = input('Remove');
  readonly invalidTypeLabel = input('Invalid file type');
  readonly invalidSizeLabel = input('File is too large');
  readonly dropzoneHintOverride = input<string | null>(null, { alias: 'dropzoneHint' });
  readonly class = input('', { alias: 'class' });

  /** Setting this is what turns on real HTTP upload — see class doc. `null` (default): picker-only, unchanged from before. */
  readonly url = input<string | null>(null);
  readonly method = input<'POST' | 'PUT'>('POST');
  /** `FormData` field name each file is appended under. */
  readonly fileFieldName = input('file');
  /** Sends cookies/credentials on cross-origin HTTP uploads; requires server-side anti-CSRF protection. */
  readonly withCredentials = input(false, { transform: booleanAttribute });
  /** Upload immediately on selection/drop instead of waiting for the "Upload" button. */
  readonly auto = input(false, { transform: booleanAttribute });
  readonly mode = input<'basic' | 'advanced'>('advanced');
  /** When `true`, the component does not send the files itself: it emits `uploadHandler` and you perform the upload. Validate type and size on the server too; client-side checks are UX only. */
  readonly customUpload = input(false, { transform: booleanAttribute });
  readonly uploadLabel = input('Upload');
  readonly cancelLabel = input('Cancel upload');
  readonly uploadedLabel = input('Done');
  readonly uploadFailedLabel = input('Failed');

  readonly rejected = output<readonly RejectedFile[]>();
  readonly progress = output<{ readonly file: File; readonly progress: number }>();
  readonly uploaded = output<{ readonly file: File; readonly response: unknown }>();
  readonly uploadError = output<{ readonly file: File; readonly error: unknown }>();
  /** Emits the selected files when `customUpload` is `true`, instead of the built-in HTTP upload. Enforce upload limits on the server. */
  readonly uploadHandler = output<{ readonly files: File[] }>();

  private readonly files = signal<File[]>([]);
  private readonly isDragOver = signal(false);
  private readonly rejectedFiles = signal<readonly RejectedFile[]>([]);
  private readonly formsDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formsDisabled());

  /** `optional: true`: a consumer who never sets `url()` never needs `provideHttpClient()` — see class doc. */
  private readonly http = inject(HttpClient, { optional: true });
  private readonly uploadState = signal<ReadonlyMap<File, FileUploadEntry>>(new Map());
  private readonly uploadSubscriptions = new Map<File, Subscription>();
  /**
   * Announced via the permanently-present sr-only status span above (Wave 2
   * fix) — the visible rejected-file list is real text too, but it only
   * enters the DOM on the first rejection (`@if (rejectedFileList().length
   * > 0)`), so an `aria-live` region on it alone would miss that very first
   * announcement; a region that's always present, even empty, doesn't have
   * that race.
   */
  protected readonly statusMessage = signal('');

  private readonly fileInputRef = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  private onChange: (value: File[]) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly fileList = computed(() => this.files());
  protected readonly rejectedFileList = computed(() => this.rejectedFiles());

  protected readonly dropzoneHint = computed(() => this.dropzoneHintOverride() ?? 'or drag and drop files here');

  protected readonly dropzoneClass = computed(() => {
    const base =
      'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors duration-(--transition-duration-base)';
    const state = this.isDisabled()
      ? 'cursor-not-allowed opacity-(--opacity-disabled) border-surface-200 dark:border-surface-700'
      : this.isDragOver()
        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
        : this.invalid()
          ? 'border-danger-500'
          : 'border-surface-300 hover:border-surface-400 dark:border-surface-600 dark:hover:border-surface-500';
    return mergeClasses(base, state, this.class());
  });

  protected uploadEntry(file: File): FileUploadEntry | undefined {
    return this.uploadState().get(file);
  }

  protected readonly hasUploadableFiles = computed(() => {
    const state = this.uploadState();
    return this.files().some((file) => {
      const entry = state.get(file);
      return !entry || entry.status === 'pending' || entry.status === 'error';
    });
  });

  protected statusText(entry: FileUploadEntry): string {
    switch (entry.status) {
      case 'uploading':
        return `${entry.progress}%`;
      case 'done':
        return this.uploadedLabel();
      case 'error':
        return this.uploadFailedLabel();
      default:
        return '';
    }
  }

  protected statusClass(status: FileUploadStatus): string {
    switch (status) {
      case 'done':
        return 'text-success-600 dark:text-success-400';
      case 'error':
        return 'text-danger-600 dark:text-danger-400';
      default:
        return 'text-surface-500 dark:text-surface-400';
    }
  }

  /** Uploads every file that hasn't already succeeded — including a previous `'error'`, so this doubles as retry. */
  protected uploadAll(): void {
    if (this.customUpload()) {
      this.uploadHandler.emit({ files: [...this.files()] });
      return;
    }
    for (const file of this.files()) {
      const entry = this.uploadState().get(file);
      if (!entry || entry.status === 'pending' || entry.status === 'error') {
        this.uploadOne(file);
      }
    }
  }

  /** Tears down the in-flight request (same effect as an XHR `abort()`) and resets the file back to `'pending'`, still in the list — a genuinely different action from `removeFile()`. */
  protected cancelUpload(file: File): void {
    this.cancelUploadSubscription(file);
    this.setUploadState(file, { file, status: 'pending', progress: 0 });
  }

  protected openFilePicker(): void {
    if (this.isDisabled()) {
      return;
    }
    this.fileInputRef().nativeElement.click();
  }

  /** Enter/Space activation for the dropzone's own `role="button"` (Wave 2 fix — it previously had no keyboard path of its own, only a click handler). */
  protected onDropzoneKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    this.openFilePicker();
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.isDisabled()) {
      this.isDragOver.set(true);
    }
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    if (this.isDisabled()) {
      return;
    }
    this.onTouched();
    const dropped = event.dataTransfer?.files;
    if (dropped) {
      this.handleFileList(dropped);
    }
  }

  protected onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.onTouched();
    if (input.files) {
      this.handleFileList(input.files);
    }
    // Reset so selecting the exact same file(s) again still fires `change`.
    input.value = '';
  }

  protected removeFile(file: File): void {
    this.clearUploadState(file);
    const next = this.files().filter((f) => f !== file);
    this.files.set(next);
    this.onChange(next);
  }

  protected formatFileSize(bytes: number): string {
    return formatFileSize(bytes);
  }

  private handleFileList(fileList: FileList): void {
    const incoming = Array.from(fileList);
    const accepted: File[] = [];
    const rejected: RejectedFile[] = [];
    const maxSize = this.maxFileSize();
    const acceptPattern = this.accept();

    for (const file of incoming) {
      if (!matchesAccept(file, acceptPattern)) {
        rejected.push({ file, reason: 'type' });
      } else if (maxSize !== null && file.size > maxSize) {
        rejected.push({ file, reason: 'size' });
      } else {
        accepted.push(file);
      }
    }

    this.rejectedFiles.set(rejected);
    if (rejected.length > 0) {
      this.rejected.emit(rejected);
    }
    this.statusMessage.set(this.buildStatusMessage(accepted.length, rejected.length));
    if (accepted.length === 0) {
      return;
    }

    const next = this.multiple() ? [...this.files(), ...accepted] : accepted.slice(0, 1);
    if (!this.multiple()) {
      // Single mode replaces the previous file outright — its upload state
      // (and any in-flight request) belongs to a file that's no longer in
      // the list at all, not just a stale entry.
      for (const previous of this.files()) {
        if (!next.includes(previous)) {
          this.clearUploadState(previous);
        }
      }
    }
    this.files.set(next);
    this.onChange(next);

    if (this.auto() && accepted.length > 0) {
      if (this.customUpload()) {
        this.uploadHandler.emit({ files: accepted });
      } else {
        for (const file of accepted) {
          this.uploadOne(file);
        }
      }
    }
  }

  private buildStatusMessage(acceptedCount: number, rejectedCount: number): string {
    const parts: string[] = [];
    if (acceptedCount > 0) {
      parts.push(`${acceptedCount} file${acceptedCount === 1 ? '' : 's'} accepted`);
    }
    if (rejectedCount > 0) {
      parts.push(`${rejectedCount} file${rejectedCount === 1 ? '' : 's'} rejected`);
    }
    return parts.join(', ');
  }

  writeValue(value: File[] | null | undefined): void {
    const next = value ?? [];
    for (const previous of this.files()) {
      if (!next.includes(previous)) {
        this.clearUploadState(previous);
      }
    }
    this.files.set(next);
  }

  registerOnChange(fn: (value: File[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formsDisabled.set(isDisabled);
  }

  ngOnDestroy(): void {
    for (const subscription of this.uploadSubscriptions.values()) {
      subscription.unsubscribe();
    }
  }

  private uploadOne(file: File): void {
    if (this.customUpload()) {
      return;
    }
    const targetUrl = this.url();
    if (!targetUrl) {
      return;
    }
    const http = this.http;
    if (!http) {
      throw new Error('FileUploadComponent: `url` is set but no HttpClient is available — add `provideHttpClient()` to your app config.');
    }
    this.setUploadState(file, { file, status: 'uploading', progress: 0 });
    const formData = new FormData();
    formData.append(this.fileFieldName(), file, file.name);

    const subscription = http
      .request(this.method(), targetUrl, {
        body: formData,
        reportProgress: true,
        observe: 'events',
        withCredentials: this.withCredentials(),
      })
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            const total = event.total ?? 0;
            const pct = total > 0 ? Math.round((100 * event.loaded) / total) : 0;
            this.setUploadState(file, { file, status: 'uploading', progress: pct });
            this.progress.emit({ file, progress: pct });
          } else if (event.type === HttpEventType.Response) {
            this.setUploadState(file, { file, status: 'done', progress: 100 });
            this.uploadSubscriptions.delete(file);
            this.uploaded.emit({ file, response: event.body });
          }
        },
        error: (error: HttpErrorResponse) => {
          this.setUploadState(file, { file, status: 'error', progress: 0 });
          this.uploadSubscriptions.delete(file);
          this.uploadError.emit({ file, error });
        },
      });
    this.uploadSubscriptions.set(file, subscription);
  }

  private setUploadState(file: File, entry: FileUploadEntry): void {
    const next = new Map(this.uploadState());
    next.set(file, entry);
    this.uploadState.set(next);
  }

  private cancelUploadSubscription(file: File): void {
    this.uploadSubscriptions.get(file)?.unsubscribe();
    this.uploadSubscriptions.delete(file);
  }

  private clearUploadState(file: File): void {
    this.cancelUploadSubscription(file);
    if (this.uploadState().has(file)) {
      const next = new Map(this.uploadState());
      next.delete(file);
      this.uploadState.set(next);
    }
  }
}
