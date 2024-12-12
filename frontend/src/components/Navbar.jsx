import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function AppNavbar({ isLoggedIn, handleLogout }) {
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 768;

  const handleLoginClick = () => {
    if(!isLoggedIn){
      navigate('/login');
    } else {
      handleLogout();
    }
  };

  return (
    <Navbar style={{ backgroundColor: '#000000' }} variant="dark" expand="lg">
      <Container fluid className="px-4">
        <Navbar.Brand as={Link} to="/">KirunaExplorer</Navbar.Brand>
        {/* Toggle button for mobile view */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isLoggedIn && (
              <>
                <Nav.Link onClick={() => navigate('/explore')} style={{color: 'lightgray'}}>
                  Explore 
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/documentsPage')} style={{color: 'lightgray'}}>
                  Manage Documents
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/graph')} style={{color: 'lightgray'}}>
                  Graph
                </Nav.Link>
              </>
            )}
          </Nav>
          <span className="navbar-text ms-auto">
            {isMobile ? (
              <button
                className="btn-as-label"
                onClick={handleLoginClick}
                style={{ cursor: 'pointer', color: 'white' }}
              >
                {isLoggedIn ? 'Logout' : 'Login'}
              </button>
            ) : (
              <button onClick={handleLoginClick} className="btn btn-outline-light">
                {isLoggedIn ? 'Logout' : 'Login'}
              </button>
            )}
          </span>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}


AppNavbar.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  handleLogout: PropTypes.func.isRequired,
};

export default AppNavbar;