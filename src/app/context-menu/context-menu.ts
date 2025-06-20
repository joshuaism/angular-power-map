import { Component, EventEmitter, input, Output } from '@angular/core';
import { Entity } from '../entity';
import { LittleSisNetwork } from '../network';

@Component({
  selector: 'app-context-menu',
  imports: [],
  templateUrl: './context-menu.html',
  styleUrl: './context-menu.css',
})
export class ContextMenu {
  @Output() contextEnded: EventEmitter<boolean> = new EventEmitter<boolean>();
  entity = input.required<Entity>();
  network = input<LittleSisNetwork>();

  expandNode() {
    this.network()?.populateNetwork(this.entity()?.id);
    this.contextEnded.emit(true);
  }

  collapseNode() {
    this.network()?.collapseNode(this.entity()?.id);
    this.contextEnded.emit(true);
  }

  deleteNode() {
    this.network()?.deleteNodeAndConnectedEdges(this.entity()?.id);
    this.contextEnded.emit(true);
  }

  isExpanded(entity: Entity) {
    let node = this.network()?.nodeDataSet.get(entity.id);
    return node?.expanded;
  }
}
