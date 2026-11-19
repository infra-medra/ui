import { Component } from '@angular/core';
import { IconComponent, TimelineComponent } from '@medra/ui';

interface ShipmentEvent {
  title: string;
  timestamp: string;
  icon: string;
  done: boolean;
}

@Component({
  selector: 'app-timeline-marker-opposite-demo',
  imports: [TimelineComponent, IconComponent],
  templateUrl: './timeline-marker-opposite.demo.html',
})
export class TimelineMarkerOppositeDemo {
  protected readonly events: ShipmentEvent[] = [
    { title: 'Order placed', timestamp: 'Sep 1', icon: 'check-circle', done: true },
    { title: 'Preparing shipment', timestamp: 'Sep 2', icon: 'check-circle', done: true },
    { title: 'Shipped', timestamp: 'Sep 3', icon: 'check-circle', done: true },
    { title: 'Out for delivery', timestamp: 'Sep 5', icon: 'x-circle', done: false },
  ];
}
