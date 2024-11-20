import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert, ListGroup, ListGroupItem } from "react-bootstrap";
import PropTypes from 'prop-types';
import API from '../API.mjs'; // Import delle funzioni API
import '../styles/DocumentList.css';

const LinkControl = (props) => {
  const { selectedId, links, newLinks, setNewLinks, setHasDuplicates, hasDuplicates } = props;

  const [documents, setDocuments] = useState([]);
  const [rows, setRows] = useState([{ targetDocument: '', linkType: '' }]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  console.log(hasDuplicates);

  // Fetch documents on mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await API.getDocuments();

        const filteredData = selectedId
          ? data.filter(doc => doc.id !== Number(selectedId))
          : data;

        setDocuments(filteredData);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Unable to fetch documents. Please try again later.');
      }
    };

    fetchDocuments();
  }, [selectedId]);

  // Check if a link is duplicate
  const isDuplicateLink = (targetDocument, linkType, currentIndex = -1) => {
    const documentId = Number(targetDocument);

    // Controlla duplicati nei link già esistenti
    const existingLinks = links.some(link => link.id === documentId && link.type === linkType);

    // Controlla duplicati in newLinks, escludendo il link corrente in modifica
    const duplicateInNewLinks = newLinks.some((link, idx) => {
      return idx !== currentIndex && link.id === documentId && link.type === linkType;
    });

    return existingLinks || duplicateInNewLinks;
  };

  // Handle adding a new link
  const addRow = () => {
    const lastRow = rows[rows.length - 1];

    if (!lastRow.targetDocument || !lastRow.linkType) {
      setError('Please fill all fields in the current row before adding a new one.');
      return;
    }

    const newLink = {
      id: parseInt(lastRow.targetDocument, 10),
      type: lastRow.linkType,
    };

    if (isDuplicateLink(newLink.id, newLink.type)) {
      setError('This link already exists.');
      setHasDuplicates(true);
      return;
    }else{
      setHasDuplicates(false);
    }

    setNewLinks([...newLinks, newLink]);
    setMessage('Link added successfully!');
    setRows([...rows, { targetDocument: '', linkType: '' }]);
    setError('');
  };

  // Handle changes in the rows
  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    const { targetDocument, linkType } = updatedRows[index];

    // Se entrambi i campi sono compilati, verifica la duplicazione
    if (targetDocument && linkType) {
      if (isDuplicateLink(targetDocument, linkType, index)) {
        setError('This combination of document and link type already exists.');
        setHasDuplicates(true);
        return;
      } else {
        setHasDuplicates(false);
        setError(''); // Nessun errore
      }

      // Aggiorna lo stato di newLinks se il link modificato esiste già in `newLinks`
      const updatedNewLinks = [...newLinks];
      if (index < newLinks.length) {
        // Aggiorna un link già esistente
        updatedNewLinks[index] = {
          id: Number(targetDocument),
          type: linkType,
        };
        setNewLinks(updatedNewLinks);
      }
    }

    setRows(updatedRows); // Aggiorna sempre la UI delle righe
  };

  return (
    <div className="mx-4 mb-4">
      <CurrentLinkList links={links} className="mt-3" />

      <h5 style={{ fontWeight: 'bolder' }}>Create Link to Another Document</h5>

      {error && <Alert variant="danger">{error}</Alert>}

      {rows.map((row, index) => (
        <Row key={index} className="mb-3">
          <Col className="d-flex justify-content-center">
            <Form.Group as={Col} controlId={`formTargetDocument-${index}`}>
              <Form.Label>Target Document</Form.Label>
              <Form.Control
                as="select"
                value={row.targetDocument}
                onChange={(e) => handleRowChange(index, 'targetDocument', e.target.value)}
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
                onChange={(e) => handleRowChange(index, 'linkType', e.target.value)}
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
          <Button className="me-3" variant="outline-success" onClick={addRow}>
            New Link
          </Button>
        </Col>
      </Row>
    </div>
  );
};

LinkControl.propTypes = {
  selectedId: PropTypes.string,
  links: PropTypes.array.isRequired,
  newLinks: PropTypes.array.isRequired,
  setNewLinks: PropTypes.func.isRequired,
  setHasDuplicates: PropTypes.func.isRequired,
  hasDuplicates: PropTypes.bool.isRequired,
};

function CurrentLinkList(props) {
  return (
    <>
      <h5 style={{ fontWeight: 'bolder', marginTop: '15px' }}>Current links</h5>
      <ListGroup className="mb-3">
        {props.links.length > 0 ? (
          props.links.map((link) => (
            <LinkInList
              key={link.id + "_" + link.type}
              linkData={link}
            />
          ))
        ) : (
          <label className="text-muted">
            No links currently
          </label>
        )}
      </ListGroup>
    </>
  );
}

CurrentLinkList.propTypes = {
  links: PropTypes.array.isRequired,
};

function LinkInList(props) {
  return (
    <ListGroupItem className="document-list-item rounded custom-list-group-item mt-2">
      <Row>
        <Col>
          <label>{props.linkData.title}</label>
        </Col>
        <Col>
          <label>{props.linkData.type}</label>
        </Col>
      </Row>
    </ListGroupItem>
  );
}

LinkInList.propTypes = {
  linkData: PropTypes.object,
};

export default LinkControl;
