import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert } from "react-bootstrap";
import PropTypes from 'prop-types';
import API from './api'; // Import delle funzioni API

const LinkControl = ({ documentId }) => {
  const [documents, setDocuments] = useState([]);
  const [targetDocument, setTargetDocument] = useState('');
  const [linkType, setLinkType] = useState('');
  const [linkDate, setLinkDate] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch documents on mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await API.getDocuments();
        setDocuments(data);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Unable to fetch documents. Please try again later.');
      }
    };
    fetchDocuments();
  }, []);

  // Handle link creation
  const handleLink = async () => {
    if (!targetDocument || !linkType || !linkDate) {
      setError('Please fill all fields to create a link.');
      return;
    }

    try {
      const linkData = { id1: documentId, id2: targetDocument, linkDate, linkType };
      await API.linkDocuments(linkData);
      setMessage('Documents linked successfully!');
      setError('');
    } catch (err) {
      console.error('Error linking documents:', err);
      setError('Failed to link documents. Please try again.');
      setMessage('');
    }
  };

  return (
    <div className="mt-4">
      <h5>Create Link to Another Document</h5>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-3">
        <Form.Group as={Col} controlId="formTargetDocument">
          <Form.Label>Target Document</Form.Label>
          <Form.Control
            as="select"
            value={targetDocument}
            onChange={(e) => setTargetDocument(e.target.value)}
          >
            <option value="">Select a document</option>
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} controlId="formLinkType">
          <Form.Label>Link Type</Form.Label>
          <Form.Control
            as="select"
            value={linkType}
            onChange={(e) => setLinkType(e.target.value)}
          >
            <option value="">Select link type</option>
            <option value="Reference">Reference</option>
            <option value="Citation">Citation</option>
            <option value="Dependency">Dependency</option>
            <option value="Related">Related</option>
          </Form.Control>
        </Form.Group>

        <Form.Group as={Col} controlId="formLinkDate">
          <Form.Label>Link Date</Form.Label>
          <Form.Control
            type="date"
            value={linkDate}
            onChange={(e) => setLinkDate(e.target.value)}
          />
        </Form.Group>
      </Row>

      <Button variant="primary" onClick={handleLink}>
        Create Link
      </Button>
    </div>
  );
};

LinkControl.propTypes = {
  documentId: PropTypes.string.isRequired,
};

export default LinkControl;
