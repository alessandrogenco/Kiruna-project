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

  const [rows, setRows] = useState([{ targetDocument: '', linkType: ''}]);

  // Handle adding a new row
  const addRow = () => {
    const lastRow = rows[rows.length - 1];

    // Controlla se tutti i campi dell'ultima riga sono completati
    if (!lastRow.targetDocument || !lastRow.linkType) {
      setError('Please fill all fields in the current row before adding a new one.');
      return;
    }

    // Aggiungi una nuova riga vuota
    setRows([...rows, { targetDocument: '', linkType: ''}]);
    setError(''); // Cancella eventuali errori
  };

  return (
    <div className="mx-4 mb-4">
      <h5 style={{ fontWeight: 'bolder' }}>Create Link to Another Document</h5>

      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      {rows.map((row, index) => (
        <Row key={index} className="mb-3">
          <Col className="d-flex justify-content-center">
            <Form.Group as={Col} controlId={`formTargetDocument-${index}`}>
              <Form.Label>Target Document</Form.Label>
              <Form.Control
                as="select"
                value={row.targetDocument}
                onChange={(e) => {
                  const updatedRows = [...rows];
                  updatedRows[index].targetDocument = e.target.value;
                  setRows(updatedRows);
                }}
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

          <Col className="d-flex justify-content-center">
            <Form.Group as={Col} controlId={`formLinkType-${index}`}>
              <Form.Label>Link Type</Form.Label>
              <Form.Control
                as="select"
                value={row.linkType}
                onChange={(e) => {
                  const updatedRows = [...rows];
                  updatedRows[index].linkType = e.target.value;
                  setRows(updatedRows);
                }}
              >
                <option value="">Select link type</option>
                <option value="Reference">Reference</option>
                <option value="Citation">Citation</option>
                <option value="Dependency">Dependency</option>
                <option value="Related">Related</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>
      ))}

      <Row className="d-flex justify-content-between">
        <Col className="d-flex justify-content-center" style={{ height: '40px'}}>
          <Button className="me-3" variant="success" onClick={addRow}>
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
