import { Component, input } from '@angular/core';
import { MoodEntry } from '../../core/services/database';

@Component({
  selector: 'app-scatter-plot',
  imports: [],
  templateUrl: './scatter-plot.html',
  styles: ``,
})
export class ScatterPlot {
  moodEntries = input<MoodEntry[]>([]);

}
