import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

function AppNavbar({ loggedIn, handleLoginClick, handleShowModal }) {
  const isMobile = window.innerWidth <= 768;

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">Kiruna</Navbar.Brand>
          {/* Toggle button for mobile view */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              (
                <>
                  <Nav.Link onClick={() => handleShowModal('Manage Documents', 'manage')}>
                    Manage Documents
                  </Nav.Link>
                  <Nav.Link onClick={() => handleShowModal('Link Documents', 'link')}>
                    Link Documents
                  </Nav.Link>
                </>
              )
            </Nav>
            <span className="navbar-text ms-auto">
              {isMobile ? (
                <span
                  className="login-logout-text"
                  onClick={handleLoginClick}
                  style={{ cursor: 'pointer', color: 'white' }}
                >
                  {loggedIn ? 'Logout' : 'Login'}
                </span>
              ) : (
                <button onClick={handleLoginClick} className="btn btn-outline-light">
                  {loggedIn ? 'Logout' : 'Login'}
                </button>
              )}
            </span>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

AppNavbar.propTypes = {
  loggedIn: PropTypes.bool,
  handleLoginClick: PropTypes.func,
  handleShowModal: PropTypes.func,
};

export default AppNavbar;