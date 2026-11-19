import { Component } from '@angular/core';
import { ImageComponent } from '@medra/ui';

@Component({
  selector: 'app-image-dimensions-demo',
  imports: [ImageComponent],
  templateUrl: './image-dimensions.demo.html',
})
export class ImageDimensionsDemo {
  protected readonly sceneImage =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgMjQwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2RiZWFmZSIvPjxjaXJjbGUgY3g9IjMyMCIgY3k9IjYwIiByPSIzMCIgZmlsbD0iI2ZiYmYyNCIvPjxwb2x5Z29uIHBvaW50cz0iMCwyNDAgMTIwLDkwIDIwMCwxODAgMjYwLDExMCA0MDAsMjQwIiBmaWxsPSIjNjBhNWZhIi8+PHBvbHlnb24gcG9pbnRzPSIwLDI0MCA5MCwxNDAgMTYwLDIwMCA0MDAsMjQwIiBmaWxsPSIjM2I4MmY2Ii8+PC9zdmc+';
}
