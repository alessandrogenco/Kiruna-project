import React, { useEffect, useRef, useState } from 'react';
import AppNavbar from './Navbar';
import { Row, Col } from 'react-bootstrap';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Supercluster from 'supercluster';
import '../styles/ExplorePage.css';
import DocumentViewer from './DocumentViewer'; // Import the DocumentViewer component
import DocumentGraph  from './Graph';
import { ReactFlowProvider } from 'react-flow-renderer';
import 'bootstrap-icons/font/bootstrap-icons.css';
import PropTypes from 'prop-types';


function ExplorePage(props) {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false); // Flag to track when the map is loaded
  const [currentStyle, setCurrentStyle] = useState('satellite');
  const [markers, setMarkers] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null); // State for the selected document
  const [showGraph, setShowGraph] = useState(false); // Stato per mostrare/nascondere il grafo
  const cluster = useRef(null);
  const markersLayer = useRef(null);
  const activePopup = useRef(null);

  const handleSetMarkers = (newMarkers) => {
    setMarkers([...newMarkers]);
  };

  useEffect(() => {
    //console.log("ciao" + process.env.REACT_APP_MAPBOX_TOKEN1);

    if (selectedDocument) {
      mapContainer.current.classList.add('blurred-map');
    } else {
      mapContainer.current.classList.remove('blurred-map');
    }
  }, [selectedDocument]);

  useEffect(() => {
    if (props.documents) {
      const newMarkers = props.documents.map(document => ({
        lat: document.lat,
        lng: document.lon,
        label: document.title,
        data: document, // Attach full document data for use in DocumentViewer
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
        markersLayer.current.forEach(marker => marker.remove());
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

      clusters.forEach((clusterPoint) => {
        const { geometry, properties } = clusterPoint;
      
        if (properties.cluster) {
          const clusterId = clusterPoint.id;
          const documentList = cluster.current
            .getLeaves(clusterId, Infinity)
            .map((leaf) => leaf.properties);
      
          const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
            <div class="cluster-popup">
              <div class="cluster-popup-header">
                ${properties.point_count_abbreviated} Documents
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
                    <li data-id="${doc.data.id}" class="document-item">
                      <div class="document-title">${doc.label}</div>
                    </li>`
                )
                  .join('')}
              </ul>
            </div>
          `)
          .on('open', () => {
           
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
              const searchTerm = event.target.value.toLowerCase();
              listItems.forEach((item) => {
                const title = item.querySelector('.document-title').textContent.toLowerCase();
                if (title.includes(searchTerm)) {
                  item.style.display = '';
                } else {
                  item.style.display = 'none';
                }
              });
            });
          });
      
          const marker = new mapboxgl.Marker({
            color: 'green',
            element: createClusterIcon(properties.point_count_abbreviated),
          })
            .setLngLat(geometry.coordinates)
            .setPopup(popup)
            .addTo(map);
      
          popup
            .on('open', () => {
              if (activePopup.current) {
                activePopup.current.remove(); 
              }
              activePopup.current = popup; 
      
              
              const listItems = popup.getElement().querySelectorAll('li.document-item');
              listItems.forEach((item) => {
                item.addEventListener('click', () => {
                  const docId = item.getAttribute('data-id');
                  const docData = markers.find(
                    (marker) => marker.data.id === parseInt(docId, 10)
                  ).data;
      
                  
                  popup.remove();
      
                  setSelectedDocument(docData);
                });
              });
            })
            .on('close', () => {
              activePopup.current = null; 
            });
      

          markersArray.push(marker);
        } else {
          
          // Imposta l'icona in base al tipo di documento
          //console.log(properties.data.type);

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
          iconContainer.style.backgroundColor = '#CB1E3B'; 
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
              document.getElementById(`view-details-${properties.data.id}`).addEventListener('click', () => {
                if (activePopup.current) {
                  activePopup.current.remove(); // Close the currently active popup
                }
                setSelectedDocument(properties.data); // Pass data to DocumentViewer
              });
              activePopup.current = popup; // Set the current popup
            })
            .on('close', () => {
              activePopup.current = null; // Clear the reference when popup closes
            });

          const marker = new mapboxgl.Marker({
            element: iconContainer,
          })
            .setLngLat(geometry.coordinates)
            .setPopup(popup)
            .addTo(map);

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
          
            marker.getElement().addEventListener('mouseenter', () => {
              map.addSource(layerId, polygonSource);

              map.addLayer({
                id: layerId,
                type: 'fill',
                source: layerId,
                paint: {
                  'fill-color': 'rgba(255, 99, 71, 0.5)',
                  'fill-opacity': 0.5,
                },
              });
            });

            marker.getElement().addEventListener('mouseleave', () => {
              map.removeLayer(layerId);
              map.removeSource(layerId);
            });
          }

          markersArray.push(marker);
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
      updateMarkers();
    }
  }, [map, mapLoaded, markers]);

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

  return (
    <>
      <AppNavbar isLoggedIn={props.isLoggedIn} handleLogout={props.handleLogout} />
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
          zIndex: 1000 // Priorità sopra gli altri elementi
        }}
        onClick={() => setShowGraph(!showGraph)}>
        {showGraph ? 'Hide Graph' : 'Show Graph'}
      </button>
      <Row className="vh-80 justify-content-center align-items-center">
        <Col style={{ width: '100%', height: showGraph ? '50vh' : '92vh' }}>
          <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
        </Col>
      </Row>
      {showGraph && (
        <Row>
          <Col>
            <ReactFlowProvider>
              <DocumentGraph documents={props.documents} setSelectedDocument={setSelectedDocument}/>
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
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </>
  );
}

ExplorePage.propTypes = {
  documents: PropTypes.array,
  isLoggedIn: PropTypes.bool,
  handleLogout: PropTypes.func,
};

export default ExplorePage;
