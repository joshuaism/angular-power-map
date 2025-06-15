import { Entity } from './entity';

export interface Relationship {
  id: number;
  entity1_id: number;
  entity1: Entity;
  entity2_id: number;
  entity2: Entity;
  category_id: number;
  description: string;
  description1: string;
  description2: string;
  amount: number;
  currency: string;
  goods: any;
  updated_at: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  link: string;
  category_attributes: any;
}
