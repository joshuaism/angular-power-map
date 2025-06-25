import { Component, EventEmitter, input, Output } from '@angular/core';
import { LittleSisNetwork } from '../network';
import { MyNode } from '../my-node';
import { Relationship } from '../relationship';
import { Entity } from '../entity';

@Component({
  selector: 'app-context-menu',
  imports: [],
  templateUrl: './context-menu.html',
  styleUrl: './context-menu.css',
})
export class ContextMenu {
  @Output() contextEnded: EventEmitter<boolean> = new EventEmitter<boolean>();
  node = input<MyNode>();
  entity = input<Entity>();
  relationship = input<Relationship>();
  network = input<LittleSisNetwork>();

  expandNode() {
    this.network()?.expandNode(this.node()?.id as number);
    this.contextEnded.emit(true);
  }

  collapseNode() {
    this.network()?.collapseNode(this.node()?.id as number);
    this.contextEnded.emit(true);
  }

  deleteNode() {
    this.network()?.deleteNodeAndConnectedEdges(this.node()?.id as number);
    this.contextEnded.emit(true);
  }

  deleteEdge() {
    this.network()?.edgeDataSet.remove(this.relationship()?.id as number);
    this.contextEnded.emit(true);
  }
}
