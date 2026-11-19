import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { OverlayModule } from '@angular/cdk/overlay';
import { IconComponent } from '../icon/icon.component';
import { MenuItem } from '../menu/menu.types';
import { SplitButtonComponent } from './split-button.component';

@Component({
  standalone: true,
  imports: [SplitButtonComponent],
  template: `<med-split-button
    label="Save"
    [items]="items"
    [disabled]="disabled"
    [buttonDisabled]="buttonDisabled"
    [menuButtonDisabled]="menuButtonDisabled"
    (buttonClick)="onButtonClick()"
    (itemSelect)="onItemSelect($event)"
  />`,
})
class HostComponent {
  saveAsSpy = jest.fn();
  items: MenuItem[] = [{ label: 'Save as...', command: this.saveAsSpy }, { label: 'Save a copy' }];
  disabled = false;
  buttonDisabled = false;
  menuButtonDisabled = false;
  clicked = 0;
  selected: MenuItem[] = [];

  onButtonClick(): void {
    this.clicked++;
  }

  onItemSelect(item: MenuItem): void {
    this.selected.push(item);
  }
}

function buttons(fixture: { nativeElement: HTMLElement }): HTMLButtonElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('button'));
}

function firePointerDown(el: HTMLElement) {
  const event = Object.assign(new Event('pointerdown', { bubbles: true }), { clientX: 5, clientY: 5 });
  el.dispatchEvent(event as PointerEvent);
}

function menuPanel(): HTMLElement | null {
  return document.querySelector('[role="menu"]');
}

