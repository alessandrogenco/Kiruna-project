import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert } from "react-bootstrap";
import PropTypes from 'prop-types';
import API from '../API.mjs'; // Import delle funzioni API

const LinkControl = (props) => {
  const { document, links, setLinks } = props;  // Ricevi setLinks da DocumentControl

  console.log(links);

  const [documents, setDocuments] = useState([]);
  const [rows, setRows] = useState([{ targetDocument: '', linkType: '' }]);
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

  // Handle adding a new link
  const addRow = () => {
    const lastRow = rows[rows.length - 1];

    // Verifica che i campi della riga corrente siano compilati
    if (!lastRow.targetDocument || !lastRow.linkType) {
      setError('Please fill all fields in the current row before adding a new one.');
      return;
    }

    // Aggiungi il nuovo link all'array links
    const newLink = {
      documentId: document.id,         // ID del documento corrente
      targetDocumentId: lastRow.targetDocument,
      linkType: lastRow.linkType,
    };

    // Aggiungi il link allo stato `links` di DocumentControl
    setLinks([...links, newLink]);

    // Visualizza un messaggio di successo
    setMessage('Link created successfully!');

    // Aggiungi una nuova riga vuota per il prossimo link
    setRows([...rows, { targetDocument: '', linkType: '' }]);

    // Reset degli errori
    setError('');
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
        <Col className="d-flex justify-content-center" style={{ height: '40px' }}>
          <Button className="me-3" variant="success" onClick={addRow}>
            Create Link
          </Button>
        </Col>
      </Row>
    </div>
  );
};

LinkControl.propTypes = {
  document: PropTypes.object.isRequired,
  links: PropTypes.array.isRequired,
  setLinks: PropTypes.func.isRequired,  // Assicurati che setLinks venga passato da DocumentControl
};

export default LinkControl;
