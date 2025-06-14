import { Node, Edge, Network } from 'vis-network';
import { DataSet } from 'vis-data';

export class LittleSisNetwork {
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
    var nodes = [
      {
        id: ++this.nextNodeId,
        label: `Node ${this.nextNodeId}`,
        title: `I am node ${this.nextNodeId}!`,
      },
      {
        id: ++this.nextNodeId,
        label: `Node ${this.nextNodeId}`,
        title: `I am node ${this.nextNodeId}!`,
      },
      { id: ++this.nextNodeId, label: `Node ${this.nextNodeId}` },
      { id: ++this.nextNodeId, label: `Node ${this.nextNodeId}` },
      { id: ++this.nextNodeId, label: `Node ${this.nextNodeId}` },
    ];

    // create an array with edges
    var edges = [
      { id: ++this.nextEdgeId, from: 1, to: 3 },
      { id: ++this.nextEdgeId, from: 1, to: 2 },
      { id: ++this.nextEdgeId, from: 2, to: 4 },
      { id: ++this.nextEdgeId, from: 2, to: 5 },
    ];

    this.nodeDataSet?.add(nodes);
    this.edgeDataSet?.add(edges);
  }
}
