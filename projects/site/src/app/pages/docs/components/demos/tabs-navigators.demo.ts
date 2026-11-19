import { Component } from '@angular/core';
import { TabComponent, TabsComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-tabs-navigators-demo',
  imports: [TabComponent, TabsComponent],
  templateUrl: './tabs-navigators.demo.html',
})
export class TabsNavigatorsDemo {
  protected readonly months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
}
