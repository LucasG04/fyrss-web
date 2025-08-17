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
    path: 'history',
    renderMode: RenderMode.Server,
  },
  {
    path: 'saved',
    renderMode: RenderMode.Server,
  },
  {
    path: 'tags',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
