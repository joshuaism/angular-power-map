import { Entity } from './entity';

export interface Connection {
  parent_id: number;
  entity: Entity;
  connection_id: number;
  connection_category: number;
}
