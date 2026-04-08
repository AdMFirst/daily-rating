import { Component, computed, ElementRef, signal, ViewChild } from '@angular/core';
import nipplejs from 'nipplejs';
@Component({
  selector: 'app-index',
  imports: [],
  templateUrl: './index.html',
  styleUrl: './index.css',
})
export class Index {
  @ViewChild('moodPad', { static: false }) moodPad?: ElementRef<HTMLDivElement>;

  // 5 star rating
  protected userRating = signal<number|null>(null);

  // 2d rusell circulmplex model
  protected valence = signal(0);
  protected activation = signal(0);

  protected moodLabel = computed(() => {
    const v = this.valence();      // already clamped to [-1, 1]
    const a = this.activation();   // already clamped to [-1, 1]

    const anchors = [
      { label: 'alert',     v:  0.00, a:  0.95 },
      { label: 'excited',   v:  0.50, a:  0.85 },
      { label: 'elated',    v:  0.70, a:  0.70 },
      { label: 'happy',     v:  0.85, a:  0.20 },
      { label: 'content',   v:  0.70, a: -0.20 },
      { label: 'relaxed',   v:  0.50, a: -0.60 },
      { label: 'serene',    v:  0.20, a: -0.85 },
      { label: 'calm',      v:  0.00, a: -0.95 },
      { label: 'fatigued',  v: -0.20, a: -0.85 },
      { label: 'depressed', v: -0.70, a: -0.70 },
      { label: 'sad',       v: -0.85, a: -0.20 },
      { label: 'bored',     v: -0.50, a: -0.60 },
      { label: 'distressed',v: -0.70, a:  0.70 },
      { label: 'angry',     v: -0.85, a:  0.20 },
      { label: 'tense',     v: -0.50, a:  0.85 },
      { label: 'nervous',   v: -0.20, a:  0.95 },
    ];

    const radius = Math.hypot(v, a);

    if (radius < 0.18) return 'neutral';

    let nearest = anchors[0];
    let minDistance = Infinity;

    for (const anchor of anchors) {
      const distance = Math.hypot(v - anchor.v, a - anchor.a);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = anchor;
      }
    }

    return nearest.label;
  });

  private manager: any;

  ngAfterViewInit(): void {
    if (!this.moodPad?.nativeElement) return;

    this.manager = nipplejs.create({
      zone: this.moodPad.nativeElement,
      mode: 'static',
      position: { left: '50%', top: '50%' },
      color: {front: 'var(--color-primary)', back: 'rgba(0,0,0,0)'},
      size: 190,
      restJoystick: false,
      dynamicPage: true
    });

    this.manager.on('move', (evt: any) => {
      const data = evt?.data;
      const x = data?.vector?.x ?? 0;
      const y = data?.vector?.y ?? 0;
      console.log();

      this.valence.set(this.clamp(x, -1, 1));
      this.activation.set(this.clamp(y, -1, 1));
    });

  }

  ngOnDestroy(): void {
    this.manager?.destroy();
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }


  protected save() {
    const savedData = {
      valance: this.valence(),
      activation: this.activation(),
      rating: this.userRating(),
      date: new Date().toISOString()
    }
    console.log(savedData);
  }

  // Sample signals ignore them

  // protected readonly textFromIndex = signal('Some mumbo jumbo long text');
  // protected readonly loremIpsum = signal('lorem ipsum dolor sit amet'.repeat(100));
  
  // // Button click counter
  // protected readonly clickCount = signal(0);

  // // Fibonacci calculation
  // protected readonly fibonacci = (n: number): number => {
  //   if (n <= 1) return n;
  //   let a = 0, b = 1;
  //   for (let i = 2; i <= n; i++) {
  //     [a, b] = [b, a + b];
  //   }
  //   return b;
  // };

  // // Handle button click
  // protected handleClick = () => {
  //   this.clickCount.update(count => count + 1);
  // };


}
