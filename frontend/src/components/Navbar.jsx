import React, { useState } from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import MessageModal from './MessageModal';
import PropTypes from "prop-types";

const AppNavbar = (props) => {
  const { isLoggedIn } = props; // Destruttura isLoggedIn dalle props
  
  const navigate = useNavigate(); // Allows navigation between pages
  const [showModal, setShowModal] = useState(false);
  
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  
  // Function to handle login/logout button clicks
  const handleLoginClick = () => {
    if (isLoggedIn) {
      props.handleLogout(); // Logs out if currently logged in
    } else {
      navigate('/login'); // Redirects to login page if not logged in
    }
  };
  
  return (
    <>
      {/*<Navbar bg="dark" variant="dark" expand="md">
        <Container>
          <Navbar.Brand as={Link} to="/">KirunaExplorer</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            {isLoggedIn ? (
              <Nav className="me-auto">
                <Nav.Link className="text-light" onClick={handleShowModal}>Add description documents</Nav.Link>
                <Nav.Link as={Link} to="/documents" className="text-light">Link documents</Nav.Link>
              </Nav>
            ) : null}
            <Button onClick={handleLoginClick} variant="outline-light">
              {isLoggedIn ? 'Logout' : 'Login'}
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {//MessageModal}
      <MessageModal
        show={showModal}
        handleClose={handleCloseModal}
      />*/}
      <nav className="navbar navbar-expand-lg navbar-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">KirunaExplorer</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarText">
          {isLoggedIn ? (
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link active clickable" onClick={handleShowModal}>Manage Documents</a>
              </li>
              <li className="nav-item">
                <a className="nav-link active" href="/documents">Link documents</a>
              </li>
            </ul> ) : null}
            <span className="navbar-text ms-auto">
              <Button onClick={handleLoginClick} variant="outline-light">
                {isLoggedIn ? 'Logout' : 'Login'}
              </Button>
            </span>
          </div>
        </div>
      </nav>
      <MessageModal
        show={showModal}
        handleClose={handleCloseModal}
      />
    </>
  );
};

AppNavbar.propTypes = {
  isLoggedIn: PropTypes.bool, 
  handleLogout: PropTypes.func, 
};

export default AppNavbar;
