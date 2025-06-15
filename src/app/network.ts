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
  nextNodeId = 0;
  nextEdgeId = 0;

  constructor(container: HTMLElement) {
    // start with elon musk for now
    this.populateNetwork(38805);
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
      console.log('hoverEdge Event:', params);
      let id = params.edge;
      that.populateEdgeTooltip(id);
    });
    network.on('hoverNode', function (params: any) {
      console.log('hoverNode Event:', params);
    });
    network.on('blurNode', function (params: any) {
      console.log('blurNode event:', params);
    });
    network.on('selectNode', function (params: any) {
      console.log('selectNode event:', params);
      let id = params.nodes[0];
      that.populateNetwork(id);
    });
    network.on('dragStart', function (params: any) {
      console.log('dragStart Event:', params);
      let id = params.nodes[0];
      if (id) {
        that.nodeDataSet?.update({ id: id, fixed: false });
      }
    });
    network.on('dragEnd', function (params: any) {
      console.log('dragEnd Event:', params);
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

  populateEdgeTooltip(id: number) {
    let edge = this.edgeDataSet.get(id);
    if (edge?.title === 'connection') {
      this.service.getRelationshipById(id).then((relationship) => {
        edge.title = relationship.description;
        edge.color = this.getEdgeColor(relationship.category_id);
        this.edgeDataSet.update(edge);
      });
    }
  }

  populateNetwork(id: number) {
    let parent = this.nodeDataSet.get(id);
    if (parent?.populated) {
      console.log('already populated');
      return;
    }
    if (!parent) {
      this.service.getEntityById(id).then((entity) => {
        let node = this.createNode(entity, true, true);
        this.nodeDataSet.add(node);
      });
    } else {
      parent.populated = true;
      parent.expanded = true;
      this.nodeDataSet.update(parent);
    }
    this.service.getConnectionsByEntityId(id).then((connections) => {
      let nodeIds = this.nodeDataSet.getIds();
      let nodes = connections
        .filter((c: Connection) => !nodeIds.includes(c.entity.id))
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
    });
  }

  createNode(entity: Entity, populated = false, expanded = false): MyNode {
    return {
      id: entity.id,
      label: entity.name,
      title: entity.blurb,
      color: entity.types[0] === 'Person' ? '#66B3BA' : '#9AB87A',
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
