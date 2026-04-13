import { Component } from '@angular/core';

@Component({
  selector: 'app-pricing',
  imports: [],
  templateUrl: './pricing.html',
  styles: '',
})
export class Pricing {
  donateTrakteer() {
    window.open('https://trakteer.id/AdMFirst/tip?open=true', '_blank');
  }

  donateSociabuzz() {
    window.open('https://sociabuzz.com/admfirst/tribe', '_blank');
  }
}
