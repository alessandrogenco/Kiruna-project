import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, ToggleButtonGroup, ToggleButton, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import * as turf from '@turf/turf';

const MapModal = ({ show, handleClose, onLocationSelect, documentId }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const draw = useRef(null);
  const [position, setPosition] = useState(null);
  const [pointMarker, setPointMarker] = useState(null);
  const [markerElement, setMarkerElement] = useState(null);
  const [el, setEl] = useState(null);
  const [mode, setMode] = useState('area');
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [existingGeoreferencingData, setExistingGeoreferencingData] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [areaCentroid, setAreaCentroid] = useState(null);
  const [centroidMarker, setCentroidMarker] = useState(null);
  const [currentAreaId, setCurrentAreaId] = useState(null);
  const [areaSet, setAreaSet] = useState(false);

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

        if (mode == 'area'){
          filteredData = existingGeoreferencingData.filter(item => item.area);
        }

        // Add existing georeferencing points/areas to the map
        if (filteredData) {
          filteredData.forEach((item) => {
            // Check if lat and lon are valid numbers
            //console.log(item);

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
                el.innerHTML = `<i class="${iconClass}"></i>`;

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
                  } else if (mode === 'area' && item.area){
                    const areaGeoJson = JSON.parse(JSON.parse(item.area));
                    console.log('Area data loaded for the selected point:', areaGeoJson);

                    // Rimuovi l'area attuale se già presente
                    let features = draw.current.getAll().features;
                    if (features.length === 1) {
                      draw.current.delete(features[0].id);  // Rimuovi la prima area se ce ne sono più di una
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
                    setAlertMessage('Selected an area associated with the point.');
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
              features.remove(features[0]);
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
            if (polygon) {
              const centroid = turf.centroid(polygon);
              setAreaCentroid(centroid.geometry.coordinates);
              displayCentroidMarker(centroid.geometry.coordinates);
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
      //updateDocumentGeoreference('documentId', position[0], position[1], null);
    } else if (mode === 'area') {
      const drawnFeatures = draw.current.getAll();

      if (drawnFeatures.features.length > 0) {
        const geoJsonString = JSON.stringify({ type: 'FeatureCollection', features: drawnFeatures.features });
        onLocationSelect({ type: 'area', geometry: geoJsonString });
        //updateDocumentGeoreference('documentId', areaCentroid[1], areaCentroid[0], geoJsonString);
      } else if (geoJsonData) {
        const geoJsonString = JSON.stringify({ type: 'FeatureCollection', features: geoJsonData.features });
        onLocationSelect({ type: 'area', geometry: geoJsonString });
        //updateDocumentGeoreference('documentId', null, null, geoJsonString);
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
                zIndex: 2 }}>
              {alertMessage}
            </Alert> )}
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
                 setMode(value);

                if (draw.current) {
                  try {
                  // Check if deleteAll exists before calling it
                  // if (typeof draw.current.deleteAll === 'function') {
                  //   draw.current.deleteAll();
                  //     } else {
                  //       console.error('deleteAll method is not available on draw.current');
                  //     }
                      if (value === 'point') {
                        draw.current.set({
                          type: 'FeatureCollection',
                          features: [] // Ensure valid GeoJSON structure
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
  documentId: PropTypes.string, // Add documentId prop type
};

export default MapModal;
