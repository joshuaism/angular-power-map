import { Component, input } from '@angular/core';
import { Entity } from '../entity';
import { LittleSisNetwork } from '../network';

@Component({
  selector: 'app-details-tab',
  imports: [],
  template: `
    <h3 (click)="focus(entity().id)">{{ entity().name }}</h3>
    <p>{{ entity().blurb }}</p>
    <p>{{ entity().summary }}</p>
    <p>last updated: {{ entity().updated_at }}</p>
    <a href="{{ entity().link }}" target="_blank">source</a>
  `,
  styleUrl: './details-tab.css',
})
export class DetailsTab {
  entity = input.required<Entity>();
  network = input<LittleSisNetwork>();

  focus(id: number) {
    this.network()?.network?.focus(id);
  }
}
