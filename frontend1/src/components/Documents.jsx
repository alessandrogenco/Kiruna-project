import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import './Documents.css'; // Import the CSS file

function Documents({ show, handleClose }) {
  const [documents, setDocuments] = useState([]);
  const [descriptions, setDescriptions] = useState({});
  const [selectedDocument, setSelectedDocument] = useState(null); // State for selected document
  const [showFormModal, setShowFormModal] = useState(false); // State to control the form modal

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
      setDescriptions({ ...descriptions, [id]: '' }); // Clear the input field after submission
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

  return (
    <div className="documents-container">
      <ul>
        {documents.map((document) => (
          <li key={document.id} onClick={() => handleDocumentClick(document)}>
            <div>
              <strong>{document.title}</strong>
              <p>{document.description}</p>
            </div>
          </li>
        ))}
      </ul>

      {selectedDocument && (
        <Modal show={showFormModal} onHide={handleCloseFormModal}>
          <Modal.Header closeButton>
            <Modal.Title>Add Description for {selectedDocument.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input
              type="text"
              placeholder="Add description"
              value={descriptions[selectedDocument.id] || ''}
              onChange={(e) => handleDescriptionChange(selectedDocument.id, e.target.value)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseFormModal}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => handleAddDescription(selectedDocument.id, selectedDocument.title)}
            >
              Add Description
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

export default Documents;