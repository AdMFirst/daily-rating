import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { database } from '../core/services/database';
import { PasswordDialog } from '../components/password-dialog/password-dialog';

@Component({
  selector: 'app-timeline',
  imports: [RouterLink, PasswordDialog],
  templateUrl: './timeline.html',
  styleUrl: './timeline.css',
})
export class Timeline {

  protected showPasswordEntry = signal(false);

  async ngAfterViewInit() {
    try {
      const unlocked = await database.restoreSession();
      if (!unlocked) {
        this.showPasswordEntry.set(true);
      } else {
        this.proceedLoading()

      }
    } catch (errror) {
      console.error('Error restoring session:', errror);
      this.showPasswordEntry.set(true);
    }
  }

  protected async handleModalSubmit(password: string) {
    try {
      console.debug('Attempting to unlock database with password:', password)
      await database.unlock(password);

      this.showPasswordEntry.set(false);
      this.proceedLoading()
    } catch (error) {
      console.error('Error unlocking database:', error);
    }
  }

  private async proceedLoading() {
    const data = await database.getAll();
    console.debug('Loaded mood entries:', data);
  }
}
