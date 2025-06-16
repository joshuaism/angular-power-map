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

  async getEntityById(id: number): Promise<Entity> {
    let url = `https://littlesis.org/api/entities/${id}`;
    return axios.get(url).then(
      (response) => {
        const json = response.data;
        json.data.attributes.link = json.data.links.self;
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
        let relationship = json.data.attributes;
        relationship.entity1 = json.included[0].attributes;
        relationship.entity2 = json.included[1].attributes;
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
        relationship.start_date = relationship.start_date
          ? this.formatDate(relationship.start_date)
          : 'the dawn of time';
        relationship.end_date = relationship.end_date
          ? this.formatDate(relationship.end_date)
          : 'present';
        return json.data.attributes ?? {};
      },
      (error) => {
        this.defaultCatchBlock(url, error);
      }
    );
  }

  async getEntitiesByName(name: string): Promise<Entity[]> {
    let url = `https://littlesis.org/api/entities/search?q=${name}`;
    return axios.get(url).then(
      (response) => {
        const json = response.data;
        return (
          json.data.map((data: any) => {
            data.attributes.link = data.links.self;
            return data.attributes;
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
            connection.entity = value.attributes;
            connection.entity.link = value.links.self;
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
    category?: number
  ): Promise<Relationship[]> {
    let url = `https://littlesis.org/api/entities/${id}/relationships/?sort=amount&page=1`;
    if (category && category > 0 && category <= 12) {
      url = `https://littlesis.org/api/entities/${id}/relationships/?category_id=${category}&sort=amount&page=1`;
    }
    return axios.get(url).then(
      (response) => {
        const json = response.data;
        return (
          json.data.map((relationship: any) => {
            relationship.attributes.link = relationship.self;
            let amount = relationship.attributes.amount?.toLocaleString(
              undefined,
              {
                style: 'currency',
                currency: relationship.attributes.currency,
              }
            );
            let description = relationship.attributes.description;
            if (amount) {
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
      },
      (error) => {
        this.defaultCatchBlock(url, error);
      }
    );
  }
}
