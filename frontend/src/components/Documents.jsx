import React, { useState } from 'react';
import { Modal, Button, Form, FormControl } from 'react-bootstrap';
import './Documents.css'; // Import the CSS file
import {deleteDocument, updateDocument} from '../API.mjs'; // Import the API module
import PropTypes from 'prop-types';

function Documents({ documents, setDocuments }) {
  const [stakeholdersList, setStakeholdersList] = useState([]);
  const [scalesList, setScalesList] = useState([]);
  const [typesList, setTypesList] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null); // State for selected document
  const [showFormModal, setShowFormModal] = useState(false); // State to control the form modal
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [selectedArea, setSelectedArea] = useState('');
  const [newDocument, setNewDocument] = useState({
    title: '',
    stakeholders: '',
    scale: '',
    date: '',
    type: '',
    connections: '',
    language: '',
    pages: '',
    lat: '',
    lon: '',
    area: '',
    description: ''
  });

  const handleAddDocument = async () => {

    const documentData = {
      title: newDocument.title,
      stakeholders: newDocument.stakeholders,
      scale: newDocument.scale,
      date: newDocument.date,
      type: newDocument.type,
      connections: newDocument.connections,
      language: newDocument.language,
      pages: newDocument.pages,
      lat: newDocument.lat,
      lon: newDocument.lon,
      area: newDocument.area,
      description: newDocument.description
    };

    //console.log(documentData);

    try {
        const response = await fetch('http://localhost:3001/api/addDocument', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(documentData),
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const addedDocument = await response.json();
        setDocuments((prevDocuments) => [...prevDocuments, addedDocument]);
        setNewDocument({ title: '', stakeholders: '', scale: '', date: '', type: '', connections: '', language: '', pages: '', lat: '', lon: '', area:'', description: '' });
        setShowFormModal(false);
    } catch (error) {
        console.error('Error adding document:', error);

    }
  };

  const fetchStakeholders = async () => {
    try {
      const response = await axios.get('/api/documents/stakeholders');
      setStakeholdersList(response.data);
    } catch (error) {
      console.error('Error fetching stakeholders:', error.message);
    }
  };

  const fetchScales = async () => {
    try {
      const response = await axios.get('/api/documents/scales');
      setScalesList(response.data);
    } catch (error) {
      console.error('Error fetching stakeholders:', error.message);
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await axios.get('/api/documents/types');
      setTypesList(response.data);
    } catch (error) {
      console.error('Error fetching stakeholders:', error.message);
    }
  };


  const handleDeleteSelectedDocument = async () => {
    if (!selectedDocument) {
      alert('Please select a document to delete.');
      return;
    }

    try {
      await deleteDocument(selectedDocument.id);
      setDocuments((prevDocuments) => prevDocuments.filter((doc) => doc.id !== selectedDocument.id));
      setSelectedDocument(null);
      setShowFormModal(false);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };


  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
    setNewDocument({
      title: document.title || '',
      stakeholders: document.stakeholders || '',
      scale: document.scale || '',
      date: document.date || '',
      type: document.type || '',
      connections: document.connections || '',
      language: document.language || '',
      pages: document.pages || '',
      lat: document.lat || '',
      lon: document.lon || '',
      area: document.area || '',
      description: document.description || ''
    });

    setShowFormModal(true);
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setNewDocument({
      title: '',
      stakeholders: '',
      scale: '',
      date: '',
      type: '',
      connections: '',
      language: '',
      pages: '',
      lat: '',
      lon: '',
      area: '',
      description: ''
    });

    setSelectedDocument(null);
  };

  const handleNewDocumentChange = (e) => {
    const { name, value } = e.target;
    setNewDocument((prevDocument) => ({
      ...prevDocument,
      [name]: value,
    }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredDocuments = documents.filter((document) =>
    document.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // validates the latitude coordinates
  function validateLatitude(e){
      let value = e.target.value;

      // check of the correct lat value
      if (value != '' && (value < 67.7500 || value > 68.3333)) {
        alert("Latitude is out of Kiruna Municipality borders!");
        setNewDocument((prevDocument) => ({
          ...prevDocument,
          lat: '',
        }));
      }
  }

  // validates the lognitude coordinates
  function validateLongitude(e){
    let value = e.target.value;

    // check of the correct lat value
    if (value != '' && (value < 20.7833 || value > 21.1333)) {
      alert("Longitude is out of Kiruna Municipality borders!");
      setNewDocument((prevDocument) => ({
        ...prevDocument,
        lon: '',
      }));
    }
}

const handleUpdateDocument = async () => {

  if (!newDocument.lat ^ !newDocument.lon) {
    alert('Please enter both latitude and longitude.');
    return;
  }

  if (newDocument.area !== '' && (newDocument.lat || newDocument.lon)) {
    alert('Please enter either area or latitude and longitude.');
    return;
  }

  newDocument.id = selectedDocument.id;
  try {
    const result = await updateDocument(
      newDocument.id,
      newDocument.title,
      newDocument.stakeholders,
      newDocument.scale,
      newDocument.issuanceDate,
      newDocument.type,
      newDocument.connections,
      newDocument.language,
      newDocument.pages,
      newDocument.lat,
      newDocument.lon,
      newDocument.area,
      newDocument.description
    );

    setDocuments((prevDocuments) =>
      prevDocuments.map((doc) =>
        doc.id === newDocument.id ? { ...doc, ...newDocument } : doc
      )
    );

    setShowFormModal(false);
    setSelectedDocument(null);
  } catch (error) {
    console.error('Error updating document:', error);
  }
};

  return (
    <div className="documents-container" style={{marginTop: '-1em'}}>
      <Form className="d-flex mb-3">
        <FormControl
          type="search"
          placeholder="Search documents"
          className="me-2"
          aria-label="Search"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </Form>
      <div className="d-flex justify-content-center">
        <Button className="w-75 mb-1" variant="primary" onClick={() => setShowFormModal(true)}>
          Add Document
        </Button>
      </div>

      <ul>
        {filteredDocuments.map((document) => (
          <li className='my-3' key={document.id} onClick={() => handleDocumentClick(document)}>
            <div>
              <strong style={{ marginTop: '-0.4em'}}>{document.title}</strong>
              <p style={{ marginTop: '0.2em', marginBottom: '-5px' }}>{document.description}</p>
            </div>
          </li>
        ))}
      </ul>
      
      <Modal className='modal-xl' show={showFormModal} onHide={handleCloseFormModal}>
        <Modal.Header closeButton>
        <Modal.Title>{selectedDocument ? 'Edit Document' : 'Add Document'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          { (
            <Form>
              <Form.Group controlId="formTitle">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter title"
                  name="title"
                  value={newDocument.title}
                  onChange={handleNewDocumentChange}/>
              </Form.Group>
              <Form.Group className="mt-3" controlId="formStakeholders">
        <Form.Label>Stakeholders</Form.Label>
        <Form.Control
          as="select"
          name="stakeholders"
          value={newDocument.stakeholders}
          onChange={handleNewDocumentChange}
          onClick={fetchStakeholders} // Recupera la lista degli stakeholder al click
        >
          <option value="">Select a stakeholder</option>
          {stakeholdersList.map((stakeholder) => (
            <option key={stakeholder.id} value={stakeholder.name}>
              {stakeholder.name}
            </option>
          ))}
          <option value="add_new">Add new</option>
        </Form.Control>
      </Form.Group>
              <Form.Group className="mt-3" controlId="formScale">
                <Form.Label>Scale</Form.Label>
                <Form.Control
                  as="select"
                  placeholder="Enter scale"
                  name="scale"
                  value={newDocument.scale}
                  onChange={handleNewDocumentChange}
                  onClick={fetchScales}
                  >
                  <option value="">Select a scale</option>
                  {scalesList.map((scale) => (
                    <option key={scale.name} value={scale.name}>
                      {scale.name}
                    </option>
                  ))}
                  <option value="add_new">Add new</option>
                   </Form.Control>
              </Form.Group>
              <Form.Group className="mt-3" controlId="formDate">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={newDocument.date}
                  onChange={handleNewDocumentChange}
                />
              </Form.Group>
              <Form.Group className="mt-3" controlId="areaText">
                <Form.Label>Area</Form.Label>
                <Form.Control as="select" name="area" value={newDocument.area} onChange={handleNewDocumentChange}>
                  <option value="">Select the area</option>
                  <option value="EntireMunicipality">Entire municipality of Kiruna</option>
                  <option value="Area2">Area 2</option>
                  <option value="Area3">Area 3</option>
                  <option value="Area4">Area 4</option>
                  <option value="Area5">Area 5</option>
                  <option value="Area6">Area 6</option>
                  <option value="Area7">Area 7</option>
                  <option value="Area8">Area 8</option>
                  </Form.Control>
                  </Form.Group>
              <Form.Group className="mt-3" controlId="formType">
                <Form.Label>Type</Form.Label>
                <Form.Control
                  as="select"
                  placeholder="Enter type"
                  name="type"
                  value={newDocument.type}
                  onClick={fetchTypes}
                  onChange={handleNewDocumentChange}>
                  <option value="">Select a scale</option>
                  {typesList.map((type) => (
                    <option key={type.name} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                  </Form.Control>
              </Form.Group>
              <Form.Group className="mt-3" controlId="formConnections">
                <Form.Label>Connections</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter connections"
                  name="connections"
                  value={newDocument.connections}
                  onChange={handleNewDocumentChange}
                  disabled
                />
              </Form.Group>
              <Form.Group className="mt-3" controlId="formLanguage">
                <Form.Label>Language</Form.Label>
                <Form.Control
                  as="select"
                  name="language"
                  value={newDocument.language}
                  onChange={handleNewDocumentChange}>

                  <option value="">Select a language</option>
                  <option value="English">English</option>
                  <option value="Swedish">Swedish</option>
                </Form.Control>
              </Form.Group>
              <Form.Group className="mt-3" controlId="formPages">
                <Form.Label>Pages</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter pages"
                  name="pages"
                  value={newDocument.pages}
                  onChange={handleNewDocumentChange}/>
                  </Form.Group>
              <Form.Group className="mt-4" controlId="formLat">
                <Form.Label>Latitude</Form.Label>
                <Form.Control
                  type="number" // Allows only numeric input
                  placeholder="Enter latitude"
                  name="lat"
                  step="0.0001" // Allows up to 4 decimal places
                  min="67.7500" // Minimum latitude
                  max="68.3333"  // Maximum latitude
                  value={newDocument.lat}
                  onChange={handleNewDocumentChange}
                  onBlur={validateLatitude}
                  disabled={selectedArea !== ''}
                />
              </Form.Group>
              <Form.Group className="mt-3" controlId="formLon">
                <Form.Label>Longitude</Form.Label>
                <Form.Control
                  type="number" // Allows only numeric input
                  placeholder="Enter longitude"
                  name="lon"
                  step="0.0001" // Allows up to 4 decimal places
                  min="20.7833" // Minimum longitude
                  max="21.1333"  // Maximum longitude
                  value={newDocument.lon}
                  onChange={handleNewDocumentChange}
                  onBlur={validateLongitude}
                  disabled={selectedArea !== ''}
                />
              </Form.Group>
              <Form.Group className="mt-4" controlId="formDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={8}
                  placeholder="Enter description"
                  name="description"
                  value={newDocument.description}
                  onChange={handleNewDocumentChange}
                />
                </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="green-button" 
            onClick={selectedDocument ? handleUpdateDocument : handleAddDocument}>
            {selectedDocument ? 'Save' : 'Add Document'}
          </Button>
          {selectedDocument ? <Button variant="danger" onClick={handleDeleteSelectedDocument}>
              Delete
          </Button> : null}
        </Modal.Footer>
      </Modal>
    </div>
  );
}

Documents.propTypes = {
  documents: PropTypes.array,
  setDocuments: PropTypes.func,
};


export default Documents;