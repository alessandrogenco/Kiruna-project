import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MessageModal from './MessageModal';
import PropTypes from "prop-types";
import 'bootstrap-icons/font/bootstrap-icons.css';

const AppNavbar = (props) => {
  const { isLoggedIn } = props;
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleLoginClick = () => {
    if (isLoggedIn) {
      props.handleLogout();
    } else {
      navigate('/login');
    }
  };

  // Rileva il dispositivo mobile in base alla larghezza dello schermo
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992); // Imposta isMobile su true per schermi inferiori a 768px
    };

    window.addEventListener('resize', handleResize); // Aggiungi listener per la ridimensione
    return () => window.removeEventListener('resize', handleResize); // Rimuovi listener su dismount
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            {isMobile ? (
              <i className="bi bi-house-fill text-white"></i>
            ) : (
              "KirunaExplorer"
            )}
          </a>
          <button
            className="navbar-toggler"
            type="button"
            onClick={() => document.getElementById('navbarText').classList.toggle('collapse')}
            aria-controls="navbarText"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarText">
            {isLoggedIn && (
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                  <a className="nav-link active clickable" onClick={handleShowModal}>
                    Manage Documents
                  </a>
                </li>
                <li className="nav-item">
                  <Link className="nav-link active" to="/link-documents">
                    Link documents
                  </Link>
                </li>
              </ul>
            )}
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
          </div>
        </div>
      </nav>
      <MessageModal show={showModal} handleClose={handleCloseModal} />
    </>
  );
};

AppNavbar.propTypes = {
  isLoggedIn: PropTypes.bool,
  handleLogout: PropTypes.func,
};

export default AppNavbar;
