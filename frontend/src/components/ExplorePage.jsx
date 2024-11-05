// ExplorePage.jsx
import React from 'react';
import PropTypes from "prop-types";
import AppNavbar from './Navbar';
import { Row, Col } from 'react-bootstrap';

function ExplorePage(props) {
  return (
    <>
      <AppNavbar isLoggedIn={props.isLoggedIn} handleLogout={props.handleLogout} />
      <Row className="vh-100 justify-content-center align-items-center">
        <Col xs="auto">
          <h1 className="text-center">Explore Page</h1>
        </Col>
      </Row>
    </>
  );
}

ExplorePage.propTypes = {
  isLoggedIn: PropTypes.bool,
  handleLogout: PropTypes.func,
};

export default ExplorePage;