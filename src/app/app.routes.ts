import { Routes } from '@angular/router';
import { Pricing } from './pricing/pricing';
import { Index } from './index';
import { Timeline } from './timeline/timeline';
import { NotFound } from './not-found/not-found';

export const routes: Routes = [
  { path: '', component: Index },
  { path: 'pricing', component: Pricing },
  { path: 'timeline', component: Timeline },
  // Catch-all route for undefined URLs
  { path: '**', component: NotFound },
];
