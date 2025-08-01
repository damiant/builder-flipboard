import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Line, LineData } from './line/line';
import { mockLineData } from './data/mock-line-data';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Line],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('builder-flipboard');
  protected readonly rowText = signal('HELLO');
  protected readonly currentTime = signal('');
  private intervalId?: number;
  private timeIntervalId?: number;
  private textOptions = ['HELLO', 'BYE01'];
  private currentTextIndex = 0;
  private rows = 20;

  public grid: LineData[] = Array.from({ length: this.rows }, () => ({
    time: '',
    title: '',
    location: '',
    directions: ''
  }));
  
  ngOnInit() {
    // Start the timer to change text every 5 seconds
    this.intervalId = window.setInterval(() => {
      this.currentTextIndex =
        (this.currentTextIndex + 1) % this.textOptions.length;
      this.rowText.set(this.textOptions[this.currentTextIndex]);
      this.loadGridFromMockData(this.currentTextIndex * this.grid.length, this.grid.length);
    }, 10000);

    // Start the timer to update current time every second
    this.updateCurrentTime(); // Set initial time
    this.timeIntervalId = window.setInterval(() => {
      this.updateCurrentTime();
    }, 1000);
  }

  ngOnDestroy() {
    // Clean up the intervals when component is destroyed
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
    if (this.timeIntervalId) {
      window.clearInterval(this.timeIntervalId);
    }
  }

  private updateCurrentTime(): void {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
    this.currentTime.set(timeString);
  }

  /**
   * Copies 10 elements from mockLineData starting at the specified index into the grid
   * @param startIndex - The index to start copying from (defaults to 0)
   */
  public loadGridFromMockData(startIndex: number = 0, length: number): void {
    // Ensure we don't go out of bounds
    const maxStartIndex = Math.max(0, mockLineData.length - length);
    const safeStartIndex = Math.min(startIndex, maxStartIndex);

    // Copy 10 elements starting from the safe index
    this.grid = mockLineData.slice(safeStartIndex, safeStartIndex + length);
  }
}
