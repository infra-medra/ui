import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpEventType, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FileUploadComponent } from './file-upload.component';

function dropzone(fixture: ComponentFixture<unknown>): HTMLElement {
  return fixture.nativeElement.querySelector('div[class*="border-dashed"]') as HTMLElement;
}

function fileInput(fixture: ComponentFixture<unknown>): HTMLInputElement {
  return fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
}

function fileNames(fixture: ComponentFixture<unknown>): string[] {
  return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('li span:first-child')).map((el) => (el as HTMLElement).textContent?.trim() ?? '');
}

function makeFile(name: string, sizeBytes: number, type = 'text/plain'): File {
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

function selectFiles(fixture: ComponentFixture<unknown>, files: File[]): void {
  const input = fileInput(fixture);
  Object.defineProperty(input, 'files', { value: files, configurable: true });
  input.dispatchEvent(new Event('change'));
  fixture.detectChanges();
}

function dropFiles(fixture: ComponentFixture<unknown>, files: File[]): void {
  const event = new Event('drop', { bubbles: true, cancelable: true }) as DragEvent;
  Object.defineProperty(event, 'dataTransfer', { value: { files } });
  dropzone(fixture).dispatchEvent(event);
  fixture.detectChanges();
}

describe('FileUploadComponent', () => {
  function createFileUpload(): ComponentFixture<FileUploadComponent> {
    const fixture = TestBed.createComponent(FileUploadComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders an empty pending-file list initially', () => {
    const fixture = createFileUpload();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('li').length).toBe(0);
  });

  it('clicking the dropzone opens the native file picker exactly once (no bubble-triggered recursion)', () => {
    const fixture = createFileUpload();
    const clickSpy = jest.spyOn(fileInput(fixture), 'click');
    dropzone(fixture).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('the dropzone is a keyboard-reachable role="button" (Wave 2 fix)', () => {
    const fixture = createFileUpload();
    const zone = dropzone(fixture);
    expect(zone.getAttribute('role')).toBe('button');
    expect(zone.tabIndex).toBe(0);
  });

  it('Enter/Space on the dropzone opens the native file picker', () => {
    const fixture = createFileUpload();
    const clickSpy = jest.spyOn(fileInput(fixture), 'click');
    dropzone(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    dropzone(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(clickSpy).toHaveBeenCalledTimes(2);
  });

  it('reflects invalid as aria-invalid on the dropzone', () => {
    const fixture = createFileUpload();
    fixture.componentRef.setInput('invalid', true);
    fixture.detectChanges();
    expect(dropzone(fixture).getAttribute('aria-invalid')).toBe('true');
  });

  it('announces accepted/rejected counts via the sr-only live status region', () => {
    const fixture = createFileUpload();
    fixture.componentRef.setInput('maxFileSize', 10);
    fixture.detectChanges();
    selectFiles(fixture, [makeFile('ok.txt', 5), makeFile('too-big.txt', 100)]);

    const status = fixture.nativeElement.querySelector('[role="status"]') as HTMLElement;
    expect(status.textContent).toBe('1 file accepted, 1 file rejected');
  });

  it('selecting a file via the native input adds it to the pending list and commits it via onChange', () => {
    const fixture = createFileUpload();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    selectFiles(fixture, [makeFile('report.pdf', 1024)]);

    expect(fileNames(fixture)).toEqual(['report.pdf']);
    expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ name: 'report.pdf' })]);
  });

  it('dropping a file adds it the same way as selecting it', () => {
    const fixture = createFileUpload();
    dropFiles(fixture, [makeFile('photo.png', 2048)]);
    expect(fileNames(fixture)).toEqual(['photo.png']);
  });

  it('single mode (default): a new selection replaces the previous file, not appends', () => {
    const fixture = createFileUpload();
    selectFiles(fixture, [makeFile('a.txt', 10)]);
    selectFiles(fixture, [makeFile('b.txt', 10)]);
    expect(fileNames(fixture)).toEqual(['b.txt']);
  });

  it('multiple mode: a new selection appends to the existing pending files', () => {
    const fixture = createFileUpload();
    fixture.componentRef.setInput('multiple', true);
    fixture.detectChanges();

    selectFiles(fixture, [makeFile('a.txt', 10)]);
    selectFiles(fixture, [makeFile('b.txt', 10)]);
    expect(fileNames(fixture)).toEqual(['a.txt', 'b.txt']);
  });

  it('rejects a file whose type does not match `accept`, without adding it', () => {
    const fixture = createFileUpload();
    fixture.componentRef.setInput('accept', 'image/*');
    fixture.detectChanges();

    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    selectFiles(fixture, [makeFile('report.pdf', 10, 'application/pdf')]);

    expect(fileNames(fixture)).toEqual([]);
    expect(onChange).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('report.pdf');
    expect(fixture.nativeElement.textContent).toContain('Invalid file type');
  });

  it('rejects a file exceeding maxFileSize, without adding it', () => {
    const fixture = createFileUpload();
    fixture.componentRef.setInput('maxFileSize', 100);
    fixture.detectChanges();

    selectFiles(fixture, [makeFile('big.bin', 200)]);

    expect(fileNames(fixture)).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('File is too large');
  });

  it('multiple mode: accepts valid files and rejects invalid ones from the same selection', () => {
    const fixture = createFileUpload();
    fixture.componentRef.setInput('multiple', true);
    fixture.componentRef.setInput('accept', 'image/*');
    fixture.detectChanges();

    selectFiles(fixture, [makeFile('photo.png', 10, 'image/png'), makeFile('doc.pdf', 10, 'application/pdf')]);

    expect(fileNames(fixture)).toEqual(['photo.png']);
    expect(fixture.nativeElement.textContent).toContain('doc.pdf');
  });

  it('emits `rejected` with the rejected files', () => {
    const fixture = createFileUpload();
    fixture.componentRef.setInput('accept', 'image/*');
    fixture.detectChanges();

    const emitted = jest.fn();
    fixture.componentInstance.rejected.subscribe(emitted);
    const badFile = makeFile('report.pdf', 10, 'application/pdf');
    selectFiles(fixture, [badFile]);

    expect(emitted).toHaveBeenCalledWith([{ file: badFile, reason: 'type' }]);
  });

  it('a later successful selection clears the previous rejection message', () => {
    const fixture = createFileUpload();
    fixture.componentRef.setInput('accept', 'image/*');
    fixture.detectChanges();

    selectFiles(fixture, [makeFile('report.pdf', 10, 'application/pdf')]);
    expect(fixture.nativeElement.textContent).toContain('Invalid file type');

    selectFiles(fixture, [makeFile('photo.png', 10, 'image/png')]);
    expect(fixture.nativeElement.textContent).not.toContain('Invalid file type');
  });

  it('removing a file updates the list and commits via onChange', () => {
    const fixture = createFileUpload();
    fixture.componentRef.setInput('multiple', true);
    fixture.detectChanges();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    selectFiles(fixture, [makeFile('a.txt', 10), makeFile('b.txt', 10)]);
    const removeButton = fixture.nativeElement.querySelector('button[aria-label="Remove: a.txt"]') as HTMLButtonElement;
    removeButton.click();
    fixture.detectChanges();

    expect(fileNames(fixture)).toEqual(['b.txt']);
    expect(onChange).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'b.txt' })]);
  });

  it('writeValue(null) clears the pending list, not a stray value', () => {
    const fixture = createFileUpload();
    selectFiles(fixture, [makeFile('a.txt', 10)]);
    fixture.componentInstance.writeValue(null);
    fixture.detectChanges();
    expect(fileNames(fixture)).toEqual([]);
  });

  it('formats file size for display', () => {
    const fixture = createFileUpload();
    selectFiles(fixture, [makeFile('big.bin', 1536)]);
    expect(fixture.nativeElement.textContent).toContain('1.5 KB');
  });

  it('does not open the picker or accept drops while disabled', () => {
    const fixture = createFileUpload();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();

    const clickSpy = jest.spyOn(fileInput(fixture), 'click');
    dropzone(fixture).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(clickSpy).not.toHaveBeenCalled();

    dropFiles(fixture, [makeFile('a.txt', 10)]);
    expect(fileNames(fixture)).toEqual([]);
  });

  describe('real HTTP upload (url set)', () => {
    let httpMock: HttpTestingController;

    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    function uploadButton(fixture: ComponentFixture<unknown>): HTMLButtonElement | null {
      return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).find((btn: HTMLButtonElement) => btn.textContent?.trim() === 'Upload') ?? null;
    }

    function statusText(fixture: ComponentFixture<unknown>): string {
      return (fixture.nativeElement.querySelector('li span:nth-child(3)') as HTMLElement)?.textContent?.trim() ?? '';
    }

    it('does not render an Upload button when url is not set', () => {
      const fixture = createFileUpload();
      selectFiles(fixture, [makeFile('a.txt', 10)]);
      expect(uploadButton(fixture)).toBeNull();
    });

    it('clicking Upload sends a multipart POST request and reports progress, then success', () => {
      const fixture = createFileUpload();
      fixture.componentRef.setInput('url', '/api/upload');
      fixture.detectChanges();
      const progressSpy = jest.fn();
      const uploadedSpy = jest.fn();
      fixture.componentInstance.progress.subscribe(progressSpy);
      fixture.componentInstance.uploaded.subscribe(uploadedSpy);

      selectFiles(fixture, [makeFile('a.txt', 10)]);
      uploadButton(fixture)!.click();
      fixture.detectChanges();

      const req = httpMock.expectOne('/api/upload');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBeInstanceOf(FormData);

      req.event({ type: HttpEventType.UploadProgress, loaded: 5, total: 10 });
      fixture.detectChanges();
      expect(progressSpy).toHaveBeenCalledWith({ file: expect.objectContaining({ name: 'a.txt' }), progress: 50 });
      expect(statusText(fixture)).toBe('50%');

      req.flush({ ok: true });
      fixture.detectChanges();
      expect(uploadedSpy).toHaveBeenCalledWith({ file: expect.objectContaining({ name: 'a.txt' }), response: { ok: true } });
      expect(statusText(fixture)).toBe('Done');
    });

    it('a failed upload shows a Failed status, and Upload retries it', () => {
      const fixture = createFileUpload();
      fixture.componentRef.setInput('url', '/api/upload');
      fixture.detectChanges();
      const errorSpy = jest.fn();
      fixture.componentInstance.uploadError.subscribe(errorSpy);

      selectFiles(fixture, [makeFile('a.txt', 10)]);
      uploadButton(fixture)!.click();
      fixture.detectChanges();

      httpMock.expectOne('/api/upload').flush('nope', { status: 500, statusText: 'Server Error' });
      fixture.detectChanges();

      expect(errorSpy).toHaveBeenCalled();
      expect(statusText(fixture)).toBe('Failed');

      uploadButton(fixture)!.click();
      fixture.detectChanges();
      httpMock.expectOne('/api/upload').flush({ ok: true });
      fixture.detectChanges();
      expect(statusText(fixture)).toBe('Done');
    });

    it('auto uploads immediately on selection, without an Upload button', () => {
      const fixture = createFileUpload();
      fixture.componentRef.setInput('url', '/api/upload');
      fixture.componentRef.setInput('auto', true);
      fixture.detectChanges();

      selectFiles(fixture, [makeFile('a.txt', 10)]);

      expect(uploadButton(fixture)).toBeNull();
      httpMock.expectOne('/api/upload').flush({ ok: true });
      fixture.detectChanges();
      expect(statusText(fixture)).toBe('Done');
    });

    it('cancelling an in-flight upload resets it to pending, keeping the file in the list', () => {
      const fixture = createFileUpload();
      fixture.componentRef.setInput('url', '/api/upload');
      fixture.detectChanges();

      selectFiles(fixture, [makeFile('a.txt', 10)]);
      uploadButton(fixture)!.click();
      fixture.detectChanges();
      httpMock.expectOne('/api/upload');

      const cancelBtn = fixture.nativeElement.querySelector('button[aria-label="Cancel upload: a.txt"]') as HTMLButtonElement;
      cancelBtn.click();
      fixture.detectChanges();

      expect(fileNames(fixture)).toEqual(['a.txt']);
      expect(statusText(fixture)).toBe('');
    });

    it('removing a file mid-upload cancels its request', () => {
      const fixture = createFileUpload();
      fixture.componentRef.setInput('url', '/api/upload');
      fixture.detectChanges();

      selectFiles(fixture, [makeFile('a.txt', 10)]);
      uploadButton(fixture)!.click();
      fixture.detectChanges();
      httpMock.expectOne('/api/upload');

      const removeBtn = fixture.nativeElement.querySelector('button[aria-label="Cancel upload: a.txt"]');
      expect(removeBtn).not.toBeNull(); // sanity: it's currently uploading, not a plain Remove
      const component = fixture.componentInstance as unknown as { removeFile(file: unknown): void; fileList(): unknown[] };
      component.removeFile(component.fileList()[0]);
      fixture.detectChanges();

      expect(fileNames(fixture)).toEqual([]);
    });
  });

  describe('with ReactiveFormsModule', () => {
    @Component({
      standalone: true,
      imports: [FileUploadComponent, ReactiveFormsModule],
      template: `<med-file-upload [formControl]="control" />`,
    })
    class HostComponent {
      readonly control = new FormControl<File[]>([]);
    }

    it('reflects the FormControl value and pushes updates back through it', () => {
      TestBed.configureTestingModule({ imports: [HostComponent] });
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();

      selectFiles(fixture, [makeFile('a.txt', 10)]);
      expect(fixture.componentInstance.control.value?.[0]?.name).toBe('a.txt');
    });
  });

  describe('UI-010.S2 mode, customUpload, and security mitigations', () => {
    it('[UI-010.S2][M-02] supports mode="basic" and customUpload emitting uploadHandler without HttpClient', () => {
      const fixture = TestBed.createComponent(FileUploadComponent);
      fixture.componentRef.setInput('mode', 'basic');
      fixture.componentRef.setInput('customUpload', true);
      fixture.detectChanges();

      const emitted: unknown[] = [];
      fixture.componentInstance.uploadHandler.subscribe((e) => emitted.push(e));

      expect(fixture.nativeElement.getAttribute('data-mode')).toBe('basic');
      selectFiles(fixture, [makeFile('report.pdf', 50)]);
      fixture.detectChanges();

      const uploadBtn = fixture.nativeElement.querySelector('[data-testid="upload-btn"]') as HTMLButtonElement;
      expect(uploadBtn).not.toBeNull();
      uploadBtn.click();
      fixture.detectChanges();

      expect(emitted).toHaveLength(1);
      expect((emitted[0] as { files: File[] }).files[0].name).toBe('report.pdf');
    });

    it('[UI-010.S2][M-01][M-04] enforces UX accept/maxFileSize validation and renders long filenames safely with truncate/break-all', () => {
      const fixture = TestBed.createComponent(FileUploadComponent);
      fixture.componentRef.setInput('accept', '.png');
      fixture.componentRef.setInput('maxFileSize', 100);
      fixture.detectChanges();

      const longName = '<img src=x onerror=alert(1)>-' + 'a'.repeat(120) + '.png';
      selectFiles(fixture, [makeFile('bad.exe', 10), makeFile(longName, 50)]);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('img')).toBeNull();
      const nameEl = fixture.nativeElement.querySelector('[data-testid="file-name"]') as HTMLElement;
      expect(nameEl?.className).toMatch(/truncate|break-all/);
      expect(nameEl?.textContent).toContain('<img src=x onerror=alert(1)>');
    });

    it('[UI-010.S2][M-02] suppresses HttpClient upload when auto=true and customUpload=true even if url is set', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [FileUploadComponent],
        providers: [provideHttpClient(), provideHttpClientTesting()],
      });
      const httpMock = TestBed.inject(HttpTestingController);

      const fixture = TestBed.createComponent(FileUploadComponent);
      fixture.componentRef.setInput('auto', true);
      fixture.componentRef.setInput('customUpload', true);
      fixture.componentRef.setInput('url', '/upload');
      fixture.componentRef.setInput('withCredentials', true);
      fixture.detectChanges();

      const emitted: unknown[] = [];
      fixture.componentInstance.uploadHandler.subscribe((e) => emitted.push(e));

      selectFiles(fixture, [makeFile('auto-custom.pdf', 64)]);
      fixture.detectChanges();

      httpMock.expectNone('/upload');
      httpMock.verify();
      expect(emitted).toHaveLength(1);
      expect((emitted[0] as { files: File[] }).files[0].name).toBe('auto-custom.pdf');
    });
  });
});
