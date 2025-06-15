import { Component, inject, input, OnInit } from '@angular/core';
import { Entity } from '../entity';
import { Relationship } from '../relationship';
import { LittleSisNetwork } from '../network';
import { LittlesisService } from '../littlesis.service';

@Component({
  selector: 'app-relationships-tab',
  imports: [],
  template: `
    @for(relationship of relationships; track relationship.id) {
    <p (click)="focus(relationship)">{{ relationship.description }}</p>
    }
  `,
  styleUrl: './relationships-tab.css',
})
export class RelationshipsTab implements OnInit {
  entity = input.required<Entity>();
  network = input<LittleSisNetwork>();

  service: LittlesisService = inject(LittlesisService);

  relationships: Relationship[] = [];

  ngOnInit(): void {
    this.service
      .getRelationshipsByEntityId(this.entity().id)
      .then((relationships) => {
        this.relationships = relationships;
      });
  }

  focus(relationship: Relationship) {
    let entityid =
      relationship.entity1_id === this.entity().id
        ? relationship.entity2_id
        : relationship.entity1_id;
    this.service.getEntityById(entityid).then((entity) => {
      this.network()?.populateSingleNodeAndEdge(entity, relationship);
    });
  }
}
