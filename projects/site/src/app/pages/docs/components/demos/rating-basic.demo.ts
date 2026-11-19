import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RatingComponent } from '@medra/ui';

@Component({
  selector: 'app-rating-basic-demo',
  imports: [FormsModule, RatingComponent],
  templateUrl: './rating-basic.demo.html',
})
export class RatingBasicDemo {
  protected score: number | null = 3;
  protected readonly averageScore = 4;
}
