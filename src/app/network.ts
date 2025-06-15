import { Edge, Network } from 'vis-network';
import { MyNode } from './my-node';
import { DataSet } from 'vis-data';
import { LittlesisService } from './littlesis.service';
import { Connection } from './connection';
import { Entity } from './entity';
import { Relationship } from './relationship';

export class LittleSisNetwork {
  service = new LittlesisService();
  nodeDataSet = new DataSet<MyNode>();
  edgeDataSet = new DataSet<Edge>();
  network?: Network;

  PERSON_CATEGORIES = [1, 4, 8];
  ORG_CATEGORIES = [1, 6, 10];

  constructor(container: HTMLElement) {
    var options = {
      interaction: {
        hover: true,
      },
      nodes: {
        shape: 'dot',
        size: 20,
      },
    };
    let treeData = {
      nodes: this.nodeDataSet,
      edges: this.edgeDataSet,
    };
    let network = new Network(container, treeData, options);
    this.network = network;

    let that = this;
    network.on('hoverEdge', function (params: any) {
      let id = params.edge;
      that.populateEdgeTooltip(id);
    });
    network.on('selectNode', function (params: any) {
      console.log('selectNode event:', params);
      let id = params.nodes[0];
      that.populateNetwork(id);
    });
    network.on('dragStart', function (params: any) {
      let id = params.nodes[0];
      if (id) {
        that.nodeDataSet?.update({ id: id, fixed: false });
      }
    });
    network.on('dragEnd', function (params: any) {
      let id = params.nodes[0];
      if (id) {
        that.nodeDataSet?.update({
          id: id,
          fixed: true,
        });
      }
      network.unselectAll();
    });
  }

  private populateEdgeTooltip(id: number) {
    let edge = this.edgeDataSet.get(id);
    if (edge?.title === 'connection') {
      this.service.getRelationshipById(id).then((relationship) => {
        edge.title = relationship.description;
        edge.color = this.getEdgeColor(relationship.category_id);
        this.edgeDataSet.update(edge);
      });
    }
  }

  populateSingleNodeAndEdge(entity: Entity, relationship: Relationship) {
    let node = this.nodeDataSet.get(entity.id);
    let edge = this.edgeDataSet.get(relationship.id);
    if (!node) {
      this.nodeDataSet.update(this.createNode(entity));
    }
    if (!edge) {
      this.edgeDataSet.update({
        id: relationship.id,
        from: relationship.entity1_id,
        to: relationship.entity2_id,
        title: relationship.description,
        color: this.getEdgeColor(relationship.category_id),
        width: 4,
      });
    }
    this.network?.focus(entity.id);
  }

  async populateNetwork(entity: number | Entity) {
    let id = typeof entity === 'number' ? entity : entity.id;
    let parent = this.nodeDataSet.get(id);
    if (parent?.populated) {
      console.log('already populated');
      this.network?.focus(id);
      return;
    }
    if (!parent) {
      if (typeof entity === 'number') {
        await this.service.getEntityById(id).then((entity) => {
          let node = this.createNode(entity);
          this.nodeDataSet.add(node);
          this.network?.focus(id);
        });
      } else {
        let node = this.createNode(entity);
        this.nodeDataSet.add(node);
        this.network?.focus(id);
      }
    }
    let categories =
      this.nodeDataSet.get(id)?.type.toUpperCase() === 'PERSON'
        ? this.PERSON_CATEGORIES
        : this.ORG_CATEGORIES;
    for (const category of categories) {
      await this.populateConnections(id, category);
    }
    await this.populateConnections(id);
    this.service
      .getOligrapherRelationships(id, this.nodeDataSet.getIds())
      .then((relationships) => {
        let edgeIds = this.edgeDataSet.getIds();
        let edges = relationships
          .filter((r: Relationship) => !edgeIds.includes(r.id))
          .map((r: Relationship) => {
            return {
              id: r.id,
              from: r.entity1_id,
              to: r.entity2_id,
              title: 'connection', // oligrapher has bad titles
              color: this.getEdgeColor(r.category_id),
              width: 4,
            };
          });
        this.edgeDataSet.add(edges);
      });

    let node = this.nodeDataSet.get(id);
    node!.populated = true;
    node!.expanded = true;
    this.nodeDataSet.update(node!);

    this.network?.focus(id);
  }

  private async populateConnections(id: number, category?: number) {
    await this.service
      .getConnectionsByEntityId(id, category)
      .then((connections) => {
        let nodeIds = this.nodeDataSet.getIds();
        let nodes = connections
          .filter((c: Connection) => !nodeIds.includes(c.entity.id))
          .slice(0, 5)
          .map((c: Connection) => {
            return this.createNode(c.entity);
          });
        let edgeIds = this.edgeDataSet.getIds();
        let edges = connections
          .filter((c: Connection) => !edgeIds.includes(c.connection_id))
          .map((c: Connection) => {
            return {
              id: c.connection_id,
              from: c.parent_id,
              to: c.entity.id,
              color: this.getEdgeColor(c.connection_category),
              title: 'connection',
              width: 4,
            };
          });
        this.nodeDataSet.add(nodes);
        this.edgeDataSet.add(edges);
      });
  }

  createNode(entity: Entity, populated = false, expanded = false): MyNode {
    return {
      id: entity.id,
      label: entity.name,
      title: entity.blurb,
      color: entity.types[0] === 'Person' ? '#66B3BA' : '#9AB87A',
      type: entity.types[0],
      populated: populated,
      expanded: expanded,
    };
  }

  getEdgeColor(category: number): string {
    let color = '#76957E';
    if (category === 1) color = '#69951E';
    if (category === 2) color = '#F9CFF2';
    if (category === 3) color = '#E09F3E';
    if (category === 4) color = '#7C98B3';
    if (category === 5) color = '#DEDBCA';
    if (category === 7) color = '#C7403B';
    if (category === 8) color = '#536B78';
    return color;
  }
}
