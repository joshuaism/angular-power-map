import { Component, input } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { Entity } from '../entity';
import { LittleSisNetwork } from '../network';
import { DetailsTab } from '../details-tab/details-tab';
import { RelationshipsTab } from '../relationships-tab/relationships-tab';

@Component({
  selector: 'app-entity-details',
  imports: [MatTabsModule, DetailsTab, RelationshipsTab],
  template: `
    <mat-tab-group>
      <mat-tab label="Entity">
        <app-details-tab
          [entity]="entity()"
          [network]="network()"
        ></app-details-tab>
      </mat-tab>
      <mat-tab label="Relationships">
        <app-relationships-tab
          [entity]="entity()"
          [network]="network()"
        ></app-relationships-tab
      ></mat-tab>
    </mat-tab-group>
  `,
  styleUrl: './entity-details.css',
})
export class EntityDetails {
  entity = input.required<Entity>();
  network = input<LittleSisNetwork>();
}
