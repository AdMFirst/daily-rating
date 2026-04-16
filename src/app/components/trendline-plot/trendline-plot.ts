import { Component, input, computed, signal } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { MoodEntry } from '../../core/services/database';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-trendline-plot',
  standalone: true, // Standard for modern Angular
  imports: [BaseChartDirective],
  templateUrl: './trendline-plot.html',
})
export class TrendlinePlot {
  moodEntries = input<MoodEntry[]>([]);
  protected duration = signal(-1); // filter days, -1 = all
  protected entries = computed(() => {
    const entries = this.moodEntries() || [];
    if (this.duration() < 0) return entries;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - this.duration());
    return entries.filter(e => new Date(e.date) >= cutoff);
  });

  private getBaseContentColor(): string {
    const hsl = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-base-content')
      .trim()
    
    return hsl || '#ccc';
  }

  readonly chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { 
        title: { display: true, text: 'Date', color: this.getBaseContentColor() }, 
        grid: {color: this.getBaseContentColor()} ,
        ticks: {color: this.getBaseContentColor()},
      },
      // Left Axis for Valence/Activation (-1 to 1)
      y: { 
        type: 'linear',
        display: true,
        position: 'left',
        min: -1,
        max: 1,
        ticks: {color: this.getBaseContentColor()},
        grid: {color: this.getBaseContentColor()},
        title: { display: true, text: 'Valence / Activation', color: this.getBaseContentColor() }
      },
      // Right Axis for Stars (1 to 5)
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        min: 0, 
        max: 5,
        ticks: {color: this.getBaseContentColor()},
        grid: { drawOnChartArea: false, color: this.getBaseContentColor() }, // Only show grid lines for the left axis
        title: { display: true, text: 'Rating (Stars)', color: this.getBaseContentColor() }
      },
    },
    plugins: {
      legend: {
        labels: {
          color: this.getBaseContentColor()
        }
      }
    }
  };

  chartData = computed<ChartConfiguration<'line'>['data']>(() => {
    // 1. Determine cutoff based on duration signal; default to last 7 days if duration is -1
    const MS_IN_A_DAY = 24 * 60 * 60 * 1000;
    const cutoffDate = this.duration() < 0 ? new Date(Date.now() - 7 * MS_IN_A_DAY) : (() => { const d = new Date(); d.setDate(d.getDate() - this.duration()); return d; })();

    // 2. Filter and Sort using entries computed (which already applies duration if set)
    const entries = [...this.entries()]
      .filter(e => new Date(e.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 3. Map to Chart Data
    return {
      labels: entries.map(e => new Date(e.date).toLocaleDateString(undefined, { 
        weekday: 'short', 
        month: 'numeric', 
        day: 'numeric' 
      })),
      datasets: [
        {
          label: 'Valence',
          data: entries.map(e => e.valance),
          borderColor: '#ff6b6b',
          yAxisID: 'y',
          tension: 0.3
        },
        {
          label: 'Activation',
          data: entries.map(e => e.activation),
          borderColor: '#4ecdc4',
          yAxisID: 'y',
          tension: 0.3
        },
        {
          label: 'Rating',
          data: entries.map(e => e.rating),
          borderColor: '#dfdf1f',
          yAxisID: 'y1',
          borderDash: [5, 5]
        }
      ]
    };
  });
}
