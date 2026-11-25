import { Component } from '@angular/core';
import { BadgeComponent, IconComponent, TabComponent, TabsComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-tabs-template-demo',
  imports: [BadgeComponent, IconComponent, TabComponent, TabsComponent],
  templateUrl: './tabs-template.demo.html',
})
export class TabsTemplateDemo {}
