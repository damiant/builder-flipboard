import { Component, signal, input } from '@angular/core';

@Component({
  selector: 'app-flip',
  imports: [],
  templateUrl: './flip.html',
  styleUrl: './flip.css'
})
export class Flip {
  protected readonly isFlipped = signal(false);
  readonly width = input<number>(300); // default width
  readonly height = input<number>(300); // default height
  readonly frontText = input<string>(''); // text for front side
  readonly backText = input<string>(''); // text for back side

  protected toggleFlip() {
    this.isFlipped.set(!this.isFlipped());
  }
}
