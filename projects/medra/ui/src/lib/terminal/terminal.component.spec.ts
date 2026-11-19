import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TerminalComponent } from './terminal.component';

@Component({
  standalone: true,
  imports: [TerminalComponent],
  template: `<med-terminal [prompt]="prompt" [welcomeMessage]="welcomeMessage" (commandSubmitted)="onCommand($event)" />`,
})
class HostComponent {
  @ViewChild(TerminalComponent) terminal!: TerminalComponent;
  prompt = '$';
  welcomeMessage: string | null = null;
  received: string[] = [];

  onCommand(command: string): void {
    this.received.push(command);
  }
}

@Component({
  standalone: true,
  imports: [TerminalComponent],
  template: `<med-terminal class="max-w-xl" />`,
})
class ClassMergeHostComponent {}

function input(fixture: { nativeElement: HTMLElement }): HTMLInputElement {
  return fixture.nativeElement.querySelector('input') as HTMLInputElement;
}

/** Joins each history row's child <span>s with a space — CSS `gap` produces no text-node whitespace of its own to rely on. */
function lines(fixture: { nativeElement: HTMLElement }): string[] {
  return Array.from(fixture.nativeElement.querySelectorAll('[data-terminal-line]')).map((el) =>
    Array.from(el.querySelectorAll('span'))
      .map((span) => span.textContent?.trim() ?? '')
      .join(' '),
  );
}

// Two detectChanges() calls, not one: the first lets Angular's own [value]
// binding catch up to the typed text (setting its internally-tracked last
// value) before Enter resets the signal back to '' — otherwise Angular
// never sees an actual change on the second call and skips writing the DOM
// property back, since the manually-set `el.value = text` above bypassed
// Angular's binding entirely and left its tracked value stale at ''.
function typeAndEnter(fixture: { nativeElement: HTMLElement; detectChanges: () => void }, text: string): void {
  const el = input(fixture);
  el.value = text;
  el.dispatchEvent(new Event('input'));
  fixture.detectChanges();
  el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  fixture.detectChanges();
}

function create(configure?: (h: HostComponent) => void) {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

describe('TerminalComponent', () => {
  it('shows the welcome message when provided, above any history', () => {
    const fixture = create((h) => (h.welcomeMessage = 'Welcome to MedraUi Terminal'));
    expect(fixture.nativeElement.querySelector('[role="log"]')!.textContent).toContain('Welcome to MedraUi Terminal');
  });

  it('submitting a command appends it to the history and emits commandSubmitted', () => {
    const fixture = create();
    typeAndEnter(fixture, 'help');

    expect(fixture.componentInstance.received).toEqual(['help']);
    expect(lines(fixture)).toEqual(['$ help']);
  });

  it('respond() appends a response line to the history', () => {
    const fixture = create();
    typeAndEnter(fixture, 'help');
    fixture.componentInstance.terminal.respond('Available commands: help, clear');
    fixture.detectChanges();

    expect(lines(fixture)).toEqual(['$ help', 'Available commands: help, clear']);
  });

  it('clear() empties the history but keeps the welcome message', () => {
    const fixture = create((h) => (h.welcomeMessage = 'Welcome'));
    typeAndEnter(fixture, 'help');
    fixture.componentInstance.terminal.clear();
    fixture.detectChanges();

    expect(lines(fixture)).toEqual([]);
    expect(fixture.nativeElement.querySelector('[role="log"]')!.textContent).toContain('Welcome');
  });

  it('the input is cleared after submitting', () => {
    const fixture = create();
    typeAndEnter(fixture, 'ls -la');
    expect(input(fixture).value).toBe('');
  });

  it('submitting an empty/whitespace-only command does nothing', () => {
    const fixture = create();
    typeAndEnter(fixture, '   ');
    expect(fixture.componentInstance.received).toEqual([]);
    expect(lines(fixture)).toEqual([]);
  });

  it('uses a custom prompt for each command line', () => {
    const fixture = create((h) => (h.prompt = '>'));
    typeAndEnter(fixture, 'status');
    expect(lines(fixture)).toEqual(['> status']);
  });

  it('clicking the container (the host itself — no separate wrapper div) focuses the input', () => {
    const fixture = create();
    const container = fixture.nativeElement.querySelector('med-terminal') as HTMLElement;
    container.click();
    expect(document.activeElement).toBe(input(fixture));
  });

  it('merges a consumer class (a real static attribute) onto the host, with no separate wrapper div', () => {
    const fixture = TestBed.createComponent(ClassMergeHostComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('med-terminal') as HTMLElement;
    expect(host.className).toContain('max-w-xl');
    expect(host.className).toContain('bg-surface-950'); // the console box's own default styling — same element
  });
});
