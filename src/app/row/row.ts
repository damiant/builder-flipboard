import { Component, input, ViewChildren, QueryList, AfterViewInit, effect, ChangeDetectorRef } from '@angular/core';
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
  styleUrl: './row.css'
})
export class Row implements AfterViewInit {
  readonly text = input<string>('');
  
  @ViewChildren(Flip) flipComponents!: QueryList<Flip>;
  
  protected characterStates: CharacterState[] = [];
  private previousText = '';
  
  constructor(private cdr: ChangeDetectorRef) {
    effect(() => {
      const newText = this.text();
      if (newText !== this.previousText) {
        this.handleTextChange(newText);
        this.previousText = newText;
      }
    });
  }
  
  ngAfterViewInit() {
    this.initializeCharacterStates();
  }
  
  private initializeCharacterStates() {
    const chars = this.text().split('');
    this.characterStates = chars.map(char => ({
      frontText: char,
      backText: char,
      isFlipped: false,
      isAnimating: false
    }));
  }
  
  private handleTextChange(newText: string) {
    const newChars = newText.split('');
    const currentLength = this.characterStates.length;
    
    // Handle length changes by recreating the entire state array
    if (newChars.length !== currentLength) {
      this.characterStates = newChars.map(char => ({
        frontText: char,
        backText: char,
        isFlipped: false,
        isAnimating: false
      }));
      return;
    }
    
    // For same length, prepare flip animations for changed characters
    newChars.forEach((newChar, index) => {
      const state = this.characterStates[index];
      if (state && this.getDisplayedText(state) !== newChar && !state.isAnimating) {
        // Determine which side should get the new text based on current flip state
        if (state.isFlipped) {
          // Currently showing back side, put new text on front side
          state.frontText = newChar;
        } else {
          // Currently showing front side, put new text on back side
          state.backText = newChar;
        }
        
        state.isAnimating = true;
        
        // Trigger change detection to ensure the new text is set before flip
        this.cdr.detectChanges();
        
        // Use requestAnimationFrame to ensure the DOM is updated before flipping
        requestAnimationFrame(() => {
          this.triggerFlip(index);
        });
      }
    });
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
      
      // After animation completes, clean up the animation state
      setTimeout(() => {
        state.isAnimating = false;
        this.cdr.detectChanges();
      }, 600); // Match the CSS animation duration
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
  
  protected get characters(): string[] {
    return this.text().split('');
  }
}
