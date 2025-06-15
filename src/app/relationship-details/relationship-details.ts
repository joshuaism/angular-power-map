import { Component, input, OnInit } from '@angular/core';
import { LittleSisNetwork } from '../network';
import { Relationship } from '../relationship';

@Component({
  selector: 'app-relationship-details',
  imports: [],
  template: `
    <div class="scrollable">
      <h3>{{ getCategory() }}</h3>
      <p>{{ relationship().description }}</p>
      <p (click)="focus(relationship().entity1.id)">
        {{ relationship().entity1.name }}: {{ relationship().description1 }}
      </p>
      <p (click)="focus(relationship().entity2.id)">
        {{ relationship().entity2.name }}: {{ relationship().description2 }}
      </p>
      <p>
        {{ relationship().start_date }} &ndash; {{ relationship().end_date }}
      </p>
      @if (relationship().goods) {
      <p style="color:red">has goods!</p>
      } @if (relationship().category_attributes) {
      <p style="color:red">has category attributes!</p>
      }
      <p>last updated: {{ relationship().updated_at }}</p>
      <a href="{{ relationship().link }}" target="_blank">source</a>
    </div>
  `,
  styleUrl: './relationship-details.css',
})
export class RelationshipDetails implements OnInit {
  relationship = input.required<Relationship>();
  network = input<LittleSisNetwork>();

  focus(id: number) {
    this.network()?.network?.focus(id);
  }

  ngOnInit() {
    console.log('goods:', this.relationship().goods);
    console.log('category attributes', this.relationship().category_attributes);
  }

  getCategory(): string {
    switch (this.relationship().category_id) {
      case 1:
        return 'Executive Role';
      case 2:
        return 'Alma Mater';
      case 3:
        return 'Political Office';
      case 4:
        return 'Family';
      case 5:
        return 'Donation';
      case 6:
        return 'Business Relation';
      case 7:
        return 'Lobbying';
      case 8:
        return 'Social Relation';
      case 9:
        return 'Professional Relation';
      case 10:
        return 'Shareholder';
      case 11:
        return 'Related Company';
      default:
        return 'Uncategorized';
    }
  }
}
