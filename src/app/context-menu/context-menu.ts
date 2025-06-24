import { Component, EventEmitter, input, Output } from '@angular/core';
import { LittleSisNetwork } from '../network';
import { MyNode } from '../my-node';
import { Relationship } from '../relationship';

@Component({
  selector: 'app-context-menu',
  imports: [],
  templateUrl: './context-menu.html',
  styleUrl: './context-menu.css',
})
export class ContextMenu {
  @Output() contextEnded: EventEmitter<boolean> = new EventEmitter<boolean>();
  obj = input.required<MyNode | Relationship>();
  network = input<LittleSisNetwork>();

  expandNode() {
    this.network()?.expandNode(this.obj()?.id as number);
    this.contextEnded.emit(true);
  }

  collapseNode() {
    this.network()?.collapseNode(this.obj()?.id as number);
    this.contextEnded.emit(true);
  }

  deleteNode() {
    this.network()?.deleteNodeAndConnectedEdges(this.obj()?.id as number);
    this.contextEnded.emit(true);
  }

  getRelationshipLink(): string {
    let myObj = this.obj();
    if (this.isEdge(myObj)) {
      return myObj.link;
    }
    return '';
  }

  deleteEdge() {
    this.network()?.edgeDataSet.remove(this.obj()?.id as number);
    this.contextEnded.emit(true);
  }

  isNode(obj: any): boolean {
    return 'expanded' in obj;
  }

  isExpandedNode(obj: any): boolean {
    return this.isNode(obj) && obj.expanded;
  }

  isEdge(obj: any): obj is Relationship {
    return 'entity1_id' in obj && 'entity2_id' in obj;
  }
}
