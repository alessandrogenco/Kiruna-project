import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import Documents from './Documents'; // Import the Documents component

function MessageModal({ show, handleClose, message }) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Documents</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message}</p>
        <Documents show={show} handleClose={handleClose} /> {/* Include the Documents component */}
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