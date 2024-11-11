import React, { useState } from 'react';
import './DocumentViewer.css';

const DocumentViewer = ({ documentData, onClose }) => {
  const [viewDescription, setViewDescription] = useState(false);

  if (!documentData) return null;

  return (
    <div className="document-viewer">
      {!viewDescription ? (
        <div className="document-details">
          <h3>{documentData.title}</h3>
          <p><strong>Stakeholder:</strong> {documentData.stakeholder}</p>
          <p><strong>Issuance date:</strong> {documentData.issuanceDate}</p>
          <p><strong>Type:</strong> {documentData.type}</p>
          <button onClick={() => setViewDescription(true)}>View Description</button>
          <button onClick={onClose}>Close</button>
        </div>
      ) : (
        <div className="document-description">
          <h3>{documentData.title}</h3>
          <p><strong>Description:</strong> {documentData.description}</p>
          <button onClick={() => setViewDescription(false)}>Go back</button>
          <button onClick={onClose}>Close</button>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;
