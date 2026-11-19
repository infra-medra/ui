import { Component } from '@angular/core';
import { BreadcrumbComponent, IconComponent, type BreadcrumbItem } from '@medra.dev/ui';

@Component({
  selector: 'app-breadcrumb-home-templates-demo',
  imports: [BreadcrumbComponent, IconComponent],
  templateUrl: './breadcrumb-home-templates.demo.html',
})
export class BreadcrumbHomeTemplatesDemo {
  protected readonly home = { url: '/', icon: 'home' };

  protected readonly items: BreadcrumbItem[] = [
    { label: 'Components', url: '/docs' },
    { label: 'Angular docs', url: 'https://angular.dev', target: '_blank' },
    { label: 'Breadcrumb' },
  ];
}
