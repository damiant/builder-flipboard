import { Component, input, ViewChildren, QueryList, AfterViewInit, effect, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Flip } from '../flip/flip';

interface CharacterState {
  frontText: string;
  backText: string;
  isFlipped: boolean;
  isAnimating: boolean;
}

@Component({
  selector: 'app-row',
  imports: [Flip],
  templateUrl: './row.html',
  styleUrl: './row.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Row implements AfterViewInit, OnDestroy {
  readonly text = input<string>('');
  readonly length = input<number | undefined>(undefined);
  readonly padLeft = input<boolean>(false);

  @ViewChildren(Flip) flipComponents!: QueryList<Flip>;

  protected characterStates: CharacterState[] = [];
  private previousText = '';
  readonly changeId = input<number>(0); // Used to track changes for batching
  private pendingTimeouts = new Set<number>();
  private animationFrameId?: number;

  constructor(private cdr: ChangeDetectorRef) {
    effect(() => {
      const newPaddedText = this.getPaddedText();
      if (newPaddedText !== this.previousText) {
        this.handleTextChange(newPaddedText);
        this.previousText = newPaddedText;
      }
    });
  }

  ngAfterViewInit() {
    this.initializeCharacterStates();
  }

  ngOnDestroy() {
    // Clean up any pending timeouts and animation frames
    this.pendingTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.pendingTimeouts.clear();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private initializeCharacterStates() {
    const chars = this.getPaddedText().split('');
    this.characterStates = chars.map(char => ({
      frontText: char,
      backText: char,
      isFlipped: false,
      isAnimating: false
    }));
  }

  private getRandomDelay(): number {
    return Math.floor(Math.random() * 6351) + 50; // More efficient than the original calculation
  }

  private handleTextChange(newText: string) {
    const newChars = newText.split('');
    const currentLength = this.characterStates.length;

    // Cancel any pending animations
    this.pendingTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.pendingTimeouts.clear();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Handle length changes by recreating the entire state array
    if (newChars.length !== currentLength) {
      this.characterStates = newChars.map(char => ({
        frontText: char,
        backText: char,
        isFlipped: false,
        isAnimating: false
      }));
      this.cdr.markForCheck(); // More efficient than detectChanges()
      return;
    }

    // Batch character updates to minimize change detection cycles
    let hasChanges = false;
    const flipQueue: number[] = [];

    newChars.forEach((newChar, index) => {
      const state = this.characterStates[index];
      if (state && this.getDisplayedText(state) !== newChar && !state.isAnimating) {
        // Determine which side should get the new text based on current flip state
        if (state.isFlipped) {
          state.frontText = newChar;
        } else {
          state.backText = newChar;
        }

        state.isAnimating = true;
        hasChanges = true;
        flipQueue.push(index);
      }
    });

    if (hasChanges) {
      this.cdr.markForCheck();

      // Use a single requestAnimationFrame for all flips
      //this.animationFrameId = requestAnimationFrame(() => {
      this.scheduleFlips(flipQueue);
      //});
    }
  }

  private scheduleFlips(indices: number[]) {
    indices.forEach(index => {
      const timeoutId = window.setTimeout(() => {
        this.pendingTimeouts.delete(timeoutId);
        this.triggerFlip(index);
      }, (index * this.rnd(15,30)) + (this.changeId() * index * this.rnd(10,15) ));
      this.pendingTimeouts.add(timeoutId);
    });

  }

  private rnd(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getDisplayedText(state: CharacterState): string {
    return state.isFlipped ? state.backText : state.frontText;
  }

  private triggerFlip(index: number) {
    const state = this.characterStates[index];
    if (!state || !this.flipComponents) return;

    const flipComponent = this.flipComponents.toArray()[index];
    if (flipComponent) {
      // Trigger the flip animation
      (flipComponent as any).toggleFlip();

      // Update state to reflect the flip
      state.isFlipped = !state.isFlipped;

      // Use more efficient cleanup
      const timeoutId = window.setTimeout(() => {
        this.pendingTimeouts.delete(timeoutId);
        state.isAnimating = false;
        this.cdr.markForCheck(); // More efficient than detectChanges()
      }, 600);

      this.pendingTimeouts.add(timeoutId);
    }
  }

  protected getCharacterData(index: number) {
    const state = this.characterStates[index];
    if (!state) return { frontText: '', backText: '' };

    return {
      frontText: state.frontText,
      backText: state.backText
    };
  }

  // Memoize this getter to avoid recalculation on every change detection
  private _cachedCharacters: string[] = [];
  private _cachedPaddedText = '';

  protected get characters(): string[] {
    const paddedText = this.getPaddedText();
    if (paddedText !== this._cachedPaddedText) {
      this._cachedPaddedText = paddedText;
      this._cachedCharacters = paddedText.split('');
    }
    return this._cachedCharacters;
  }

  private getPaddedText(): string {
    const originalText = this.text();
    const targetLength = this.length();

    if (targetLength === undefined) {
      return originalText;
    }

    // If text is longer than target length, truncate it
    if (originalText.length > targetLength) {
      return originalText.substring(0, targetLength);
    }

    // If text is already the right length, return as is
    if (originalText.length === targetLength) {
      return originalText;
    }

    // If text is shorter, add padding
    const paddingLength = targetLength - originalText.length;
    const padding = ' '.repeat(paddingLength);

    return this.padLeft() ? padding + originalText : originalText + padding;
  }
}
