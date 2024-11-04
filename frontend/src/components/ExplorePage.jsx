// ExplorePage.jsx
import React from 'react';
import AppNavbar from './Navbar';
import PropTypes from "prop-types";

function ExplorePage(props) {
  return (
    <div className="vh-100 d-flex flex-column">
      <AppNavbar isLoggedIn={props.isLoggedIn} handleLogout={props.handleLogout}></AppNavbar>
      {/* Page content centered below */}
      <div className="text-center flex-grow-1 d-flex flex-column justify-content-center align-items-center">
        <h1>Explore Page</h1>
        <p>Content will be added here.</p>
      </div>
    </div>
  );
}

ExplorePage.propTypes = {
  isLoggedIn: PropTypes.bool,
  handleLogout: PropTypes.func,
};

export default ExplorePage;