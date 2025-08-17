import { Component, inject, signal } from '@angular/core';
import { Tag } from '../../shared/types/tag';
import { TagService } from '../../core/services/tag-service';
import { firstValueFrom } from 'rxjs';
import { CheckboxTile } from '../../shared/components/checkbox-tile/checkbox-tile';

@Component({
  selector: 'app-tags-page',
  imports: [CheckboxTile],
  templateUrl: './tags-page.html',
  styleUrl: './tags-page.css',
})
export class TagsPage {
  private readonly tagService = inject(TagService);

  tags = signal<Tag[]>([]);

  constructor() {
    firstValueFrom(this.tagService.getAll()).then((tags) =>
      this.tags.set(tags)
    );
  }

  updateTagPriority(tag: Tag) {
    tag.priority = !tag.priority;
    firstValueFrom(this.tagService.update(tag)).then(() => {
      const index = this.tags().findIndex((t) => t.id === tag.id);
      const updatedTags = [...this.tags()];
      updatedTags[index] = tag;
      this.tags.set(updatedTags);
    });
  }
}
