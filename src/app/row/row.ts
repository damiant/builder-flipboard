import { Component, input } from '@angular/core';
import { Flip } from '../flip/flip';

@Component({
  selector: 'app-row',
  imports: [Flip],
  templateUrl: './row.html',
  styleUrl: './row.css'
})
export class Row {
  readonly text = input<string>(''); // input text property

  protected get characters(): string[] {
    return this.text().split('');
  }
}
