import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { database, MoodEntry, PasswordWrongError } from '../core/services/database';
import { PasswordDialog } from '../components/password-dialog/password-dialog';
import { Calendar } from '../components/calendar/calendar';
import { ScatterPlot } from '../components/scatter-plot/scatter-plot';
import { SummaryStatistic } from '../components/summary-statistic/summary-statistic';


type pageState = 'loading' | 'locked' | 'ready' | 'error';

@Component({
  selector: 'app-timeline',
  imports: [RouterLink, PasswordDialog, Calendar, ScatterPlot, SummaryStatistic],
  templateUrl: './timeline.html',
  styles: '',
})
export class Timeline {

  protected pageState = signal<pageState>('loading');
  protected showPasswordEntry = signal(false);
  protected modalDescription = signal('Your data is password protected. Please enter your password or create a new one to access timeline.');

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
      await database.unlock(password);

      this.showPasswordEntry.set(false);
      this.pageState.set('ready');

      this.proceedLoading()
    } catch (error) {
      console.error('Error unlocking database:', error);
      this.pageState.set('locked');

      if (error instanceof PasswordWrongError) {
        this.showPasswordEntry.set(true); 
        this.modalDescription.set('Incorrect password. Please try again.');
      }
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


  async debug() {
    await database.debugSeedLastMonth();
    console.log('Database seeded with test data!');
  }
}
