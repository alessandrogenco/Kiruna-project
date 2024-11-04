// ExplorePage.jsx
import React from 'react';
import PropTypes from "prop-types";

function ExplorePage(props) {
  return (
    <div>
      <h1>Explore Page</h1>
      {props.isLoggedIn ? (
        <button onClick={props.handleLogout} className="btn btn-primary">
          Logout
        </button>
      ) : (
        <p>You are not logged in.</p>
      )}
    </div>
  );
}

ExplorePage.propTypes = {
  isLoggedIn: PropTypes.bool,
  handleLogout: PropTypes.func,
};

export default ExplorePage;