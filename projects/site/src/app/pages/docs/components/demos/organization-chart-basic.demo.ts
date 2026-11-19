import { Component, signal } from '@angular/core';
import { OrganizationChartComponent, type OrgChartNode } from '@medra.dev/ui';

@Component({
  selector: 'app-organization-chart-basic-demo',
  imports: [OrganizationChartComponent],
  templateUrl: './organization-chart-basic.demo.html',
})
export class OrganizationChartBasicDemo {
  protected readonly selection = signal<OrgChartNode | readonly OrgChartNode[] | null>(null);
  protected readonly lastToggle = signal('No node toggled yet.');

  protected onNodeExpand(node: OrgChartNode): void {
    this.lastToggle.set(`Expanded: ${node.label}`);
  }

  protected onNodeCollapse(node: OrgChartNode): void {
    this.lastToggle.set(`Collapsed: ${node.label}`);
  }

  protected readonly chart: OrgChartNode = {
    label: 'Priya Nandakumar — CEO',
    children: [
      {
        label: 'Marcus Webb — VP Engineering',
        children: [
          {
            label: 'Sofia Reyes — Engineering Lead',
            children: [{ label: 'Devon Park — Backend Engineer' }, { label: 'Aisha Toure — Frontend Engineer' }],
          },
          { label: 'Vacant — Data Engineer', selectable: false },
        ],
      },
      {
        label: 'Grace Kim — VP Sales',
        children: [{ label: 'Noah Fischer — Account Executive' }],
      },
    ],
  };
}
