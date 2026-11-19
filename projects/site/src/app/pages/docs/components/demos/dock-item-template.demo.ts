import { Component } from '@angular/core';
import { DockComponent, IconComponent, type MenuItem } from '@medra.dev/ui';

@Component({
  selector: 'app-dock-item-template-demo',
  imports: [DockComponent, IconComponent],
  templateUrl: './dock-item-template.demo.html',
})
export class DockItemTemplateDemo {
  protected readonly items: MenuItem[] = [
    { label: 'Mail', icon: 'envelope' },
    { label: 'Calendar', icon: 'calendar' },
    { label: 'Photos', icon: 'photo' },
    { label: 'Settings', icon: 'cog-6-tooth' },
  ];
}
