import { Component, input } from '@angular/core';
import { Entity } from '../entity';

@Component({
  selector: 'app-details',
  imports: [],
  template: ` <p>{{ entity().id }}</p> `,
  styleUrl: './details.css',
})
export class Details {
  entity = input.required<Entity>();
}
