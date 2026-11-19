import { Component, signal } from '@angular/core';
import { OrganizationChartComponent, type OrgChartNode } from '@medra/ui';

@Component({
  selector: 'app-organization-chart-checkbox-demo',
  imports: [OrganizationChartComponent],
  templateUrl: './organization-chart-checkbox.demo.html',
})
export class OrganizationChartCheckboxDemo {
  protected readonly selection = signal<readonly OrgChartNode[]>([]);

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
