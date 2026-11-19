import { Component } from '@angular/core';
import { BreadcrumbComponent, type BreadcrumbItem } from '@medra/ui';

@Component({
  selector: 'app-breadcrumb-basic-demo',
  imports: [BreadcrumbComponent],
  templateUrl: './breadcrumb-basic.demo.html',
})
export class BreadcrumbBasicDemo {
  protected readonly items: BreadcrumbItem[] = [
    { label: 'Home', url: '/', icon: 'home' },
    { label: 'Components', url: '/docs' },
    { label: 'Breadcrumb' },
  ];
}
