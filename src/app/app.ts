import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Flip } from './flip/flip';
import { Row } from './row/row';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Flip, Row],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('builder-flipboard');
  protected readonly rows = Array.from({ length: 5 }, (_, i) => i); // 5 rows
  protected readonly columns = Array.from({ length: 20 }, (_, i) => i); // 20 columns
}
