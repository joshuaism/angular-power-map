import { Component, inject, input, OnInit } from '@angular/core';
import { Entity } from '../entity';
import { Relationship } from '../relationship';
import { LittleSisNetwork } from '../network';
import { LittlesisService } from '../littlesis.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-relationships-tab',
  imports: [MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule],
  template: `
    <mat-form-field>
      <mat-label>Category</mat-label>
      <mat-select [(value)]="selected" (selectionChange)="getRelationships()">
        <mat-option [value]="0">All Categories</mat-option>
        <mat-option [value]="1">Executive Roles</mat-option>
        <mat-option [value]="2">Schools Attended</mat-option>
        <mat-option [value]="3">Offices Held</mat-option>
        <mat-option [value]="4">Family Members</mat-option>
        <mat-option [value]="5">Donations</mat-option>
        <mat-option [value]="6">Business Relations</mat-option>
        <mat-option [value]="7">Lobbying</mat-option>
        <mat-option [value]="8">Social Relations</mat-option>
        <mat-option [value]="9">Professional Relations</mat-option>
        <mat-option [value]="10">Shareholder Roles</mat-option>
        <mat-option [value]="11">Related Companies</mat-option>
        <mat-option [value]="12">Uncategorized Relations</mat-option>
      </mat-select>
    </mat-form-field>
    <div class="scrollable">
      @for(relationship of relationships; track relationship.id) {
      <p (click)="focus(relationship)">{{ relationship.description }}</p>
      }
    </div>
  `,
  styleUrl: './relationships-tab.css',
})
export class RelationshipsTab implements OnInit {
  entity = input.required<Entity>();
  network = input<LittleSisNetwork>();

  service: LittlesisService = inject(LittlesisService);

  selected = 0;
  relationships: Relationship[] = [];

  ngOnInit(): void {
    this.service
      .getRelationshipsByEntityId(this.entity().id, this.selected)
      .then((relationships) => {
        this.relationships = relationships;
      });
  }

  getRelationships() {
    console.log(this.selected);
    this.service
      .getRelationshipsByEntityId(this.entity().id, this.selected)
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
