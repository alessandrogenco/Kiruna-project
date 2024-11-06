import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, FormControl } from 'react-bootstrap';
import './Documents.css'; // Import the CSS file

function Documents({ show, handleClose }) {
  const [documents, setDocuments] = useState([]);
  const [descriptions, setDescriptions] = useState({});
  const [selectedDocument, setSelectedDocument] = useState(null); // State for selected document
  const [showFormModal, setShowFormModal] = useState(false); // State to control the form modal
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
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
    const requiredFields = ['title', 'lat', 'lon']; // , 'lat', 'lon'
    for (const field of requiredFields) {
        if (!newDocument[field]) {
            console.error(`Field ${field} is missing.`);
            return;
        }
    }

    console.log("Sending document data:", newDocument); // Log dei dati inviati

    try {
        const response = await fetch('http://localhost:3001/api/addDocument', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newDocument),
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const addedDocument = await response.json();
        setDocuments((prevDocuments) => [...prevDocuments, addedDocument]);
        setNewDocument({ title: '', stakeholders: '', scale: '', date: '', type: '', connections: '', language: '', pages: '', lat: '', lon: '', description: '' });
        setShowFormModal(false);
    } catch (error) {
        console.error('Error adding document:', error);
    }
  };

  const handleDescriptionChange = (id, value) => {
    setDescriptions({
      ...descriptions,
      [id]: value,
    });
  };

  const handleAddDescription = async (id, title) => {
    const newDescription = descriptions[id];
    if (!newDescription) return;

    try {
      const response = await fetch('http://localhost:3001/api/addDescription', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, title, description: newDescription }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Optionally, update the document list or show a success message
      const updatedDocument = await response.json();
      setDocuments((prevDocuments) =>
        prevDocuments.map((doc) =>
          doc.id === id ? { ...doc, description: updatedDocument.document.description } : doc
        )
      );
      setDescriptions({ ...descriptions, [id]: ''}); // Clear the input field after submission
      setShowFormModal(false); // Close the form modal
    } catch (error) {
      console.error('Error adding description:', error);
    }
  };

  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
    setShowFormModal(true);
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setSelectedDocument(null);
  };
  const handleNewDocumentChange = (e) => {
    const { name, value } = e.target;

    if (name == "lon"){
      
    }
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

  return (
    <div className="documents-container">
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
      <Button variant="primary" onClick={() => setShowFormModal(true)}>
        Add Document
      </Button>
      <ul>
        {filteredDocuments.map((document) => (
          <li key={document.id} onClick={() => handleDocumentClick(document)}>
            <div>
              <strong>{document.title}</strong>
              <p>{document.description}</p>
            </div>
          </li>
        ))}
      </ul>
      
      <Modal show={showFormModal} onHide={handleCloseFormModal}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedDocument ? `Set description for \"${selectedDocument.title}\"` : 'Add new document'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDocument ? (
            <textarea className='w-100 my-2 form-control'
              type="text"
              placeholder="Set description"
              minLength={1}
              rows={8}
              maxLength={8*80} // rows number multiplied by characters per row
              value={descriptions[selectedDocument.id] || ''}
              onChange={(e) => handleDescriptionChange(selectedDocument.id, e.target.value)}
              required
            />
          ) :  (
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
          <Button variant="secondary" onClick={handleCloseFormModal}>
            Close
          </Button>
          <Button
             className="green-button" 
            onClick={selectedDocument ? () => handleAddDescription(selectedDocument.id, selectedDocument.title) : handleAddDocument}
          >
            {selectedDocument ? 'Set Description' : 'Add Document'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Documents;