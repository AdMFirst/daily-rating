import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { database, MoodEntry } from '../core/services/database';
import { PasswordDialog } from '../components/password-dialog/password-dialog';


type pageState = 'loading' | 'locked' | 'ready' | 'error';

@Component({
  selector: 'app-timeline',
  imports: [RouterLink, PasswordDialog],
  templateUrl: './timeline.html',
  styleUrl: './timeline.css',
})
export class Timeline {

  protected pageState = signal<pageState>('loading');
  protected showPasswordEntry = signal(false);

  protected entries = signal<MoodEntry[]>([]);

  async ngOnInit() {
    try {
      const unlocked = await database.restoreSession();
      if (!unlocked) {
        this.pageState.set('locked');
        this.showPasswordEntry.set(true);
      } else {
        this.pageState.set('ready');
        this.proceedLoading()
      }
    } catch (errror) {
      console.error('Error restoring session:', errror);
      this.pageState.set('locked');
      this.showPasswordEntry.set(true);
    }
  }

  protected async handleModalSubmit(password: string) {
    try {
      console.debug('Attempting to unlock database with password:', password)
      await database.unlock(password);

      this.showPasswordEntry.set(false);
      this.pageState.set('ready');

      this.proceedLoading()
    } catch (error) {
      console.error('Error unlocking database:', error);
      this.pageState.set('locked');
    }
  }

  private async proceedLoading() {
    try {
      const data = await database.getAll();

      this.entries.set(data);
    } catch (error) {
      console.error('Error loading mood entries:', error);
      this.pageState.set('error');
    }
  }
}
