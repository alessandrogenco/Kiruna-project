import React, { useState, useEffect } from "react";
import ReactFlow, { Background, BackgroundVariant, ReactFlowProvider, Controls, useEdgesState, useNodesState, Handle } from "react-flow-renderer";
import API from "../API.mjs";

// Dati dei nodi con titolo e data
const rawNodes = [
  { id: '1', title: 'Evento A', date: '2024-11-22' },
  { id: '2', title: 'Evento B', date: '2024-11-20' },
  { id: '3', title: 'Evento C', date: '2024-11-21' },
  { id: '4', title: 'Evento D', date: '2024-11-23' },
  { id: '5', title: 'Evento E', date: '2024-11-22' }, // Data duplicata
  { id: '6', title: 'Evento F', date: '2024-11-21' }, // Data duplicata
  { id: '7', title: 'Evento G', date: '2024-11-20' }, // Data duplicata
  { id: '8', title: 'Evento H', date: '2024-11-23' }  // Data duplicata
];

// Ordinare i nodi in base alla data
const sortedNodes = rawNodes.sort((a, b) => new Date(a.date) - new Date(b.date));

// Funzione per determinare la posizione dei nodi
const calculateNodePosition = (nodes, node) => {
  const dateGroups = nodes.reduce((acc, n) => {
    if (!acc[n.date]) acc[n.date] = [];
    acc[n.date].push(n);
    return acc;
  }, {});

  let x = 0, y = 0;
  
  const group = dateGroups[node.date];
  
  x = 330 * Object.keys(dateGroups).indexOf(node.date); 
  x += group.indexOf(node) * 70; 
  
  y = 100 * group.indexOf(node); 
  y += 20; 

  return { x, y };
};

const nodes = sortedNodes.map((node) => ({
  id: node.id,
  data: { label:  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <div style={{ fontWeight: 'bold' }}>{node.title}</div>
                    <div style={{ fontSize: '12px', color: 'gray' }}>{node.date}</div>
                  </div>              
    }, 
  position: calculateNodePosition(sortedNodes, node), 
  draggable: true, 
  sourcePosition: 'right', 
  targetPosition: 'left', 
  style: {
    width: 150, 
    backgroundColor: '#d4f7d6', 
    border: '2px solid #89c79d', 
    borderRadius: '8px', 
    padding: '6px', 
    fontSize: '13px', 
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{node.title}</div>
      <div>{node.date}</div>
      <Handle type="source" position="right" id="a" style={{ top: '50%' }} />
      <Handle type="target" position="left" id="b" style={{ top: '50%' }} />
      <Handle type="source" position="top" id="c" style={{ left: '50%' }} />
      <Handle type="target" position="bottom" id="d" style={{ left: '50%' }} />
    </div>
  ),
}));

const createEdges = (nodes) => {
  const edges = [];
  
  for (let i = 0; i < nodes.length - 1; i++) {
    const sourceNode = nodes[i];
    const targetNode = nodes[i + 1];
    
    const lineType = i % 3 === 0 ? 'continuous' : i % 3 === 1 ? 'dashed' : 'dotted';
    
    let edgeStyle;
    switch (lineType) {
      case 'dashed':
        edgeStyle = { stroke: '#000', strokeWidth: 1.8, strokeDasharray: '5,5' };
        break;
      case 'dotted':
        edgeStyle = { stroke: '#000', strokeWidth: 3, strokeDasharray: '1,5' };
        break;
      case 'continuous':
      default:
        edgeStyle = { stroke: '#000', strokeWidth: 1.5, strokeDasharray: '0' };
        break;
    }

    const edge = {
      id: `e${sourceNode.id}-${targetNode.id}`,
      source: sourceNode.id,
      target: targetNode.id,
      animated: true,
      style: edgeStyle,
    };
    
    edges.push(edge);
  }

  return edges;
};

const edges = createEdges(sortedNodes);

const DocumentGraph = (props) => {

  const [linkedDocuments, setLinkedDocuments] = useState([]);
  const [nodesState, setNodes] = useNodesState(nodes);
  const [edgesState, setEdges] = useEdgesState(edges);

  useEffect(() => {
    if (props.documents.length > 0) {
      const fetchLinks = async () => {
        try {
          // Create a new array to store updated documents
          const linkedDocs = await Promise.all(
            props.documents.map(async (document) => {
              // Fetch the links for the current document
              const fetchedData = await API.getDocumentLinks(document.id);

              // Extract the array of links from the response
              const fetchedLinks = Array.isArray(fetchedData.links) ? fetchedData.links : [];

              // Return a new object with updated graphLinks
              return {
                ...document,
                graphLinks: fetchedLinks.map((link) => ({
                  id: link.id,
                  type: link.type,
                  title: link.title,
                })),
              };
            })
          );

          // Update the state with the new array
          setLinkedDocuments(linkedDocs);
        } catch (error) {
          console.error("Error fetching links:", error);
        }
      };
  
      fetchLinks();
    }
  }, [props.documents]);  

  useEffect(() => {
    setNodes(nodes);
    setEdges(edges);
  }, []);

  const onNodeDrag = (event, node) => {
    const nodeIndex = nodesState.findIndex((n) => n.id === node.id);
    const currentNode = nodesState[nodeIndex];
    
    let updatedNodes = [...nodesState];
    
    const distanceX = node.position.x - currentNode.position.x;

    const threshold = 50;

    const moveAdjacentNodes = (startIndex, direction, axis) => {
      if (axis !== 'x') return; 

      let currentPosition = updatedNodes[startIndex].position[axis];

      for (let i = startIndex + direction; i >= 0 && i < updatedNodes.length; i += direction) {
        const adjacentNode = updatedNodes[i];

        if (Math.abs(adjacentNode.position[axis] - currentPosition) < threshold && adjacentNode.date === currentNode.date) {
          updatedNodes[i] = {
            ...adjacentNode,
            position: {
              ...adjacentNode.position,
              [axis]: adjacentNode.position[axis] + distanceX, 
            },
          };
          currentPosition = adjacentNode.position[axis];
        } else {
          break;
        }
      }
    };

    updatedNodes[nodeIndex] = { 
      ...currentNode, 
      position: { 
        ...currentNode.position, 
        x: node.position.x, 
        y: node.position.y 
      } 
    };

    moveAdjacentNodes(nodeIndex, 1, 'x');
    moveAdjacentNodes(nodeIndex, 1, 'y');
    
    moveAdjacentNodes(nodeIndex, -1, 'x');
    moveAdjacentNodes(nodeIndex, -1, 'y');

    setNodes(updatedNodes);
  };

  const onNodeClick = (event, node) => {};

  return (
    <div style={{ height: '37vh' }}>
      <ReactFlowProvider>
        <ReactFlow
          snapGrid={[10, 10]}
          nodes={nodesState}
          edges={edgesState}
          onNodeClick={onNodeClick}
          onNodeDrag={onNodeDrag}
          snapToGrid={true}
          minZoom={0.3} 
          maxZoom={2}
          fitView={true}  // Aggiungi fitView per centrare il grafo
          style={{ background: '#fdfdfd' }}  // Imposta lo sfondo grigio chiaro
        >
          <Background color="lightgray" gap={200} variant={BackgroundVariant.Lines}/>
          <Controls showZoom={false} showInteractive={false} showFitView={true}/>
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default DocumentGraph;
