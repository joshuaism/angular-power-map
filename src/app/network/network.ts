import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { LittleSisNetwork } from '../network';
import { Details } from '../details/details';
import { Entity } from '../entity';
import { LittlesisService } from '../littlesis.service';
import { EntityAutocomplete } from '../entity-autocomplete/entity-autocomplete';

@Component({
  selector: 'app-network',
  imports: [Details, EntityAutocomplete],
  template: `
    <section>
      <app-entity-autocomplete
        (notify)="addOrPopulateNode($event)"
      ></app-entity-autocomplete>
    </section>
    <section>
      <div class="network" id="mynetwork" #myNetwork></div>
      <section></section>
      <div class="info-box">
        @for (entity of entities; track entity.id) {
        <app-details [entity]="entity" [network]="network"></app-details>
        }
      </div>
    </section>
  `,
  styleUrls: ['./network.css'],
})
export class Network implements AfterViewInit {
  @ViewChild('myNetwork') networkContainer!: ElementRef;

  network?: LittleSisNetwork;
  entities: Entity[] = [];
  service: LittlesisService = inject(LittlesisService);

  constructor() {}

  ngAfterViewInit() {
    this.network = new LittleSisNetwork(this.networkContainer.nativeElement);
    let that = this;
    this.network.network?.on('selectNode', function (params: any) {
      let node = params.nodes[0];
      if (node) {
        that.service.getEntityById(node).then((entity) => {
          that.entities = [entity];
        });
      }
    });
  }

  addOrPopulateNode(entity: Entity) {
    this.network?.populateNetwork(entity);
    this.entities = [entity];
  }
}
