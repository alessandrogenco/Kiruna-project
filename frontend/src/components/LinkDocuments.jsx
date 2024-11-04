import React, { useEffect, useState } from 'react';
import { Button, Form, ListGroup } from 'react-bootstrap';
//import './LinkDocuments.css'; // Import the CSS file

function LinkDocuments() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);

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
    setSelectedDocuments((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((docId) => docId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const handleLinkDocuments = async () => {
    if (selectedDocuments.length !== 2) {
      alert('Please select exactly two documents to link.');
      return;
    }

    const [id1, id2] = selectedDocuments;

    try {
      const response = await fetch('http://localhost:3001/api/linkDocuments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id1, id2 }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      alert('Documents linked successfully!');
      setSelectedDocuments([]);
    } catch (error) {
      console.error('Error linking documents:', error);
      alert('Error linking documents.');
    }
  };

  return (
    <div className="link-documents-container">
      <h2>Link Documents</h2>
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
      <Button variant="primary" onClick={handleLinkDocuments} className="mt-3">
        Link Documents
      </Button>
    </div>
  );
}

export default LinkDocuments;