import { Component, computed, input, signal } from '@angular/core';
import { MoodEntry } from '../../core/services/database';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, LegendItem } from 'chart.js';

@Component({
  selector: 'app-scatter-plot',
  imports: [BaseChartDirective,],
  templateUrl: './scatter-plot.html',
  styles: ``,
})
export class ScatterPlot {
  moodEntries = input<MoodEntry[]>([]);
  protected duration = signal(-1); // limit how many days are shown, -1 for all
  protected entries = computed(() => {
    if (this.duration() < 0) {
      return this.moodEntries();
    }
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.duration());
    return this.moodEntries().filter(entry => new Date(entry.date) >= cutoffDate);
  });


  readonly ratingLegend = [
    { rating: 1, label: 'stars' },
    { rating: 2, label: 'stars' },
    { rating: 3, label: 'stars' },
    { rating: 4, label: 'stars' },
    { rating: 5, label: 'stars' },
  ];

  chartData = computed<ChartConfiguration<'scatter'>['data']>(() => ({
    datasets: [
      {
        label: 'Mood',
        data: this.entries().map(m => ({
          x: m.valance,
          y: m.activation,
          rating: m.rating,
          date: m.date,
        })),
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: this.entries().map(m => this.getRatingThemeColors(m.rating).fill),
        pointBorderColor: this.entries().map(m => this.getRatingThemeColors(m.rating).stroke),
        pointBorderWidth: 1,
      },
    ],
  }));

  chartOptions: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        title: {
          display: true,
          text: 'Valance',
          color: this.getThemeColor('--color-base-content', '#fff')
        },
        ticks: {color: this.getThemeColor('--color-base-content', '#fff')},
        grid: {color: this.getThemeColor('--color-base-content', '#fff')},
      },
      y: {
        title: {
          display: true,
          text: 'Activation',
          color: this.getThemeColor('--color-base-content', '#fff')
        },
        ticks: {color: this.getThemeColor('--color-base-content', '#fff')},
        grid: {color: this.getThemeColor('--color-base-content', '#fff')},

      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          generateLabels: () =>
          this.ratingLegend.map(item => {
            const colors = this.getRatingThemeColors(item.rating);

            return {
              text: `${item.rating} ${item.label}`,
              fillStyle: colors.fill,
              fontColor: this.getThemeColor('--color-base-content', '#ffffff'),
              strokeStyle: colors.stroke,
              lineWidth: 1,
              hidden: false,
              datasetIndex: 0,
              pointStyle: 'circle',
              rotation: 0,
            };
          }),
        },
      }
    }
  };

  private getThemeColor(name: string, fallback: string): string {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim() || fallback;
  }

  private withOpacity(color: string, opacity: number): string {
    return `color-mix(in srgb, ${color} ${Math.round(opacity * 100)}%, transparent)`;
  }

  private getRatingThemeColors(rating: number): { fill: string; stroke: string; text: string } {
    switch (rating) {
      case 1:
        return {
          fill: this.getThemeColor('--color-error', '#dc2626'),
          stroke: this.getThemeColor('--color-error', '#dc2626'),
          text: this.getThemeColor('--color-error-content', '#ffffff'),
        };
      case 2:
        return {
          fill: this.withOpacity(this.getThemeColor('--color-warning', '#f59e0b'), 0.6),
          stroke: this.getThemeColor('--color-warning', '#f59e0b'),
          text: this.getThemeColor('--color-warning-content', '#000000'),
        };
      case 3:
        return {
          fill: this.getThemeColor('--color-warning', '#f59e0b'),
          stroke: this.getThemeColor('--color-warning', '#f59e0b'),
          text: this.getThemeColor('--color-warning-content', '#000000'),
        };
      case 4:
        return {
          fill: this.withOpacity(this.getThemeColor('--color-success', '#22c55e'), 0.6),
          stroke: this.getThemeColor('--color-success', '#22c55e'),
          text: this.getThemeColor('--color-success-content', '#ffffff'),
        };
      case 5:
        return {
          fill: this.getThemeColor('--color-success', '#22c55e'),
          stroke: this.getThemeColor('--color-success', '#22c55e'),
          text: this.getThemeColor('--color-success-content', '#ffffff'),
        };
      default: 
        return {
          fill: this.getThemeColor('--color-base', '#a855f7'),
          stroke: this.getThemeColor('--color-base', '#a855f7'),
          text: this.getThemeColor('--color-base-content', '#ffffff'),
        };
    }
  }

}
