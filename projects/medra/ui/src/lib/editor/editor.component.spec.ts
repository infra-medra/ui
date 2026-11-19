import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditorComponent } from './editor.component';

function editableRegion(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('[role="textbox"]') as HTMLElement;
}

function toolbarButton(fixture: { nativeElement: HTMLElement }, label: string): HTMLButtonElement {
  return fixture.nativeElement.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement;
}

function typeInto(fixture: ComponentFixture<EditorComponent>, html: string): void {
  const el = editableRegion(fixture);
  el.innerHTML = html;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  fixture.detectChanges();
}

describe('EditorComponent', () => {
  let execCommandSpy: jest.SpyInstance;
  let queryCommandStateSpy: jest.SpyInstance;

  beforeEach(() => {
    execCommandSpy = jest.spyOn(document, 'execCommand').mockReturnValue(true);
    queryCommandStateSpy = jest.spyOn(document, 'queryCommandState').mockReturnValue(false);
  });

  afterEach(() => {
    execCommandSpy.mockRestore();
    queryCommandStateSpy.mockRestore();
  });

  function create(): ComponentFixture<EditorComponent> {
    const fixture = TestBed.createComponent(EditorComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('renders an empty editable region by default', () => {
    const fixture = create();
    expect(editableRegion(fixture).innerHTML).toBe('');
    expect(editableRegion(fixture).getAttribute('contenteditable')).toBe('true');
  });

  it('writeValue displays the given HTML in the editable region', () => {
    const fixture = create();
    fixture.componentInstance.writeValue('<p>Hello <strong>world</strong></p>');
    fixture.detectChanges();
    expect(editableRegion(fixture).innerHTML).toBe('<p>Hello <strong>world</strong></p>');
  });

  it('typing calls onChange with the (sanitized) HTML', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    typeInto(fixture, '<p>Hello</p>');

    expect(onChange).toHaveBeenCalledWith('<p>Hello</p>');
  });

  it('strips a <script> tag out of typed/pasted HTML before it reaches onChange', () => {
    const fixture = create();
    const onChange = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);

    typeInto(fixture, '<p>Hi</p><script>alert(1)</script>');

    const committed = onChange.mock.calls[onChange.mock.calls.length - 1][0] as string;
    expect(committed).not.toContain('<script>');
    expect(committed).toContain('<p>Hi</p>');
  });

  it('clicking Bold runs the bold command on the editable region', () => {
    const fixture = create();
    toolbarButton(fixture, 'Bold').click();
    fixture.detectChanges();
    expect(execCommandSpy).toHaveBeenCalledWith('bold');
  });

  it('reflects the active formatting state via aria-pressed after a command runs', () => {
    queryCommandStateSpy.mockImplementation((command: string) => command === 'bold');
    const fixture = create();

    toolbarButton(fixture, 'Bold').click();
    fixture.detectChanges();

    expect(toolbarButton(fixture, 'Bold').getAttribute('aria-pressed')).toBe('true');
    expect(toolbarButton(fixture, 'Italic').getAttribute('aria-pressed')).toBe('false');
  });

  it('disabling the editor makes the region non-editable and disables the toolbar', () => {
    const fixture = TestBed.createComponent(EditorComponent);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(editableRegion(fixture).getAttribute('contenteditable')).toBe('false');
    expect(toolbarButton(fixture, 'Bold').disabled).toBe(true);
  });

  it('setDisabledState(true) (Reactive Forms disable()) also disables the toolbar', () => {
    const fixture = create();
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    expect(toolbarButton(fixture, 'Bold').disabled).toBe(true);
  });

  it('clicking a toolbar command while disabled does nothing', () => {
    const fixture = TestBed.createComponent(EditorComponent);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    toolbarButton(fixture, 'Bold').click();
    fixture.detectChanges();

    expect(execCommandSpy).not.toHaveBeenCalled();
  });

  function toolbarButtons(fixture: { nativeElement: HTMLElement }): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('[role="toolbar"] button'));
  }

  function keydown(el: HTMLElement, key: string) {
    el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  }

  describe('toolbar roving tabindex (Wave 2 fix)', () => {
    it('only the first button (Bold) is in the Tab order initially, the rest are -1', () => {
      const fixture = create();
      expect(toolbarButtons(fixture).map((b) => b.tabIndex)).toEqual([0, -1, -1, -1, -1, -1, -1, -1]);
    });

    it('ArrowRight moves the roving tab stop to (and focuses) the next button, wrapping past the last one', () => {
      const fixture = create();
      const buttons = toolbarButtons(fixture);
      buttons[0].dispatchEvent(new Event('focus'));
      fixture.detectChanges();

      keydown(buttons[0], 'ArrowRight');
      fixture.detectChanges();
      expect(document.activeElement).toBe(buttons[1]);
      expect(toolbarButtons(fixture).map((b) => b.tabIndex)).toEqual([-1, 0, -1, -1, -1, -1, -1, -1]);

      // Wrap from the last button (Redo, index 7) back to the first (Bold).
      for (let i = 0; i < 6; i++) {
        keydown(toolbarButtons(fixture)[i + 1], 'ArrowRight');
        fixture.detectChanges();
      }
      expect(document.activeElement).toBe(toolbarButtons(fixture)[7]);
      keydown(toolbarButtons(fixture)[7], 'ArrowRight');
      fixture.detectChanges();
      expect(document.activeElement).toBe(toolbarButtons(fixture)[0]);
    });

    it('ArrowLeft from the first button wraps around to the last', () => {
      const fixture = create();
      const buttons = toolbarButtons(fixture);
      keydown(buttons[0], 'ArrowLeft');
      fixture.detectChanges();
      expect(document.activeElement).toBe(toolbarButtons(fixture)[7]);
    });

    it('Home/End jump the roving tab stop to the first/last button', () => {
      const fixture = create();
      const buttons = toolbarButtons(fixture);
      keydown(buttons[0], 'End');
      fixture.detectChanges();
      expect(document.activeElement).toBe(toolbarButtons(fixture)[7]);

      keydown(toolbarButtons(fixture)[7], 'Home');
      fixture.detectChanges();
      expect(document.activeElement).toBe(toolbarButtons(fixture)[0]);
    });
  });

  describe('headings', () => {
    function headingSelect(fixture: { nativeElement: HTMLElement }): HTMLSelectElement {
      return fixture.nativeElement.querySelector('select[aria-label="Text style"]') as HTMLSelectElement;
    }

    function selectHeading(fixture: ComponentFixture<EditorComponent>, value: string): void {
      const select = headingSelect(fixture);
      select.value = value;
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();
    }

    it('applying a heading runs formatBlock with the chosen tag', () => {
      const fixture = create();
      selectHeading(fixture, 'h1');
      expect(execCommandSpy).toHaveBeenCalledWith('formatBlock', false, '<h1>');
    });

    it('resets back to the placeholder after applying, instead of tracking the caret', () => {
      const fixture = create();
      selectHeading(fixture, 'h2');
      expect(headingSelect(fixture).value).toBe('');
    });

    it('does nothing while disabled', () => {
      const fixture = TestBed.createComponent(EditorComponent);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      selectHeading(fixture, 'h1');
      expect(execCommandSpy).not.toHaveBeenCalled();
    });
  });

  describe('link insertion', () => {
    function panelUrlInput(): HTMLInputElement | null {
      return document.querySelector('input[aria-label="Link URL"]');
    }

    function insertButton(): HTMLButtonElement | null {
      return Array.from(document.querySelectorAll('button')).find((btn) => btn.textContent?.trim() === 'Insert') ?? null;
    }

    function cancelButton(): HTMLButtonElement | null {
      return Array.from(document.querySelectorAll('button')).find((btn) => btn.textContent?.trim() === 'Cancel') ?? null;
    }

    afterEach(() => {
      document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
    });

    it('clicking the Link button opens a panel with a focused URL input', () => {
      const fixture = create();
      toolbarButton(fixture, 'Insert link').click();
      fixture.detectChanges();

      const input = panelUrlInput();
      expect(input).not.toBeNull();
      expect(document.activeElement).toBe(input);
    });

    it('submitting a URL runs createLink and closes the panel', () => {
      const fixture = create();
      toolbarButton(fixture, 'Insert link').click();
      fixture.detectChanges();

      const input = panelUrlInput()!;
      input.value = 'https://medra.dev';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      insertButton()!.click();
      fixture.detectChanges();

      expect(execCommandSpy).toHaveBeenCalledWith('createLink', false, 'https://medra.dev');
      expect(panelUrlInput()).toBeNull();
    });

    it('Cancel closes the panel without running createLink', () => {
      const fixture = create();
      toolbarButton(fixture, 'Insert link').click();
      fixture.detectChanges();

      cancelButton()!.click();
      fixture.detectChanges();

      expect(execCommandSpy).not.toHaveBeenCalledWith('createLink', expect.anything(), expect.anything());
      expect(panelUrlInput()).toBeNull();
    });

    it('does nothing while disabled', () => {
      const fixture = TestBed.createComponent(EditorComponent);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      toolbarButton(fixture, 'Insert link').click();
      fixture.detectChanges();

      expect(panelUrlInput()).toBeNull();
    });
  });
});
