import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapModal.css';


const MapModal = ({ show, handleClose, onLocationSelect }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [position, setPosition] = useState(null);

  const MAPBOX_TOKEN = "pk.eyJ1IjoiYWxlc3NhbmRyb2cwOCIsImEiOiJjbTNiZzFwbWEwdnU0MmxzYTdwNWhoY3dpIn0._52AcWROcPOQBr1Yz0toKw";

  useEffect(() => {
    if (show && mapContainer.current && !map.current) {
      mapboxgl.accessToken = MAPBOX_TOKEN;
  
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [20.25, 67.85], 
        zoom: 12,
        maxBounds: [[20.1200, 67.82], [20.400, 67.8800]],

      });
  
      map.current.on('load', () => {
        map.current.resize();
      });
  
      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        setPosition([lat, lng]);
  
        if (marker.current) {
          marker.current.setLngLat([lng, lat]);
        } else {
          marker.current = new mapboxgl.Marker({ color: '#007cbf' })
            .setLngLat([lng, lat])
            .addTo(map.current);
        }
      });
    }
  
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
  }, [show]);
  
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
        <div ref={mapContainer} style={{ height: '400px', width: '100%' }} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={!position}>
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
