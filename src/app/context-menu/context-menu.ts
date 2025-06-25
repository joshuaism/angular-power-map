import { Component, EventEmitter, input, Output } from '@angular/core';
import { LittleSisNetwork } from '../network';
import { Context } from '../context';

@Component({
  selector: 'app-context-menu',
  imports: [],
  templateUrl: './context-menu.html',
  styleUrl: './context-menu.css',
})
export class ContextMenu {
  @Output() contextEnded: EventEmitter<boolean> = new EventEmitter<boolean>();
  context = input.required<Context>();
  network = input<LittleSisNetwork>();

  expandNode() {
    this.network()?.expandNode(this.context().node?.id as number);
    this.contextEnded.emit(true);
  }

  collapseNode() {
    this.network()?.collapseNode(this.context().node?.id as number);
    this.contextEnded.emit(true);
  }

  deleteNode() {
    this.network()?.deleteNodeAndConnectedEdges(
      this.context().node?.id as number,
    );
    this.contextEnded.emit(true);
  }

  deleteEdge() {
    this.network()?.edgeDataSet.remove(
      this.context().relationship?.id as number,
    );
    this.contextEnded.emit(true);
  }
}
