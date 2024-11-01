import React, { useState }  from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import MessageModal from './MessageModal'; 

const AppNavbar = ({ isLoggedIn, role, onLoginToggle }) => {
  
  const navigate = useNavigate(); // Allows navigation between pages
  const [showModal, setShowModal] = useState(false);
  
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  
  // Function to handle login/logout button clicks
  const handleLoginClick = () => {
    if (isLoggedIn) {
      onLoginToggle(); // Logs out if currently logged in
    } else {
      navigate('/login'); // Redirects to login page if not logged in
    }
  };
  return (
    <div className="vh-100 d-flex flex-column">
    <Navbar bg="dark" variant="dark" expand="md" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} to="/">Kiruna</Navbar.Brand>
        {/* Toggle button for mobile view */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/* Link Documents and Role Display */}
            <Nav.Link className="text-light" onClick={handleShowModal}>Add description documents</Nav.Link>
            <Nav.Link as={Link} to="/documents" className="text-light">Link documents</Nav.Link>
            {/*<Nav.Link className="text-light">Role | {isLoggedIn ? role : 'Not logged in'}</Nav.Link>+*/}
          </Nav>
          {/* Login/Logout Button */}
          <Button onClick={handleLoginClick} variant="outline-light">
            {isLoggedIn ? 'Logout' : 'Login'}
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  {/* Message Modal */}
  <MessageModal
        show={showModal}
        handleClose={handleCloseModal}
      />
    </div>
    
  );
};
export default AppNavbar;