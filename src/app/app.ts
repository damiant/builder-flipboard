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
  public pageNumber = signal(1);
  public pages = signal(1);
  private intervalId?: number;
  private timeIntervalId?: number;
  private updateIntervalId?: number;
  private textOptions = ['HELLO', 'BYE01'];
  private currentTextIndex = 0;
  private rows = 14;
  private busy = false;
  private data: BoardEvent[] = [];

  public grid: BoardEvent[] = this.emptyGrid();

  private emptyGrid(): BoardEvent[] {
    return Array.from({ length: this.rows }, () => ({
      time: '',
      title: '',
      location: '',
      directions: '',
      start: new Date(),
      end: new Date()
    }));
  }

  constructor(private dataService: DataService) { }

  async ngOnInit() {
    await this.dataService.load();
    this.getData();
    // Start the timer to change text every 5 seconds
    this.intervalId = window.setInterval(() => {
      this.flipScreen();
    }, 20000);
    this.flipScreen();

    this.updateIntervalId = window.setInterval(() => {
      this.getData();
    }, 60000);

    // Start the timer to update current time every second
    this.updateCurrentTime(); // Set initial time
    this.timeIntervalId = window.setInterval(() => {
      this.updateCurrentTime();
    }, 1000);
  }

  private flipScreen() {
    this.currentTextIndex =
      (this.currentTextIndex + 1) % this.textOptions.length;
    this.rowText.set(this.textOptions[this.currentTextIndex]);
    this.loadGrid(this.currentTextIndex * this.grid.length, this.rows);
  }

  now(): Date {
    return new Date(2025, 7, 25, 7, 0, 0)
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
    if (this.busy) return;
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
    //const maxStartIndex = Math.max(0, this.data.length - length);
    //const safeStartIndex = Math.min(startIndex, maxStartIndex);
    this.pageNumber.set(Math.floor(startIndex / length) + 1);
    this.pages.set(Math.ceil(this.data.length / length));
    console.log(`pageNumber=${this.pageNumber()},  startIndex=${startIndex}, length=${length} count is ${this.data.length}`);


    // Copy 10 elements starting from the safe index
    this.grid = this.emptyGrid();

    this.grid = this.emptyGrid();
    const toCopy = this.data.slice(startIndex, startIndex + length);
    for (let i = 0; i < toCopy.length; i++) {
      this.grid[i] = toCopy[i];
    }
  }

  async onTimeClick() {
    this.currentTime.set('Loading...');
    this.busy = true;
    await this.dataService.downloadData();
    this.currentTime.set('Done');
    this.busy = false;
  }
}
