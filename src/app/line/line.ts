import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Row } from '../row/row';

export interface BoardEvent {
  time: string;
  title: string;
  location: string;
  directions: string;
  start?: Date;
  end?: Date;
  changeId: number;
}

@Component({
  selector: 'app-line',
  imports: [Row],
  templateUrl: './line.html',
  styleUrl: './line.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Line {
  readonly data = input<BoardEvent>({
    time: '',
    title: '',
    location: '',
    directions: '',
    start: new Date(),
    end: new Date(),
    changeId: 0 
  });
}
