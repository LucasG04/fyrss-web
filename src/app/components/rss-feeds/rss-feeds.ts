import { Component, inject, signal } from '@angular/core';
import { RssFeed } from '../../shared/types/rss-feed';
import { firstValueFrom } from 'rxjs';
import { RssFeedService } from '../../core/services/rss-feed-service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rss-feeds',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rss-feeds.html',
  styleUrl: './rss-feeds.css',
})
export class RssFeeds {
  private readonly feedService = inject(RssFeedService);
  private readonly fb = inject(FormBuilder);

  feeds = signal<RssFeed[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  isCreating = signal<boolean>(false);
  editingFeed = signal<RssFeed | null>(null);
  showDeleteConfirm = signal<string | null>(null);

  feedForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
  });

  constructor() {
    this.loadFeeds();
  }

  async loadFeeds(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);
      this.success.set(null);
      const feeds = await firstValueFrom(this.feedService.getAll());
      this.feeds.set(feeds);
    } catch (err) {
      this.error.set('Failed to load RSS feeds');
      console.error('Error loading feeds:', err);
    } finally {
      this.loading.set(false);
    }
  }

  startCreating(): void {
    this.isCreating.set(true);
    this.editingFeed.set(null);
    this.error.set(null);
    this.success.set(null);
    this.feedForm.reset();
  }

  startEditing(feed: RssFeed): void {
    this.editingFeed.set(feed);
    this.isCreating.set(false);
    this.error.set(null);
    this.success.set(null);
    this.feedForm.patchValue({
      name: feed.name,
      url: feed.url,
    });
  }

  cancelForm(): void {
    this.isCreating.set(false);
    this.editingFeed.set(null);
    this.error.set(null);
    this.success.set(null);
    this.feedForm.reset();
  }

  async saveFeed(): Promise<void> {
    if (this.feedForm.invalid) {
      this.feedForm.markAllAsTouched();
      return;
    }

    try {
      this.loading.set(true);
      this.error.set(null);
      this.success.set(null);

      const formData = this.feedForm.value;
      const editingFeed = this.editingFeed();

      if (editingFeed) {
        // Update existing feed
        const updatedFeed: RssFeed = {
          ...editingFeed,
          name: formData.name,
          url: formData.url,
        };
        await firstValueFrom(this.feedService.update(updatedFeed));

        // Update local state
        const currentFeeds = this.feeds();
        const updatedFeeds = currentFeeds.map((feed) =>
          feed.id === editingFeed.id ? updatedFeed : feed
        );
        this.feeds.set(updatedFeeds);
        this.success.set('RSS feed updated successfully!');
      } else {
        // Create new feed
        const newFeed = await firstValueFrom(this.feedService.create(formData));
        this.feeds.update((feeds) => [...feeds, newFeed]);
        this.success.set('RSS feed created successfully!');
      }

      this.cancelForm();

      // Clear success message after 3 seconds
      setTimeout(() => this.success.set(null), 3000);
    } catch (err: any) {
      let message = 'Failed to save RSS feed';
      if (err && err.error && err) {
        message += `: ${err.error}`;
      }
      this.error.set(message);
      console.error(message, err);
    } finally {
      this.loading.set(false);
    }
  }

  confirmDelete(feedId: string): void {
    this.showDeleteConfirm.set(feedId);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(null);
  }

  async deleteFeed(feedId: string): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);
      this.success.set(null);

      await firstValueFrom(this.feedService.delete(feedId));

      // Update local state
      this.feeds.update((feeds) => feeds.filter((feed) => feed.id !== feedId));
      this.showDeleteConfirm.set(null);
      this.success.set('RSS feed deleted successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => this.success.set(null), 3000);
    } catch (err) {
      this.error.set('Failed to delete RSS feed');
      console.error('Error deleting feed:', err);
    } finally {
      this.loading.set(false);
    }
  }

  getFieldError(fieldName: string): string | null {
    const field = this.feedForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) {
        return `${
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
        } is required`;
      }
      if (field.errors?.['minlength']) {
        return `${
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
        } must be at least 1 character`;
      }
      if (field.errors?.['pattern']) {
        return 'Please enter a valid URL (must start with http:// or https://)';
      }
    }
    return null;
  }
}
