import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { LittleSisNetwork } from '../network';
import { Details } from '../details/details';
import { Entity } from '../entity';
import { LittlesisService } from '../littlesis.service';
import { EntityAutocomplete } from '../entity-autocomplete/entity-autocomplete';
import { Relationship } from '../relationship';
import { RelationshipDetails } from '../relationship-details/relationship-details';

@Component({
  selector: 'app-network',
  imports: [Details, RelationshipDetails, EntityAutocomplete],
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
        } @for (relationship of relationships; track relationship.id) {
        <app-relationship-details
          [relationship]="relationship"
          [network]="network"
        ></app-relationship-details>
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
  relationships: Relationship[] = [];
  service: LittlesisService = inject(LittlesisService);

  constructor() {}

  ngAfterViewInit() {
    this.network = new LittleSisNetwork(this.networkContainer.nativeElement);
    let that = this;
    this.network.network?.on('selectNode', function (params: any) {
      that.relationships = [];
      let node = params.nodes[0];
      if (node) {
        that.service.getEntityById(node).then((entity) => {
          that.entities = [entity];
        });
      }
    });
    this.network.network?.on('selectEdge', function (params: any) {
      let node = params.nodes[0];
      if (node) {
        return; // false alarm, a node was selected
      }
      that.entities = [];
      let edge = params.edges[0];
      if (edge) {
        that.service.getRelationshipById(edge).then((relationship) => {
          that.relationships = [relationship];
        });
      }
    });
  }

  addOrPopulateNode(entity: Entity) {
    this.network?.populateNetwork(entity);
    this.entities = [entity];
  }
}
