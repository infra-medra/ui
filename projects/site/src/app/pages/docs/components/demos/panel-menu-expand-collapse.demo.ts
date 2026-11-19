import { Component } from '@angular/core';
import { ButtonDirective, PanelMenuComponent, type TieredMenuItem } from '@medra.dev/ui';

@Component({
  selector: 'app-panel-menu-expand-collapse-demo',
  imports: [ButtonDirective, PanelMenuComponent],
  templateUrl: './panel-menu-expand-collapse.demo.html',
})
export class PanelMenuExpandCollapseDemo {
  protected readonly items: TieredMenuItem[] = [
    {
      label: 'Settings',
      items: [{ label: 'Profile' }, { label: 'Security' }],
    },
    {
      label: 'Reports',
      items: [{ label: 'Sales' }, { label: 'Traffic' }],
    },
  ];
}
