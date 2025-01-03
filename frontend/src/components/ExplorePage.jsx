import React, { useEffect, useRef, useState } from 'react';
import AppNavbar from './Navbar';
import { Row, Col } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Supercluster from 'supercluster';
import '../styles/ExplorePage.css';
import DocumentViewer from './DocumentViewer'; // Import the DocumentViewer component
import DocumentGraph  from './Graph';
import { ReactFlowProvider } from 'react-flow-renderer';
import 'bootstrap-icons/font/bootstrap-icons.css';
import * as turf from '@turf/turf';
import PropTypes from 'prop-types';


function ExplorePage(props) {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false); // Flag to track when the map is loaded
  const [currentStyle, setCurrentStyle] = useState('satellite');
  const [markers, setMarkers] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null); // State for the selected document
  const [showGraph, setShowGraph] = useState(false); // Stato per mostrare/nascondere il grafo
  const [selectMode, setSelectMode] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]); // State for the selected documents
  const [showArea, setShowArea] = useState(false);
  const cluster = useRef(null);
  const markersLayer = useRef(null);
  const activePopup = useRef(null);
  const location = useLocation();
  const graphSize = 43;

  const [documentIdToOpen, setDocumentIdToOpen] = useState(null); // stato temporaneo per l'ID del documento da aprire

  // Global hover popup
  const globalHoverPopup = useRef(null);
  
  // Track if mouse is currently inside a marker
  let mouseInsideMarker = false;

  useEffect(() => {
    const documentId = location.state?.documentId;
    if (documentId) {
      setDocumentIdToOpen(documentId);
    }
  }, [location]);



  const handleSetMarkers = (newMarkers) => {
    setMarkers([...newMarkers]);
  };

  

  useEffect(() => {
    if (props.documents) {
      const newMarkers = props.documents.map(document => ({
        lat: document.lat,
        lng: document.lon,
        label: document.title,
        data: { ...document, description: document.description || '' },// Attach full document data for use in DocumentViewer
      }));

      handleSetMarkers(newMarkers);
    }
  }, [props.documents]);

  useEffect(() => {
    if (!map) {
      mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN1;
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [20.25, 67.85], 
        zoom:11,
        pitch: 0,
        bearing: 0,
        projection: 'mercator',
        antialias: true,
        maxZoom: 16,
        minZoom: 8,
        maxBounds: [[17.8998, 67.3562], [23.2867, 69.0599]],
        attributionControl: false,
        maxPitch: 0
      });

      mapInstance.on('load', async () => {
        setMap(mapInstance);
        setMapLoaded(true); // Set mapLoaded to true when the map is ready
      
        const response = await fetch('/KirunaMunicipality.geojson');
        const geojson = await response.json();

        // Add the GeoJSON file
       mapInstance.addSource('kiruna-boundary', {
          type: 'geojson',
          data: geojson, 
        });

        mapInstance.addLayer({
          id: 'kiruna-boundary-border',
          type: 'line',  
          source: 'kiruna-boundary',  
          paint: {
            'line-color': '#007cbf',   
            'line-width': 3,           
            'line-opacity': 1,         
          },
        });
        
        map.on('click', () => {
        if (globalHoverPopup.current) {
          globalHoverPopup.current.remove();
        }
        if (activePopup.current) {
          activePopup.current.remove();
          activePopup.current = null;
        }
      });
      });
    }
  }, [map]);

  const createCluster = (markersData) => {
    const points = markersData.map(marker => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [marker.lng, marker.lat] },
      properties: { label: marker.label, data: marker.data },
    }));

    const clusterInstance = new Supercluster({
      radius: 40,
      maxZoom: 16,
    }).load(points);

    return clusterInstance;
  };

  const updateMarkers = () => {
    if (map && mapLoaded && cluster.current) {
      const bounds = map.getBounds();
      const zoom = map.getZoom();

      const clusters = cluster.current.getClusters(
        [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
        zoom
      );

      if (markersLayer.current) {
        markersLayer.current.forEach(item => item.marker.remove());
      }

      const markersArray = [];

      // Mappa dei tipi di documenti alle icone
      const documentTypeToIcon = {
        Technical: 'bi bi-gear', 
        Design: 'bi bi-pencil-square',
        Prescriptive: 'bi bi-alarm',
        'Material effect': 'bi bi-exclamation-circle',
        default: 'bi bi-person-add', //added by the urban planner
      };

      // Initialize the global hover popup if not done
      if (!globalHoverPopup.current) {
        globalHoverPopup.current = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false
        });

        // Remove popup on map movements/zooms
        map.on('movestart', () => {
          globalHoverPopup.current.remove();
        });
        map.on('zoomstart', () => {
          globalHoverPopup.current.remove();
        });

        // Also remove popup after movement/zoom ends if not hovering a marker
        map.on('moveend', () => {
          if (!mouseInsideMarker) {
            globalHoverPopup.current.remove();
          }
        });
        map.on('zoomend', () => {
          if (!mouseInsideMarker) {
            globalHoverPopup.current.remove();
          }
        });
      }

      clusters.forEach((clusterPoint) => {
        const { geometry, properties } = clusterPoint;

        if (properties.cluster) {
          const clusterId = clusterPoint.id;
          let documentList = cluster.current
            .getLeaves(clusterId, Infinity)
            .map((leaf) => leaf.properties);

          // Filter documents that are in the selected documents
          const selectedDocsInCluster = documentList.filter(doc => 
          selectedDocuments.some(selectedDoc => selectedDoc.id === doc.data.id));

          const isAnySelectedDocInCluster = showArea
          ? selectedDocsInCluster.length
          : true;
          
          if(isAnySelectedDocInCluster) {
            if(showArea) {
              documentList=selectedDocsInCluster;
            }
            let markerElement = null;
            let popup;
            if(showArea && selectedDocsInCluster.length === 1) {
              const iconClass = documentTypeToIcon[selectedDocsInCluster[0].data.type] || documentTypeToIcon.default; 
              const iconElement = document.createElement('i'); 
              iconElement.className = iconClass; 
              iconElement.style.fontSize = '20px'; 
              iconElement.style.color = 'white'; 

              const iconContainer = document.createElement('div'); 
              iconContainer.style.width = '30px'; 
              iconContainer.style.height = '30px'; 
              iconContainer.style.display = 'flex'; 
              iconContainer.style.justifyContent = 'center'; 
              iconContainer.style.alignItems = 'center';
              iconContainer.style.borderRadius = '50%';
              iconContainer.style.backgroundColor = (selectedDocument && selectedDocsInCluster[0].data.id==selectedDocument.id) ? '#ffd404' : '#CB1E3B'; 
              iconContainer.style.border = '2px solid #CB1E3B'; 
              iconContainer.appendChild(iconElement);
              markerElement = iconContainer;
              
              popup = new mapboxgl.Popup({
                offset: 25,
                closeButton: false,
              })
                .setHTML(`
                  <div style="padding: 5px; margin-bottom: -0.4em; display: flex; flex-direction: column;">
                    <div style="font-size: 1.2em; font-weight: bold;">${selectedDocsInCluster[0].data.title}</div>
                    <button id="view-details-${selectedDocsInCluster[0].data.id}" style="margin-top: 12px; padding: 5px; background-color: #218838; color: white; border: none; border-radius: 4px; cursor: pointer;">
                      View Details
                    </button>
                  </div>
                `)
                .on('open', () => {
                  document.getElementById(`view-details-${selectedDocsInCluster[0].data.id}`).addEventListener('click', () => {
                    if (activePopup.current) {
                      activePopup.current.remove(); // Close the currently active popup
                    }
                    iconContainer.style.backgroundColor = '#ffd404';
                    iconContainer.style.border = '2px solid #ffd404';
                    globalHoverPopup.current.remove();
                    setSelectedDocument(selectedDocsInCluster[0].data); // Pass data to DocumentViewer
                  });
                  activePopup.current = popup; // Set the current popup
                })
                .on('close', () => {
                  iconContainer.style.backgroundColor = '#CB1E3B';
                  iconContainer.style.border = '2px solid #CB1E3B';
                  activePopup.current = null; // Clear the reference when popup closes
                  setSelectedDocument(null);
                });
            } else {
            popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
              <div class="cluster-popup">
                <div class="cluster-popup-header">
                  ${showArea ? selectedDocsInCluster.length : properties.point_count_abbreviated} Documents
                </div>
              <input
                type="text"
                id="cluster-search-${clusterId}"
                placeholder="Search documents..."
                class="cluster-popup-search"
              >
                <ul id="cluster-list-${clusterId}" class="cluster-popup-list">
                ${documentList
                  .map(
                    (doc) => `
                      <li data-id="${doc.data.id}" data-description="${doc.data.description.replace(/"/g, '&quot;')}"
                        class="document-item">
                        <div class="document-title">${doc.label}</div>
                      </li>`
                  )
                    .join('')}
                </ul>
              </div>
            `)
            .on('open', () => {

              // Extract the search term from the input event
              const getSearchTerm = (event) => event.target.value.toLowerCase();

              // Retrieve title and description of an item
              const getItemDetails = (item) => {
                const title = item.querySelector('.document-title')?.textContent.toLowerCase() || '';
                const description = item.getAttribute('data-description')?.toLowerCase() || '';
                return { title, description };
              };

              // Update the visibility of a single item based on the search term
              const updateItemVisibility = (item, searchTerm) => {
                const { title, description } = getItemDetails(item);
                item.style.display = title.includes(searchTerm) || description.includes(searchTerm) ? '' : 'none';
              };

              // Filter and update the visibility of list items
              const filterListItems = (event, listItems) => {
                const searchTerm = getSearchTerm(event);
                listItems.forEach((item) => updateItemVisibility(item, searchTerm));
              };

            
              const popupContent = document.querySelector('.mapboxgl-popup-content');
              if (popupContent) {
                popupContent.style.width = '350px'; 
                popupContent.style.maxWidth = '350px'; 
                popupContent.style.padding = '10px'; 
                popupContent.style.borderRadius = '10px';
              }
              const searchInput = document.getElementById(`cluster-search-${clusterId}`);
              const listElement = document.getElementById(`cluster-list-${clusterId}`);
              const listItems = Array.from(listElement.querySelectorAll('li.document-item'));
    
              searchInput.addEventListener('input', (event) => {
                filterListItems(event, listItems);
              });
            });
            }

            if (!markerElement){
              const clusterIconCount = showArea ? selectedDocsInCluster.length : properties.point_count_abbreviated;
              markerElement = createClusterIcon(clusterIconCount);
            }

            const marker = new mapboxgl.Marker({
              color: 'green',
              element: markerElement,
            })
              .setLngLat(showArea && selectedDocsInCluster.length === 1 ? [selectedDocsInCluster[0].data.lon, selectedDocsInCluster[0].data.lat] : geometry.coordinates)
              .setPopup(popup)
              .addTo(map);
            
            if (selectedDocsInCluster.length !== 1) {
              popup
                .on('open', () => {
                  if (activePopup.current) {
                    activePopup.current.remove(); 
                  }
                  activePopup.current = popup; 
                  
                  const listItems = popup.getElement().querySelectorAll('li.document-item');
                  listItems.forEach((item) => {
                    item.addEventListener('click', () => {
                      globalHoverPopup.current.remove();
                      const docId = item.getAttribute('data-id');
                      const docData = markers.find(
                        (marker) => marker.data.id === parseInt(docId, 10)
                      ).data;
          
                      if (selectMode && !showArea) {
                        handleMarkerClick(docData);
                      }

                      popup.remove();
                      
                      if(showArea || !selectMode) {
                        setSelectedDocument(docData);
                      }
                    });
                  });
                })
                .on('close', () => {
                  activePopup.current = null; 
                });
            }

            markersArray.push({marker: marker, data: properties.data});
            const markerEl = marker.getElement();

            markerEl.addEventListener('mouseenter', () => {
              mouseInsideMarker = true;
            
              if (!activePopup.current) {
                // Generate the content for the popup
                const documentListHTML = documentList
                  .map(d => `<div>${d.label}</div>`)
                  .join('');
            
                const popupContent = `
                  <div style="max-height: 100px; overflow: auto;">
                    ${documentListHTML}
                  </div>
                `;
            
                globalHoverPopup.current
                  .setLngLat(showArea && selectedDocsInCluster.length === 1 ? [selectedDocsInCluster[0].data.lon, selectedDocsInCluster[0].data.lat] : geometry.coordinates)
                  .setHTML(popupContent)
                  .addTo(map);
              }
            });
            

            markerEl.addEventListener('mouseleave', () => {
              mouseInsideMarker = false;
              if (!activePopup.current) {
                globalHoverPopup.current.remove();
              }
            });

            markerEl.addEventListener('click', () => {
              globalHoverPopup.current.remove();
            });
          }
        } else {
          
          // If the marker is associated with one of the selected documents
          const isMarkerInSelectedDocs = showArea
          ? selectedDocuments.some(doc => doc.id === properties.data.id)
          : true; // If showArea is disabled, show all markers

          if(isMarkerInSelectedDocs) {
            const iconClass = documentTypeToIcon[properties.data.type] || documentTypeToIcon.default; 
            const iconElement = document.createElement('i'); 
            iconElement.className = iconClass; 
            iconElement.style.fontSize = '20px'; 
            iconElement.style.color = 'white'; 

            const iconContainer = document.createElement('div'); 
            iconContainer.style.width = '30px'; 
            iconContainer.style.height = '30px'; 
            iconContainer.style.display = 'flex'; 
            iconContainer.style.justifyContent = 'center'; 
            iconContainer.style.alignItems = 'center';
            iconContainer.style.borderRadius = '50%';
            iconContainer.style.backgroundColor = (selectedDocument && properties.data.id==selectedDocument.id) ? '#ffd404' : '#CB1E3B'; 
            iconContainer.style.border = '2px solid #CB1E3B'; 
            iconContainer.appendChild(iconElement);

            const popup = new mapboxgl.Popup({
              offset: 25,
              closeButton: false,
            })
              .setHTML(`
                <div style="padding: 5px; margin-bottom: -0.4em; display: flex; flex-direction: column;">
                  <div style="font-size: 1.2em; font-weight: bold;">${properties.label}</div>
                  <button id="view-details-${properties.data.id}" style="margin-top: 12px; padding: 5px; background-color: #218838; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    View Details
                  </button>
                </div>
              `)
              .on('open', () => {
                console.log(properties.data);
                document.getElementById(`view-details-${properties.data.id}`).addEventListener('click', () => {
                  if (activePopup.current) {
                    activePopup.current.remove(); // Close the currently active popup
                  }
                  iconContainer.style.backgroundColor = '#ffd404';
                  iconContainer.style.border = '2px solid #ffd404';
                  globalHoverPopup.current.remove();
                  setSelectedDocument(properties.data); // Pass data to DocumentViewer
                });
                activePopup.current = popup; // Set the current popup
              })
              .on('close', () => {
                iconContainer.style.backgroundColor = '#CB1E3B';
                iconContainer.style.border = '2px solid #CB1E3B';
                activePopup.current = null; // Clear the reference when popup closes
                setSelectedDocument(null);
              });

            const marker = new mapboxgl.Marker({
              element: iconContainer,
            })
              .setLngLat(geometry.coordinates);

            if ((showArea || !selectMode) && popup) {
              marker.setPopup(popup);
            }
              
            marker.addTo(map);

              markersArray.push({ marker: marker, data: properties.data });

              const singleMarkerEl = marker.getElement();
              if (properties.data.lat && properties.data.lon) {
                singleMarkerEl.addEventListener('mouseenter', () => {
                  mouseInsideMarker = true;
                  if (!activePopup.current) {
                    globalHoverPopup.current
                      .setLngLat([properties.data.lon, properties.data.lat])
                      .setHTML(`<div>${properties.label}</div>`)
                      .addTo(map);
                  }
                });
    
                singleMarkerEl.addEventListener('mouseleave', () => {
                  mouseInsideMarker = false;
                  if (!activePopup.current) {
                    globalHoverPopup.current.remove();
                  }
                });
    
                singleMarkerEl.addEventListener('click', () => {
                  if (selectMode && !showArea) {
                    handleMarkerClick(properties.data);
                  }
                  globalHoverPopup.current.remove();
                });
              }

            if (properties.data.area) {
              
              const areaGeoJson = JSON.parse(JSON.parse(properties.data.area));

            const layerId = `area-layer-${properties.data.id}`;
            
            const polygonSource = {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: [{
                  type: 'Feature',
                  geometry: {
                    type: 'Polygon',
                    coordinates: areaGeoJson.features[0].geometry.coordinates,
                  },
                }],
              },
            };
          
            if(!showArea) {
              marker.getElement().addEventListener('mouseenter', () => {
                if (!map.getSource(layerId)) {
                  map.addSource(layerId, polygonSource);
                }
                
                if (!map.getLayer(layerId)) {
                  map.addLayer({
                    id: layerId,
                    type: 'fill',
                    source: layerId,
                    paint: {
                      'fill-color': 'rgba(255, 99, 71, 0.5)',
                      'fill-opacity': 0.5,
                    },
                  });
                }
              });
              
              marker.getElement().addEventListener('mouseleave', () => {
                if (map.getLayer(layerId)) {
                  map.removeLayer(layerId);
                }
                if (map.getSource(layerId)) {
                  map.removeSource(layerId);
                }
              });
            }
          }

            markersArray.push({marker: marker, data: properties.data});
          }
        }
      });

      markersLayer.current = markersArray;
    }
  };

  const createClusterIcon = (count) => {
    const div = document.createElement('div');
    div.style.backgroundColor = '#CB1E3B';
    div.style.borderRadius = '50%';
    div.style.border = '2px solid white';
    div.style.color = 'white';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.style.width = '30px';
    div.style.height = '30px';
    div.style.fontSize = '15px';
    div.innerHTML = count;
    return div;
  };

  useEffect(() => {
    if (map && mapLoaded) {
      cluster.current = createCluster(markers);
      map.on('move', updateMarkers);
      map.on('zoom', updateMarkers); 
      updateMarkers();
    }
  }, [map, mapLoaded, markers, selectMode, showArea]);

   // Use the ID to search and open the corresponding popup
   useEffect(() => {
    if (documentIdToOpen && map) {
      // Find the marker corresponding to the ID
      const selectedMarker = markersLayer.current.find(
        (item) => item.data ? item.data.id === documentIdToOpen : false
      );
      if (selectedMarker) {
        const popup = selectedMarker.marker.getPopup();
        if (popup) {
          popup.addTo(map); // Add the popup to the map
        }        
      } else {
       // If the document is inside a cluster, find the cluster and zoom in on it
        const clusters = cluster.current.getClusters(
          [map.getBounds().getWest(), map.getBounds().getSouth(), map.getBounds().getEast(), map.getBounds().getNorth()],
          map.getZoom()
        );
        const clusterWithDocument = clusters.find(clusterPoint => {        
          if (!clusterPoint.properties.cluster) {
            return false;
          }
          const documentList = cluster.current
          .getLeaves(clusterPoint.id, Infinity)
          .map((leaf) => leaf.properties);

          return documentList.find(d => 
            d.data.id === documentIdToOpen
          );
        });

        if (clusterWithDocument) {
          const documentList = cluster.current
          .getLeaves(clusterWithDocument.id, Infinity)

          const docInCluster = documentList.find(d => d.properties.data.id === documentIdToOpen);
          if (docInCluster) {
            map.flyTo({
              center: docInCluster.geometry.coordinates,
              zoom: 14,
              speed: 1,
              curve: 1,
              easing: (t) => t,
            });

            map.once('moveend', () => {
              updateMarkers();
              const selectedMarker = markersLayer.current.find(
                (item) => item.data ? item.data.id === documentIdToOpen : false
              );
              if(selectedMarker){
                const popup = selectedMarker.marker.getPopup();
                if (popup) {
                  popup.addTo(map); // Add the popup to the map
                }
              }
            });
          }
        } else {
          console.error("No cluster found containing the specified document.");
        }
      }
    }
  }, [documentIdToOpen, map]);

  const handleMapStyleChange = (style) => {
    if (map) {
      const styleUrl = `mapbox://styles/mapbox/${style}-v9`;
      map.setStyle(styleUrl);
      setCurrentStyle(style);

      // After the style has changed, re-add the boundary layer.
      map.on('style.load', () => {
        addBoundaryLayer(); 
      });

    }
  };

  const addBoundaryLayer = async () => {
    if (map.getLayer('kiruna-boundary-border')) {
      map.removeLayer('kiruna-boundary-border');
    }
  
    if (map.getSource('kiruna-boundary')) {
      map.removeSource('kiruna-boundary');
    }

    const response = await fetch('/KirunaMunicipality.geojson');
    const geojson = await response.json();

    map.addSource('kiruna-boundary', {
      type: 'geojson',
      data: geojson,
    });

    map.addLayer({
      id: 'kiruna-boundary-border',
      type: 'line',
      source: 'kiruna-boundary',
      paint: {
        'line-color': '#007cbf',
        'line-width': 3,
        'line-opacity': 1,
      },
    });
  };

  const MapStyleToggleButton = ({ style, label }) => {
    const isActive = currentStyle === style;
    return (
      <button
        className='toggle'
        onClick={() => handleMapStyleChange(style)}
        style={{ backgroundColor: isActive ? '#146726' : '#28a745' }}>
        {label}
      </button>
    );
  };

  MapStyleToggleButton.propTypes = {
    style: PropTypes.string,
    label: PropTypes.string,
  }

  useEffect(() => {
    if (map) {
      map.resize(); // Forza la mappa a ricalcolare le dimensioni
    }
  }, [showGraph]);

  const handleMarkerClick = (docData) => {
    // Add the selected document
    setSelectedDocuments((prevSelected) => {
      if (prevSelected.some((doc) => doc.id === docData.id)) {
        return [...prevSelected];
      } else {
        return [...prevSelected, docData];
      }
    });
  };

  const handleDeleteDocument = (docId) => {
    // Delete a document
    setSelectedDocuments((prevSelected) => {
      return [...prevSelected.filter((doc) => doc.id !== docId)];
    });
  };

  const handleSelectToggle = () => {
    setSelectMode((prev) => !prev);
    setShowArea(false);
  };

  const createCommonArea = () => {
    const areas = selectedDocuments
      .filter(doc => doc.area)
      .map(doc => turf.polygon(JSON.parse(JSON.parse(doc.area)).features[0].geometry.coordinates));
    
    const multiPolygon = turf.multiPolygon(areas.map(area => area.geometry.coordinates));

    return multiPolygon;
  };

  useEffect(() => {
    if(showArea) {
      const commonArea = createCommonArea();

      if (commonArea) {
        const layerId = 'common-area-layer';

        if (!map.getSource(layerId)) {
          map.addSource(layerId, {
            type: 'geojson',
            data: commonArea,
          });
        }

        if (!map.getLayer(layerId)) {
          map.addLayer({
            id: layerId,
            type: 'fill',
            source: layerId,
            paint: {
              'fill-color': 'rgba(255, 99, 71, 0.5)',
              'fill-opacity': 0.5,
            },
          });
        }
      }
    }
  },[showArea]);

  useEffect(() => {
    if(!selectMode) {
      setSelectedDocuments([]);   // Reset the selected documents 
      const layerId = 'common-area-layer';
      if(map) {
        if (map.getLayer(layerId)) {
          map.removeLayer(layerId);
        }
        if (map.getSource(layerId)) {
          map.removeSource(layerId);
        }
      }
    }
    console.log("Select Mode: ", selectMode);
  },[selectMode]);

  useEffect(() => {
    console.log("The selected documents are: ", selectedDocuments);
  },[selectedDocuments]);

  useEffect(() => {
    if (selectedDocument) {
      // Trova il marker corrispondente e applica l'evidenziazione
      markersLayer.current.forEach((markerData) => {
        //console.log(markerData);
        if(markerData.data){
          //console.log(markerData.data);
          //console.log(selectedDocument);
          if (markerData.data.id === selectedDocument.id) {
            markerData.marker.getElement().style.backgroundColor = "#ffd404"; // Evidenziato
            markerData.marker.getElement().style.border = '2px solid #ffd404';
            //console.log(markerData.marker);
          } else {
            markerData.marker.getElement().style.backgroundColor = "#CB1E3B"; // Colore di default
            markerData.marker.getElement().style.border = '2px solid #CB1E3B';
          }
        }
      });
    }
  }, [selectedDocument]);

  return (
    <>
      <AppNavbar isLoggedIn={props.isLoggedIn} handleLogout={props.handleLogout} />
      <button
        style={{
          position: 'absolute',
          top: '90px',
          left: '20px',
          padding: '10px',
          backgroundColor: selectMode ? '#CB1E3B' : '#28a745',
          color: '#fff',
          borderRadius: '8px',
          cursor: 'pointer',
          zIndex: 1000,
        }}
        className='toggle'
        onClick={() => handleSelectToggle()}
      >
        {selectMode ? 'Exit Select Mode' : 'Select Documents'}
      </button>
      
      {/* Show the selected documents */}
      {selectedDocuments.length > 0 && !showArea && (
        <div
          style={{
            position: 'absolute',
            top: '150px',
            left: '20px',
            backgroundColor: '#FCFCFC',
            padding: '10px',
            border: '1px solid #28a745',
            borderRadius: '8px',
            zIndex: 1001,
            maxWidth: '400px',
          }}
        >
          <span className="lead d-flex justify-content-center mb-2"><strong>Selected Documents</strong></span>
          <div
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              marginLeft: '12px'
            }}>
            {selectedDocuments.map((doc) => (
              <li key={doc.id} 
                className="d-flex justify-content-between align-items-center mt-1" 
                >
                <span>{doc.title}</span>
                <button className="btn btn-outline-danger bi bi-trash" 
                  onClick={() => handleDeleteDocument(doc.id)}
                  style={{ marginLeft: '10px', marginRight: '15px' }}
                  />
              </li>
            ))}
          </div> 
          <div className="d-flex justify-content-center mt-3">
            <button className="btn btn-success" onClick={() => setShowArea(true)}>
              <span>Show Area</span>
            </button>
          </div>
        </div>
      )}
      
      <button
        style={{
          position: 'fixed', // Fisso nella finestra
          bottom: '20px', // Margine dal basso
          right: '20px', // Margine da destra
          padding: '10px',
          backgroundColor: '#FCFCFC',
          color: '#28a745',
          border: '1px solid #28a745',
          borderRadius: '8px',
          cursor: 'pointer',
          zIndex: 1000, // Priorità sopra gli altri elementi
          
        }}
        onClick={() => setShowGraph(!showGraph)}>
        {showGraph ? 'Hide Graph' : 'Show Graph'}
      </button>

      <Row className="vh-80 justify-content-center align-items-center">
        <Col style={{ width: '100%', height: showGraph ? '50vh' : '93vh' }}>
          <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
        </Col>
      </Row>
      
      {showGraph && (
        <Row>
          <Col>
            <ReactFlowProvider>
              <DocumentGraph documents={props.documents} setDocuments={props.setDocuments} selectedDocument={selectedDocument} setSelectedDocument={setSelectedDocument} graphSize={graphSize}/>
            </ReactFlowProvider>
          </Col>
        </Row>
      )}
      <div style={{
        position: 'absolute', top: 90, right: 20, zIndex: 1,
        backgroundColor: '#F0F0F0', padding: '7px', borderRadius: '8px',
        display: 'flex', flexDirection: 'column', gap: '2px'
      }}>
        <MapStyleToggleButton style="satellite" label="Satellite" />
        <MapStyleToggleButton style="streets" label="Streets" />
      </div>

      {/* Document Viewer */}
      {selectedDocument && (
        <DocumentViewer
          isLoggedIn={props.isLoggedIn}
          documentData={selectedDocument}
          onClose={() => {setSelectedDocument(null); updateMarkers();}}
        />
      )}
    </>
  );
}

ExplorePage.propTypes = {
  documents: PropTypes.array,
  setDocuments: PropTypes.func,
  isLoggedIn: PropTypes.bool,
  handleLogout: PropTypes.func,
};

export default ExplorePage;
