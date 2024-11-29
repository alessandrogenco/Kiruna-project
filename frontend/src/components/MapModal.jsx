import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, ToggleButtonGroup, ToggleButton, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import * as turf from '@turf/turf';

const MapModal = ({ show, handleClose, onLocationSelect, existingGeoreferencingData }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const draw = useRef(null);
  const [position, setPosition] = useState(null);
  const [mode, setMode] = useState('point');
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const MAPBOX_TOKEN = "pk.eyJ1IjoiYWxlc3NhbmRyb2cwOCIsImEiOiJjbTNiZzFwbWEwdnU0MmxzYTdwNWhoY3dpIn0._52AcWROcPOQBr1Yz0toKw";

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

        // try {
        //   const documentResponse = await fetch('/api/getDocumentLocations');
        //   if (!documentResponse.ok) 
        //     throw new Error(`Failed to load document location: ${documentResponse.statusText}`);
        //   const documentLocation = await documentResponse.json();

        //   if (documentLocation.type === 'point') {
        //     new mapboxgl.Marker()
        //       .setLonLat([documentLocation.coordinates[1], documentLocation.coordinates[0]]) // [lng, lat]
        //       .addTo(map.current);
        //   } else if (documentLocation.type === 'area') {
        //     const polygon = turf.polygon(documentLocation.geometry.coordinates);
        //     map.current.addLayer({
        //       id: 'document-boundary',
        //       type: 'fill',
        //       source: {
        //         type: 'geojson',
        //         data: polygon,
        //       },
        //       paint: {
        //         'fill-color': '#ff5733',
        //         'fill-opacity': 0.5,
        //       },
        //     });
        //   }
        // } catch (error) {
        //   console.error('Error loading GeoJSON or document location:', error.message);
        //   setAlertMessage('Error loading map or document location. Please try again later.');
        // }

        // Add existing georeferencing points/areas to the map
        if (existingGeoreferencingData) {
          existingGeoreferencingData.forEach((item) => {
            if (item.type === 'point') {
              new mapboxgl.Marker({ color: '#ff5733' })
                .setLngLat([item.coordinates[1], item.coordinates[0]]) // [latitude, longitude]
                .addTo(map.current)
                .getElement().addEventListener('click', () => {
                  setPosition([item.coordinates[0], item.coordinates[1]]);
                  setAlertMessage('');
                });
            } else if (item.type === 'area') {
              const polygon = turf.polygon(item.geometry.coordinates);
              map.current.addLayer({
                id: `area-${item.id}`,
                type: 'fill',
                source: {
                  type: 'geojson',
                  data: polygon,
                },
                paint: {
                  'fill-color': '#ff5733',
                  'fill-opacity': 0.5,
                },
              });

              map.current.on('click', `area-${item.id}`, () => {
                setPosition(item.geometry.coordinates);
                setAlertMessage('');
              });
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
    } else if (mode === 'area') {
      const drawnFeatures = draw.current.getAll();
      if (drawnFeatures.features.length === 0) {
        setAlertMessage('Please draw an area before saving.');
        return;
      }
      onLocationSelect({ type: 'area', geometry: drawnFeatures });
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
                if (value === 'point') {
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
        <Button variant="danger" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="success" onClick={handleSave}>
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
  existingGeoreferencingData: PropTypes.array.isRequired,
};

export default MapModal;
