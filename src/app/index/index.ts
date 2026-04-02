import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-index',
  imports: [],
  templateUrl: './index.html',
  styleUrl: './index.css',
})
export class Index {

  protected readonly textFromIndex = signal('Some mumbo jumbo long text');
  protected readonly loremIpsum = signal('lorem ipsum dolor sit amet'.repeat(200));


}
