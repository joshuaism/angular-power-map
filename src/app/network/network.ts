import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { LittleSisNetwork } from '../network';
import { Details } from '../details/details';
import { Entity } from '../entity';
import { LittlesisService } from '../littlesis.service';

@Component({
  selector: 'app-network',
  imports: [Details],
  template: `<div id="mynetwork" #myNetwork></div>
    @for (entity of entities; track entity.id) {
    <app-details [entity]="entity" [network]="network"></app-details>
    }`,
  styleUrls: ['./network.css'],
})
export class Network implements AfterViewInit {
  @ViewChild('myNetwork') networkContainer!: ElementRef;

  network?: LittleSisNetwork;
  entities: Entity[] = [];
  service: LittlesisService = inject(LittlesisService);

  constructor() {
    /*this.service.getEntityById('38805').then((entity) => {
      this.entities = [entity];
      console.log(entity);
    });
    this.service.getEntitiesByName('Clinton').then((entities) => {
      entities.forEach((entity) => console.log(entity));
    });
    this.service
      .getRelationshipsByEntityId('38805', 1)
      .then((relationships) => {
        relationships.forEach((relationship) => console.log(relationship));
      });
    this.service.getConnectionsByEntityId(38805).then((connections) => {
      connections.forEach((connection) => console.log(connection));
    });*/
    this.service
      .getOligrapherRelationships(13191, [13503, 28862, 13284])
      .then((relationships) => {
        relationships.forEach((relationship) => console.log(relationship));
      });
  }

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
}
