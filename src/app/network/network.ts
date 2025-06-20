import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { LittleSisNetwork } from '../network';
import { Entity } from '../entity';
import { LittlesisService } from '../littlesis.service';
import { EntityAutocomplete } from '../entity-autocomplete/entity-autocomplete';
import { Relationship } from '../relationship';
import { RelationshipDetails } from '../relationship-details/relationship-details';
import { EntityDetails } from '../entity-details/entity-details';
import { ContextMenu } from '../context-menu/context-menu';
import { MyNode } from '../my-node';

@Component({
  selector: 'app-network',
  imports: [
    EntityDetails,
    RelationshipDetails,
    ContextMenu,
    EntityAutocomplete,
    NgClass,
  ],
  template: `
    <section>
      <app-entity-autocomplete
        (notify)="addOrPopulateNode($event)"
      ></app-entity-autocomplete>
    </section>
    <section>
      <div class="network" id="mynetwork" #myNetwork></div>
      <section></section>
      <div class="info-box" [ngClass]="{ hidden: hidden }">
        @if (entity) {
        <app-entity-details
          [entity]="entity"
          [network]="network"
        ></app-entity-details>
        } @if(relationship) {
        <app-relationship-details
          [relationship]="relationship"
          [network]="network"
        ></app-relationship-details>
        }
      </div>
      <div
        class="info-box-tab"
        [ngClass]="{ hidden: hidden }"
        (click)="toggleButton()"
      >
        <h1>+</h1>
      </div>
    </section>
    @if(contextNode) {
    <app-context-menu
      class="oncontext"
      (contextEnded)="dismissContextMenu()"
      [hidden]="!contextNode"
      [node]="contextNode"
      [network]="network"
      [style]="getPosition()"
    ></app-context-menu>
    }
  `,
  styleUrls: ['./network.css'],
})
export class Network implements AfterViewInit {
  @ViewChild('myNetwork') networkContainer!: ElementRef;

  network?: LittleSisNetwork;
  entity: Entity | undefined;
  relationship: Relationship | undefined;
  service: LittlesisService = inject(LittlesisService);
  hidden = true;

  x = 0;
  y = 0;
  contextNode: MyNode | undefined;

  getPosition() {
    return {
      position: 'relative',
      left: this.x + 'px',
      top: this.y + 'px',
    };
  }

  constructor() {}

  ngAfterViewInit() {
    this.network = new LittleSisNetwork(this.networkContainer.nativeElement);
    let that = this;
    this.network.network?.on('selectNode', function (params: any) {
      that.relationship = undefined;
      let node = params.nodes[0];
      if (node) {
        that.service.getEntityById(node).then((entity) => {
          that.entity = entity;
        });
      }
    });
    this.network.network?.on('oncontext', function (params: any) {
      let id = that.network?.network?.getNodeAt(params.pointer.DOM);
      if (!id) {
        that.dismissContextMenu();
        return;
      }
      let node = that.network?.nodeDataSet.get(id as number);
      if (node) {
        that.contextNode = node;
        that.x = params.pointer.DOM.x;
        that.y = params.pointer.DOM.y;
        that.service.getEntityById(id as number).then((entity) => {
          that.entity = entity;
          that.relationship = undefined;
        });
      }
    });
    this.network.network?.on('click', function (params: any) {
      that.dismissContextMenu();
    });
    this.network.network?.on('dragStart', function (params: any) {
      that.dismissContextMenu();
    });
    this.network.network?.on('selectEdge', function (params: any) {
      let node = params.nodes[0];
      if (node) {
        return; // false alarm, a node was selected
      }
      that.entity = undefined;
      let edge = params.edges[0];
      if (edge) {
        that.service.getRelationshipById(edge).then((relationship) => {
          that.relationship = relationship;
        });
      }
    });
  }

  dismissContextMenu() {
    this.contextNode = undefined;
  }

  addOrPopulateNode(entity: Entity) {
    this.network?.populateNetwork(entity);
    this.entity = entity;
  }

  toggleButton() {
    this.hidden = !this.hidden;
  }

  showInfoBoxTab() {
    if (this.hidden) {
    }
  }
}
