import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FileUploadComponent, type RejectedFile } from '@medra/ui';

@Component({
  selector: 'app-file-upload-basic-demo',
  imports: [FormsModule, FileUploadComponent],
  templateUrl: './file-upload-basic.demo.html',
})
export class FileUploadBasicDemo {
  protected files: File[] = [];
  protected readonly maxFileSize = 2 * 1024 * 1024;
  protected lastRejection = '';

  protected onRejected(rejected: readonly RejectedFile[]): void {
    this.lastRejection = rejected.map((r) => `${r.file.name} (${r.reason})`).join(', ');
  }
}
