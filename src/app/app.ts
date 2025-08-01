import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Flip } from './flip/flip';
import { Row } from './row/row';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Flip, Row],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('builder-flipboard');
  protected readonly rows = Array.from({ length: 5 }, (_, i) => i); // 5 rows
  protected readonly columns = Array.from({ length: 20 }, (_, i) => i); // 20 columns
  protected readonly rowText = signal('HELLO');
  private intervalId?: number;
  private textOptions = ['HELLO', 'BYE01'];
  private currentTextIndex = 0;

  ngOnInit() {
    // Start the timer to change text every 5 seconds
    this.intervalId = window.setInterval(() => {
      this.currentTextIndex = (this.currentTextIndex + 1) % this.textOptions.length;
      this.rowText.set(this.textOptions[this.currentTextIndex]);
    }, 5000);
  }

  ngOnDestroy() {
    // Clean up the interval when component is destroyed
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
  }
}
