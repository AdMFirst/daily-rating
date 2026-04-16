import { Component, input, computed, signal } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { MoodEntry } from '../../core/services/database';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-quadrant-plot',
  templateUrl: './quadrant-plot.html',
  imports: [BaseChartDirective]
})
export class QuadrantPlot {
  moodEntries = input<MoodEntry[]>([]);
  protected duration = signal(-1); // filter duration in days, -1 = all
  protected entries = computed(() => {
    if (this.duration() < 0) return this.moodEntries();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - this.duration());
    return this.moodEntries().filter(e => new Date(e.date) >= cutoff);
  });

  private getBaseContentColor(): string {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--color-base-content')
      .trim() || '#ccc';
  }

  // Update your chartOptions
  chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%', // Makes it a thin, elegant ring
    plugins: {
      legend: {
        display: true,
        position: 'left',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { family: 'Inter, sans-serif', size: 12 },
          color: this.getBaseContentColor(),
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: this.getBaseContentColor(),
        bodyColor: this.getBaseContentColor(),
        borderColor: this.getBaseContentColor(),
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        cornerRadius: 8
      }
    },
    elements: {
      arc: {
        borderWidth: 2,
        borderRadius: 5, // Gives segments rounded edges
      }
    }
  };

  // Returns ONLY the data part, matching ChartData<'pie'>
  chartData = computed<ChartData<'doughnut'>>(() => {
    const counts = { e: 0, c: 0, s: 0, t: 0 };

    (this.entries() || []).forEach(entry => {
      const v = entry.valance ?? 0;
      const a = entry.activation ?? 0;
      if (v > 0 && a > 0) counts.e++;
      else if (v > 0 && a <= 0) counts.c++;
      else if (v <= 0 && a > 0) counts.s++;
      else counts.t++;
    });

    return {
      labels: ['Excited', 'Calm', 'Stressed', 'Sad'],
      datasets: [{
        data: [counts.e, counts.c, counts.s, counts.t],
        backgroundColor: [
          'rgba(255, 107, 107, 0.7)', // Coral Red
          'rgba(78, 205, 196, 0.7)',  // Teal
          'rgba(255, 159, 64, 0.7)',  // Orange/Stress
          'rgba(69, 90, 100, 0.7)'    // Slate/Tired
        ],
        hoverBackgroundColor: ['#ff6b6b', '#4ecdc4', '#ff9f40', '#455a64'],
        borderColor: ['#ff6b6b', '#4ecdc4', '#ff9f40', '#455a64'],
        hoverOffset: 15, // Pops the segment out on hover
        spacing: 5       // Gap between segments
      }]
    };
  });
}
