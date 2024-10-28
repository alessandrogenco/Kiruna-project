// ExplorePage.jsx
import React from 'react';
import Navbar from './Navbar'; // Adjust the path based on your folder structure

function ExplorePage({ isLoggedIn, role, onLoginToggle }) {
  return (
    <div className="vh-100 d-flex flex-column">
      {/* Navbar at the top */}
      <Navbar isLoggedIn={isLoggedIn} role={role} onLoginToggle={onLoginToggle} />

      {/* Page content centered below */}
      <div className="text-center flex-grow-1 d-flex flex-column justify-content-center align-items-center">
        <h1>Explore Page</h1>
        <p>Content will be added here.</p>
      </div>
    </div>
  );
}

export default ExplorePage;