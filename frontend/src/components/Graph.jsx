import React, { useState, useEffect } from "react";
import ReactFlow, { Background, BackgroundVariant, Controls, useEdgesState, useNodesState } from "react-flow-renderer";
import API from "../API.mjs";

function calculateNodePosition(nodes, node) {

  // Raggruppa i nodi per data normalizzata
  const dateGroups = nodes.reduce((acc, n) => {
    const normalizedDate = normalizeDate(n.issuanceDate); // Usa issuanceDate per ogni nodo
    if (!acc[normalizedDate]) acc[normalizedDate] = [];
    acc[normalizedDate].push(n);
    return acc;
  }, {});

  // Trova il gruppo e calcola la posizione
  const normalizedNodeDate = normalizeDate(node.issuanceDate);
  const group = dateGroups[normalizedNodeDate];

  // Calcola le posizioni
  const xBase = 330 * Object.keys(dateGroups).indexOf(normalizedNodeDate); // Posizione X per i gruppi
  const xOffset = group.indexOf(node) * 70; // Offset X per i nodi nel gruppo
  const yBase = 100 * group.indexOf(node); // Posizione Y per i gruppi
  const yOffset = 20; // Offset Y fisso

  return { x: xBase + xOffset, y: yBase + yOffset };
}

function computeNodes(documents) {
  return documents.map((node) => ({
  id: node.id,
  data: {label: <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <div style={{ fontWeight: 'bold' }}>{node.title}</div>
                    <div style={{ fontSize: '12px', color: 'gray' }}>{node.issuanceDate}</div>
                  </div>}, 
  position: calculateNodePosition(documents, node), 
  draggable: true, 
  ContentVisibilityAutoStateChangeEvent: true,
  sourcePosition: 'right', 
  targetPosition: 'left', 
  style: {
    width: 200, 
    backgroundColor: '#d4f7d6', 
    border: '2px solid #89c79d', 
    borderRadius: '8px', 
    padding: '6px', 
    fontSize: '13px',
    visibility: 'visible', 
  },
}))};

function computeEdges(nodes, documents) {
  const edges = [];
  const existingEdgeIds = new Set(); // Per tracciare gli ID univoci degli edge

  documents.forEach((document) => {
    if (document.graphLinks && document.graphLinks.length > 0) {
      document.graphLinks.forEach((link) => {
        const sourceNode = nodes.find((node) => node.id === document.id);
        const targetNode = nodes.find((node) => node.id === link.id);

        if (sourceNode && targetNode) {
          const edgeId = `e${sourceNode.id}-${targetNode.id}`;

          // Controlla se l'ID dell'edge esiste già
          if (!existingEdgeIds.has(edgeId)) {
            let edgeStyle;

            // Determina lo stile in base al tipo di collegamento
            switch (link.type.toLowerCase()) {
              case 'reference':
                edgeStyle = { stroke: '#000', strokeWidth: 1.5, strokeDasharray: '0' }; // Linea continua
                break;
              case 'citation':
                edgeStyle = { stroke: '#000', strokeWidth: 1.8, strokeDasharray: '5,5' }; // Linea tratteggiata
                break;
              case 'dependency':
                edgeStyle = { stroke: '#ff0000', strokeWidth: 2, strokeDasharray: '10,5' }; // Linea tratteggiata rossa
                break;
              default:
                edgeStyle = { stroke: '#000', strokeWidth: 1.5, strokeDasharray: '0' }; // Predefinito
                break;
            }

            // Crea l'edge e aggiungilo alla lista
            const edge = {
              id: edgeId,
              source: sourceNode.id,
              target: targetNode.id,
              animated: true,
              style: edgeStyle,
            };

            edges.push(edge);
            existingEdgeIds.add(edgeId); // Aggiungi l'ID dell'edge al Set
          }
        }
      });
    }
  });

  return edges;
}

function sortedDocumentsByDate(documents) {
  return documents.sort((a, b) => {
    const dateA = new Date(normalizeDate(a.issuanceDate));
    const dateB = new Date(normalizeDate(b.issuanceDate));
    return dateA - dateB; // Confronta le date normalizzate
  });
}

// Normalizza le date
const normalizeDate = (date) => {
  const parts = date.split('-');
  if (parts.length === 1) return `${parts[0]}-01-01`; // YYYY -> YYYY-01-01
  if (parts.length === 2) return `${parts[0]}-${parts[1]}-01`; // YYYY-MM -> YYYY-MM-01
  return date; // YYYY-MM-DD
};

const DocumentGraph = (props) => {

  const [linkedDocuments, setLinkedDocuments] = useState([]);
  const [nodesState, setNodes] = useNodesState([]);
  const [edgesState, setEdges] = useEdgesState([]);

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
          setLinkedDocuments(sortedDocumentsByDate(linkedDocs));
          console.log("Linked documents:", linkedDocs);
        } catch (error) {
          console.error("Error fetching links:", error);
        }
      };
      fetchLinks();
    }
  }, [props.documents]); 
  
  useEffect(() => {
    if (linkedDocuments.length > 0) {
      const nodes = computeNodes(linkedDocuments);
      const edges = computeEdges(nodes, linkedDocuments);
      setNodes(nodes);
      setEdges(edges);
      console.log(edgesState);

    }
  }, [linkedDocuments]);

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
    <div style={{ height: '42vh' }}>
      {nodesState.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span>Loading...</span>
        </div>
      ) : (
        <ReactFlow
          snapGrid={[10, 10]}
          nodes={nodesState}
          edges={edgesState}
          onNodeClick={onNodeClick}
          onNodeDrag={onNodeDrag}
          snapToGrid={true}
          minZoom={0.2}
          maxZoom={1.5}
          fitView={true}
          style={{ background: '#fdfdfd' }}
        >
          <Background color="lightgray" gap={200} variant={BackgroundVariant.Lines} />
          <Controls showZoom={false} showInteractive={false} showFitView={true} />
        </ReactFlow>
      )}
    </div>
  );
};

export default DocumentGraph;
