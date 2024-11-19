import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Col, ListGroupItem, Row, ListGroup, Form, Button, Dropdown, DropdownButton, Card } from 'react-bootstrap';
import { Link } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import './DocumentList.css';
import { getDocumentLinks } from '../API.mjs';
import axios from 'axios';

function DocumentList(props){
  

    return(
        <>
            <h1 className='mx-4'>Documents List</h1>
          
            <ListGroup>
                {props.documents.map((doc) => <DocumentInList
                    key={doc.id}
                    documentData={doc}
                    updateDocument={props.updateDocument}
                    deleteDocument={props.deleteDocument}
                    />)}
            </ListGroup>
            <div style={{ height: '50px' }}></div>
        </>
    )
}

DocumentList.propTypes = {
    documents: PropTypes.array, 
    updateDocument: PropTypes.func,
    deleteDocument: PropTypes.func,
};

//custom-border mx-3 mb-2 p-2 border border-dark bg-light rounded

function DocumentInList(props){
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [documentLinks, setDocumentLinks] = useState([]);
    const [showLinks, setShowLinks] = useState(false);


    const handleDocumentClick = (document) => {
        setSelectedDocument(document);
      };
    
      const handleCloseViewer = () => {
        setSelectedDocument(null);
        setShowLinks(false);
      };
      
      const handleConnectionsClick = async () => {
        try {
          const links = await getDocumentLinks(selectedDocument.id);
          setDocumentLinks(links.links);
          console.log('Document links:', documentLinks);
          setShowLinks(true);
        } catch (error) {
          console.error('Error fetching document links:', error);
        }
      };
      
      return (
        <div className="document-details1">
          <ListGroupItem className="document-list-item-det rounded custom-list-group-item">
            <Row>
              <Col>
                <label className='mt-2' onClick={() => handleDocumentClick(props.documentData)}>{props.documentData.title}</label>
              </Col>
              <Col>
                {console.log(props.documentData)}
                <label>{props.documentData.date}</label>
              </Col>
              <Col className='text-end'>
                <Link
                  className="btn btn-success bi bi-pencil me-2"
                  to={`/editDocument/${props.documentData.id}`}
                  state={{ document: props.documentData }}
                />
                <i className="btn btn-danger bi bi-trash" onClick={() => props.deleteDocument(props.documentData.id)} />
              </Col>
            </Row>
          </ListGroupItem>
          
          {selectedDocument && (
            <div className="document-details1 mt-4">
              <h3>{selectedDocument.title}</h3>
              <Row className='row-det'>
                <Col>
                  <Form.Group className='form-group-det'>
                    <Form.Label className='form-label-det'>Stakeholders</Form.Label>
                    <Form.Control
                      className='form-control-det'
                      type="text"
                      name="stakeholders"
                      value={selectedDocument.stakeholders || ""}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className='form-group-det'>
                    <Form.Label className='form-label-det'>Scale</Form.Label>
                    <Form.Control
                      className='form-control-det'
                      type="text"
                      name="scale"
                      value={selectedDocument.scale || ""}
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className='form-group-det'>
                    <Form.Label className='form-label-det'>Issuance Date</Form.Label>
                    <Form.Control
                      className='form-control-det'
                      type="date"
                      name="date"
                      value={selectedDocument.date || ""}
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Form.Group className='form-group-det'>
                    <Form.Label className='form-label-det'>Type</Form.Label>
                    <Form.Control
                      className='form-control-det'
                      as="select"
                      name="type"
                      value={selectedDocument.type || ""}
                      readOnly
                    >
                      <option value="Technical">Text - Technical</option>
                      <option value="Agreement">Concept - Agreement</option>
                      <option value="Conflict">Concept - Conflict</option>
                      <option value="Consultation">Concept - Consultation</option>
                      <option value="Material effect">Concept - Material effect</option>
                      <option value="Paper">Concept - Paper</option>
                      <option value="Action">Action</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className='form-group-det'>
                    <Form.Label className='form-label-det'>Language</Form.Label>
                    <Form.Control
                      className='form-control-lang'
                      as="select"
                      name="language"
                      value={selectedDocument.language || ""}
                      readOnly
                    >
                      <option value="English">English</option>
                      <option value="Swedish">Swedish</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col>
                      <DropdownButton
                     id="dropdown-basic-button"
                     onClick={handleConnectionsClick}
                     title="Connections"
                      >
                        {documentLinks ? (
                          documentLinks.map((link, index) => {
                            return <Dropdown.Item key={index} className="custom-dropdown-item">{link.title}</Dropdown.Item>;
                          })
                        ) : (
                          <Dropdown.ItemText>No connections available.</Dropdown.ItemText>
                        )}
                      </DropdownButton>
                </Col>
                </Row>
                <Row>
                <Col>
                  <Form.Group className='form-group-det'>
                    <Form.Label className='form-label-det'>Description</Form.Label>
                    <Form.Control
                      className='form-control-description'
                      as="textarea"
                      name="description"
                      value={selectedDocument.description || ""}
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <FileList documentId={selectedDocument.id}/>
              </Row>
                
             
              <div className="text-end">
                <Button variant="secondary" onClick={handleCloseViewer}>Close</Button>
              </div>
            </div>
          )}
        </div>
      );
      }

function FileList(props) {
  const [files, setFiles] = useState([]);
  const [showFiles, setShowFiles] = useState(false);
  const [error, setError] = useState(null);

  const toggleFileList = () => {
    setShowFiles(prevState => !prevState);
  };

  return (
    <div>
      <Button variant="outline-success" onClick={toggleFileList}>
        {showFiles ? 'Hide files' : 'Show files'}
      </Button>

      {showFiles && (
        <Row className="mt-3">
          <Col md={4}>
            <ListGroup>
              {files && files.length > 0 && files.map((file, index) => (
              <ListGroup.Item key={index}>
                <span style={{ paddingTop: '2px', display: 'inline-block' }}>{file.name}</span>
              </ListGroup.Item>
              ))}
              {error && <p>{error}</p>}
            </ListGroup>
          </Col>
        </Row>
      )}
    </div>
  );
}
export default DocumentList;