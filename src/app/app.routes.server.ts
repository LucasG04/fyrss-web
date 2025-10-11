import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Client,
  },
  {
    path: 'feed',
    renderMode: RenderMode.Server,
  },
  {
    path: 'feed/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'history',
    renderMode: RenderMode.Server,
  },
  {
    path: 'saved',
    renderMode: RenderMode.Server,
  },
  {
    path: 'rss-feeds',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
