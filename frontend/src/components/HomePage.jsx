// HomePage.jsx
import { useNavigate } from 'react-router-dom';
import { Row, Col, Navbar, Container } from 'react-bootstrap'; // Importa i componenti Row e Col
import '../App.css'; 
import AppNavbar from './Navbar';
import App from '../App';
import PropTypes from "prop-types";

function HomePage(props) {
  const navigate = useNavigate();

  return (
    <>
    {/*<nav class="navbar bg-dark border-body" data-bs-theme="dark">
      <div class="container-fluid">
        <a class="navbar-brand" href='/'>KirunaExplorer</a>
        <form class="d-flex">
          <button class="btn btn-light" type="submit" onClick={() => navigate('/login')}>Login</button>
        </form>
      </div>
    </nav>*/}
    <AppNavbar isLoggedIn={props.isLoggedIn} handleLogout={props.handleLogout}></AppNavbar>
    <Row className="homepage"> {/* Usa Row per il layout a griglia */}
      <Col md={6} className="welcome-text"> {/* Colonna per il testo di benvenuto */}
        <h1>KirunaExplorer</h1>
        <p>
        Discover Kiruna, a unique Swedish city that tells a story of transformation and innovation through its architecture. 
        Due to mining development, Kiruna has undergone profound changes over the years, 
        with buildings that reflect its industrial history and resilient spirit. 
        In this guide, you will explore the highlights of the city’s architectural evolution, 
        from its iconic historic buildings to modern sustainable solutions. 
        Join us on this journey to understand how mining has shaped not only the urban landscape but also the identity of Kiruna.
        </p>
        <button className="btn-grad mt-3" onClick={() => navigate('/explore')}>
          EXPLORE
        </button>
      </Col>
      {/*<Col md={6} className="button-container d-flex flex-column justify-content-center align-items-center"> 
        <button className="btn custom-green mb-3" onClick={() => navigate('/login')}>
          Login
        </button>
        <button className="btn custom-green" onClick={() => navigate('/explore')}>
          Start to Explore
        </button>
      </Col>*/}
    </Row>
    </>
  );
}

HomePage.propTypes = {
  isLoggedIn: PropTypes.bool,
  handleLogout: PropTypes.func,
};

export default HomePage;
