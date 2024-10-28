// HomePage.jsx
import { useNavigate } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap'; // Importa i componenti Row e Col
import '../App.css'; 

function HomePage({ username }) {
  const navigate = useNavigate();

  return (
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
      </Col>
      <Col md={6} className="button-container d-flex flex-column justify-content-center align-items-center"> {/* Colonna per i pulsanti */}
        <button className="btn custom-green mb-3" onClick={() => navigate('/login')}>
          Login
        </button>
        <button className="btn custom-green" onClick={() => navigate('/explore')}>
          Start to Explore
        </button>
      </Col>
    </Row>
  );
}

export default HomePage;
