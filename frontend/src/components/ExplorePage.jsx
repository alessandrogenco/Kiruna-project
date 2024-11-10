import React, { useEffect, useRef, useState } from 'react';
import PropTypes from "prop-types";
import AppNavbar from './Navbar';
import { Row, Col } from 'react-bootstrap';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'; // Import Mapbox CSS
import Supercluster from 'supercluster'; // Import the Supercluster module for clustering

function ExplorePage(props) {
  const MAPBOX_TOKEN = "pk.eyJ1IjoiYWxlc3NhbmRyb2cwOCIsImEiOiJjbTNiZzFwbWEwdnU0MmxzYTdwNWhoY3dpIn0._52AcWROcPOQBr1Yz0toKw"; // Use the token from the .env file

  const mapContainer = useRef(null);  // Reference to the DOM element for the map
  const [map, setMap] = useState(null); // State to hold the map instance

  // Markers in Kiruna
  const markers = [
    { lat: 67.8558, lng: 20.2253, label: 'Kiruna Center' },
    { lat: 67.8575, lng: 20.2258, label: 'Kiruna Station' },
    { lat: 67.8550, lng: 20.2251, label: 'Marker A' },
    { lat: 67.8560, lng: 20.2260, label: 'Marker B' },
    { lat: 67.8545, lng: 20.2248, label: 'Marker C' },
    // Add more markers to test clustering
  ];

  const cluster = useRef(null); // Reference to the marker cluster
  const markersLayer = useRef(null); // Reference for the map layers

  // Initialize the map
  useEffect(() => {
    if (!map) {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current, // Reference to the DOM element
        style: 'mapbox://styles/mapbox/streets-v11', // Initial map style (Streets)
        center: [20.2253, 67.8558], // Kiruna's coordinates
        zoom: 9,
        pitch: 0, // Disable tilt for a 2D view
        bearing: 0, // Map orientation
        projection: 'mercator', // Mercator projection for standard 2D view
        antialias: true, // Improve map rendering quality
        maxZoom: 16, // Limit maximum zoom to 16
        minZoom: 8, // Limit minimum zoom to 8
        maxBounds: [
          [20.1200, 67.82], // Lower bounds of the map (Longitude, Latitude)
          [20.400, 67.8800]  // Upper bounds of the map
        ] // Set map view limits for Kiruna
      });

      mapInstance.on('load', () => {
        // Remove 3D building visibility (if any)
        mapInstance.setLayoutProperty('building', 'visibility', 'none');

        // Remove all labels from the map
        mapInstance.setLayoutProperty('poi-label', 'visibility', 'none'); // Points of interest labels (e.g., shops)
        mapInstance.setLayoutProperty('poi', 'visibility', 'none'); // Points of interest
        mapInstance.setLayoutProperty('road-label', 'visibility', 'none'); // Road labels
        mapInstance.setLayoutProperty('road', 'visibility', 'none'); // Roads
        mapInstance.setLayoutProperty('place-label', 'visibility', 'none'); // Place labels (e.g., cities)
        mapInstance.setLayoutProperty('administrative', 'visibility', 'none'); // Administrative labels
        mapInstance.setLayoutProperty('water-label', 'visibility', 'none'); // Water labels
      });

      setMap(mapInstance);
    }
  }, [map, MAPBOX_TOKEN]);

  // Function to create clusters
  const createCluster = (markersData) => {
    // Create points for clustering
    const points = markersData.map(marker => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [marker.lng, marker.lat]
      },
      properties: { label: marker.label }
    }));

    // Create the cluster instance
    const clusterInstance = new Supercluster({
      radius: 40, // Clustering radius (distance between points)
      maxZoom: 16  // Max zoom level for separating clusters
    }).load(points);

    return clusterInstance;
  };

  // Function to add or remove markers from the map
  const updateMarkers = () => {
    if (map && cluster.current) {
      const bounds = map.getBounds();
      const zoom = map.getZoom();

      // Get clusters based on bounds and zoom level
      const clusters = cluster.current.getClusters(
        [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
        zoom
      );

      // Remove old markers
      if (markersLayer.current) {
        markersLayer.current.forEach(marker => marker.remove());
      }

      // Add new clusters to the map
      const markersArray = [];
      clusters.forEach(clusterPoint => {
        const { geometry, properties } = clusterPoint;

        // Popup showing the number of markers in the cluster
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          ${properties.point_count_abbreviated} Document(s)
        `);

        // Create a marker for the cluster
        const marker = new mapboxgl.Marker({
          color: 'green',
          element: createClusterIcon(properties.point_count_abbreviated) // Use a function to create custom icon
        })
          .setLngLat(geometry.coordinates)
          .setPopup(popup)
          .addTo(map);

        markersArray.push(marker);
      });

      markersLayer.current = markersArray; // Update the reference for markers
    }
  };

  // Function to create a custom icon for the cluster
  const createClusterIcon = (count) => {
    const div = document.createElement('div');
    div.style.backgroundColor = '#D21F3C'; // Red color for the cluster
    div.style.borderRadius = '50%';
    div.style.border = '2px solid white';
    div.style.color = 'white';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.style.width = '30px';
    div.style.height = '30px';
    div.style.fontSize = '15px';
    div.innerHTML = count; // Display the number of markers in the cluster
    return div;
  };

  // Add clusters to the map when the map moves
  useEffect(() => {
    if (map) {
      cluster.current = createCluster(markers); // Create the initial cluster

      // Listen to the 'move' event to update markers when the map moves
      map.on('move', updateMarkers);

      // Initialize markers
      updateMarkers();
    }
  }, [map]);

  // Function to switch the map style
  const switchMapStyle = (style) => {
    map.setStyle(style);
  };

  return (
    <>
      <AppNavbar isLoggedIn={props.isLoggedIn} handleLogout={props.handleLogout} />
      <Row className="vh-80 justify-content-center align-items-center">
        <Col style={{ width: '100%', height: '90vh' }}>
          <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
        </Col>
      </Row>
      <div style={{
        position: 'absolute', top: 90, right: 20, zIndex: 1,
        backgroundColor: '#F0F0F0', padding: '7px', borderRadius: '8px',
        display: 'flex', flexDirection: 'column', gap: '2px'
      }}>
        {/* Buttons to switch map styles */}
        <button
          onClick={() => switchMapStyle('mapbox://styles/mapbox/streets-v11')}
          style={buttonStyle}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'} // Darker green
          onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'} // Return to normal green
        >
          Streets
        </button>
        <button
          onClick={() => switchMapStyle('mapbox://styles/mapbox/satellite-v9')}
          style={buttonStyle}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#218838'} // Darker green
          onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'} // Return to normal green
        >
          Satellite
        </button>
      </div>
    </>
  );
}

ExplorePage.propTypes = {
  isLoggedIn: PropTypes.bool,
  handleLogout: PropTypes.func,
};

// Button style for switching map type
const buttonStyle = {
  margin: '2px',
  padding: '8px 20px',
  backgroundColor: '#28a745', // Green color as buttons
  color: 'white',
  border: 'none',
  borderRadius: '7px',
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'background-color 0.3s ease',
};

export default ExplorePage;
