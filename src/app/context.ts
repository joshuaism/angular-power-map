import { Entity } from './entity';
import { MyNode } from './my-node';
import { Relationship } from './relationship';

export interface Context {
  node?: MyNode;
  entity?: Entity;
  relationship?: Relationship;
}
