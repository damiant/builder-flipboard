import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Flip } from './flip/flip';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Flip],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('builder-flipboard');
}
