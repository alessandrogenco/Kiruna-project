// HomePage.jsx
import { Row, Col } from 'react-bootstrap';
import Auth from './Auth'; // Import del componente Auth per il login
import '../App.css';
import PropTypes from "prop-types";

function HomePage(props) {
  return (
    <div className="text-white m-0"> 
      <Row> 
        <Col xs={5} className="welcome-text justify-content-center align-items-center d-flex"> 
          <div>
            <h1 className='large-heading'>KirunaExplorer</h1>
            <p>
              Discover Kiruna, a unique Swedish city that tells a story of transformation and innovation through its architecture.
              Due to mining development, Kiruna has undergone profound changes over the years, with buildings that reflect its industrial history and resilient spirit.
              In this guide, you will explore the highlights of the city’s architectural evolution, from its iconic historic buildings to modern sustainable solutions.
              Join us on this journey to understand how mining has shaped not only the urban landscape but also the identity of Kiruna.
            </p>
          </div>
        </Col>
        <Col sm={5} className="text-dark"> 
          <Auth login={props.login}/> 
        </Col>
      </Row>
    </div>
  );
}

HomePage.propTypes = {
  login: PropTypes.func,
};

export default HomePage;
