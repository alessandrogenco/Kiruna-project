import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, FormControl } from 'react-bootstrap';
import './Documents.css'; // Import the CSS file
import {deleteDocument, updateDocument} from '../API.mjs'; // Import the API module

function Documents({ show, handleClose }) {
  const [documents, setDocuments] = useState([]);
  const [descriptions, setDescriptions] = useState({});
  const [selectedDocument, setSelectedDocument] = useState(null); // State for selected document
  const [showFormModal, setShowFormModal] = useState(false); // State to control the form modal
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [selectedArea, setSelectedArea] = useState('');
  const [message, setMessage] = useState(''); // Add this line
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

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/documents');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setDocuments(data);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    fetchDocuments();
  }, []);

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

    console.log(documentData);

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
        setMessage('Document added successfully!');
    } catch (error) {
        console.error('Error adding document:', error);
        setMessage(error.message);
    }
  };


  const handleDeleteSelectedDocument = async () => {
    if (!selectedDocument) {
      alert('Please select a document to delete.');
      return;
    }

    try {
      await deleteDocument(selectedDocument.id);
      setDocuments((prevDocuments) => prevDocuments.filter((doc) => doc.id !== selectedDocument));
      setSelectedDocument(null);
      setMessage('Document deleted successfully!');
      setShhowFormModal(false);
    } catch (error) {
      console.error('Error deleting document:', error);
      setMessage('Error deleting document.');
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
        return;
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
      return;
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
    setMessage('Document updated successfully!');
  } catch (error) {
    console.error('Error updating document:', error);
    setMessage('Error updating document.');
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
                  onChange={handleNewDocumentChange}
                />
              </Form.Group>
              <Form.Group className="mt-3" controlId="formStakeholders">
                <Form.Label>Stakeholders</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter stakeholders"
                  name="stakeholders"
                  value={newDocument.stakeholders}
                  onChange={handleNewDocumentChange}
                />
                 </Form.Group>
              <Form.Group className="mt-3" controlId="formScale">
                <Form.Label>Scale</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter scale"
                  name="scale"
                  value={newDocument.scale}
                  onChange={handleNewDocumentChange}
                />
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
                  onChange={handleNewDocumentChange}>

                  <option value="">Select document type</option>
                  <option value="Design">Text - Design</option>
                  <option value="Informative">Text - Informative</option>
                  <option value="Prescriptive">Text - Prescriptive</option>
                  <option value="Technical">Text - Technical</option>
                  <option value="Agreement">Concept - Agreement</option>
                  <option value="Conflict">Concept - Conflict</option>
                  <option value="Consultation">Concept - Consultation</option>
                  <option value="Material effect">Concept - Material effect</option>
                  <option value="Paper">Concept - Paper</option>
                  <option value="Action">Action</option>
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
                  <option value="Danish">Danish</option>
                  <option value="Norwegian">Norwegian</option>
                  <option value="Finnish">Finnish</option>
                  <option value="Icelandic">Icelandic</option>
                  <option value="Estonian">Estonian</option>
                  <option value="Latvian">Latvian</option>
                  <option value="Lithuanian">Lithuanian</option>
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

export default Documents;