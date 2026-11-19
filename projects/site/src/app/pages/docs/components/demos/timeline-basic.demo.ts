import { Component } from '@angular/core';
import { TimelineComponent } from '@medra/ui';

interface ShipmentEvent {
  title: string;
  timestamp: string;
  description: string;
}

@Component({
  selector: 'app-timeline-basic-demo',
  imports: [TimelineComponent],
  templateUrl: './timeline-basic.demo.html',
})
export class TimelineBasicDemo {
  protected readonly events: ShipmentEvent[] = [
    { title: 'Order placed', timestamp: 'Sep 1, 9:12 AM', description: 'Order #4821 was created and payment was authorized.' },
    { title: 'Preparing shipment', timestamp: 'Sep 2, 2:47 PM', description: 'Items were picked and packed at the warehouse.' },
    { title: 'Shipped', timestamp: 'Sep 3, 8:05 AM', description: 'Handed off to the carrier; a tracking number was assigned.' },
    { title: 'Out for delivery', timestamp: 'Sep 5, 7:30 AM', description: "On today's delivery vehicle." },
  ];
}
