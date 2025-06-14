import { Node, Edge, Network } from 'vis-network';
import { DataSet } from 'vis-data';
import { LittlesisService } from './littlesis.service';
import { Connection } from './connection';

export class LittleSisNetwork {
  service = new LittlesisService();
  nodeDataSet = new DataSet<Node>();
  edgeDataSet = new DataSet<Edge>();
  network?: Network;
  nextNodeId = 0;
  nextEdgeId = 0;

  constructor(container: HTMLElement) {
    this.populateNetwork();
    var options = {
      interaction: {
        hover: true,
      },
      manipulation: {
        enabled: true,
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
    network.on('hoverNode', function (params: any) {
      console.log('hoverNode Event:', params);
    });
    network.on('blurNode', function (params: any) {
      console.log('blurNode event:', params);
    });
    network.on('selectNode', function (params: any) {
      console.log('selectNode event:', params);
      let id = params.nodes[0];
      that.nodeDataSet?.add([
        {
          id: ++that.nextNodeId,
          label: `Node ${that.nextNodeId}`,
          title: `I am node ${that.nextNodeId}!`,
        },
        {
          id: ++that.nextNodeId,
          label: `Node ${that.nextNodeId}`,
          title: `I am node ${that.nextNodeId}!`,
        },
        { id: ++that.nextNodeId, label: `Node ${that.nextNodeId}` },
        { id: ++that.nextNodeId, label: `Node ${that.nextNodeId}` },
      ]);
      that.edgeDataSet?.add([
        { id: ++that.nextEdgeId, from: id, to: that.nextNodeId - 3 },
        { id: ++that.nextEdgeId, from: id, to: that.nextNodeId - 2 },
        { id: ++that.nextEdgeId, from: id, to: that.nextNodeId - 1 },
        { id: ++that.nextEdgeId, from: id, to: that.nextNodeId },
      ]);
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
          title: "I've been dragged!",
        });
      }
      network.unselectAll();
    });
  }

  populateNetwork() {
    this.service.getEntityById(38805).then((entity) => {
      let node = {
        id: entity.id,
        label: entity.name,
        title: entity.blurb,
      };
      this.nodeDataSet.add(node);
    });
    this.service.getConnectionsByEntityId(38805).then((connections) => {
      let nodes = connections.map((c: Connection) => {
        return {
          id: c.entity.id,
          label: c.entity.name,
          title: c.entity.blurb,
        };
      });
      let edges = connections.map((c: Connection) => {
        return {
          id: c.connection_id,
          from: c.parent_id,
          to: c.entity.id,
        };
      });
      this.nodeDataSet.add(nodes);
      this.edgeDataSet.add(edges);
    });
  }
}
