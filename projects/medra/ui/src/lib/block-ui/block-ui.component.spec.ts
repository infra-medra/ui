import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BlockUiComponent } from './block-ui.component';

@Component({
  standalone: true,
  imports: [BlockUiComponent],
  template: `
    <med-block-ui [blocked]="blocked" [blockedLabel]="blockedLabel" [class]="customClass">
      <button type="button">Save</button>
    </med-block-ui>
  `,
})
class HostComponent {
  blocked = false;
  blockedLabel = 'Loading';
  customClass = '';
}

@Component({
  standalone: true,
  imports: [BlockUiComponent],
  template: `
    <med-block-ui [blocked]="blocked">
      <button type="button">Save</button>
      <ng-template>Custom mask content</ng-template>
    </med-block-ui>
  `,
})
class CustomTemplateHostComponent {
  blocked = true;
}

function host(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return fixture.nativeElement.querySelector('med-block-ui') as HTMLElement;
}

function mask(fixture: { nativeElement: HTMLElement }): HTMLElement | null {
  return fixture.nativeElement.querySelector('[role="status"]');
}

function contentWrapper(fixture: { nativeElement: HTMLElement }): HTMLElement {
  return host(fixture).querySelector('div') as HTMLElement;
}

function create(configure?: (h: HostComponent) => void) {
  const fixture = TestBed.createComponent(HostComponent);
  configure?.(fixture.componentInstance);
  fixture.detectChanges();
  return fixture;
}

describe('BlockUiComponent', () => {
  it('renders projected content and no mask when not blocked', () => {
    const fixture = create();
    expect(fixture.nativeElement.textContent).toContain('Save');
    expect(mask(fixture)).toBeNull();
  });

  it('shows a mask with a default spinner when blocked', () => {
    const fixture = create((h) => (h.blocked = true));
    const m = mask(fixture);
    expect(m).not.toBeNull();
    expect(m!.querySelector('med-progress-spinner')).not.toBeNull();
  });

  it('marks the mask aria-label from blockedLabel', () => {
    const fixture = create((h) => {
      h.blocked = true;
      h.blockedLabel = 'Saving changes';
    });
    expect(mask(fixture)!.getAttribute('aria-label')).toBe('Saving changes');
  });

  it('makes the blocked content inert while blocked', () => {
    const fixture = create((h) => (h.blocked = true));
    expect(contentWrapper(fixture).hasAttribute('inert')).toBe(true);
  });

  it('leaves the content interactive when not blocked', () => {
    const fixture = create((h) => (h.blocked = false));
    expect(contentWrapper(fixture).hasAttribute('inert')).toBe(false);
  });

  it('renders a projected <ng-template> instead of the default spinner when provided', () => {
    const fixture = TestBed.createComponent(CustomTemplateHostComponent);
    fixture.detectChanges();
    const m = mask(fixture);
    expect(m!.textContent).toContain('Custom mask content');
    expect(m!.querySelector('med-progress-spinner')).toBeNull();
  });

  it('merges a consumer class via the escape hatch onto the host', () => {
    const fixture = create((h) => (h.customClass = 'rounded-lg'));
    expect(host(fixture).className).toContain('rounded-lg');
  });
});

describe('BlockUiComponent target', () => {
  @Component({
    standalone: true,
    imports: [BlockUiComponent],
    template: `
      <button type="button" (click)="blocked = !blocked">Toggle</button>
      <div #externalTarget class="external-target">
        <p>External content</p>
      </div>
      <med-block-ui [blocked]="blocked" [target]="externalTarget"></med-block-ui>
    `,
  })
  class TargetHostComponent {
    blocked = false;
  }

  @Component({
    standalone: true,
    imports: [BlockUiComponent],
    template: `
      <div #externalTarget class="external-target" style="position: absolute;">
        <p>External content</p>
      </div>
      <med-block-ui [blocked]="blocked" [target]="externalTarget"></med-block-ui>
    `,
  })
  class PositionedTargetHostComponent {
    blocked = false;
  }

  function externalTarget(fixture: { nativeElement: HTMLElement }): HTMLElement {
    return fixture.nativeElement.querySelector('.external-target') as HTMLElement;
  }

  function createTarget(configure?: (h: TargetHostComponent) => void) {
    const fixture = TestBed.createComponent(TargetHostComponent);
    configure?.(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
  }

  it('renders no wrapped content div of its own when target is set', () => {
    const fixture = createTarget();
    expect(host(fixture).children.length).toBe(0);
  });

  it('moves the mask into the target element while blocked, not into its own host', () => {
    const fixture = createTarget((h) => (h.blocked = true));
    expect(externalTarget(fixture).querySelector('[role="status"]')).not.toBeNull();
    expect(host(fixture).querySelector('[role="status"]')).toBeNull();
  });

  it('sets the target to position: relative while blocked (needed for the mask\'s absolute anchor)', () => {
    const fixture = createTarget((h) => (h.blocked = true));
    expect(externalTarget(fixture).style.position).toBe('relative');
  });

  it('restores the target\'s original position once unblocked', () => {
    const fixture = createTarget((h) => (h.blocked = true));
    expect(externalTarget(fixture).style.position).toBe('relative');

    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(externalTarget(fixture).style.position).toBe('');
    expect(externalTarget(fixture).querySelector('[role="status"]')).toBeNull();
  });

  it('never overwrites a target that already has a non-static position', () => {
    const fixture = TestBed.createComponent(PositionedTargetHostComponent);
    fixture.componentInstance.blocked = true;
    fixture.detectChanges();

    const target = fixture.nativeElement.querySelector('.external-target') as HTMLElement;
    expect(target.style.position).toBe('absolute'); // untouched, not force-set to 'relative'
    expect(target.querySelector('[role="status"]')).not.toBeNull(); // still blocked correctly
  });

  it('restores the target position on destroy while still blocked', () => {
    const fixture = createTarget((h) => (h.blocked = true));
    const target = externalTarget(fixture);
    expect(target.style.position).toBe('relative');

    fixture.destroy();

    expect(target.style.position).toBe('');
  });
});
