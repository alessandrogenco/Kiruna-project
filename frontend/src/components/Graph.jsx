import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import ReactFlow, { Background, BackgroundVariant, Controls, useEdgesState, useNodesState } from "react-flow-renderer";
import API from "../API.mjs";
import './Graph.css';
import axios from "axios";
import AppNavbar from './Navbar';
import DocumentViewer from "./DocumentViewer";
import { useNavigate } from 'react-router-dom';

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

// Funzione per scurire un colore esadecimale
function darkenColor(color, percent = 20) {
  // Rimuove il simbolo "#" se presente
  if (color.startsWith("#")) {
    color = color.slice(1);
  }

  // Converte il colore esadecimale in RGB
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);

  // Riduce i valori RGB in base alla percentuale
  r = Math.max(0, r - (r * percent) / 100);
  g = Math.max(0, g - (g * percent) / 100);
  b = Math.max(0, b - (b * percent) / 100);

  // Converte di nuovo in formato esadecimale
  r = Math.round(r).toString(16).padStart(2, '0');
  g = Math.round(g).toString(16).padStart(2, '0');
  b = Math.round(b).toString(16).padStart(2, '0');

  return `#${r}${g}${b}`;
}


// Trasforma i documenti in nodi
function computeNodes(documents, types, setTooltip) {

  let color_type = {};

  // Genera i colori direttamente in sequenza
  const colors = [
    "#FFE6CC", // Arancione chiaro
    "#CCE5FF", // Blu chiaro
    "#FFCCCC", // Rosso chiaro
    "#E6FFCC", // Verde chiaro
    "#FFFFCC", // Giallo chiaro
    "#D9CCFF", // Viola chiaro
    "#CCFFFF", // Azzurro chiaro
    "#FFD9E6", // Rosa chiaro
    "#D6FFD6", // Verde pastello
    "#FFF2CC", // Beige chiaro
    "#CCE0FF", // Blu pastello
    "#FFC6C6", // Rosa pesca
    "#E2FFCC", // Verde lime
    "#FFEDCC", // Giallo albicocca
    "#CCF2FF", // Azzurro cielo
  ];

  types.forEach((type) => {
    color_type[type.toLowerCase()] = colors[Object.keys(color_type).length % colors.length];
  });

  return documents.map((node) => {
    // Determina il colore in base al tipo
    const nodeType = node.type?.toLowerCase() || "default";
    const backgroundColor = color_type[nodeType] || "#F0F0F0";
    // Scurisci il colore di sfondo per il bordo
    const borderColor = darkenColor(backgroundColor, 30); // 20% più scuro

    return {
      id: node.id.toString(),
      data: {
        label: (
          <button
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              textAlign: "center",
            }}
            onMouseEnter={(e) => {
              setTooltip({
                visible: true,
                content: node.title,
                x: e.clientX,
                y: e.clientY,
              });
            }}
            onMouseLeave={() =>
              setTooltip({ visible: false, content: "", x: 0, y: 0 })
            }
          >
            <div style={{ fontWeight: "bold", fontSize: "14px" }}>{node.title}</div>
            <div style={{ fontSize: "11px", color: "gray" }}>{node.issuanceDate}</div>
          </button>

        ),
      },
      position: node.x || node.y ? { x: node.x, y: node.y } : calculateNodePosition(documents, node),
      draggable: true,
      sourcePosition: "right",
      targetPosition: "left",
      style: {
        width: 200,
        backgroundColor: backgroundColor,
        border: `2px solid ${borderColor}`,
        borderRadius: "8px",
        padding: "6px",
        fontSize: "13px",
        visibility: "visible",
      },
    };
  });
}

