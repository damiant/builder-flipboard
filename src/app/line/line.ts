import { Component, input } from '@angular/core';
import { Row } from '../row/row';

export interface LineData {
  time: string;
  title: string;
  location: string;
  directions: string;
}

@Component({
  selector: 'app-line',
  imports: [Row],
  templateUrl: './line.html',
  styleUrl: './line.css'
})
export class Line {
  readonly data = input<LineData>({
    time: '',
    title: '',
    location: '',
    directions: ''
  });
}
