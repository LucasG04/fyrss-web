import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/feed', pathMatch: 'full' },
  {
    path: 'feed',
    loadComponent: () =>
      import('./components/feed/feed-page/feed-page').then((m) => m.FeedPage),
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./components/history-page/history-page').then(
        (m) => m.HistoryPage
      ),
  },
  {
    path: 'saved',
    loadComponent: () =>
      import('./components/saved-page/saved-page').then((m) => m.SavedPage),
  },
  {
    path: 'tags',
    loadComponent: () =>
      import('./components/tags-page/tags-page').then((m) => m.TagsPage),
  },
  { path: '**', redirectTo: '' },
];
