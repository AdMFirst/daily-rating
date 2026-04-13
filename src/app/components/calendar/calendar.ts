import { Component, input } from '@angular/core';
import { MoodEntry } from '../../core/services/database';

/**
 * This component is responsible for displaying a calendar view of the mood entries. 
 * It receives the mood entries as input and renders them in a calendar format. 
 * 
 * If there is multiple entries for a day, use a calculated average.
 * Each day with an entry will be colored based on the rating, from red (1) to green (5)
 * If there's no entry for a day it will be colored 'accent' from theme.
 * Day outside the current month will be colored 'neutral; from theme.
 * 
 * Each day tile will also show the valance and activation along with an icon to
 * represent the mood label of the day.
 * 
 * Clicking on a tile with multiple entries will open a modal to show list of entries.
 */
@Component({
  selector: 'app-calendar',
  imports: [],
  templateUrl: './calendar.html',
  styles: ``,
})
export class Calendar {
  moodEntries = input<MoodEntry[]>([]);

  
}
