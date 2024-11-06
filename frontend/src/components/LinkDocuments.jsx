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

        const documentsWithLinks = await Promise.all(
          data.map(async (document) => {
            const links = await fetchDocumentLinks(document.id);
            
            return { ...document, links: links.links || [] };
          })
        );
        
    
        
        setDocuments(documentsWithLinks);
       
      } catch (error) {
        console.error('Error fetching documents:', error);
      }

   

  };

    fetchDocuments();
  }, []);

  //update links
  const updateLink = async (idDocument1, idDocument2, newLinkDate, newLinkType) => {
    try {
      const response = await fetch('http://localhost:3001/api/links', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idDocument1: idDocument1,
          idDocument2: idDocument2,
          newLinkDate: newLinkDate,
          newLinkType: newLinkType
        })
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating link:', error);
      throw error;
    }
  };

  const handleUpdateLink = async () => {
    if (selectedDocuments.length !== 2) {
      alert('Please select exactly two documents to update the link.');
      return;
    }

    const [id1, id2] = selectedDocuments;

    try {
      const result = await API.updateLink(id1, id2, linkDate, linkType);
      setSelectedDocuments([]);
      setLinkDate(''); 
      setLinkType(''); 
   
      setMessage('Links updated successfully!');
      window.location.reload();
    } catch (error) {
      alert("the link must exist already and both the date and the type of the link must be filled in");
    }
  };

  const fetchDocumentLinks = async (documentId) => {
    try {
     
      const response = await fetch('http://localhost:3001/api/documentLinks/' + documentId, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching document links:', error);
      throw error;
    }
  };

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
      window.location.reload();
    } catch (error) {
      console.error('Error linking documents:', error);
      alert("the link must not exist already and both the date and the type of the link must be filled in");
    }
  };

  return (
    <div className="documents-container">
      {message && <Alert variant={message.includes('successfully') ? 'success' : 'danger'}>{message}</Alert>}
      <h1>Documents and their Links</h1>
      {/* Campo per linkDate */}
      <Form.Group controlId="linkDate">
        <Form.Label>Link Date</Form.Label>
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
          onChange={(e) => setLinkType(e.target.value)}>
          <option value="">Select link type</option>
          <option value="Direct">Direct</option>
          <option value="Collateral">Collateral</option>
          <option value="Projection">Projection</option>
          <option value="Update">Update</option>
        </Form.Control>
      </Form.Group>
      <ListGroup className='mb-3'>
        {documents.map((document, index) => (
          <ListGroup.Item
            key={document.id}
            style={{
              backgroundColor: index % 2 === 0 ? 'white' : '#e7e7e7' // Alternates between white and light gray
            }}>
            <Form.Check
              type="checkbox"
              label={document.title}
              checked={selectedDocuments.includes(document.id)}
              onChange={() => handleDocumentSelection(document.id)}
            />
            <p className='mt-3 mx-3 mb-1'>Linked Documents:</p>
            <ListGroup className='mb-2'>
              {Array.isArray(document.links) && document.links.map((link, index) => (
                <ListGroup.Item 
                  key={link.id} 
                  style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f5f5f5' }} // Alternating background color
                >
                  {link.title}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </ListGroup.Item>
        ))}
      </ListGroup>

       

      <Button onClick={handleLinkDocuments}>Create Link</Button>
      <Button onClick={handleUpdateLink}>Update Link</Button>
    </div>
  );
}

export default LinkDocuments;