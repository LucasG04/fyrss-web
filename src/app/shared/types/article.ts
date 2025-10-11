export interface Article {
  id: string; // UUID
  title: string;
  description: string;
  sourceUrl: string;
  sourceType: 'rss' | 'scraped';
  publishedAt: string; // ISO date string
  lastReadAt: string; // ISO date string
  save: boolean;
  feedId: string; // UUID of the feed it belongs to
}
