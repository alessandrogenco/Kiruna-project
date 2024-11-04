import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, FormControl } from 'react-bootstrap';
import './Documents.css';

function Documents({ show, handleClose }) {
  const [documents, setDocuments] = useState([]);
  const [descriptions, setDescriptions] = useState({});
  const [linkedDocuments, setLinkedDocuments] = useState({});
  const [documentTitles, setDocumentTitles] = useState({}); // New state for document titles
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

        // Create a dictionary of document titles for easy lookup
        const titles = {};
        data.forEach((doc) => {
          titles[doc.id] = doc.title;
        });
        setDocumentTitles(titles); // Set the document titles dictionary
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    fetchDocuments();
  }, []);

  const handleLinkDocuments = (id1, id2) => {
    if (!id2) return;
    setLinkedDocuments((prevLinks) => ({
      ...prevLinks,
      [id1]: [...(prevLinks[id1] || []), id2]
    }));
  };

  const filteredDocuments = documents.filter((document) =>
    document.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="documents-container">
      <Form className="d-flex mb-3">
        <FormControl
          type="search"
          placeholder="Search documents"
          className="me-2"
          aria-label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Form>
      <Button variant="primary" onClick={() => setShowFormModal(true)}>
        Add Document
      </Button>
      <ul>
        {filteredDocuments.map((document) => (
          <li key={document.id}>
            <div>
              <strong>{document.title}</strong>
              <p>{document.description}</p>

              {/* Show linked documents with actual names */}
              <div>
                <p>Linked to:</p>
                <ul>
                  {(linkedDocuments[document.id] || []).map((linkedDocId) => (
                    <li key={linkedDocId}>Link to {documentTitles[linkedDocId]}</li>
                  ))}
                </ul>
              </div>

              <Form.Select
                aria-label="Select document to link"
                onChange={(e) => handleLinkDocuments(document.id, e.target.value)}
                className="mt-2"
              >
                <option>Select document to link</option>
                {documents
                  .filter((doc) => doc.id !== document.id)
                  .map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.title}
                    </option>
                  ))}
              </Form.Select>

              <button className="btn btn-link mt-2" onClick={() => setShowFormModal(true)}>
                Add Description
              </button>
            </div>
          </li>
        ))}
      </ul>
      
      {/* The Modal for adding new documents can remain unchanged */}
    </div>
  );
}

export default Documents;
