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
    path: 'rss-feeds',
    loadComponent: () =>
      import('./components/rss-feeds/rss-feeds').then((m) => m.RssFeeds),
  },
  { path: '**', redirectTo: '' },
];
