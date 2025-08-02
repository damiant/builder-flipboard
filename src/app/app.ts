import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Line, BoardEvent } from './line/line';
import { mockLineData } from './data/mock-line-data';
import { DataService } from './services/data.service';

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
  private updateIntervalId?: number;
  private textOptions = ['HELLO', 'BYE01'];
  private currentTextIndex = 0;
  private rows = 20;
  private data: BoardEvent[] = [];

  public grid: BoardEvent[] = Array.from({ length: this.rows }, () => ({
    time: '',
    title: '',
    location: '',
    directions: '',
    start: new Date(),
    end: new Date()
  }));
  
  constructor(private dataService: DataService) {}

  async ngOnInit() {
    await this.dataService.load();
    this.getData();
    // Start the timer to change text every 5 seconds
    this.intervalId = window.setInterval(() => {
      this.currentTextIndex =
        (this.currentTextIndex + 1) % this.textOptions.length;
      this.rowText.set(this.textOptions[this.currentTextIndex]);
      this.loadGrid(this.currentTextIndex * this.grid.length, this.grid.length);
    }, 10000);

    this.updateIntervalId = window.setInterval(() => {
      this.getData();
    }, 60000);

    // Start the timer to update current time every second
    this.updateCurrentTime(); // Set initial time
    this.timeIntervalId = window.setInterval(() => {
      this.updateCurrentTime();
    }, 1000);
  }

  now(): Date {
    return new Date(2025, 7,25,5,0,0)
    return new Date();
  }

  getData(): void {
    const data = this.dataService.data.filter(e => {
      const now = this.now();
      const startTime = new Date(e.start ?? now);
      const endTime = new Date(e.end ?? now);
      return startTime <= now && endTime >= now;
    });
    // Filter for events that are happening now
    this.data = data;
    console.log('Filtered data:', this.data);
  }

  ngOnDestroy() {
    // Clean up the intervals when component is destroyed
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
    if (this.timeIntervalId) {
      window.clearInterval(this.timeIntervalId);
    }
    if (this.updateIntervalId) {
      window.clearInterval(this.updateIntervalId);
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

  public loadGrid(startIndex: number = 0, length: number): void {
    // Ensure we don't go out of bounds
    const maxStartIndex = Math.max(0, this.data.length - length);
    const safeStartIndex = Math.min(startIndex, maxStartIndex);

    // Copy 10 elements starting from the safe index
    this.grid = this.data.slice(safeStartIndex, safeStartIndex + length);
  }

  onTimeClick() {
    this.dataService.downloadData();
  }
}
