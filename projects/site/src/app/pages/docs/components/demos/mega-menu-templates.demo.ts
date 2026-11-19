import { Component } from '@angular/core';
import { IconComponent, MegaMenuComponent, type MegaMenuItem } from '@medra/ui';

@Component({
  selector: 'app-mega-menu-templates-demo',
  imports: [MegaMenuComponent, IconComponent],
  templateUrl: './mega-menu-templates.demo.html',
})
export class MegaMenuTemplatesDemo {
  protected readonly items: MegaMenuItem[] = [{ label: 'Products' }, { label: 'Pricing' }, { label: 'Docs' }];
}
