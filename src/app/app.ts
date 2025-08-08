import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Line, BoardEvent } from './line/line';
import { NativeAudio } from '@capacitor-community/native-audio';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Line],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  protected readonly currentTime = signal('');
  public pageNumber = signal(1);
  public pages = signal(1);
  private intervalId?: number;
  private timeIntervalId?: number;
  private updateIntervalId?: number;
  private currentTextIndex = 0;
  private rows = 14;
  private busy = false;
  public mock = false;
  private data: BoardEvent[] = [];

  public grid: BoardEvent[] = this.emptyGrid();

  private emptyGrid(): BoardEvent[] {
    return Array.from({ length: this.rows }, () => ({
      time: '',
      title: '',
      location: '',
      directions: '',
      start: new Date(),
      end: new Date(),
    }));
  }

  public pageArray(length: number): number[] {
    return Array.from({ length }, (_, i) => i + 1);
  }

  constructor(private dataService: DataService) {}

  async ngOnInit() {
    await this.dataService.load();
    NativeAudio.preload({
      assetId: 'flap',
      assetPath: 'flap.mp3',
      audioChannelNum: 1,
      isUrl: false,
    });
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
    const max = Math.floor(this.data.length / this.rows) + 1;
    console.log(`max=${max}, currentTextIndex=${this.currentTextIndex}`);
    this.currentTextIndex = (this.currentTextIndex + 1) % max;
    this.loadGrid(this.currentTextIndex * this.grid.length, this.rows);

    NativeAudio.play({
      assetId: 'flap',
      // time: 6.0 - seek time
    });
  }

  private rnd(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private mockTime: Date = new Date();

  now(): Date {
    if (this.mock) {
      return this.mockTime;
    } else {
      return new Date();
    }
  }

  toggleMock() {
    this.mock = !this.mock;
    this.mockTime = new Date(
      2025,
      7,
      this.rnd(25, 31),
      this.rnd(1, 23),
      this.rnd(0, 59),
      0
    );
    this.currentTextIndex = 0;
    this.getData();
    this.flipScreen();
  }

  getData(): void {
    const data = this.dataService.data.filter((e) => {
      const now = this.now();
      const startTime = new Date(e.start ?? now);
      const endTime = new Date(e.end ?? now);
      return startTime <= now && endTime >= now;
    });
    // Filter for events that are happening now
    this.data = data;
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
    const now = this.now();
    const timeString = now.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });
    this.currentTime.set(timeString);
  }

  public loadGrid(startIndex: number = 0, length: number): void {
    // Ensure we don't go out of bounds
    //const maxStartIndex = Math.max(0, this.data.length - length);
    //const safeStartIndex = Math.min(startIndex, maxStartIndex);
    this.pageNumber.set(Math.floor(startIndex / length) + 1);
    this.pages.set(Math.ceil(this.data.length / length));
    console.log(
      `pageNumber=${this.pageNumber()}, pages=${this.pages()}  startIndex=${startIndex}, length=${length} count is ${
        this.data.length
      }`
    );

    // Copy 10 elements starting from the safe index
    this.grid = this.emptyGrid();

    this.grid = this.emptyGrid();
    const toCopy = this.data.slice(startIndex, startIndex + length);
    for (let i = 0; i < toCopy.length; i++) {
      this.grid[i] = toCopy[i];

      toCopy[i].time = this.formatStatus(
        toCopy[i].start ?? this.now(),
        toCopy[i].end ?? this.now()
      );
    }
  }

  private formatTime(start: Date, end: Date): string {
    const formatSingleTime = (date: Date): string => {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const period = hours >= 12 ? 'pm' : 'am';
      const displayHours = hours % 12 || 12;

      if (minutes === 0) {
        return `${displayHours}${period}`;
      } else {
        return `${displayHours}:${minutes
          .toString()
          .padStart(2, '0')}${period}`;
      }
    };

    const startTime = formatSingleTime(start);
    const endTime = formatSingleTime(end);
    const fullFormat = `${startTime
      .replace('am', '')
      .replace('pm', '')}-${endTime}`;

    // If the full format is longer than 5 characters, return just start time
    if (fullFormat.length > 5) {
      return startTime;
    }

    return fullFormat;
  }

  private formatStatus(start: Date, end: Date): string {
    const now = this.now();

    if (now > new Date(end.getTime() - 15 * 60 * 1000)) {
      return 'CLOSING';
    } else if (now < new Date(start.getTime() + 15 * 60 * 1000)) {
      return 'OPEN';
    } else if (now > start) {
      return 'ON TIME';
    }

    return 'NOW';
  }

  async onTimeClick() {
    this.currentTime.set('Loading...');
    this.busy = true;
    await this.dataService.downloadData();
    this.currentTime.set('Done');
    this.busy = false;
  }
}
