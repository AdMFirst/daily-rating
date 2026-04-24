import { Component, input, signal, computed, effect } from '@angular/core';
import { MoodEntry } from '../../core/services/database';

@Component({
  selector: 'app-summary-statistic',
  imports: [],
  templateUrl: './summary-statistic.html',
  styles: [], // Fixed: Angular expects an array for inline styles
})
export class SummaryStatistic {
  moodEntries = input<MoodEntry[]>([]); 

  protected avgValance = signal(0.0);
  protected avgActivation = signal(0.0);
  protected avgRating = signal(0.0);
  protected currentStreak = signal(0);
  protected currentStreakLabel = computed(() => {
    const n = Math.max(0, Math.min(7, this.currentStreak())); // clamp 0..7
    if (n === 0) return "Let's get started. you got this!";
    if (n === 1) return "Nice start. 1 day streak!";
    if (n < 7) return `Great job. ${n} days in a row!`;
    return `Legendary. 7 days! You've nailed the week!`;
  });

  protected starsHtml = computed(() => this.renderStars())

  constructor() {
    // Automatically triggers when moodEntries signal changes.
    // Runs once on init, then again when parent loads data.
    effect(() => {
      this.calculateStatistics();
    });
  }

  private calculateStatistics() {
    const entries = this.moodEntries();
    
    if (!entries?.length) {
      this.resetStatistics();
      return;
    }

    // Sort entries by date descending for easier filtering
    const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Define the 7-day window (inclusive of today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const last7Days = sorted.filter(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate >= sevenDaysAgo && entryDate <= today;
    });

    // Calculate averages
    const count = last7Days.length;
    if (count > 0) {
      this.avgValance.set(last7Days.reduce((sum, e) => sum + e.valance, 0) / count);
      this.avgActivation.set(last7Days.reduce((sum, e) => sum + e.activation, 0) / count);
      this.avgRating.set(last7Days.reduce((sum, e) => sum + e.rating, 0) / count);
    } else {
      this.avgValance.set(0);
      this.avgActivation.set(0);
      this.avgRating.set(0);
    }

    // Calculate current weekly streak
    const streak = this.calculateStreak(entries);
    this.currentStreak.set(Math.min(streak, 7));
  }

  private calculateStreak(entries: MoodEntry[]): number {
    if (!entries.length) return 0;

    // Extract unique dates, normalize to local day boundaries, sort descending
    const uniqueDates = [...new Set(entries.map(e => new Date(e.date).toDateString()))]
      .map(d => new Date(d).getTime())
      .sort((a, b) => b - a);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000; 

    // Streak is only active if the most recent entry is today or yesterday
    const latest = uniqueDates[0];
    if (latest < todayMs - oneDayMs) return 0;

    let streak = 0;
    let expectedDate = latest;

    for (const date of uniqueDates) {
      if (date === expectedDate) {
        streak++;
        expectedDate -= oneDayMs;
      } else if (date < expectedDate) {
        // Gap found in consecutive days, break streak
        break;
      }
      // Ignore future dates (shouldn't happen with proper sorting, but safe to skip)
    }

    return streak;
  }

  private renderStars(): string {
    const rating = this.avgRating()
    if (rating == null || isNaN(rating)) return '';
    // Clamp to 1..5
    const full = Math.floor(rating);
    const remainder = rating - full;
    const half = remainder >= 0.25 && remainder < 0.75 ? 1 : 0;
    const extraFull = remainder >= 0.75 ? 1 : 0;
    const fullCount = full + extraFull;
    const empty = 5 - fullCount - half;
    let html = '';
    for (let i = 0; i < fullCount; i++) html += '<i class="fa-solid fa-star"></i>';
    if (half) html += '<i class="fa-solid fa-star-half-stroke"></i>';
    for (let i = 0; i < empty; i++) html += '<i class="fa-regular fa-star"></i>';
    return html;
  }

  private resetStatistics() {
    this.avgValance.set(0);
    this.avgActivation.set(0);
    this.avgRating.set(0);
    this.currentStreak.set(0);
  }
}