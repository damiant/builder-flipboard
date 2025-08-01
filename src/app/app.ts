import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Row } from './row/row';
import { Line, LineData } from './line/line';
import { mockLineData } from './data/mock-line-data';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Row, Line],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('builder-flipboard');
  protected readonly rowText = signal('HELLO');
  private intervalId?: number;
  private textOptions = ['HELLO', 'BYE01'];
  private currentTextIndex = 0;

  public lineData = signal<LineData>({
    time: '06:00',
    title: 'Morning Yoga',
    location: 'Yoga Camp',
    directions: '4:15&A',
  });

  public grid: LineData[] = [
    { time: '', title: '', location: '', directions: '' },
    { time: '', title: '', location: '', directions: '' },
    { time: '', title: '', location: '', directions: '' },
    { time: '', title: '', location: '', directions: '' },
    { time: '', title: '', location: '', directions: '' },
    { time: '', title: '', location: '', directions: '' },
    { time: '', title: '', location: '', directions: '' },
    { time: '', title: '', location: '', directions: '' },
    { time: '', title: '', location: '', directions: '' },
    { time: '', title: '', location: '', directions: '' }
  ];
  
  ngOnInit() {
    // Start the timer to change text every 5 seconds
    this.intervalId = window.setInterval(() => {
      this.currentTextIndex =
        (this.currentTextIndex + 1) % this.textOptions.length;
      this.rowText.set(this.textOptions[this.currentTextIndex]);
      this.loadGridFromMockData(this.currentTextIndex * this.grid.length);
    }, 5000);
  }

  ngOnDestroy() {
    // Clean up the interval when component is destroyed
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
  }

  /**
   * Copies 10 elements from mockLineData starting at the specified index into the grid
   * @param startIndex - The index to start copying from (defaults to 0)
   */
  public loadGridFromMockData(startIndex: number = 0): void {
    // Ensure we don't go out of bounds
    const maxStartIndex = Math.max(0, mockLineData.length - 10);
    const safeStartIndex = Math.min(startIndex, maxStartIndex);

    // Copy 10 elements starting from the safe index
    this.grid = mockLineData.slice(safeStartIndex, safeStartIndex + 10);
  }
}
