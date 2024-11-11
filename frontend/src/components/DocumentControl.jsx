import { Form, Button, Row, Col, Alert } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { useState } from 'react';
import AppNavbar from "./Navbar";

function DocumentControl(props) {
    const location = useLocation();
    const newDocument = location.state?.newDocument;
    console.log(newDocument);

    const navigate = useNavigate();

    // Stati per i valori dei campi del modulo
    const [formData, setFormData] = useState({
        title: '',
        stakeholders: '',
        scale: '',
        date: '',
        type: '',
        connections: '',
        language: '',
        pages: '',
        lat: '',
        lon: '',
        area: '',
        description: ''
    });

    // Stato per i messaggi di feedback
    const [message, setMessage] = useState('');
    const [error, setError] = useState(''); // Stato per il messaggio di errore

    // Gestore per l'aggiornamento dei campi
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Funzione di validazione
    function validateForm() {
        const lat = parseFloat(formData.lat);
        const lon = parseFloat(formData.lon);

        if (lat < 67.7500 || lat > 68.3333) {
            return "Latitude is out of Kiruna Municipality borders!";
        }
        if (lon < 20.7833 || lon > 21.1333) {
            return "Longitude is out of Kiruna Municipality borders!";
        }
        return '';
    }

    // Gestore per l'invio del modulo
    const handleSubmit = async (e) => {
        e.preventDefault(); // Previene il comportamento di default

        // Controllo di validazione
        const validationError = validateForm();
        if (validationError) {
            setError(validationError); // Imposta il messaggio di errore
            setMessage(''); // Resetta il messaggio di successo
            return;
        }
        
        try {
            const response = await fetch('http://localhost:3001/api/addDocument', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Network response was not ok');
            
            const addedDocument = await response.json();
            setMessage('Document added successfully!');
            setError(''); // Resetta il messaggio di errore
            
            // Naviga alla pagina documenti dopo l'invio
            navigate('/documentsPage');
        } catch (error) {
            console.error('Error adding document:', error);
            setError('Error adding document: ' + error.message);
            setMessage(''); // Resetta il messaggio di successo
        }
    };

    return (
      <>
        <AppNavbar isLoggedIn={props.isLoggedIn} handleLogout={props.handleLogout}/>
        
        <Form className="mt-4 mx-5 mb-4" onSubmit={handleSubmit}>
          <Row className="d-flex justify-content-between align-items-center mx-3 mb-3">
            <Col>
              <h1 className="mt-3">Add a new document</h1>
            </Col>
          </Row>

          {/* Banner di errore */}
          {error && (
            <Alert variant="danger" className="mx-3">
              {error}
            </Alert>
          )}

          {/* Banner di successo */}
          {message && (
            <Alert variant="success" className="mx-3">
              {message}
            </Alert>
          )}

          <Row className="mb-3 mx-3">
            <Form.Group as={Col} controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group as={Col} controlId="formStakeholders">
              <Form.Label>Stakeholders</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter stakeholders"
                name="stakeholders"
                value={formData.stakeholders}
                onChange={handleChange}
              />
            </Form.Group>
          </Row>
          
          <Row className="mb-3 mx-3">
            <Form.Group as={Col} controlId="formScale">
              <Form.Label>Scale</Form.Label>
              <Form.Control
                placeholder="Enter scale"
                type="text"
                name="scale"
                value={formData.scale}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group as={Col} controlId="formDate">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </Form.Group>
          </Row>

          <Row className="mb-3 mx-3">
            <Form.Group as={Col} controlId="formType">
              <Form.Label>Type</Form.Label>
              <Form.Control
                as="select"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="">Select document type</option>
                <option value="Design">Text - Design</option>
                <option value="Informative">Text - Informative</option>
                <option value="Prescriptive">Text - Prescriptive</option>
                <option value="Technical">Text - Technical</option>
                <option value="Agreement">Concept - Agreement</option>
                <option value="Conflict">Concept - Conflict</option>
                <option value="Consultation">Concept - Consultation</option>
                <option value="Material effect">Concept - Material effect</option>
                <option value="Paper">Concept - Paper</option>
                <option value="Action">Action</option>
              </Form.Control>
            </Form.Group>

            <Form.Group as={Col} controlId="formLanguage">
              <Form.Label>Language</Form.Label>
              <Form.Control
                as="select"
                name="language"
                value={formData.language}
                onChange={handleChange}
              >
                <option value="">Select a language</option>
                <option value="English">English</option>
                <option value="Swedish">Swedish</option>
                <option value="Danish">Danish</option>
                <option value="Norwegian">Norwegian</option>
                <option value="Finnish">Finnish</option>
                <option value="Icelandic">Icelandic</option>
                <option value="Estonian">Estonian</option>
                <option value="Latvian">Latvian</option>
                <option value="Lithuanian">Lithuanian</option>
              </Form.Control>
            </Form.Group>

            <Form.Group as={Col} controlId="formPages">
              <Form.Label>Pages</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter pages"
                name="pages"
                value={formData.pages}
                onChange={handleChange}
              />
            </Form.Group>
          </Row>

          <Row className="mb-3 mx-3">
            <Form.Group as={Col} controlId="formLat">
              <Form.Label>Latitude</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter latitude"
                name="lat"
                step="0.0001"
                value={formData.lat}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group as={Col} controlId="formLon">
              <Form.Label>Longitude</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter longitude"
                name="lon"
                step="0.0001"
                value={formData.lon}
                onChange={handleChange}
              />
            </Form.Group>
          </Row>

          <Row className="mx-3">
            <Form.Group controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                placeholder="Enter description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
          </Row>

          <Row className="mx-3">
            <Col className="d-flex justify-content mt-3 pb-5">
                <Button className="me-3" variant="success" type="submit">
                  Add
                </Button>
                <Button variant="danger" onClick={() => navigate('/documentsPage')}>
                  Cancel
                </Button>
            </Col>
          </Row>
        </Form>
      </>
    );
}

DocumentControl.propTypes = {
  isLoggedIn: PropTypes.bool,
  handleLogout: PropTypes.func,
};

export default DocumentControl;
