import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FileUploadComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-file-upload-real-demo',
  imports: [FormsModule, FileUploadComponent],
  templateUrl: './file-upload-real.demo.html',
})
export class FileUploadRealDemo {
  protected files: File[] = [];
  protected readonly lastEvent = signal('No upload yet.');

  protected onUploaded(event: { file: File; response: unknown }): void {
    const response = event.response as { size?: number } | null;
    this.lastEvent.set(`Uploaded ${event.file.name} (server saw ${response?.size ?? '?'} bytes).`);
  }

  protected onUploadError(event: { file: File }): void {
    this.lastEvent.set(`Failed to upload ${event.file.name}.`);
  }
}
