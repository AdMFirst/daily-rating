import { Component, computed, input, signal } from '@angular/core';
import { MoodEntry } from '../../core/services/database';
import { moodIconFromVA, moodLabelFromVA } from '../../core/utils/mood-translator';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styles: ``,
})
export class Calendar {
  moodEntries = input<MoodEntry[]>([]);

  protected viewDate = signal(new Date());
  protected animating = signal(false);
  protected selectedDayEntries = signal<MoodEntry[]>([]);
  protected isModalOpen = signal(false);

  protected days = computed(() => {
    const date = this.viewDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDay = new Date(firstDayOfMonth);
    startDay.setDate(1 - firstDayOfMonth.getDay()); // Padding from prev month

    const endDay = new Date(lastDayOfMonth);
    endDay.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay())); // Padding from next month

    const days: any[] = [];
    const curr = new Date(startDay);

    const entries = this.moodEntries();
    const entriesMap = new Map<string, MoodEntry[]>();
    
    entries.forEach(entry => {
      // Use the date part directly from the ISO string to avoid timezone shifts
      const d = entry.date.split('T')[0];
      if (!entriesMap.has(d)) {
        entriesMap.set(d, []);
      }
      entriesMap.get(d)!.push(entry);
    });

    while (curr <= endDay) {
      // Use local date parts for the calendar grid
      const dateString = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
      const dayEntries = entriesMap.get(dateString) || [];
      
      let averageRating = 0;
      let averageValence = 0;
      let averageActivation = 0;

      if (dayEntries.length > 0) {
        averageRating = dayEntries.reduce((acc, e) => acc + e.rating, 0) / dayEntries.length;
        averageValence = dayEntries.reduce((acc, e) => acc + e.valance, 0) / dayEntries.length;
        averageActivation = dayEntries.reduce((acc, e) => acc + e.activation, 0) / dayEntries.length;
      }

      days.push({
        date: new Date(curr),
        isCurrentMonth: curr.getMonth() === month,
        entries: dayEntries,
        averageRating,
        averageValence,
        averageActivation,
        moodIcon: dayEntries.length > 0 ? moodIconFromVA(averageValence, averageActivation) : null,
        moodLabel: dayEntries.length > 0 ? moodLabelFromVA(averageValence, averageActivation) : null,
        colorClass: this.getColorClass(dayEntries.length > 0, averageRating, curr.getMonth() === month)
      });
      curr.setDate(curr.getDate() + 1);
    }

    return days;
  });

  protected monthName = computed(() => {
    return this.viewDate().toLocaleString('default', { month: 'long', year: 'numeric' });
  });

  protected nextMonth() {
    const d = new Date(this.viewDate());
    d.setMonth(d.getMonth() + 1);
    this.startAnimation(d);
  }

  protected prevMonth() {
    const d = new Date(this.viewDate());
    d.setMonth(d.getMonth() - 1);
    this.startAnimation(d);
  }

  protected goToToday() {
    this.startAnimation(new Date());
  }

  protected onDayClick(day: any) {
    if (day.entries.length >= 1) {
      this.selectedDayEntries.set(day.entries);
      this.isModalOpen.set(true);
    }
  }

  /**
   * Triggers the fade animation and updates the view date after the transition.
   */

  private getColorClass(hasEntries: boolean, rating: number, isCurrentMonth: boolean): string {
    if (!isCurrentMonth) return 'bg-neutral text-neutral-content opacity-50';
    if (!hasEntries) return 'bg-accent text-accent-content opacity-50';
    
    // Rating 1 to 5
    const roundedRating = Math.round(rating);
    switch (roundedRating) {
      case 1: return 'bg-error text-error-content';
      case 2: return 'bg-warning/60 text-warning-content';
      case 3: return 'bg-warning text-warning-content';
      case 4: return 'bg-success/60 text-success-content';
      case 5: return 'bg-success text-success-content';
      default: return 'bg-accent text-accent-content';
    }
  }

  /**
   * Triggers a slide‑in animation before updating the month.
   */
  private startAnimation(newDate: Date) {
    this.animating.set(true);
    setTimeout(() => {
      this.viewDate.set(newDate);
      this.animating.set(false);
    }, 300);
  }
  
  protected formatEntryTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  protected getMoodIcon(v: number, a: number) {
    return moodIconFromVA(v, a);
  }

  protected getMoodLabel(v: number, a: number) {
    return moodLabelFromVA(v, a);
  }
}
