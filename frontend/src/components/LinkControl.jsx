import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert, ListGroup, ListGroupItem } from "react-bootstrap";
import PropTypes from 'prop-types';
import API from '../API.mjs'; // Import delle funzioni API
import '../styles/DocumentList.css';

const LinkControl = (props) => {
  const { links, newLinks, setNewLinks } = props;  // Ricevi setLinks da DocumentControl

  console.log(links);
  console.log(newLinks);
  
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
  
    // Crea il nuovo link con il formato corretto
    const newLink = {
      id: parseInt(lastRow.targetDocument, 10), // Converti l'ID in numero se necessario
      type: lastRow.linkType,
    };
  
    // Verifica che il nuovo link non esista già
    const linkExists = links.some(
      (link) => link.id === newLink.id && link.type === newLink.type
    );
  
    if (linkExists) {
      setError('This link already exists.');
      return;
    }
  
    // Aggiungi il link allo stato `links` di DocumentControl
    setNewLinks([...newLinks, newLink]);
  
    // Visualizza un messaggio di successo
    setMessage('Link created successfully!');
  
    // Aggiungi una nuova riga vuota per il prossimo link
    setRows([...rows, { targetDocument: '', linkType: '' }]);
  
    // Reset degli errori
    setError('');
  };
  

  return (
    <div className="mx-4 mb-4">

      <CurrentLinkList links={links} className="mt-3"/>

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
  links: PropTypes.array.isRequired,
  newLinks: PropTypes.array.isRequired,
  setNewLinks: PropTypes.func.isRequired,  // Assicurati che setLinks venga passato da DocumentControl
};

function CurrentLinkList(props){
  console.log(props.links);
  return(
    <>
      <h5 style={{ fontWeight: 'bolder' }}>Current links</h5>
      <ListGroup className='mb-3'>
                {props.links.map((link) => <LinkInList
                    key={link.id+"_"+link.type}
                    linkData={link}
                    />)}
      </ListGroup>
    </>
  );
}

LinkControl.propTypes = {
  links: PropTypes.array.isRequired,
};

function LinkInList(props){
  return(
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

LinkControl.propTypes = {
  linkData: PropTypes.object,
};

export default LinkControl;
