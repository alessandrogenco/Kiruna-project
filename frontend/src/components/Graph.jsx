import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import ReactFlow, { Background, BackgroundVariant, Controls, useEdgesState, useNodesState } from "react-flow-renderer";
import API from "../API.mjs";
import './Graph.css';

// Normalizza la data in formato `YYYY-MM-DD`
const normalizeDate = (date) => {
  const parts = date.split("-");
  if (parts.length === 1) return `${parts[0]}-01-01`; // Solo anno -> YYYY-01-01
  if (parts.length === 2) return `${parts[0]}-${parts[1]}-01`; // Anno e mese -> YYYY-MM-01
  return date; // Anno, mese e giorno -> YYYY-MM-DD
};

// Calcola la posizione dei nodi
function calculateNodePosition(nodes, node) {
  const dateGroups = nodes.reduce((acc, n) => {
    const normalizedDate = normalizeDate(n.issuanceDate);
    if (!acc[normalizedDate]) acc[normalizedDate] = [];
    acc[normalizedDate].push(n);
    return acc;
  }, {});

  const normalizedNodeDate = normalizeDate(node.issuanceDate);
  const group = dateGroups[normalizedNodeDate];

  const groupIndex = Object.keys(dateGroups).indexOf(normalizedNodeDate);

  const xBase = 330 * groupIndex; // Posizione X
  const xOffset = group.indexOf(node) * 70; // Offset X per nodi dello stesso gruppo

  // Calcolo della posizione Y a zig-zag con target a 150
  const yBaseAmplitude = 350; // Amplitudine massima dello zig-zag
  const yTarget = 150; // Target centrale attorno a cui oscillare
  const yBase = yTarget + (groupIndex % 2 === 0 ? -1 : 1) * 
                (yBaseAmplitude - (yBaseAmplitude * (groupIndex / (Object.keys(dateGroups).length - 1)))); // Zig-zag dinamico attorno a 150

  const yOffset = 100 * group.indexOf(node) + 20; // Offset Y per nodi nel gruppo

  return { x: xBase + xOffset, y: yBase + yOffset };
}

// Trasforma i documenti in nodi
function computeNodes(documents) {
  return documents.map((node) => ({
    id: node.id.toString(),
    data: {
      label: (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: '14px' }}>{node.title}</div>
          <div style={{ fontSize: "11px", color: "gray" }}>
            {node.issuanceDate}
          </div>
        </div>
      ),
    },
    position: calculateNodePosition(documents, node),
    draggable: true,
    sourcePosition: "right",
    targetPosition: "left",
    style: {
      width: 200,
      backgroundColor: "#d4f7d6",
      border: "2px solid #89c79d",
      borderRadius: "8px",
      padding: "6px",
      fontSize: "13px",
      visibility: "visible",
    },
  }));
}

// Trasforma i documenti in edge
function computeEdges(nodes, documents) {
  const edges = [];
  const existingEdgeIds = new Set();

  documents.forEach((document) => {
    if (document.graphLinks && document.graphLinks.length > 0) {
      document.graphLinks.forEach((link) => {
        const sourceNode = nodes.find((node) => node.id === document.id.toString());
        const targetNode = nodes.find((node) => node.id === link.id.toString());

        if (sourceNode && targetNode) {
          const edgeId = `e${sourceNode.id}-${targetNode.id}`;
          const reverseEdgeId = `e${targetNode.id}-${sourceNode.id}`;

          if (!existingEdgeIds.has(edgeId) && !existingEdgeIds.has(reverseEdgeId)) {
            let edgeStyle;

            switch (link.type.toLowerCase()) {
              case "reference":
                edgeStyle = {
                  stroke: "#000",
                  strokeWidth: 1.5,
                  strokeDasharray: "0" // Linea continua
                };
                break;
              case "citation":
                edgeStyle = {
                  stroke: "#000",
                  strokeWidth: 1.7,
                  strokeDasharray: "8,4" // Linea tratteggiata
                };
                break;
              case "dependency":
                edgeStyle = {
                  stroke: "#000",
                  strokeWidth: 3,
                  strokeDasharray: "1,5" // Linea tratteggiata
                };
                break;
              default:                    // "related"
                edgeStyle = {
                  stroke: "#BBBBBB",
                  strokeWidth: 3,
                  strokeDasharray: "0"
                };
                break;
            }

            const edge = {
              id: edgeId,
              source: sourceNode.id,
              target: targetNode.id,
              animated: true,
              style: edgeStyle,
            };

            edges.push(edge);
            existingEdgeIds.add(edgeId);
          }
        }
      });
    }
  });

  return edges;
}

const DocumentGraph = (props) => {

  const [nodesState, setNodes] = useNodesState([]);
  const [edgesState, setEdges] = useEdgesState([]);
  const [showGraph, setShowGraph] = useState(0);

  let nodes = [];

let edges = [];

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
          nodes = computeNodes(linkedDocs);
          setNodes(nodes);
          edges = computeEdges(nodes, linkedDocs);
          setEdges(edges);
          setShowGraph(1);
        } catch (error) {
          console.error("Error fetching links:", error);
        }
      };
      fetchLinks();
    }
  }, [props.documents]); 

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

  const onNodeClick = (event, node) => {
    const clickedDocument = props.documents.find((doc) => doc.id.toString() === node.id);
    
    if (clickedDocument) {
      props.setSelectedDocument(clickedDocument);
    }
  };

  return (
    <div style={{ width: '100vw', height: '42vh' }}>
      {showGraph === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span>Loading...</span>
        </div>
      ) : (
        <div
      style={{
        width: "100vw",
        margin: "0 auto",
        padding: "8px",
        backgroundColor: "#F5F5F5",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          height: "39vh",
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid #eee",
        }}
      >
        <ReactFlow
          snapGrid={[10, 10]}
          nodes={nodesState}
          edges={edgesState}
          onNodeClick={onNodeClick}
          onNodeDrag={onNodeDrag}
          snapToGrid={true}
          minZoom={0.3}
          maxZoom={1.5}
          fitView={true}
          style={{ background: "#FDFDFD" }}>
          <Background color="lightgray" gap={200} variant={BackgroundVariant.Lines} />
          <Controls showZoom={false} showInteractive={false} showFitView={true} />
        </ReactFlow>
      </div>
    </div>
      )}

    </div>
  );
};

DocumentGraph.propTypes = {
  documents: PropTypes.array,
  setSelectedDocument: PropTypes.func,
};

export default DocumentGraph;
