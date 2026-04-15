import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import nipplejs from 'nipplejs';
import { database, MoodEntry, PasswordWrongError } from '../core/services/database';
import { PasswordDialog } from '../components/password-dialog/password-dialog';
import { Router } from '@angular/router';
import { moodLabelFromVA } from '../core/utils/mood-translator';

@Component({
  selector: 'app-index',
  imports: [PasswordDialog],
  templateUrl: './index.html',
  styles: '',
})
export class Index {
  @ViewChild('moodPad', { static: false }) moodPad?: ElementRef<HTMLDivElement>;

  private router = inject(Router);

  // 5 star rating
  protected userRating = signal<number|null>(null);

  // 2d rusell circulmplex model
  protected valence = signal(0);
  protected activation = signal(0);

  protected moodLabel = computed(() => {
    return moodLabelFromVA(this.valence(), this.activation());
  });

  protected showPasswordEntry = signal(false);
  protected modalDescription = signal('Your data is password protected. Please enter your password or create a new one to save your mood entry.');

  private manager: any;

  ngAfterViewInit(): void {
    if (!this.moodPad?.nativeElement) return;

    this.manager = nipplejs.create({
      zone: this.moodPad.nativeElement,
      mode: 'static',
      position: { left: '50%', top: '50%' },
      color: {front: 'var(--color-primary)', back: 'rgba(0,0,0,0)'},
      size: 190,
      restJoystick: false,
      dynamicPage: true
    });

    this.manager.on('move', (evt: any) => {
      const data = evt?.data;
      const x = data?.vector?.x ?? 0;
      const y = data?.vector?.y ?? 0;

      this.valence.set(this.clamp(x, -1, 1));
      this.activation.set(this.clamp(y, -1, 1));
    });

  }

  ngOnDestroy(): void {
    this.manager?.destroy();
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }


  protected async HandleSaveClicked() {
    try {
      const unlocked = await database.restoreSession();
      if (unlocked) {
        await this.proceedSave()
      } else {
        this.showPasswordEntry.set(true);
      }
    } catch (errror) {
      console.error('Error restoring session:', errror);
      this.showPasswordEntry.set(true);
    }
  }

  protected async handleModalSave(password: string) {
    try {
      await database.unlock(password);
      await this.proceedSave();
      this.showPasswordEntry.set(false);
    } catch (error) {
      console.error('Error unlocking database:', error);
      if (error instanceof PasswordWrongError) {
        this.showPasswordEntry.set(true);
        this.modalDescription.set('Incorrect password. Please try again.');
      }
    }
    
  }

  protected async proceedSave() {
    const data: MoodEntry = {
      date: new Date().toISOString(),
      valance: this.valence(),
      activation: this.activation(),
      rating: this.userRating() ?? 0,
    }
    
    try {
      await database.save(data)

      this.router.navigate(['/timeline']);
    } catch (error) {
      console.error('Error saving mood entry:', error);
    }
  }

  // Sample signals ignore them

  // protected readonly textFromIndex = signal('Some mumbo jumbo long text');
  // protected readonly loremIpsum = signal('lorem ipsum dolor sit amet'.repeat(100));
  
  // // Button click counter
  // protected readonly clickCount = signal(0);

  // // Fibonacci calculation
  // protected readonly fibonacci = (n: number): number => {
  //   if (n <= 1) return n;
  //   let a = 0, b = 1;
  //   for (let i = 2; i <= n; i++) {
  //     [a, b] = [b, a + b];
  //   }
  //   return b;
  // };

  // // Handle button click
  // protected handleClick = () => {
  //   this.clickCount.update(count => count + 1);
  // };


}
