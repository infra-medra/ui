import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordFeedbackPanelComponent } from './password-feedback-panel.component';

function segments(fixture: ComponentFixture<PasswordFeedbackPanelComponent>): HTMLSpanElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('span'));
}

function labelText(fixture: ComponentFixture<PasswordFeedbackPanelComponent>): string {
  return (fixture.nativeElement.querySelector('p') as HTMLElement).textContent ?? '';
}

describe('PasswordFeedbackPanelComponent', () => {
  function create(strength: 'none' | 'weak' | 'medium' | 'strong'): ComponentFixture<PasswordFeedbackPanelComponent> {
    const fixture = TestBed.createComponent(PasswordFeedbackPanelComponent);
    fixture.componentRef.setInput('strength', strength);
    fixture.componentRef.setInput('panelId', 'test-panel');
    fixture.detectChanges();
    return fixture;
  }

  it('shows the prompt label and no lit segments when strength is none', () => {
    const fixture = create('none');
    expect(labelText(fixture)).toBe('Please enter a password');
    expect(segments(fixture).every((el) => !el.className.includes('bg-danger') && !el.className.includes('bg-warn') && !el.className.includes('bg-success'))).toBe(true);
  });

  it('lights exactly 1 segment (danger) for weak', () => {
    const fixture = create('weak');
    expect(labelText(fixture)).toBe('Weak');
    const lit = segments(fixture).filter((el) => el.className.includes('bg-danger-500'));
    expect(lit.length).toBe(1);
  });

  it('lights exactly 2 segments (warn) for medium', () => {
    const fixture = create('medium');
    expect(labelText(fixture)).toBe('Medium');
    const lit = segments(fixture).filter((el) => el.className.includes('bg-warn-500'));
    expect(lit.length).toBe(2);
  });

  it('lights all 3 segments (success) for strong', () => {
    const fixture = create('strong');
    expect(labelText(fixture)).toBe('Strong');
    const lit = segments(fixture).filter((el) => el.className.includes('bg-success-500'));
    expect(lit.length).toBe(3);
  });

  it('supports custom labels', () => {
    const fixture = create('weak');
    fixture.componentRef.setInput('weakLabel', 'Fraca');
    fixture.detectChanges();
    expect(labelText(fixture)).toBe('Fraca');
  });
});
