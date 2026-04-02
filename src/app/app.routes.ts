import { Routes } from '@angular/router';
import { Pricing } from './pricing/pricing';
import { Index } from './index';

export const routes: Routes = [
  { path: '', component: Index },
  { path: 'pricing', component: Pricing },
];
