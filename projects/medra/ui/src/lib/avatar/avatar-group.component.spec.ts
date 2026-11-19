import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AvatarGroupComponent } from './avatar-group.component';
import { AvatarComponent } from './avatar.component';

@Component({
  standalone: true,
  imports: [AvatarGroupComponent, AvatarComponent],
  template: `
    <med-avatar-group class="max-w-xs">
      <med-avatar label="Ana Silva" />
      <med-avatar label="Bruno Costa" />
      <med-avatar label="+2" />
    </med-avatar-group>
  `,
})
class HostComponent {}

describe('AvatarGroupComponent', () => {
  it('renders projected avatars inside the wrapper', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const avatars = fixture.nativeElement.querySelectorAll('med-avatar');
    expect(avatars.length).toBe(3);
  });

  it('overlaps adjacent children with a negative margin', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const wrapper = fixture.nativeElement.querySelector('div');
    expect(wrapper.className).toContain('[&>*+*]:-ml-2.5');
  });

  it('merges a consumer class override onto the wrapper', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('div').className).toContain('max-w-xs');
  });
});
