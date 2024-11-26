import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapModal = ({ show, handleClose, onLocationSelect }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [position, setPosition] = useState(null);
  const [mode, setMode] = useState('point');

  const MAPBOX_TOKEN = "pk.eyJ1IjoiYWxlc3NhbmRyb2cwOCIsImEiOiJjbTNiZzFwbWEwdnU0MmxzYTdwNWhoY3dpIn0._52AcWROcPOQBr1Yz0toKw";

  useEffect(() => {
    if (show && mapContainer.current && !map.current) {
      mapboxgl.accessToken = MAPBOX_TOKEN;
  
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [20.25, 67.85], 
        zoom: 12,
        maxBounds: [[20.12, 67.82], [20.40, 67.88]], 
      });
  
      map.current.on('load', () => {
        map.current.resize();
      });
  
      map.current.on('click', (e) => {
        if (mode === 'point'){
        const { lng, lat } = e.lngLat; 
  
        if (lng < 20.1200 || lng > 20.4000 || lat < 67.82 || lat > 67.8800) {
          alert("Selected coordinates are out of Kiruna Municipality borders!");
          return;
        }
  
        setPosition([lat, lng]);
  
        if (marker.current) {
          marker.current.setLngLat([lng, lat]); 
        } else {
          marker.current = new mapboxgl.Marker({ color: '#007cbf' })
            .setLngLat([lng, lat]) 
            .addTo(map.current);
        }
      } else {
        alert ("Area selection mode is under development!")
      }
      });
    };
  
    if (show && map.current) {
      setTimeout(() => {
        map.current.resize();
      }, 200);
    }
  
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        marker.current = null;
      }
    };
  }, [show, mode]);
  
  const handleSave = () => {
    if (position) {
      onLocationSelect(position);
      handleClose();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Select Location</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{ position: 'relative', height: '400px', width: '100%' }}>
          {/* Map container */}
          <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />

          {/* Toggle overlay */}
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
              onChange={(value) => setMode(value)}
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
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="success" onClick={handleSave} disabled={!position}>
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
