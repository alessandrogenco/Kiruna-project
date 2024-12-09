import React, { useState } from 'react';
import { getDocumentLinks } from '../API.mjs'; // Import the function
import './DocumentViewer.css';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const DocumentViewer = ({ isLoggedIn, documentData, onClose }) => {
  const [viewDescription, setViewDescription] = useState(false);
  const [documentLinks, setDocumentLinks] = useState([]);
  const [showLinks, setShowLinks] = useState(false);
  const navigate = useNavigate();

  const handleConnectionsClick = async () => {
    if (showLinks) {
      setShowLinks(false); // Hide links if they're already visible
    } else {
      try {
        const links = await getDocumentLinks(documentData.id);
        setDocumentLinks(links.links);
        setShowLinks(true); // Show links when they are fetched
      } catch (error) {
        console.error('Error fetching document links:', error);
      }
    }
  };

  const handleEditClick = () => {
    navigate(`/editDocument/${documentData.id}`, { state: { document: documentData, explorePage: true} });
  };


  if (!documentData) return null;

  return (
<div className="my-document-viewer-wrapper">
  <div className="document-viewer">
    <div className="fixed-header">
      <h3>{documentData.title}</h3>
      <button className="close-button" onClick={onClose}>&times;</button>
    </div>
    {!viewDescription ? (
      <div className="document-details">
        <div className="scrollable-content">
          <p><strong>Stakeholder:</strong> {documentData.stakeholders}</p>
          <p><strong>Issuance date:</strong> {documentData.issuanceDate}</p>
          <p><strong>Type:</strong> {documentData.type}</p>
          <button className='btn-as-label' onClick={handleConnectionsClick} style={{ cursor: 'pointer', color: 'blue' }}>
            <strong>Connections:</strong> {/*documentData.connections*/}
          </button>
          {showLinks && (
            <ul className="document-links custom-document-links">
              {documentLinks ? documentLinks.map((link, index) => (
                <li key={link.title + index}>{link.title + " | " + link.type}</li>
              )) : <p>No connections available</p>}
            </ul>
          )}
          <div className="button-group">
            {isLoggedIn && (
              <button className="btn-edit-style" onClick={handleEditClick}>Edit</button>
            )}
            <button onClick={() => setViewDescription(true)}>View Description</button>
          </div>
        </div>
      </div>
    ) : (
      <div className="document-description">
        <div className="scrollable-content">
          <p><strong>Description:</strong> {documentData.description}</p>
          <div className="button-group">
            <button onClick={() => setViewDescription(false)}>Back to Details</button>
          </div>
        </div>
      </div>
    )}
  </div>
</div>



  );
};

DocumentViewer.propTypes = {
  isLoggedIn: PropTypes.bool,
  documentData: PropTypes.object,
  onClose: PropTypes.func,
};



export default DocumentViewer;
