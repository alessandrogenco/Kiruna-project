import React, { useState } from 'react';
import './DocumentViewer.css';

const DocumentViewer = ({ documentData, onClose }) => {
  const [viewDescription, setViewDescription] = useState(false);

  if (!documentData) return null;

  return (
    <div className="my-document-viewer-wrapper">
      <div className="document-viewer">
        
        <button className="close-button" onClick={onClose}>&times;</button>
        {!viewDescription ? (
          <div className="document-details">
            <h3>{documentData.title}</h3>
            <p><strong>Stakeholder:</strong> {documentData.stakeholder}</p>
            <p><strong>Issuance date:</strong> {documentData.issuanceDate}</p>
            <p><strong>Type:</strong> {documentData.type}</p>
            <div className="button-group">
              <button onClick={() => setViewDescription(true)}>View Description</button>
            </div>
          </div>
        ) : (
          <div className="document-description">
            <h3>{documentData.title}</h3>
            <p><strong>Description:</strong> {documentData.description}</p>

            <div className="button-group">
              <button onClick={() => setViewDescription(false)}>Go Back</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
