export interface Article {
  id: string; // UUID
  title: string;
  description: string;
  sourceUrl: string;
  sourceType: 'rss' | 'scraped';
  priority: number;
  tags: string[];
  publishedAt: string; // ISO date string
  lastReadAt: string; // ISO date string
  save: boolean;
}
