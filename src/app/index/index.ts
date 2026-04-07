import { Component, signal } from '@angular/core';
@Component({
  selector: 'app-index',
  imports: [],
  templateUrl: './index.html',
  styleUrl: './index.css',
})
export class Index {

  protected userRating = signal<number|null>(null);

  // Sample signals

  protected readonly textFromIndex = signal('Some mumbo jumbo long text');
  protected readonly loremIpsum = signal('lorem ipsum dolor sit amet'.repeat(100));
  
  // Button click counter
  protected readonly clickCount = signal(0);

  // Fibonacci calculation
  protected readonly fibonacci = (n: number): number => {
    if (n <= 1) return n;
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
      [a, b] = [b, a + b];
    }
    return b;
  };

  // Handle button click
  protected handleClick = () => {
    this.clickCount.update(count => count + 1);
  };


}
