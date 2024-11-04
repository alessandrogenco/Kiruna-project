import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import Documents from './Documents'; // Import the Documents component
import LinkDocuments from './LinkDocuments'; // Import the LinkDocuments component

function MessageModal({ show, handleClose, message, modalType }) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{modalType === 'manage' ? 'Manage Documents' : 'Link Documents'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
        {modalType === 'manage' ? (
          <Documents show={show} handleClose={handleClose} />
        ) : (
          <LinkDocuments />
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default MessageModal;