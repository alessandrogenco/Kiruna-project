import React, { useState } from 'react';
import { getDocumentLinks } from '../API.mjs'; // Importa correttamente la funzione
import './DocumentViewer.css';

const DocumentViewer = ({ documentData, onClose }) => {
  const [viewDescription, setViewDescription] = useState(false);
  const [documentLinks, setDocumentLinks] = useState([]);
  const [showLinks, setShowLinks] = useState(false);

  const handleConnectionsClick = async () => {
    if (showLinks) {
      setShowLinks(false); // Nascondi i link se sono già visibili
    } else {
      try {
        const links = await getDocumentLinks(documentData.id);
        setDocumentLinks(links.links);
        setShowLinks(true); // Mostra i link quando vengono recuperati
      } catch (error) {
        console.error('Error fetching document links:', error);
      }
    }
  };

  if (!documentData) return null;

 

  return (
    <div className="my-document-viewer-wrapper">
      <div className="document-viewer">
        <button className="close-button" onClick={onClose}>&times;</button>
        {!viewDescription ? (
          <div className="document-details">
            <h3>{documentData.title}</h3>
            <p><strong>Stakeholder:</strong> {documentData.stakeholders}</p>
            <p><strong>Issuance date:</strong> {documentData.issuanceDate}</p>
            <p><strong>Type:</strong> {documentData.type}</p>
            <p onClick={handleConnectionsClick} style={{ cursor: 'pointer', color: 'blue' }}>
              <strong>Connections:</strong> {documentData.connections}
            </p>
            {showLinks && (
        <>
          {documentLinks ? (
            <ul className="document-links custom-document-links">
              {documentLinks.map((link, index) => {
                console.log('Document link:', link.title); // Log per ogni elemento della lista
                return <li key={index}>{link.title}</li>;
              })}
            </ul>
          ) : (
            <p>No connections available.</p>
          )}
        </>
      )}
            <div className="button-group">
              <button onClick={() => setViewDescription(true)}>View Description</button>
            </div>
          </div>
        ) : (
          <div className="document-description">
            <h3>{documentData.title}</h3>
            <p><strong>Description:</strong> {documentData.description}</p>
            <div className="button-group">
              <button onClick={() => setViewDescription(false)}>Back to Details</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;