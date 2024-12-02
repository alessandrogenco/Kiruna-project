import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, ToggleButtonGroup, ToggleButton, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import * as turf from '@turf/turf';

const MapModal = ({ show, handleClose, onLocationSelect }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const draw = useRef(null);
  const [position, setPosition] = useState(null);
  const [mode, setMode] = useState('point');
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [existingGeoreferencingData, setExistingGeoreferencingData] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const MAPBOX_TOKEN = "pk.eyJ1IjoiYWxlc3NhbmRyb2cwOCIsImEiOiJjbTNiZzFwbWEwdnU0MmxzYTdwNWhoY3dpIn0._52AcWROcPOQBr1Yz0toKw";

  // Fetch document locations when the modal is opened
  useEffect(() => {
    if (show) {
      fetchDocumentLocations();
    }
  }, [show]);

  const fetchDocumentLocations = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/getDocumentLocations');
      console.log('Response Status:', response.status);
      const text = await response.text();
      
      if (!response.ok) throw new Error('Failed to fetch document locations');
      const data = JSON.parse(text); 
      console.log(data); 

      setExistingGeoreferencingData(data); 
    } catch (error) {
      console.error('Error fetching document locations:', error.message);
      alert('Error fetching document locations: ' + error.message);
    }
  };

  useEffect(() => {
    if (show && mapContainer.current && !map.current) {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [20.25, 67.85],
        zoom: 11,
        maxBounds: [[17.8998, 67.3562], [23.2867, 69.0599]],
      });

      map.current.on('load', async () => {
        map.current.resize();

        try {
          const response = await fetch('/KirunaMunicipality.geojson');
          if (!response.ok) throw new Error('Failed to load GeoJSON');
          const geojson = await response.json();
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

        // Add existing georeferencing points/areas to the map
        if (existingGeoreferencingData) {
          existingGeoreferencingData.forEach((item) => {
              // Check if lat and lon are valid numbers
              if (item.lat && item.lon && !isNaN(item.lat) && !isNaN(item.lon)) {
                  const coordinates = [parseFloat(item.lon), parseFloat(item.lat)];
  
                  if (item.area) {
                      try {
                          const areaGeoJson = JSON.parse(item.area);
  
                          // Check if the GeoJSON is correctly structured
                          if (areaGeoJson.type === 'FeatureCollection' && Array.isArray(areaGeoJson.features)) {
                              areaGeoJson.features.forEach((feature) => {

                                  // Check if feature is a Polygon and has valid coordinates
                                  if (feature.geometry && feature.geometry.type === 'Polygon') {
                                      const polygonCoordinates = feature.geometry.coordinates;
  
                                      if (polygonCoordinates && Array.isArray(polygonCoordinates) && polygonCoordinates.length > 0) {
                                          
                                          polygonCoordinates.forEach((ring) => {

                                            if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) {
                                              ring.push(ring[0]); 
                                          }
                                          });
  
                                          // Creating a turf polygon to handle the geometry properly
                                          const polygon = turf.polygon(polygonCoordinates);
  
                                          // Add this polygon to the map
                                          const sourceId = `area-${item.id}`;
                                          if (map.current) {
                                              map.current.addSource(sourceId, {
                                                  type: 'geojson',
                                                  data: polygon,
                                              });
  
                                              map.current.addLayer({
                                                  id: sourceId,
                                                  type: 'fill',
                                                  source: sourceId,
                                                  paint: {
                                                      'fill-color': '#ff5733',
                                                      'fill-opacity': 0.5,
                                                  },
                                              });
  
                                              map.current.on('click', sourceId, () => {
                                                  if (mode === 'select') {
                                                      setPosition(item.geometry.coordinates);
                                                      setAlertMessage('Selected an existing area.');
                                                  }
                                              });
                                          }
                                      } else {
                                          console.warn(`Invalid coordinates for Polygon in document ${item.id}:`, polygonCoordinates);
                                      }
                                  } else {
                                      console.warn(`Invalid geometry type for feature ${feature.id}:`, feature.geometry.type);
                                  }
                              });
                          } else {
                              console.warn(`Invalid GeoJSON format for document ${item.id}:`, areaGeoJson);
                          }
                      } catch (err) {
                          console.error('Error parsing area GeoJSON for document', item.id, err);
                      }
                  } else {
                      const pointMarker = new mapboxgl.Marker({ color: '#ff5733' })
                          .setLngLat(coordinates)
                          .addTo(map.current);
  
                      pointMarker.getElement().addEventListener('click', () => {
                          if (mode === 'select') {
                              setPosition([item.lat, item.lon]);
                              setAlertMessage('Selected an existing point.');
                          }
                      });
                  }
              } else {
                  console.warn(`Invalid lat/lon for document ${item.id}:`, item);
              }
          });
      }
      });

      // Initialize Mapbox Draw
      draw.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
      });
      map.current.addControl(draw.current, 'top-right');

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
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        marker.current = null;
      }
    };
  }, [show, mode, existingGeoreferencingData]);

  const isWithinBounds = (lon, lat, geojson) => {
    const point = turf.point([lon, lat]);

    const isInside = geojson.features[0].geometry.coordinates.some((polygonCoordinates) => {
      const polygon = turf.polygon(polygonCoordinates);
      return turf.booleanPointInPolygon(point, polygon);
    });

    return isInside;
  };

  const handleSave = () => {
    if (mode === 'point' && position) {
      onLocationSelect({ type: 'point', coordinates: position });
      updateDocumentGeoreference('someDocumentId', position[0], position[1], null); 
    }
     else if (mode === 'area') {
      const drawnFeatures = draw.current.getAll();

      if (drawnFeatures.features.length > 0) {
        const geoJsonString = JSON.stringify({ type: 'FeatureCollection', features: drawnFeatures.features });
        onLocationSelect({ type: 'area', geometry: geoJsonString });
        updateDocumentGeoreference('someDocumentId', null, null, geoJsonString); 

      } else if (geoJsonData) {
          const geoJsonString = JSON.stringify({ type: 'FeatureCollection', features: geoJsonData.features });
          onLocationSelect({ type: 'area', geometry: geoJsonString });
          updateDocumentGeoreference('someDocumentId', null, null, geoJsonString); 

        } else {
          setAlertMessage('Error: Default municipality boundary is unavailable.');
          return;
        }
    } else if (mode === 'select' && position) {
      onLocationSelect({ type: 'select', coordinates: position });
      updateDocumentGeoreference('someDocumentId', position[0], position[1], null); 

    }

    handleClose();
  };

  const updateDocumentGeoreference = async (id, lat, lon, area) => {
  
    try {
      const response = await fetch('http://localhost:3001/api/updateDocumentGeoreference'
      , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, lat, lon, area }),
      });
  
      console.log('Response Status:', response.status);
      const result = await response.json();
      console.log('Response Body:', result);
  
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update georeferencing');
      }
  
      alert(result.message);
    } catch (error) {
      console.error('Error updating georeferencing:', error);
      alert('Failed to update georeferencing');
    }
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
              variant="warning"
              onClose={() => setAlertMessage('')}
              dismissible
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 2,
              }}
            >
              {alertMessage}
            </Alert>
          )}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 1,
              background: 'white',
              padding: '5px',
              borderRadius: '5px',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <ToggleButtonGroup
              type="radio"
              name="mode"
              value={mode}
              onChange={(value) => {
                setMode(value);
                if (value === 'point' || value === 'select') {
                  draw.current.deleteAll();
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
              <ToggleButton
                id="select-mode"
                value="select"
                variant={mode === 'select' ? 'success' : 'outline-success'}
              >
                Select
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave}>
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
};

export default MapModal;
