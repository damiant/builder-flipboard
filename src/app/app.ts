import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Line, BoardEvent } from './line/line';
import { NativeAudio } from '@capacitor-community/native-audio';
import { DataService } from './services/data.service';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { set } from 'idb-keyval';
import { Capacitor } from '@capacitor/core';

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
  private voices: number[] = [];
  private intervalId?: number;
  private timeIntervalId?: number;
  private updateIntervalId?: number;
  private currentTextIndex = 0;
  private rows = 14;
  private busy = false;
  private announceId?: number;
  public mock = false;
  public announcing = signal('');
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

  constructor(private dataService: DataService) { }

  async ngOnInit() {
    await this.dataService.load();
    if (Capacitor.isNativePlatform()) {
      NativeAudio.preload({
        assetId: 'flap',
        assetPath: 'flap.mp3',
        audioChannelNum: 1,
        volume: 0.5,
        isUrl: false,
      });
      await KeepAwake.keepAwake();
      await ScreenOrientation.lock({ orientation: 'landscape' });
      const voices = await TextToSpeech.getSupportedVoices();
      let i = 0;
      for (const voice of voices.voices) {
        if (voice.lang === 'en-AU') {
          console.log(`Chosen Voice ${i}: ${JSON.stringify(voice)}`);
          this.voices.push(i);
        }
        i++;
        console.log(`Voice ${i}: ${JSON.stringify(voice)}`);
      }
    }
    this.getData();
    // Start the timer to change text every 20 seconds
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
    const priorIndex = this.currentTextIndex;
    this.currentTextIndex = (this.currentTextIndex + 1) % max;
    const announce = this.loadGrid(this.currentTextIndex * this.grid.length, this.rows);

    if (priorIndex !== this.currentTextIndex) {
      NativeAudio.play({
        assetId: 'flap',
        // time: 6.0 - seek time
      });
    }
    setTimeout(() => {
      // announce
      if (this.rnd(0, 2) === 1) {
        this.announce(announce);
      }
    }, this.rnd(500, 20000));
  }

  private async announce(event: BoardEvent) {
    let dir = event.directions.replace('ESP&', 'Esplanade &').replace('CENTERCAMP', 'Center Camp');
    const texts = [
      `${event.title} is now departing from ${event.location} at ${dir}`,
      `Attention passengers: This is the final boarding call for ${event.title} to ${event.location} at gate ${dir}.`,
      `Now boarding ${event.title} to ${event.location}. Please proceed to gate ${dir} immediately.`,
      `This is a reminder that ${event.location} is now boarding at ${dir} for ${event.title}.`,
      `Passengers for ${event.title} to ${event.location}, please proceed to Gate ${dir}.`,
      `Passengers for ${event.title}, please proceed to Gate ${dir} for immediate departure.`,
      `Final call for all passengers of ${event.location} to ${event.title} — Gate ${dir}.`,
      `We invite passengers requiring special assistance for ${event.title} to proceed to ${event.location} at gate ${dir}.`,
      `${event.location} is now boarding at gate ${dir} for ${event.title}.`,
      `Flight ${dir} to ${event.title} is now boarding all remaining passengers.`,
      `Attention: ${event.title} at ${event.location} will begin boarding shortly at gate ${dir}.`,
    ];
    const text = texts[this.rnd(0, texts.length - 1)];
    const voice = this.voices[this.rnd(0, this.voices.length - 1)];
    TextToSpeech.speak({
      text,
      lang: 'en-US',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      voice,
      category: 'ambient',
      queueStrategy: 1
    });
    this.announcing.set(text);
    if (this.announceId) {
      clearTimeout(this.announceId);
    }
    this.announceId = setTimeout(() => {
      this.announcing.set('');
    }, 15000);


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

  public loadGrid(startIndex: number = 0, length: number): BoardEvent {
    // Ensure we don't go out of bounds
    //const maxStartIndex = Math.max(0, this.data.length - length);
    //const safeStartIndex = Math.min(startIndex, maxStartIndex);
    this.pageNumber.set(Math.floor(startIndex / length) + 1);
    this.pages.set(Math.ceil(this.data.length / length));
    console.log(
      `pageNumber=${this.pageNumber()}, pages=${this.pages()}  startIndex=${startIndex}, length=${length} count is ${this.data.length
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
    return toCopy[this.rnd(0, toCopy.length - 1)];
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
