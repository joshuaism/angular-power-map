import { Component, EventEmitter, input, Output } from '@angular/core';
import { LittleSisNetwork } from '../network';
import { MyNode } from '../my-node';

@Component({
  selector: 'app-context-menu',
  imports: [],
  templateUrl: './context-menu.html',
  styleUrl: './context-menu.css',
})
export class ContextMenu {
  @Output() contextEnded: EventEmitter<boolean> = new EventEmitter<boolean>();
  node = input.required<MyNode>();
  network = input<LittleSisNetwork>();

  expandNode() {
    this.network()?.populateNetwork(this.node()?.id as number);
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
}
