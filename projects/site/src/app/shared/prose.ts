import { Component, computed, input } from '@angular/core';
import { marked } from 'marked';

/**
 * Renders one of this site's own original prose fragments (src/content/docs/*.txt)
 * as HTML. Not `@analogjs/content`'s `<analog-markdown>`: its internal
 * `AnchorNavigationDirective` throws NG0203 ("inject() outside an injection
 * context") during prerendering with this Angular version — `marked` alone
 * has no such DI involvement and is already a dependency.
 */
@Component({
  selector: 'app-prose',
  template: `<div class="docs-prose" [innerHTML]="html()"></div>`,
})
export class ProseComponent {
  readonly content = input.required<string>();
  protected readonly html = computed(() => marked.parse(this.content(), { async: false }));
}
