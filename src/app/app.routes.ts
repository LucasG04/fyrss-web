import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/feed', pathMatch: 'full' },
  {
    path: 'feed',
    loadComponent: () =>
      import('./components/feed/feed-page/feed-page').then((m) => m.FeedPage),
  },
  { path: '**', redirectTo: '' },
];