// Trasforma i documenti in edge
function computeEdges(nodes, documents, setTooltip) {
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
              data: { type: link.type },
              onMouseEnter: (e) => {
                setTooltip({
                  visible: true,
                  content: `Connection Type: ${link.type}`,
                  x: e.clientX,
                  y: e.clientY,
                });
              },
              onMouseLeave: () => {
                setTooltip({ visible: false, content: "", x: 0, y: 0 });
              },
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

  const navigate = useNavigate();
  const [nodesState, setNodes] = useNodesState([]);
  const [edgesState, setEdges] = useEdgesState([]);
  const [showGraph, setShowGraph] = useState(0);
  const [types, setTypes] = useState([]);
  const [tooltip, setTooltip] = useState({ visible: false, content: "", x: 0, y: 0 });
  const [selectedDocument, setSelectedDocument] = useState(null); // State for the selected document
  
  let nodes = [];
  let edges = [];

  const getTypes = async () => {
    const response = await axios.get('http://localhost:3001/api/documents/types');
    return response.data;
  };

  useEffect(() => {

    if(props.isLoggedIn === false) {
      navigate("/explore");
    } else {
      getTypes()
      .then((response) => {
        const types = response.map((type) => {
          return type.name;
        });
        setTypes(types);
      })
      .catch((error) => {
        console.error("Error fetching types:", error);
      });
    }
  }, []);


  // Funzione per normalizzare e ordinare le date parziali
  function parseDate(dateStr) {
    const parts = dateStr.split("-");
    const year = parseInt(parts[0], 10);
    const month = parts[1] ? parseInt(parts[1], 10) - 1 : 0; // Default: gennaio
    const day = parts[2] ? parseInt(parts[2], 10) : 1; // Default: primo giorno del mese
    return new Date(year, month, day);
  }

  useEffect(() => {
    if (props.documents.length > 0 && types.length > 0) {
      // Orders documents by increasing issuance date
      let linkedDocs = props.documents.sort((a, b) => parseDate(a.issuanceDate) - parseDate(b.issuanceDate));

      const fetchLinks = async () => {
        try {
          // Create a new array to store updated documents
          linkedDocs = await Promise.all(
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
          nodes = computeNodes(linkedDocs, types, setTooltip);
          setNodes(nodes);
          edges = computeEdges(nodes, linkedDocs, setTooltip);
          setEdges(edges);
          setShowGraph(1);
        } catch (error) {
          console.error("Error fetching links:", error);
        }
      };
      fetchLinks();
    }
  }, [props.documents, types]); 

  useEffect(() => {
    if (props.selectedDocument) {
      //  Evidenzia il nodo selezionato
      setNodes((prevNodes) => 
        prevNodes.map((node) => ({
          ...node,
          style: {
            ...node.style,
            border: node.id === props.selectedDocument.id.toString() ? "2px solid #ffd404" : "1px solid #ddd",
            backgroundColor: node.id === props.selectedDocument.id.toString() ? "#ffd404" : node.style.backgroundColor,
          },
        }))
      );
    } else {
      // Ripristina lo stile originale di tutti i nodi
      setNodes((prevNodes) =>
        prevNodes.map((node) => ({
          ...node,
          style: {
            ...node.style,
            border: "1px solid #ddd", // Stile predefinito del bordo
            background: node.style?.originalBackgroundColor || node.style.backgroundColor, // Usa un colore di sfondo originale se disponibile
          },
        }))
      );
    }
  }, [props.selectedDocument]);

  const onNodeDrag = (event, node) => {
    const nodeIndex = nodesState.findIndex((n) => n.id === node.id);
    const currentNode = nodesState[nodeIndex];
    let updatedNodes = [...nodesState];

    updatedNodes[nodeIndex] = { 
      ...currentNode, 
      position: { 
        ...currentNode.position, 
        x: node.position.x, 
        y: node.position.y 
      } 
    };
    
    setNodes(updatedNodes);
  };

  const onNodeDragStop = (event, node) => {

    // update position with post API with node.position.x, node.position.y and node.id
    API.adjustPosition(node.id, node.position.x, node.position.y)
      .then((response) => {
          let updatedDocuments = [...props.documents];
          let doc = updatedDocuments.find((doc) => doc.id.toString() === node.id);

          doc.x = node.position.x;
          doc.y = node.position.y;
          
          props.setDocuments(updatedDocuments);
      })
      .catch((error) => {
        console.error("Error updating position:", error);
      });

  };

  const onNodeClick = (event, node) => {
    const clickedDocument = props.documents.find((doc) => doc.id.toString() === node.id);
    
    if (clickedDocument) { // click disabilitato su grafo a pagina completa
      if (props.graphSize < 70) {
        props.setSelectedDocument(clickedDocument);
      } else {
        setSelectedDocument(clickedDocument);
      }
    }
  };

  return (
    <>
      {props.graphSize > 70 && (<AppNavbar isLoggedIn={props.isLoggedIn} handleLogout={props.handleLogout} />)}
      <div style={{ width: '100vw', height: `100vh` }}>
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
            height: `${props.graphSize}vh`,
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
            onNodeDragStop={onNodeDragStop}
            onEdgeMouseEnter={(event, edge) => {
              setTooltip({
                visible: true,
                content: `Connection Type: ${edge.data?.type || "Unknown"}`,
                x: event.clientX,
                y: event.clientY,
              });
            }}
            onEdgeMouseLeave={() => {
              setTooltip({ visible: false, content: "", x: 0, y: 0 });
            }}
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
      {tooltip.visible && (
        <div
          style={{
            position: "absolute",
            top: tooltip.y + 10,
            left: tooltip.x + 10,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            color: "white",
            padding: "8px",
            borderRadius: "4px",
            fontSize: "12px",
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
    {/* Document Viewer */}
    {selectedDocument && (
      <DocumentViewer
        isLoggedIn={props.isLoggedIn}
        documentData={selectedDocument}
        onClose={() => {setSelectedDocument(null);}}
      />
    )}
    </>
  );
};

DocumentGraph.propTypes = {
  documents: PropTypes.array,
  setDocuments: PropTypes.func,
  selectedDocument: PropTypes.object,
  setSelectedDocument: PropTypes.func,
  graphSize: PropTypes.number,
  isLoggedIn: PropTypes.bool,
  handleLogout: PropTypes.func,
};

export default DocumentGraph;
