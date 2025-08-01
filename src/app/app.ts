import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Row } from './row/row';
import { Line, LineData } from './line/line';

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
    {
      time: '06:00',
      title: 'Morning Yoga',
      location: 'Yoga Camp',
      directions: '4:15&A',
    },
    {
      time: '07:00',
      title: 'Breakfast',
      location: 'Cafeteria',
      directions: '5&B',
    },
    {
      time: '08:00',
      title: 'Team Meeting',
      location: 'Conference Room',
      directions: '2:30&A',
    },
    {
      time: '09:00',
      title: 'Project Work',
      location: 'Workstation',
      directions: '3:30&C',
    }
  ];
  
  ngOnInit() {
    // Start the timer to change text every 5 seconds
    this.intervalId = window.setInterval(() => {
      this.currentTextIndex =
        (this.currentTextIndex + 1) % this.textOptions.length;
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
