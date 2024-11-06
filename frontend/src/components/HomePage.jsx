import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import AppNavbar from './Navbar';
import PropTypes from "prop-types";

function HomePage(props) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <AppNavbar isLoggedIn={props.isLoggedIn} handleLogout={props.handleLogout} />
      <div className="homepage">
        <div className="welcome-text">
          <h1 className="text-shadow-basic" style={{ textAlign: 'left' }}>KirunaExplorer</h1>
          <p className="text-shadow-basic" style={{ textAlign: 'left', paddingBottom: '1em' }}>
            {isMobile
              ? "Explore Kiruna, a unique Swedish city that tells a story of transformation through its architecture. Join us to understand how the mining industry has shaped the urban landscape and identity of Kiruna."
              : "Discover Kiruna, a unique Swedish city that tells a story of transformation and innovation through its architecture. Due to mining development, Kiruna has undergone profound changes over the years, with buildings that reflect its industrial history and resilient spirit. In this guide, you will explore the highlights of the city’s architectural evolution, from its iconic historic buildings to modern sustainable solutions. Join us on this journey to understand how mining has shaped not only the urban landscape but also the identity of Kiruna."
            }
          </p>
          <div className="button-container button-shadow">
            <button className="btn-grad mt-2" onClick={() => navigate('/explore')}>
              EXPLORE
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

HomePage.propTypes = {
  isLoggedIn: PropTypes.bool,
  handleLogout: PropTypes.func,
};

export default HomePage;