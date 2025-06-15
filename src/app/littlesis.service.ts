import { Injectable } from '@angular/core';
import { Entity } from './entity';
import { Relationship } from './relationship';
import { Connection } from './connection';
import { Id } from 'vis-data/declarations/data-interface';

@Injectable({
  providedIn: 'root',
})
export class LittlesisService {
  constructor() {}

  async getEntityById(id: number): Promise<Entity> {
    let url = `https://littlesis.org/api/entities/${id}`;
    const response = await fetch(url);
    const json = await response.json();
    json.data.attributes.link = json.data.links.self;
    return json.data.attributes ?? {};
  }

  async getRelationshipById(id: number): Promise<Relationship> {
    let url = `https://littlesis.org/api/relationships/${id}`;
    const response = await fetch(url);
    const json = await response.json();
    let relationship = json.data.attributes;
    relationship.link = json.data.self;
    let amount = relationship.amount?.toLocaleString(undefined, {
      style: 'currency',
      currency: relationship.currency,
    });
    let description = relationship.description;
    if (amount && relationship.category_id === 5) {
      description = description.replace('money', amount);
    }
    if (amount && relationship.category_id === 6) {
      description = description.replace('did/do', `did ${amount} in`);
    }
    relationship.description = description;
    return json.data.attributes ?? {};
  }

  async getEntitiesByName(name: string): Promise<Entity[]> {
    let url = `https://littlesis.org/api/entities/search?q=${name}`;
    const response = await fetch(url);
    const json = await response.json();
    return (
      json.data.map((data: any) => {
        data.attributes.link = data.links.self;
        return data.attributes;
      }) ?? []
    );
  }

  async getConnectionsByEntityId(
    id: number,
    category?: number
  ): Promise<Connection[]> {
    let url = `https://littlesis.org/api/entities/${id}/connections/`;
    if (category) {
      url = `https://littlesis.org/api/entities/${id}/connections/?category_id=${category}`;
    }
    const response = await fetch(url);
    const json = await response.json();
    return (
      json.data.map((value: any) => {
        let connection: Connection = value;
        connection.entity = value.attributes;
        connection.entity.link = value.links.self;
        connection.connection_id =
          value.attributes.connected_relationship_ids.split(',')[0];
        connection.connection_category = value.attributes.connected_category_id;
        connection.parent_id = id;
        return connection;
      }) ?? []
    );
  }

  async getOligrapherRelationships(
    id: number,
    ids: Id[]
  ): Promise<Relationship[]> {
    let url = `https://littlesis.org/oligrapher/get_edges?entity1_id=${id}&entity2_ids=${ids}`;
    const response = await fetch(url);
    const json = await response.json();
    return (
      json.map((relationship: any) => {
        relationship.entity1_id = relationship.node1_id;
        relationship.entity2_id = relationship.node2_id;
        relationship.title = 'connection';
        return relationship;
      }) ?? []
    );
  }

  async getRelationshipsByEntityId(
    id: number,
    category?: number
  ): Promise<Relationship[]> {
    let url = `https://littlesis.org/api/entities/${id}/relationships/?sort=amount&page=1`;
    if (category && category > 0 && category <= 12) {
      url = `https://littlesis.org/api/entities/${id}/relationships/?category_id=${category}&sort=amount&page=1`;
    }
    const response = await fetch(url);
    const json = await response.json();
    return (
      json.data.map((relationship: any) => {
        relationship.attributes.link = relationship.self;
        let amount = relationship.attributes.amount?.toLocaleString(undefined, {
          style: 'currency',
          currency: relationship.attributes.currency,
        });
        let description = relationship.attributes.description;
        if (amount) {
          relationship.attributes.amount = amount;
          if (relationship.attributes.category_id === 5) {
            description = description.replace('money', amount);
          }
          if (relationship.attributes.category_id === 6) {
            description = description.replace('did/do', `did ${amount} in`);
          }
          relationship.attributes.description = description;
        }
        return relationship.attributes;
      }) ?? []
    );
  }
}
