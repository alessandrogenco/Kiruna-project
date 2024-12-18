import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, ToggleButtonGroup, ToggleButton, Alert, Form } from 'react-bootstrap';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import * as turf from '@turf/turf';

const MapModal = ({ show, handleClose, onLocationSelect, selectedAreaName, setSelectedAreaName, areaNameInput, setAreaNameInput }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const draw = useRef(null);
  const [position, setPosition] = useState(null);
  const [mode, setMode] = useState('area');
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [existingGeoreferencingData, setExistingGeoreferencingData] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [areaCentroid, setAreaCentroid] = useState(null);
  const [centroidMarker, setCentroidMarker] = useState(null);
  const [currentAreaId, setCurrentAreaId] = useState(null);
  const [areaSet, setAreaSet] = useState(false);
  const [areaNames, setAreaNames] = useState([]);

  useEffect(() => {
    if (show) {
      fetchDocumentLocations();
      fetchAreaNames();
    }
  }, [show]);

  const fetchDocumentLocations = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/getDocumentLocations');
      console.log('Response Status:', response.status);
      const text = await response.text();

      if (!response.ok) throw new Error('Failed to fetch document locations');
      const data = JSON.parse(text);
      console.log('Fetched Document Locations:', data); // Log the fetched data

      setExistingGeoreferencingData(data);
    } catch (error) {
      console.error('Error fetching document locations:', error.message);
      alert('Error fetching document locations: ' + error.message);
    }
  };

  const fetchAreaNames = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/getAreaNames');
      const text = await response.text();

      if (!response.ok) throw new Error('Failed to fetch area names');
      const data = JSON.parse(text);
      console.log('Fetched area names:', data);

      // Adjust the data structure
      if (data.areas && Array.isArray(data.areas)) {
        setAreaNames(data.areas);
      } else {
        console.error('Unexpected data structure for area names:', data);
      }
    } catch (error) {
      console.error('Error fetching area names:', error.message);
      alert('Error fetching area names: ' + error.message);
    }
  };

  useEffect(() => {
    setAlertMessage('');
    if (show && mapContainer.current && !map.current) {
      mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [20.25, 67.85],
        zoom: 11,
        maxBounds: [[17.8998, 67.3562], [23.2867, 69.0599]],
        attributionControl: false,
        pitch: 0,
        maxPitch: 0
      });

      map.current.on('load', async () => {
        map.current.resize();
        try {
          const response = await fetch('/KirunaMunicipality.geojson');
          if (!response.ok) throw new Error('Failed to load GeoJSON');
          const geojson = await response.json();
          console.log('Loaded GeoJSON:', geojson); // Inspect the GeoJSON data
          setGeoJsonData(geojson);
          map.current.addSource('kiruna-boundary', {
            type: 'geojson',
            data: geojson,
          });
          map.current.addLayer({
            id: 'kiruna-boundary-border',
            type: 'line',
            source: 'kiruna-boundary',
            paint: {
              'line-color': '#007cbf',
              'line-width': 3,
              'line-opacity': 1,
            },
          });
        } catch (error) {
          console.error('Error loading GeoJSON:', error.message);
          setAlertMessage('Error loading map boundaries. Please try again later.');
        }

        let filteredData = existingGeoreferencingData;
        if (mode === 'area') {
          filteredData = existingGeoreferencingData.filter(item => item.area);
        }

        // Add existing georeferencing points/areas to the map
        if (filteredData) {
          filteredData.forEach((item) => {
            if (item.lat && item.lon && !isNaN(item.lat) && !isNaN(item.lon)) {
              const coordinates = [parseFloat(item.lon), parseFloat(item.lat)];

              const iconClass = (() => {
                switch (item.type) {
                  case "Technical":
                    return "bi bi-gear";
                  case "Design":
                    return "bi bi-pencil-square";
                  case "Prescriptive":
                    return "bi bi-alarm";
                  case "Material effect":
                    return "bi bi-exclamation-circle";
                  default:
                    return "bi bi-person-add";
                }
              })();

              const el = document.createElement('div');
              el.style.width = '30px';
              el.style.height = '30px';
              el.style.display = 'flex';
              el.style.alignItems = 'center';
              el.style.justifyContent = 'center';
              el.style.backgroundColor = '#CB1E3B';
              el.style.borderRadius = '50%';
              el.style.border = '2px solid #CB1E3B';
              el.style.color = 'white';
              el.style.fontSize = '20px';
              el.innerHTML = `<i class="bi bi-geo-alt"></i>`;

              const pointMarker = new mapboxgl.Marker(el)
                .setLngLat(coordinates)
                .addTo(map.current);

                if (mode === 'area') {

                  if (item.area) {
            
                    const areaGeoJson = JSON.parse(JSON.parse(item.area));
                    const layerId = `area-layer-${item.id}`;
                    
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
                    
                    pointMarker.getElement().addEventListener('mouseenter', () => {
                      map.current.addSource(layerId, polygonSource);
        
                      map.current.addLayer({
                        id: layerId,
                        type: 'fill',
                        source: layerId,
                        paint: {
                          'fill-color': 'rgba(255, 99, 71, 0.5)',
                          'fill-opacity': 0.5,
                        },
                      });
                    });
        
                    pointMarker.getElement().addEventListener('mouseleave', () => {
                      map.current.removeLayer(layerId);
                      map.current.removeSource(layerId);
                    });
                  }
                  
                }

              pointMarker.getElement().addEventListener('click', (event) => {
                // Prevent other click events from being executed
                event.stopPropagation();

                if (mode === 'point') {
                  setPosition([item.lat, item.lon]);
                  setAlertMessage('Selected an existing point.');
                  if (marker.current) {
                    marker.current.setLngLat([item.lon, item.lat]);
                  } else {
                    marker.current = new mapboxgl.Marker({ color: '#007cbf' })
                      .setLngLat([item.lon, item.lat])
                      .addTo(map.current);
                  }
                } else if (mode === 'area' && item.area) {
                  const areaGeoJson1 = JSON.parse(item.area);
                  const areaGeoJson = JSON.parse(areaGeoJson1);

                  if (areaGeoJson.features && areaGeoJson.features.length > 0) {
                    //console.log('Area data loaded for the selected point:', areaGeoJson);

                    // Rimuovi l'area attuale se già presente
                    let features = draw.current.getAll().features;
                    if (features.length > 0) {
                      draw.current.delete(features[0].id); // Rimuovi la prima area se ce ne sono più di una
                      features.splice(0, 1); // Remove the first feature
                    }

                    if (centroidMarker) {
                      console.log('Removing existing centroid marker');
                      centroidMarker.remove();
                      setCentroidMarker(null);
                    }

                    // Aggiungi l'area al Mapbox Draw
                    const areaFeature = {
                      type: 'Feature',
                      geometry: {
                        type: 'Polygon',
                        coordinates: areaGeoJson.features[0].geometry.coordinates,
                      },
                      properties: {
                        name: item.areaName
                      }
                    };

                    // Salva l'ID dell'area attualmente visualizzata
                    const addedArea = draw.current.add(areaFeature);
                    setCurrentAreaId(addedArea[0]);

                    // Calcola il centroid e visualizza il marcatore
                    const centroid = turf.centroid(areaFeature);
                    setAreaCentroid(centroid.geometry.coordinates);
                    displayCentroidMarker(centroid.geometry.coordinates);

                    // Aggiorna lo stato per indicare che un'area è stata selezionata
                    setAreaSet(true);
                    setSelectedAreaName(item.areaName); // Set the selected area name
                    setAlertMessage('Selected an area associated with the point.');
                  }
                }
              }, true); // Add event listener in the capture phase for higher priority
            }
          });
        }

        // Initialize Mapbox Draw
        draw.current = new MapboxDraw({
          displayControlsDefault: false,
          controls: {
            polygon: true,
            trash: true,
          },
          defaultMode: mode === 'area' ? 'draw_polygon' : 'simple_select',
        });

        // Add or remove the draw control based on the mode
        if (mode === 'area') {
          map.current.addControl(draw.current, 'top-right');
        }

        if (mode === 'point' && areaSet) {
          setAreaSet(false);
        }

        let centroidMarker = null;

        map.current.on('draw.create', (e) => {
          if (mode === 'area') {
            console.log('draw.create event fired', e);
            let features = draw.current.getAll().features;
            if (features.length > 1) {
              draw.current.delete(features[0].id);  // Rimuovi la prima area se ce ne sono più di una
              features = features.slice(1);
            }

            if (centroidMarker) {
              console.log('Removing existing centroid marker on create');
              centroidMarker.remove();
              setCentroidMarker(null);
            }

            const polygon = features.find(feature => feature.geometry.type === 'Polygon');
            if (polygon) {
              setCurrentAreaId(polygon.id);
              const centroid = turf.centroid(polygon);
              setAreaCentroid(centroid.geometry.coordinates);
              displayCentroidMarker(centroid.geometry.coordinates);
              setSelectedAreaName(''); // Reset the selected area name
            }
            setAreaSet(true);
          }
        });

        map.current.on('draw.update', (e) => {
          console.log('draw.update event fired', e);
          if (mode === 'area') {
            if (centroidMarker) {
              console.log('Removing existing centroid marker on update');
              centroidMarker.remove();
              setCentroidMarker(null);
            }

            const features = draw.current.getAll().features;
            const polygon = features.find(feature => feature.geometry.type === 'Polygon');

            if (polygon && polygon.geometry && Array.isArray(polygon.geometry.coordinates)) {
              try {
                const centroid = turf.centroid(polygon);
                setAreaCentroid(centroid.geometry.coordinates);
                displayCentroidMarker(centroid.geometry.coordinates);
              } catch (error) {
                console.error('Error calculating centroid:', error.message);
              }
            } else {
              console.warn('Invalid polygon or missing coordinates:', polygon);
            }
          }
        });

        map.current.on('draw.delete', (e) => {
          console.log('draw.delete event fired', e);
          setCurrentAreaId(null);
          if (centroidMarker) {
            console.log('Removing centroid marker on delete');
            centroidMarker.remove();
            setCentroidMarker(null);
          } else {
            console.log('Centroid marker is already null');
          }
        });

        const displayCentroidMarker = (coordinates) => {
          if (centroidMarker) {
            centroidMarker.remove();
          }

          centroidMarker = new mapboxgl.Marker({
            color: '#007cbf',
            scale: 1
          })
            .setLngLat(coordinates)
            .addTo(map.current);
          setCentroidMarker(centroidMarker);

          console.log('Centroid marker added at', coordinates);
        };

        map.current.on('click', (e) => {
          if (mode === 'point') {
            const { lng, lat } = e.lngLat;
            if (geoJsonData) {
              if (!isWithinBounds(lng, lat, geoJsonData)) {
                setAlertMessage('Selected coordinates are outside Kiruna Municipality borders.');
                return;
              }

              setPosition([lat, lng]);
              setAlertMessage('');

              if (marker.current) {
                marker.current.setLngLat([lng, lat]);
              } else {
                marker.current = new mapboxgl.Marker({ color: '#007cbf' })
                  .setLngLat([lng, lat])
                  .addTo(map.current);
              }
            }
          }
        });
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        marker.current = null;
        if (centroidMarker) {
          centroidMarker.remove();
        }
      }
    };
  }, [show, mode, existingGeoreferencingData]);

  const isWithinBounds = (lon, lat, geojson) => {
    if (!geojson || !geojson.features || geojson.features.length === 0) {
      console.error('GeoJSON is undefined or empty:', geojson);
      return false;
    }

    const point = turf.point([lon, lat]);
    const isInside = geojson.features[0].geometry.coordinates.some((polygonCoordinates) => {
      const polygon = turf.polygon(polygonCoordinates);
      return turf.booleanPointInPolygon(point, polygon);
    });
    return isInside;
  };

  const highlightArea = (areaName) => {
    console.log('Looking for areaName:', areaName);

    // Find the selected area by areaName (make sure the areaId matches the name correctly)
    const selectedArea = areaNames.find(area => area.areaName === areaName);
    console.log('Selected Area:', selectedArea);

    if (selectedArea && selectedArea.coordinates) {
        try {
            // Parse the coordinates string into a valid object
            const parsedCoordinates = JSON.parse(selectedArea.coordinates);
            console.log('Parsed Coordinates:', parsedCoordinates);

            // Check if the coordinates are in the correct format (Polygon)
            if (!parsedCoordinates || parsedCoordinates.type !== "Polygon" || !parsedCoordinates.coordinates[0]) {
                console.error('Invalid coordinates format for area:', areaName);
                return;
            }

            // Create GeoJSON object for the selected area
            const areaGeoJson = {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'Polygon',
                            coordinates: parsedCoordinates.coordinates,
                        },
                        properties: {
                            name: selectedArea.areaName,
                        },
                    },
                ],
            };

            console.log('Valid Area GeoJSON:', areaGeoJson);

            // Create a unique layer ID based on the areaName to avoid conflicts
            const layerId = `highlight-area-${selectedArea.areaName}`;

            // Remove any existing highlighted area layers and sources
            const existingLayers = map.current.getStyle().layers;
            existingLayers.forEach(layer => {
                if (layer.id.startsWith('highlight-area-')) {
                    console.log(`Removing existing layer: ${layer.id}`);
                    map.current.removeLayer(layer.id);   // Remove the previous layer
                    map.current.removeSource(layer.id);  // Remove the source associated with the previous layer
                }
            });

            // Add the new GeoJSON source for the selected area
            map.current.addSource(layerId, {
                type: 'geojson',
                data: areaGeoJson,
            });

            // Add the new layer to the map
            map.current.addLayer({
                id: layerId,
                type: 'fill',
                source: layerId,
                paint: {
                    'fill-color': 'rgba(255, 99, 71, 0.5)',
                    'fill-opacity': 0.5,
                },
            });

            // Fit the map bounds to the selected area
            const bounds = turf.bbox(areaGeoJson);
            map.current.fitBounds(bounds, { padding: 20 });

            console.log(`Successfully highlighted area: ${selectedArea.areaName}`);
        } catch (error) {
            console.error('Error processing coordinates or GeoJSON:', error);
        }
    } else {
        console.error('Selected area or coordinates are undefined:', selectedArea);
    }
};

  const handleSave = () => {
    console.log('Saving location with area name:', selectedAreaName);

    if (mode === 'point' && position) {
      onLocationSelect({ type: 'point', coordinates: position });
    } else if (mode === 'area') {
      const drawnFeatures = draw.current.getAll();
      if (drawnFeatures.features.length > 0) {
        const geoJsonString = JSON.stringify({ type: 'FeatureCollection', features: drawnFeatures.features });

        const areaName = areaNameInput || selectedAreaName;

        console.log('Saving area with name:', areaName); 
        console.log(areaNameInput);

        onLocationSelect({ type: 'area', geometry: geoJsonString, name: areaName }); 
      } else if (geoJsonData) {
        const geoJsonString = JSON.stringify({ type: 'FeatureCollection', features: geoJsonData.features });

        const areaName = areaNameInput || selectedAreaName;

        console.log('Saving area with name:', areaName); 

        onLocationSelect({ type: 'area', geometry: geoJsonString, name: areaName });
      } else {
        setAlertMessage('Error: Default municipality boundary is unavailable.');
        return;
      }
    }
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Select Location</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{ position: 'relative', height: '400px', width: '100%' }}>
          <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />
          {alertMessage && (
            <Alert
              variant="success"
              onClose={() => setAlertMessage('')}
              dismissible
              style={{
                position: 'absolute',
                top: '10px',
                left: '150px',
                zIndex: 2 }}
            >
              {alertMessage}
            </Alert>
          )}
          <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              zIndex: 2,
              background: 'white',
              padding: '5px',
              borderRadius: '5px',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'}}>
            <ToggleButtonGroup
              type="radio"
              name="mode"
              value={mode}
              onChange={(value) => {
                console.log('ToggleButtonGroup onChange:', value);
                setMode(value);
                if (draw.current) {
                  try {
                    if (value === 'point') {
                      draw.current.set({
                        type: 'FeatureCollection',
                        features: []
                      });
                      if (typeof draw.current.changeMode === 'function') {
                        draw.current.changeMode('simple_select', {
                          displayControlsDefault: false,
                          controls: {}
                        });
                      } else {
                        console.error('changeMode method is not available on draw.current');
                      }
                    } else if (value === 'polygon') {
                      if (typeof draw.current.changeMode === 'function') {
                        draw.current.changeMode('draw_polygon', {
                          displayControlsDefault: false,
                          controls: {
                            polygon: true,
                            trash: true
                          }
                        });
                      } else {
                        console.error('changeMode method is not available on draw.current');
                      }
                    }
                  } catch (error) {
                    console.error('Error setting draw mode:', error);
                  }
                } else {
                  console.error('draw.current is not initialized');
                }
              }}
            >
              <ToggleButton
                id="point-mode"
                value="point"
                variant={mode === 'point' ? 'success' : 'outline-success'}
              >
                Point
              </ToggleButton>
              <ToggleButton
                id="area-mode"
                value="area"
                variant={mode === 'area' ? 'success' : 'outline-success'}
              >
                Area
              </ToggleButton>
            </ToggleButtonGroup>
          </div>

          {mode === 'area' && (
            <div style={{
              position: 'absolute',
              top: '60px',
              left: '10px',
              zIndex: 2,
              background: 'white',
              padding: '5px',
              borderRadius: '5px',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'}}>
              <Form.Group controlId="areaSelect">
                <Form.Label>Select Area</Form.Label>
                <Form.Select
                  value={selectedAreaName}
                  onChange={(e) => {
                    const selectedAreaName = e.target.value;
                    console.log('Selected Area Name:', selectedAreaName);
                    setSelectedAreaName(selectedAreaName);
                    highlightArea(selectedAreaName);

                    // removes previsous area if there is one
                    let features = draw.current.getAll().features;
                    if (features.length > 0) {
                      draw.current.delete(features[0].id); // Rimuovi la prima area se ce ne sono più di una
                      features.splice(0, 1); // Remove the first feature
                    }
                    
                    if (centroidMarker) {
                      console.log('Removing existing centroid marker on update');
                      centroidMarker.remove();
                      setCentroidMarker(null);
                    }

                  }}
                >
                  <option value="">Select an area</option>
                  {Array.isArray(areaNames) && areaNames.map(area => (
                    <option key={area.areaName} value={area.areaName}>
                      {area.areaName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="areaNameInput">
                <Form.Label>Name the Area</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter area name"
                  value={areaNameInput}
                  onChange={(e) => setAreaNameInput(e.target.value)}
                />
              </Form.Group>
            </div>
          )}

        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button style={{ backgroundColor: '#28a745', border: 'none' }} onClick={handleSave}>
          Save Location
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

MapModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  onLocationSelect: PropTypes.func.isRequired,
  documentId: PropTypes.string,
  selectedAreaName: PropTypes.string,
  setSelectedAreaName: PropTypes.string,
  areaNameInput: PropTypes.string,
  setAreaNameInput: PropTypes.string,

};

export default MapModal;
