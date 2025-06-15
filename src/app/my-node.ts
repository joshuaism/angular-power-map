import { Node } from 'vis-network';

export interface MyNode extends Node {
  populated: boolean;
  expanded: boolean;
  type: string;
}
