import React, { useEffect, useState } from 'react';
import { Button, Form, ListGroup, Alert, Container, Row, Col } from 'react-bootstrap';
import '../App.css';
import API from '../API.mjs';
import PropTypes from "prop-types";
import AppNavbar from './Navbar';

function LinkDocuments({ isLoggedIn, handleLogout }) {
  const [documents, setDocuments] = useState([]);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [linkDate, setLinkDate] = useState('');
  const [linkType, setLinkType] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/documents');
        if (!response.ok) {
          throw new Error('Failed to fetch documents.');
        }
        const data = await response.json();
        setDocuments(data);
      } catch (error) {
        console.error('Error fetching documents:', error);
        setMessage({ type: 'danger', text: 'Error loading documents.' });
      }
    };

    fetchDocuments();
  }, []);

  const handleDocumentSelection = (id) => {
    setSelectedDocuments((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((docId) => docId !== id);
      } else if (prevSelected.length < 2) {
        return [...prevSelected, id];
      }
      return prevSelected; // Limit to two selections
    });
  };

  const handleLinkDocuments = async () => {
    if (selectedDocuments.length !== 2) {
      setMessage({ type: 'warning', text: 'Please select exactly two documents to link.' });
      return;
    }

    const [id1, id2] = selectedDocuments;
    try {
      await API.linkDocument(id1, id2, linkDate, linkType);
      setMessage({ type: 'success', text: 'Documents linked successfully!' });
      setSelectedDocuments([]);
      setLinkDate('');
      setLinkType('');
    } catch (error) {
      console.error('Error linking documents:', error);
      setMessage({ type: 'danger', text: 'Error linking documents. Please try again.' });
    }
  };

  return (
    <>
      <AppNavbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      <Container className="link-documents-container mt-4 p-4 rounded shadow-sm bg-light">
        <h2 className="text-center mb-4">Link Documents</h2>

        {/* Display success/error message */}
        {message && (
          <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
            {message.text}
          </Alert>
        )}

        <Row>
          <Col md={6}>
            <h5>Select Documents to Link (Choose Two)</h5>
            <ListGroup className="mb-3">
              {documents.map((document) => (
                <ListGroup.Item
                  key={document.id}
                  className="d-flex align-items-center"
                  action
                  onClick={() => handleDocumentSelection(document.id)}
                  active={selectedDocuments.includes(document.id)}
                >
                  <Form.Check
                    type="checkbox"
                    label={document.title}
                    checked={selectedDocuments.includes(document.id)}
                    onChange={() => handleDocumentSelection(document.id)}
                  />
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>

          <Col md={6}>
            <Form>
              <Form.Group controlId="linkDate" className="mb-3">
                <Form.Label>Link Date</Form.Label>
                <Form.Control
                  type="date"
                  value={linkDate}
                  onChange={(e) => setLinkDate(e.target.value)}
                  placeholder="Select a date"
                />
              </Form.Group>

              <Form.Group controlId="linkType" className="mb-3">
                <Form.Label>Link Type</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter link type"
                  value={linkType}
                  onChange={(e) => setLinkType(e.target.value)}
                />
              </Form.Group>

              <Button
                variant="primary"
                onClick={handleLinkDocuments}
                disabled={selectedDocuments.length !== 2 || !linkDate || !linkType}
                className="w-100 mt-3"
              >
                Link Selected Documents
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedDocuments([]);
                  setLinkDate('');
                  setLinkType('');
                  setMessage(null);
                }}
                className="w-100 mt-2"
              >
                Clear Selection
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
}

LinkDocuments.propTypes = {
  isLoggedIn: PropTypes.bool,
  handleLogout: PropTypes.func,
};

export default LinkDocuments;
