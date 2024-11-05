import React, {useState} from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import MessageModal from './MessageModal';

function AppNavbar({ isLoggedIn, handleLogout }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalType, setModalType] = useState('');
  const isMobile = window.innerWidth <= 768;

  const handleShowModal = (content, type) => {
    setModalContent(content);
    setModalType(type);
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setModalContent('');
    setModalType('');
  };


  const handleLoginClick = () => {
      navigate('/login');
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">Kiruna</Navbar.Brand>
          {/* Toggle button for mobile view */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {isLoggedIn && (
                <>
                  <Nav.Link onClick={() => handleShowModal('Manage Documents', 'manage')}>
                    Manage Documents
                  </Nav.Link>
                  <Nav.Link onClick={() => handleShowModal('Link Documents', 'link')}>
                    Link Documents
                  </Nav.Link>
                </>
              )}
            </Nav>
            <span className="navbar-text ms-auto">
              {isMobile ? (
                <span
                  className="login-logout-text"
                  onClick={handleLoginClick}
                  style={{ cursor: 'pointer', color: 'white' }}
                >
                  {isLoggedIn ? 'Logout' : 'Login'}
                </span>
              ) : (
                <button onClick={handleLoginClick} className="btn btn-outline-light">
                  {isLoggedIn ? 'Logout' : 'Login'}
                </button>
              )}
            </span>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <MessageModal show={showModal} handleClose={handleCloseModal} modalType={modalType} />
    </>
  );
}


AppNavbar.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  handleLogout: PropTypes.func.isRequired,
};

export default AppNavbar;