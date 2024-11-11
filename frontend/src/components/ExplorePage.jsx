import React, { useEffect, useRef, useState } from 'react';
import PropTypes from "prop-types";
import AppNavbar from './Navbar';
import { Row, Col } from 'react-bootstrap';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Supercluster from 'supercluster';
import documentIcon from '../assets/document.png';
import '../styles/ExplorePage.css';


function ExplorePage(props) {
  const MAPBOX_TOKEN = "pk.eyJ1IjoiYWxlc3NhbmRyb2cwOCIsImEiOiJjbTNiZzFwbWEwdnU0MmxzYTdwNWhoY3dpIn0._52AcWROcPOQBr1Yz0toKw";
  
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [currentStyle, setCurrentStyle] = useState('streets');

  const markers = [
    { lat: 67.8558, lng: 20.2253, label: 'Kiruna Center' },
    { lat: 67.8575, lng: 20.2258, label: 'Kiruna Station' },
    { lat: 67.8550, lng: 20.2251, label: 'Marker A' },
    { lat: 67.8560, lng: 20.2260, label: 'Marker B' },
    { lat: 67.8545, lng: 20.2248, label: 'Marker C' },
  ];

  const cluster = useRef(null);
  const markersLayer = useRef(null);

  useEffect(() => {
    if (!map) {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [20.2253, 67.8558],
        zoom: 9,
        pitch: 0,
        bearing: 0,
        projection: 'mercator',
        antialias: true,
        maxZoom: 16,
        minZoom: 8,
        maxBounds: [[20.1200, 67.82], [20.400, 67.8800]],
        attributionControl: false,
      });

      mapInstance.on('load', () => {
        setMap(mapInstance);
      });
    }
  }, [map, MAPBOX_TOKEN]);

  const createCluster = (markersData) => {
    const points = markersData.map(marker => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [marker.lng, marker.lat] },
      properties: { label: marker.label }
    }));

    const clusterInstance = new Supercluster({
      radius: 40,
      maxZoom: 16,
    }).load(points);

    return clusterInstance;
  };

  const updateMarkers = () => {
    if (map && cluster.current) {
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
      clusters.forEach(clusterPoint => {
        const { geometry, properties } = clusterPoint;

        if (properties.cluster) {
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="padding-top: 8px; display: flex; flex-direction: column;">
              <div style="flex-grow: 1;">${properties.point_count_abbreviated} Document(s)</div>
            </div>`);

          const marker = new mapboxgl.Marker({
            color: 'green',
            element: createClusterIcon(properties.point_count_abbreviated),
          })
            .setLngLat(geometry.coordinates)
            .setPopup(popup)
            .addTo(map);

          markersArray.push(marker);
        } else {
          const iconElement = document.createElement('div');
          iconElement.style.width = '30px';
          iconElement.style.height = '30px';
          iconElement.style.backgroundSize = 'cover';
          iconElement.style.backgroundColor = '#CB1E3B';
          iconElement.style.borderRadius = '50%';
          iconElement.style.border = '2px solid white';
          iconElement.style.backgroundImage = `url(${documentIcon})`;

          const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div style="padding-top: 8px; display: flex; flex-direction: column;">
                <div style="flex-grow: 1;">${properties.label}</div>
              </div>`);


          const marker = new mapboxgl.Marker({
            element: iconElement,
          })
            .setLngLat(geometry.coordinates)
            .setPopup(popup)
            .addTo(map);

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
    if (map) {
      cluster.current = createCluster(markers);
      map.on('move', updateMarkers);
      updateMarkers();
    }
  }, [map]);

  const handleMapStyleChange = (style) => {
    if (map) {
      const styleUrl = `mapbox://styles/mapbox/${style}-v9`;
      map.setStyle(styleUrl);
      setCurrentStyle(style);
    }
  };

  const MapStyleToggleButton = ({ style, label }) => {
    const isActive = currentStyle === style;
    return (
      <button
        className='toggle'
        onClick={() => handleMapStyleChange(style)}
        style={{backgroundColor: isActive ? '#146726' : '#28a745'}}>
        {label}
      </button>
    );
  };

  return (
    <>
      <AppNavbar isLoggedIn={props.isLoggedIn} handleLogout={props.handleLogout} />
      <Row className="vh-80 justify-content-center align-items-center">
        <Col style={{ width: '100%', height: '92vh' }}>
          <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
        </Col>
      </Row>
      <div style={{
        position: 'absolute', top: 90, right: 20, zIndex: 1,
        backgroundColor: '#F0F0F0', padding: '7px', borderRadius: '8px',
        display: 'flex', flexDirection: 'column', gap: '2px'
      }}>
        <MapStyleToggleButton style="streets" label="Streets" />
        <MapStyleToggleButton style="satellite" label="Satellite" />
      </div>
    </>
  );
}

ExplorePage.propTypes = {
  isLoggedIn: PropTypes.bool,
  handleLogout: PropTypes.func,
};

export default ExplorePage;

