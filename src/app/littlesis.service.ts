import { Injectable } from '@angular/core';
import { Entity } from './entity';
import { Relationship } from './relationship';
import { Connection } from './connection';
import { Id } from 'vis-data/declarations/data-interface';
import axios from 'axios';
import axiosRetry from 'axios-retry';

axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount) => {
    return retryCount * 1000; // 1 second delay between retries
  },
});

@Injectable({
  providedIn: 'root',
})
export class LittlesisService {
  constructor() {}

  private defaultCatchBlock(url: string, e: any) {
    console.log(`couldn't get ${url}`, e);
  }

  private formatDate(date: string): string {
    if (!date) {
      return '';
    }
    let options: any = {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    };
    return new Date(date).toLocaleDateString(undefined, options);
  }

  private createEntity(data: any): Entity {
    data.attributes.link = data.links.self;
    data.attributes.aliases = data.attributes.aliases.filter(
      (alias: string) => alias !== data.attributes.name
    );
    return data.attributes;
  }

  async getEntityById(id: number): Promise<Entity> {
    let url = `https://littlesis.org/api/entities/${id}?details=true`;
    return axios.get(url).then(
      (response) => {
        const json = response.data;
        json.data.attributes = this.createEntity(json.data);
        return json.data.attributes ?? {};
      },
      (error) => {
        this.defaultCatchBlock(url, error);
      }
    );
  }

  async getRelationshipById(id: number): Promise<Relationship> {
    let url = `https://littlesis.org/api/relationships/${id}`;
    return axios.get(url).then(
      (response) => {
        const json = response.data;
        json.data.attributes = this.createRelationship(
          json.data.attributes,
          json.data.self,
          json.included[0],
          json.included[1]
        );
        return json.data.attributes ?? {};
      },
      (error) => {
        this.defaultCatchBlock(url, error);
      }
    );
  }

  createRelationship(
    data: any,
    link: string,
    entity1?: any,
    entity2?: any
  ): Relationship {
    let relationship = data;
    if (entity1) relationship.entity1 = this.createEntity(entity1);
    if (entity2) relationship.entity2 = this.createEntity(entity2);
    relationship.link = link;
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
    relationship.start_date = relationship.start_date
      ? this.formatDate(relationship.start_date)
      : 'the dawn of time';
    relationship.end_date = relationship.end_date
      ? this.formatDate(relationship.end_date)
      : 'present';
    return relationship;
  }

  async getEntitiesByName(name: string): Promise<Entity[]> {
    let url = `https://littlesis.org/api/entities/search?q=${name}`;
    return this.getEntities(url);
  }

  async getEntitiesByIds(ids: number[]): Promise<Entity[]> {
    let url = `https://littlesis.org/api/entities/?ids=${ids.join(',')}`;
    return this.getEntities(url);
  }

  private async getEntities(url: string): Promise<Entity[]> {
    return axios.get(url).then(
      (response) => {
        const json = response.data;
        return (
          json.data.map((data: any) => {
            return this.createEntity(data);
          }) ?? []
        );
      },
      (error) => {
        this.defaultCatchBlock(url, error);
        return [];
      }
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
    return axios.get(url).then(
      (response) => {
        const json = response.data;
        return (
          json.data.map((value: any) => {
            let connection: Connection = value;
            connection.entity = this.createEntity(value);
            connection.connection_id =
              value.attributes.connected_relationship_ids.split(',')[0];
            connection.connection_category =
              value.attributes.connected_category_id;
            connection.parent_id = id;
            return connection;
          }) ?? []
        );
      },
      (error) => {
        this.defaultCatchBlock(url, error);
      }
    );
  }

  async getOligrapherRelationships(
    id: number,
    ids: Id[]
  ): Promise<Relationship[]> {
    let url = `https://littlesis.org/oligrapher/get_edges?entity1_id=${id}&entity2_ids=${ids}`;
    return axios.get(url).then(
      (response) => {
        const json = response.data;
        return (
          json.map((relationship: any) => {
            relationship.id = parseInt(relationship.id);
            relationship.entity1_id = relationship.node1_id;
            relationship.entity2_id = relationship.node2_id;
            relationship.title = 'connection';
            return relationship;
          }) ?? []
        );
      },
      (error) => {
        this.defaultCatchBlock(url, error);
      }
    );
  }

  async getRelationshipsByEntityId(
    id: number,
    category?: number,
    sort?: string
  ): Promise<Relationship[]> {
    let url = `https://littlesis.org/api/entities/${id}/relationships/?page=1&per_page=300`;
    if (category && category > 0 && category <= 12) {
      url = `https://littlesis.org/api/entities/${id}/relationships/?category_id=${category}&page=1&per_page=300`;
    }
    if (sort) {
      url = url + `&sort=${sort}`;
    }
    return axios.get(url).then(
      (response) => {
        const json = response.data;
        // remove duplicates
        let uniqueJson: any = [
          ...new Map(json.data.map((r: any) => [r.attributes.id, r])).values(),
        ];
        return (
          uniqueJson.map((relationship: any) => {
            relationship.attributes = this.createRelationship(
              relationship.attributes,
              relationship.self
            );
            return relationship.attributes;
          }) ?? []
        );
      },
      (error) => {
        this.defaultCatchBlock(url, error);
      }
    );
  }
}
