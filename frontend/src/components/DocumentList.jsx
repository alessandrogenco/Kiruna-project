import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Col, ListGroupItem, Row, ListGroup, Button } from 'react-bootstrap';
import { Link } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import './DocumentList.css';
import { getDocumentLinks } from '../API.mjs';
import axios from 'axios';

function DocumentList(props){

    return(
        <>
            <h1 className='mx-4'>Documents</h1>
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
          setShowLinks(!showLinks);
        } catch (error) {
          console.error('Error fetching document links:', error);
        }
      };
      
      return (
        <div className="document-details1">
          <ListGroupItem className="document-list-item-det rounded custom-list-group-item">
            <Row>
              <Col>
                <label role="button" className='mt-2' onClick={() => handleDocumentClick(props.documentData)}>{props.documentData.title}</label>
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
            <Row>
              <Col md={4}>
                <div className="left-column">
                  <div className="form-group-det">
                    <span className="form-label-det">Stakeholders:</span>
                    <p className="form-control-det">{selectedDocument.stakeholders || "N/A"}</p>
                  </div>
                  <div className="form-group-det">
                    <span className="form-label-det">Scale:</span>
                    <p className="form-control-det">{selectedDocument.scale || "N/A"}</p>
                  </div>
                  <div className="form-group-det">
                    <span className="form-label-det">Issuance Date:</span>
                    <p className="form-control-det">{selectedDocument.issuanceDate || "N/A"}</p>
                  </div>
                  <div className="form-group-det">
                    <span className="form-label-det">Type:</span>
                    <p className="form-control-det">
                      {
                        {
                          Technical: "Text - Technical",
                          Agreement: "Concept - Agreement",
                          Conflict: "Concept - Conflict",
                          Consultation: "Concept - Consultation",
                          "Material effect": "Concept - Material effect",
                          Paper: "Concept - Paper",
                          Action: "Action",
                        }[selectedDocument.type] || "N/A"
                      }
                    </p>
                  </div>
                  <div className="form-group-det">
                    <span className="form-label-det">Language:</span>
                    <p className="form-control-det">
                      {selectedDocument.language === "English"
                        ? "English"
                        : selectedDocument.language === "Swedish"
                        ? "Swedish"
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </Col>
              <Col md={8}>
                <div className="right-column">
                  <div className="form-group-det-description">
                    <span className="form-label-det">Description:</span>
                    <p className="form-control-description">
                      {selectedDocument.description || "No description available."}
                    </p>
                  </div>
                </div>
              </Col>
            </Row>
            <div className="mx-3 mt-3">
              <Row>
                <Col>
                  <Button
                    variant="outline-success"
                    onClick={handleConnectionsClick}
                    className="toggle-button"
                  >
                    {showLinks ? "Hide Connections" : "Show Connections"}
                  </Button>
                </Col>
              </Row>
              {showLinks && (
                <Row className="mt-1">
                  <Col>
                    <ListGroup>
                      {documentLinks && documentLinks.length > 0 ? (
                        documentLinks.map((link, index) => (
                          <ListGroupItem
                            key={link.title + index}
                            className="document-list-item rounded custom-list-group-item mt-2"
                          >
                            <Row>
                              <Col>
                                <label>{link.title}</label>
                              </Col>
                              <Col>
                                <label>{link.type}</label>
                              </Col>
                            </Row>
                          </ListGroupItem>
                        ))
                      ) : (
                        <label className="text-muted">No connections available.</label>
                      )}
                    </ListGroup>
                  </Col>
                </Row>
              )}
            </div>
            <div className='mx-3 mt-3'>
              <Row>
                <FileList documentId={selectedDocument.id} />
              </Row>
            </div>
            <div className="text-end">
              <Button variant="secondary" onClick={handleCloseViewer}>
                Close
              </Button>
            </div>
          </div>          
          )}
        </div>
      );
      }

DocumentInList.propTypes = {
 deleteDocument: PropTypes.func,
 documentData: PropTypes.object,
};

function FileList(props) {
  const [files, setFiles] = useState([]);
  const [showFiles, setShowFiles] = useState(false);
  const [error, setError] = useState(null);

  const toggleFileList = () => {
    setShowFiles(prevState => !prevState);
  };

  const handleDownload = (fileName, fileData) => {
    const byteCharacters = atob(fileData);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const fileBlob = new Blob([new Uint8Array(byteNumbers)], { type: 'application/pdf' });
    const fileUrl = URL.createObjectURL(fileBlob);
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName;
    a.click(); 
    URL.revokeObjectURL(fileUrl);  
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/files/${props.documentId}`, {
          responseType: 'json',
        });
        console.log(response.data);
        const dataFiles = response.data.map((file) => ({
          name: file.name,
          data: file.data, 
        }));

        setFiles(dataFiles);
      } catch (error) {
        setError(`This document has no files`);
      }
    };

    fetchFiles();
  }, [props.documentId]);

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
                <Button 
                  variant="success" 
                  onClick={() => handleDownload(file.name, file.data)} 
                  size="sm"
                  style={{ float: 'right' }}
                >
                  Download
                </Button>
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

FileList.propTypes = {
  documentId: PropTypes.number,
};
export default DocumentList;