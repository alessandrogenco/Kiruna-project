// ExplorePage.jsx
import React from 'react';

function ExplorePage({ isLoggedIn, role, onLoginToggle }) {
  return (
    <div className="vh-100 d-flex flex-column">

      {/* Page content centered below */}
      <div className="text-center flex-grow-1 d-flex flex-column justify-content-center align-items-center">
        <h1>Explore Page</h1>
        <p>Content will be added here.</p>
      </div>
    </div>
  );
}

export default ExplorePage;