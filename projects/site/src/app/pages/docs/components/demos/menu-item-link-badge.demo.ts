import { Component } from '@angular/core';
import { ButtonDirective, MenuComponent, type MenuItem } from '@medra.dev/ui';

@Component({
  selector: 'app-menu-item-link-badge-demo',
  imports: [ButtonDirective, MenuComponent],
  templateUrl: './menu-item-link-badge.demo.html',
})
export class MenuItemLinkBadgeDemo {
  protected readonly items: MenuItem[] = [
    { label: 'Documentation', icon: 'document-text', url: 'https://medra.dev', target: '_blank' },
    { label: 'What’s new', icon: 'bell', badge: 'New' },
    { label: 'Notifications', icon: 'envelope', badge: '3' },
  ];
}
