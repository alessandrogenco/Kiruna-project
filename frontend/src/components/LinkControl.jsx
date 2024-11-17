import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert } from "react-bootstrap";
import PropTypes from 'prop-types';
import API from '../API.mjs'; // Import delle funzioni API

const LinkControl = (props) => {
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
  /*const handleLink = async () => {
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
  };*/

  return (
    <div className="mx-4 mb-4">
      <h5 style={{fontWeight: 'bolder'}}>Create Link to Another Document</h5>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-3 d-flex justify-content-between">
        <Col md = {3} className="d-flex justify-content-center">
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
        </Col>

        <Col md = {3} className="d-flex justify-content-center">
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
        </Col>
        
        <Col md = {3} className="d-flex justify-content-center" style={{ height: '40px', marginTop: '33px' }}>
          <Button className="me-3" variant="success"/*onClick={handleLink}*/>
            Create Link
          </Button>
        </Col>
      </Row>
    </div>
  );
};

LinkControl.propTypes = {
  document: PropTypes.object,
};

export default LinkControl;
