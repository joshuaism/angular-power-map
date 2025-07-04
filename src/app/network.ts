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
  GOVERNMENT_TYPES = [
    'Government Advisory Body',
    'Government Body',
    'Government-Sponsored Enterprise',
    'Public Official',
  ];
  POLITICIAN_TYPES = ['Political Candidate', 'Elected Representative'];
  PAC_TYPES = [
    'Individual Campaign Committee',
    'Other Campaign Committee',
    'PAC',
    'Political Fundraising Committee',
  ];
  LOBBYIST_TYPES = [
    'Lobbying Firm',
    'Public Relations Firm',
    'Consulting Firm',
    'Elite Consensus Group',
    'Policy/Think Tank',
    'Lobbyist',
  ];
  ACADEMIC_TYPES = [
    'Academic',
    'Academic Research Institute',
    'School',
    'Cultural/Arts',
  ];
  CORPORATE_TYPES = ['Industry/Trade Association', 'Professional Association'];
  LABOR_TYPES = ['Labor Union'];
  NON_PROFIT_TYPES = [
    'Membership Organization',
    'Social Club',
    'Other Not-for-Profit',
    'Philanthropy',
  ];
  MEDIA_TYPES = [
    'Media Organization',
    'Media Personality',
    'Public Intellectual',
  ];
  POLITICAL_PARTY_TYPES = ['Political Party'];
  OTHER_TYPES = [
    'Business',
    'Private Company',
    'Public Company',
    'Law Firm',
    'Business Person',
    'Lawyer',
  ];

  DEFAULT_EDGE_TITLE = 'connection';

  constructor(container: HTMLElement) {
    var hoverAndSelectModifications = function (values: any) {
      values.size = 30;
      values.width = 8;
      values.shadowColor = '#7700ff';
    };
    var options = {
      interaction: {
        hover: true,
      },
      nodes: {
        shape: 'dot',
        size: 20,
        chosen: { label: true, node: hoverAndSelectModifications },
        widthConstraint: { maximum: 120 },
        font: {
          strokeWidth: 3,
          strokeColor: 'white',
        },
        borderWidth: 2,
        shadow: true,
      },
      edges: {
        arrows: '',
        width: 4,
        // note: causes typescript exception expected below
        // may require changes in vis-network type definitions file
        // see Network.d.ts ln 992
        chosen: { label: false, edge: hoverAndSelectModifications },
        shadow: true,
        smooth: {
          enabled: true,
          type: 'continuous',
          forceDirection: 'none',
          roundness: 0.1,
        },
      },
      physics: {
        hierarchicalRepulsion: {
          centralGravity: 0,
          springLength: 150,
          springConstant: 0.1,
          nodeDistance: 100,
          damping: 0.75,
          avoidOverlap: 1,
        },
        minVelocity: 0.75,
        solver: 'hierarchicalRepulsion',
      },
    };
    let treeData = {
      nodes: this.nodeDataSet,
      edges: this.edgeDataSet,
    };
    // @ts-expect-error
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
      that.expandNode(id);
    });
    network.on('oncontext', function (params: any) {
      params.event.preventDefault();
    });
    network.on('dragStart', function (params: any) {
      let id = params.nodes[0];
      if (id) {
        if (that.network?.isCluster(id)) {
          that.network?.updateClusteredNode(id, { fixed: false });
        } else {
          that.nodeDataSet?.update({ id: id, fixed: false });
        }
      }
    });
    network.on('dragEnd', function (params: any) {
      let id = params.nodes[0];
      if (id) {
        if (that.network?.isCluster(id)) {
          that.network?.updateClusteredNode(id, { fixed: true });
        } else {
          that.nodeDataSet?.update({ id: id, fixed: true });
        }
      }
      network.unselectAll();
    });
  }

  private populateEdgeTooltip(id: number) {
    let edge = this.edgeDataSet.get(id);
    if (edge?.title === this.DEFAULT_EDGE_TITLE) {
      this.service.getRelationshipById(id).then((relationship) => {
        edge.title = relationship.description;
        edge.color = this.getEdgeColor(relationship.category_id);
        this.edgeDataSet.update(edge);
        console.log(`littlesis service updated ${id} title to ${edge.title}`);
      });
    }
  }

  populateSingleNodeAndEdge(
    entity: Entity,
    relationship: Relationship,
    parentId: number,
  ) {
    let node = this.nodeDataSet.get(entity.id);
    let edge = this.edgeDataSet.get(relationship.id);
    if (!node) {
      let location = this.network?.getPosition(parentId);
      this.nodeDataSet.update(this.createNode(entity, location));
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
    this.network?.fit({ nodes: [entity.id, parentId] });
    this.selectRelationship(relationship);
  }

  async addAllRelationships(relationships: Relationship[], parentId: number) {
    let location = this.network?.getPosition(parentId);
    let existingNodeIds = this.nodeDataSet.getIds();
    let entityIds = relationships
      .map((r) => {
        return r.entity1_id === parentId ? r.entity2_id : r.entity1_id;
      })
      .filter((id) => !existingNodeIds?.includes(id));
    let existingRelationshipIds = this.edgeDataSet.getIds();
    let newRelationships = relationships.filter(
      (r) => !existingRelationshipIds?.includes(r.id),
    );
    let newEntities = await this.service.getEntitiesByIds(entityIds);
    let newNodes = newEntities.map((entity) => {
      return this.createNode(entity, location);
    });
    let newEdges = newRelationships.map((relationship) => {
      return {
        id: relationship.id,
        from: relationship.entity1_id,
        to: relationship.entity2_id,
        title: relationship.description,
        color: this.getEdgeColor(relationship.category_id),
        width: 4,
      };
    });
    this.nodeDataSet.add(newNodes);
    this.edgeDataSet.add(newEdges);
    this.network?.fit({ nodes: entityIds });
  }

  selectRelationship(relationship: Relationship) {
    if (
      this.nodeDataSet.get(relationship.entity1_id) &&
      this.nodeDataSet.get(relationship.entity2_id) &&
      this.edgeDataSet.get(relationship.id)
    ) {
      this.network?.setSelection(
        {
          nodes: [relationship.entity1_id, relationship.entity2_id],
          edges: [relationship.id],
        },
        { highlightEdges: false },
      );
    } else {
      this.network?.unselectAll();
    }
  }

  populateMissingEdgeTitles(relationships: Relationship[]) {
    // This will hopefully cut down on roundtrips to the littlesis service on edge mouseover
    if (relationships.length <= 0) return;
    let relationshipsMap = new Map<string, Relationship>();
    let ids: string[] = [];
    relationships.map((r) => {
      let id = r.id.toString();
      ids.push(id);
      relationshipsMap.set(id, r);
    });
    this.edgeDataSet
      .get(ids, {
        filter: (edge) => edge.title === this.DEFAULT_EDGE_TITLE,
      })
      .forEach((edge) => {
        if (edge) {
          let relationship = relationshipsMap.get(edge.id as string);
          if (relationship) {
            edge.title = relationship.description;
            edge.color = this.getEdgeColor(relationship.category_id);
            console.log(
              `populateMissingEdgeTitles: ${edge.id} title updated to ${edge.title}`,
            );
            this.edgeDataSet.update(edge);
          }
        }
      });
  }

  collapseNode(id: number) {
    let node = this.nodeDataSet.get(id);
    if (node) {
      this.network?.clusterByConnection(id + '', {
        clusterNodeProperties: { label: node.label + ' cluster', size: 40 },
      });
    }
  }

  expandNode(entity: number | Entity) {
    console.log('attempting to expand node: ', entity);
    let id = typeof entity === 'number' ? entity : entity.id;
    if (typeof entity === 'string') {
      if (this.network?.isCluster(entity)) {
        this.network.openCluster(entity);
        return;
      } else {
        console.log('something odd may be going on expanding:', entity);
      }
    }
    this.populateNetwork(id);
  }

  deleteNodeAndConnectedEdges(id: number) {
    this.nodeDataSet.remove(id);
    let connectedEdges = this.edgeDataSet.get({
      filter: (edge) => edge.to == id || edge.from == id,
    });
    this.edgeDataSet.remove(connectedEdges);
  }

  fillInMissingEdges(id: number) {
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
              title: this.DEFAULT_EDGE_TITLE, // oligrapher has bad titles
              color: this.getEdgeColor(r.category_id),
              width: 4,
            };
          });
        this.edgeDataSet.add(edges);
      });
  }

  createNode(
    entity: Entity,
    location?: { x: number; y: number },
    populated = false,
    expanded = false,
  ): MyNode {
    // nodes with the exact same location stack on top of each other instead
    // of being repelled by the physics simulation, so introduce some noise
    let noiseX = Math.random() * 60 - 30;
    let noiseY = Math.random() * 60 - 30;
    let title = entity.blurb ? `${entity.name}\n${entity.blurb}` : entity.name;
    return {
      id: entity.id,
      label: entity.name,
      title: title,
      color: this.getNodeColor(entity.types),
      borderWidth: 4,
      borderWidthSelected: 8,
      x: location ? location.x + noiseX : noiseX,
      y: location ? location.y + noiseY : noiseY,
      type: entity.types[0],
      populated: populated,
      expanded: expanded,
    };
  }

  getEdgeColor(category: number): string {
    let color = '#76957E';
    if (category === 1) return '#69951E';
    if (category === 2) return '#F9CFF2';
    if (category === 3) return '#E09F3E';
    if (category === 4) return '#7C98B3';
    if (category === 5) return '#DEDBCA';
    if (category === 7) return '#C7403B';
    if (category === 8) return '#536B78';
    return color;
  }

  getNodeColor(types: string[]): string | Object {
    let color = types[0] === 'Person' ? '#66B3BA' : '#9AB87A';
    if (types.length === 1) {
      return color;
    }
    let border = '';
    if (types.includes('Media Organization')) {
      border = '#FFFFFF';
    } else if (types.some((r) => this.PAC_TYPES.includes(r))) {
      border = '#FA8072';
    } else if (types.some((r) => this.POLITICIAN_TYPES.includes(r))) {
      border = '#E09F3E';
    } else if (types.some((r) => this.GOVERNMENT_TYPES.includes(r))) {
      border = '#FFFF00';
    } else if (types.some((r) => this.LOBBYIST_TYPES.includes(r))) {
      border = '#C7403B';
    } else if (types.some((r) => this.MEDIA_TYPES.includes(r))) {
      border = '#DEDBCA';
    } else if (types.some((r) => this.POLITICAL_PARTY_TYPES.includes(r))) {
      border = '#00FFD5';
    } else if (types.some((r) => this.LABOR_TYPES.includes(r))) {
      border = '#C3FF00';
    } else if (types.some((r) => this.CORPORATE_TYPES.includes(r))) {
      border = '#00FFD5';
    } else if (types.some((r) => this.ACADEMIC_TYPES.includes(r))) {
      border = '#F9CFF2';
    } else if (types.some((r) => this.NON_PROFIT_TYPES.includes(r))) {
      border = '#66B3BA';
    }
    if (border !== '') {
      return {
        background: color,
        border: border,
        highlight: { background: color, border: border },
        hover: { background: color, border: border },
      };
    }
    return color;
  }

  async populateNetwork(entity: number | Entity) {
    let id = typeof entity === 'number' ? entity : entity.id;
    this.network?.focus(id);
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
        });
      } else {
        let node = this.createNode(entity);
        this.nodeDataSet.add(node);
      }
    }
    let location = this.network?.getPosition(id);
    let categories =
      this.nodeDataSet.get(id)?.type.toUpperCase() === 'PERSON'
        ? this.PERSON_CATEGORIES
        : this.ORG_CATEGORIES;
    await this.service
      .getRelationshipsByEntityId(id)
      .then((relationships: Relationship[]) => {
        relationships = Array.from(new Set(relationships));
        if (relationships.length <= 80) {
          console.log(`populating all ${relationships.length} connections`);
          this.populateEdgesAndNodes(relationships, id, location);
        } else {
          console.log(`found ${relationships.length} connections`);
          let filtered: Relationship[] = [];
          for (const category of categories) {
            let firstInCategory = relationships
              .filter((r: Relationship) => r.category_id === category)
              .slice(0, 20);
            console.log(
              `populating ${firstInCategory.length} category ${category} connections for ${id}`,
            );
            filtered.push(...firstInCategory);
          }
          this.populateEdgesAndNodes(filtered, id, location);
        }
      });

    let node = this.nodeDataSet.get(id);
    node!.populated = true;
    node!.expanded = true;
    node!.x = location?.x;
    node!.y = location?.y;
    this.nodeDataSet.update(node!);

    this.network?.focus(id);
  }

  async populateEdgesAndNodes(
    relationships: Relationship[],
    id: number,
    location?: { x: number; y: number },
  ) {
    let ids = relationships.map((r) =>
      r.entity1_id == id ? r.entity2_id : r.entity1_id,
    );
    let edgeIds = this.edgeDataSet.getIds();
    let edges = relationships
      .filter((r) => !edgeIds.includes(r.id))
      .map((r) => {
        return {
          id: r.id,
          from: r.entity1_id,
          to: r.entity2_id,
          color: this.getEdgeColor(r.category_id),
          title: r.description,
        };
      });
    await this.edgeDataSet.add(edges);
    this.service.getEntitiesByIds(ids).then((entities) => {
      let nodeIds = this.nodeDataSet.getIds();
      let nodes = entities
        .filter((entity) => !nodeIds.includes(entity.id))
        .map((entity) => this.createNode(entity, location));
      this.nodeDataSet.add(nodes);
    });

    this.fillInMissingEdges(id);
  }
}
