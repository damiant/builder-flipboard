import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-flip',
  imports: [],
  templateUrl: './flip.html',
  styleUrl: './flip.css'
})
export class Flip {
  protected readonly isFlipped = signal(false);

  protected toggleFlip() {
    this.isFlipped.set(!this.isFlipped());
  }
}