describe('SplitButtonComponent', () => {
  let animateSpy: jest.Mock;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [OverlayModule] });
    animateSpy = jest.fn().mockReturnValue({ finished: Promise.resolve() });
    HTMLElement.prototype.animate = animateSpy as unknown as HTMLElement['animate'];
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.remove());
    delete (HTMLElement.prototype as { animate?: unknown }).animate;
  });

  function create(configure?: (host: HostComponent) => void) {
    const fixture = TestBed.createComponent(HostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  it('renders the primary button with its label and a separate toggle button', () => {
    const fixture = create();
    const [primary, toggle] = buttons(fixture);
    expect(primary.textContent?.trim()).toBe('Save');
    expect(toggle.getAttribute('aria-haspopup')).toBe('menu');
  });

  it('triggers the ripple effect on both the primary and toggle buttons (Ripple adoption)', () => {
    const fixture = create();
    const [primary, toggle] = buttons(fixture);

    firePointerDown(primary);
    expect(animateSpy).toHaveBeenCalledTimes(1);

    firePointerDown(toggle);
    expect(animateSpy).toHaveBeenCalledTimes(2);
  });

  it('clicking the primary button emits buttonClick and never opens the menu', () => {
    const fixture = create();
    buttons(fixture)[0].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.clicked).toBe(1);
    expect(menuPanel()).toBeNull();
  });

  it('clicking the toggle button opens the menu and sets aria-expanded', () => {
    const fixture = create();
    const toggle = buttons(fixture)[1];
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    toggle.click();
    fixture.detectChanges();

    expect(menuPanel()).not.toBeNull();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });

  it('clicking the toggle button again closes the menu (toggle behavior)', () => {
    const fixture = create();
    const toggle = buttons(fixture)[1];

    toggle.click();
    fixture.detectChanges();
    expect(menuPanel()).not.toBeNull();

    toggle.click();
    fixture.detectChanges();
    expect(menuPanel()).toBeNull();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('selecting an item calls its command(), emits itemSelect, and closes the panel', () => {
    const fixture = create();
    buttons(fixture)[1].click();
    fixture.detectChanges();

    // activeIndex starts at the first enabled item on mount (see MenuPanelComponent).
    menuPanel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(menuPanel()).toBeNull();
    expect(fixture.componentInstance.saveAsSpy).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.selected).toEqual([{ label: 'Save as...', command: fixture.componentInstance.saveAsSpy }]);
  });

  it('closes on Escape', () => {
    const fixture = create();
    buttons(fixture)[1].click();
    fixture.detectChanges();

    menuPanel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(menuPanel()).toBeNull();
  });

  it('disabled: both buttons are disabled and the toggle never opens the menu', () => {
    const fixture = create((host) => (host.disabled = true));
    const [primary, toggle] = buttons(fixture);

    expect(primary.disabled).toBe(true);
    expect(toggle.disabled).toBe(true);
  });

  it('buttonDisabled disables only the primary button — the toggle stays usable', () => {
    const fixture = create((host) => (host.buttonDisabled = true));
    const [primary, toggle] = buttons(fixture);

    expect(primary.disabled).toBe(true);
    expect(toggle.disabled).toBe(false);

    toggle.click();
    fixture.detectChanges();
    expect(menuPanel()).not.toBeNull();
  });

  it('menuButtonDisabled disables only the toggle button — the primary action stays usable', () => {
    const fixture = create((host) => (host.menuButtonDisabled = true));
    const [primary, toggle] = buttons(fixture);

    expect(primary.disabled).toBe(false);
    expect(toggle.disabled).toBe(true);

    toggle.click();
    fixture.detectChanges();
    expect(menuPanel()).toBeNull();
  });

  it('destroying the host while open closes the overlay', () => {
    const fixture = create();
    buttons(fixture)[1].click();
    fixture.detectChanges();
    expect(menuPanel()).not.toBeNull();

    fixture.destroy();

    expect(menuPanel()).toBeNull();
  });

  it('applies severity/variant/size to both buttons via the shared buttonVariants CVA', () => {
    const fixture = TestBed.createComponent(SplitButtonComponent);
    fixture.componentRef.setInput('severity', 'danger');
    fixture.componentRef.setInput('variant', 'outlined');
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();

    const [primary, toggle] = buttons(fixture);
    expect(primary.className).toContain('border-danger-500');
    expect(toggle.className).toContain('border-danger-500');
    expect(primary.className).toContain('text-sm');
  });

  it('splits the two buttons visually via border-collapsing classes, not a second color system', () => {
    const fixture = TestBed.createComponent(SplitButtonComponent);
    fixture.detectChanges();
    const [primary, toggle] = buttons(fixture);
    expect(primary.className).toContain('rounded-r-none');
    expect(toggle.className).toContain('rounded-l-none');
    expect(toggle.className).toContain('-ml-px');
  });

  it('supports a leading icon on the primary button', () => {
    const fixture = TestBed.createComponent(SplitButtonComponent);
    fixture.componentRef.setInput('label', 'Download');
    fixture.componentRef.setInput('icon', 'arrow-down-tray');
    fixture.detectChanges();

    const icons = fixture.debugElement.queryAll(By.directive(IconComponent)).map((el) => (el.componentInstance as IconComponent).name());
    expect(icons).toContain('arrow-down-tray');
    expect(buttons(fixture)[0].textContent?.trim()).toBe('Download');
  });

  it('omits the leading icon when icon is not set', () => {
    const fixture = TestBed.createComponent(SplitButtonComponent);
    fixture.detectChanges();
    const icons = fixture.debugElement.queryAll(By.directive(IconComponent)).map((el) => (el.componentInstance as IconComponent).name());
    expect(icons).toEqual(['chevron-down']); // only the toggle's own icon
  });

  it('sets a default toggle aria-label, overridable via toggleLabel', () => {
    const fixture = TestBed.createComponent(SplitButtonComponent);
    fixture.detectChanges();
    expect(buttons(fixture)[1].getAttribute('aria-label')).toBe('More options');

    fixture.componentRef.setInput('toggleLabel', 'Show more save options');
    fixture.detectChanges();
    expect(buttons(fixture)[1].getAttribute('aria-label')).toBe('Show more save options');
  });

  // @scenario UI-005.S2
  it('applies pill rounding to outer edges when rounded is true', () => {
    const fixture = TestBed.createComponent(SplitButtonComponent);
    fixture.componentRef.setInput('rounded', true);
    fixture.detectChanges();

    const [primary, toggle] = buttons(fixture);
    expect(primary.className).toContain('rounded-l-full');
    expect(primary.className).toContain('rounded-r-none');
    expect(toggle.className).toContain('rounded-r-full');
    expect(toggle.className).toContain('rounded-l-none');
  });

  it('uses custom dropdownIcon and emits dropdownClick when the toggle button is clicked', () => {
    const fixture = TestBed.createComponent(SplitButtonComponent);
    fixture.componentRef.setInput('dropdownIcon', 'ellipsis-vertical');
    const clicks: MouseEvent[] = [];
    fixture.componentInstance.dropdownClick.subscribe((e: MouseEvent) => clicks.push(e));
    fixture.detectChanges();

    const icons = fixture.debugElement.queryAll(By.directive(IconComponent)).map((el) => (el.componentInstance as IconComponent).name());
    expect(icons).toContain('ellipsis-vertical');

    buttons(fixture)[1].click();
    expect(clicks.length).toBe(1);
  });

  it('renders custom #content template inside the primary button when provided', () => {
    @Component({
      standalone: true,
      imports: [SplitButtonComponent],
      template: `
        <med-split-button label="Ignored">
          <ng-template #content>
            <span data-custom-split>Custom Save</span>
          </ng-template>
        </med-split-button>
      `,
    })
    class CustomContentHost {}

    const fixture = TestBed.createComponent(CustomContentHost);
    fixture.detectChanges();

    const [primary] = buttons(fixture);
    expect(primary.querySelector('[data-custom-split]')?.textContent?.trim()).toBe('Custom Save');
    expect(primary.textContent?.trim()).not.toContain('Ignored');
  });
});
