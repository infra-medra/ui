import { Component } from '@angular/core';
import { TabComponent, TabsComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-tabs-lazy-demo',
  imports: [TabComponent, TabsComponent],
  templateUrl: './tabs-lazy.demo.html',
})
export class TabsLazyDemo {
  private reportsCreatedAt: number | null = null;
  private billingCreatedAt: number | null = null;

  protected reportsMountedAt(): number {
    return (this.reportsCreatedAt ??= Math.round(performance.now()));
  }

  protected billingMountedAt(): number {
    return (this.billingCreatedAt ??= Math.round(performance.now()));
  }
}
