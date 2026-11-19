import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RatingComponent } from '@medra.dev/ui';

@Component({
  selector: 'app-rating-allow-half-demo',
  imports: [FormsModule, RatingComponent],
  templateUrl: './rating-allow-half.demo.html',
})
export class RatingAllowHalfDemo {
  protected score: number | null = 3.5;
}
