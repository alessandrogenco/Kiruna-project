import React, { useEffect, useState, useRef } from 'react';
import { Button, Form, ListGroup, Alert } from 'react-bootstrap';
import "./Documents.css";
import API from '../API.mjs'; 

function LinkDocuments() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [linkDate, setLinkDate] = useState(''); // Stato per la data del link
  const [linkType, setLinkType] = useState(''); // Stato per il tipo di link
  const [message, setMessage] = useState(''); 
  const isLinkedRef = useRef(false);

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

  const handleDocumentSelection = (id) => {

    // Check if the document is already selected
    const isSelected = selectedDocuments.includes(id);

    // If it is selected, unselect it
    if (isSelected) {
      setSelectedDocuments(selectedDocuments.filter(docId => docId !== id));
    } else {
      // If it is not selected, check if we can select more documents
      if (selectedDocuments.length < 2) {
        setSelectedDocuments([...selectedDocuments, id]);
      } else {
        // Alert user if they attempt to select more than 2
        alert("You can only select a maximum of 2 documents.");
      }
    }
  };

  const handleLinkDocuments = async () => {
    if (isLinkedRef.current) return;

    if (selectedDocuments.length !== 2) {
      alert('Please select exactly two documents to link.');
      return;
    }

    const [id1, id2] = selectedDocuments;

    try {
      await API.linkDocument(id1, id2, linkDate, linkType);
      setSelectedDocuments([]);
      setLinkDate(''); 
      setLinkType(''); 
      isLinkedRef.current = true; // Aggiorna il flag
      setMessage('Documents linked successfully!');
    } catch (error) {
      console.error('Error linking documents:', error);
      alert('Error linking documents.');
    }
  };

  return (
    <div className="documents-containe w-100">
      {message && <Alert variant={message.includes('successfully') ? 'success' : 'danger'}>{message}</Alert>}
      
      {/* Campo per linkDate */}
      <Form.Group controlId="linkDate">
        <Form.Label>Date</Form.Label>
        <Form.Control
          type="date"
          value={linkDate}
          onChange={(e) => setLinkDate(e.target.value)}
        />
      </Form.Group>

      {/* Campo per linkType */}
      <Form.Group controlId="linkType" className="mt-3 mb-4">
        <Form.Label>Type</Form.Label>
        <Form.Control
          as="select"  // This turns the input into a select dropdown
          value={linkType}
          onChange={(e) => setLinkType(e.target.value)}
        >
          <option value="">Select link type</option>
          <option value="Direct">Direct</option>
          <option value="Collateral">Collateral</option>
          <option value="Projection">Projection</option>
          <option value="Update">Update</option>
        </Form.Control>
      </Form.Group>

      <ListGroup>
        {documents.map((document) => (
          <ListGroup.Item key={document.id}>
            <Form.Check
              type="checkbox"
              label={document.title}
              checked={selectedDocuments.includes(document.id)}
              onChange={() => handleDocumentSelection(document.id)}
            />
          </ListGroup.Item>
        ))}
      </ListGroup>

      <Button onClick={handleLinkDocuments} disabled={selectedDocuments.length != 2} className="mt-3 w-100 green-button">
        Link Documents
      </Button>
    </div>
  );
}

export default LinkDocuments;
