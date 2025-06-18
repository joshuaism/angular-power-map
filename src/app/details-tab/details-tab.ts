import { Component, input } from '@angular/core';
import { Entity } from '../entity';
import { LittleSisNetwork } from '../network';

@Component({
  selector: 'app-details-tab',
  imports: [],
  template: `
    <h1
      style="cursor:pointer;"
      title="center map on {{ entity().name }}"
      (click)="focus(entity().id)"
    >
      {{ entity().name }}
    </h1>
    <h4>{{ entity().blurb }}</h4>
    <div class="scrollable">
      @if(entity().aliases && entity().aliases.length > 0) {
      <h4>
        aka: @for(alias of entity().aliases; track alias) {
        <span>{{ alias }}</span>
        @if(!$last) {<span>, </span>} }
      </h4>
      }
      <a href="{{ getFecUrl() }}" target="_blank">fec search</a>
      @if (entity().types[0].toUpperCase() !== 'PERSON') {
      <br />
      <a href="{{ getEmployerFecUrl() }}" target="_blank"
        >fec employee search</a
      >
      } @if (entity().website) {
      <br />
      <a href="{{ entity().website }}" target="_blank">
        {{ entity().name }} website
      </a>
      }
      <p>{{ entity().summary }}</p>
      <p>last updated: {{ entity().updated_at }}</p>
      <a href="{{ entity().link }}" target="_blank">source</a>
      <br />
      <a
        href="https://littlesis.org/api/entities/{{ entity().id }}"
        target="_blank"
        >data</a
      >
    </div>
  `,
  styleUrl: './details-tab.css',
})
export class DetailsTab {
  entity = input.required<Entity>();
  network = input<LittleSisNetwork>();

  focus(id: number) {
    this.network()?.network?.focus(id);
  }

  getFecUrl(): string {
    return `https://joshuaism.github.io/react-fec-client?name=${
      this.entity().name
    }&amp;from_year=1980`;
  }

  getEmployerFecUrl(): string {
    return `https://joshuaism.github.io/react-fec-client?employer=${
      this.entity().name
    }`;
  }
}
