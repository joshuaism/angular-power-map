import { Component, input } from '@angular/core';
import { Entity } from '../entity';
import { LittleSisNetwork } from '../network';

@Component({
  selector: 'app-details-tab',
  imports: [],
  templateUrl: './details-tab.html',
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
    }&from_year=1980`;
  }

  getEmployerFecUrl(): string {
    return `https://joshuaism.github.io/react-fec-client?employer=${
      this.entity().name
    }`;
  }
}
