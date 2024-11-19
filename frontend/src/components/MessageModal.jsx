import React from 'react';
import { Modal } from 'react-bootstrap';
import Documents from './Documents'; // Import the Documents component

function MessageModal({ show, handleClose, message, modalType }) {
  return (
    <Modal show={show} onHide={handleClose} className='modal-xl'>
      <Modal.Header closeButton>
        <Modal.Title>{modalType === 'manage' ? 'Manage Documents' : 'Link Documents'}</Modal.Title>
      </Modal.Header>
      <Modal.Body >
        <p>{message}</p>
        {modalType === 'manage' ? (
          <Documents show={show} handleClose={handleClose} />
        ) : (
          <LinkDocuments />
        )}
      </Modal.Body>
    </Modal>
  );
}

export default MessageModal;