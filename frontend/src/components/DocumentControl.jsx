import { Form, Button, Row, Col, Alert } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import AppNavbar from "./Navbar";
import '../styles/DocumentControl.css';

function DocumentControl(props) {

  const { documentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const existingDocument = location.state?.document;

    // Stati per i valori dei campi del modulo
    const [formData, setFormData] = useState({
      id: existingDocument?.id || '',
      title: existingDocument?.title || '',
      stakeholders: existingDocument?.stakeholders || '',
      scale: existingDocument?.scale || '',
      issuanceDate: existingDocument?.issuanceDate || '', // Assicurato valore predefinito
      type: existingDocument?.type || '',
      connections: existingDocument?.connections || '',
      language: existingDocument?.language || '',
      pages: existingDocument?.pages || '',
      lat: existingDocument?.lat || '',
      lon: existingDocument?.lon || '',
      area: existingDocument?.area || '',
      description: existingDocument?.description || ''
    });

    useEffect(() => {
      if (existingDocument) {
        setFormData({
          id: existingDocument.id || '',
          title: existingDocument.title || '',
          stakeholders: existingDocument.stakeholders || '',
          scale: existingDocument.scale || '',
          issuanceDate: existingDocument.issuanceDate || '',
          type: existingDocument.type || '',
          connections: existingDocument.connections || '',
          language: existingDocument.language || '',
          pages: existingDocument.pages || '',
          lat: existingDocument.lat || '',
          lon: existingDocument.lon || '',
          area: existingDocument.area || '',
          description: existingDocument.description || ''
        });
      }
    }, [existingDocument]);

    // Stato per i messaggi di feedback
    const [message, setMessage] = useState('');
    const [error, setError] = useState(''); // Stato per il messaggio di errore

    // Gestore per l'aggiornamento dei campi
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value ?? '' });
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
      e.preventDefault();

      // Eseguiamo la validazione del form
      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        setMessage('');
        return;
      }

      try {
        // Determina l'URL e il metodo in base alla presenza di documentId
        let url;
        let method;

        if (documentId) {
          // Modifica di un documento esistente
          url = 'http://localhost:3001/api/updateDocument'; // Usa l'endpoint di aggiornamento
          method = 'POST'; // Metodo POST per la modifica
        } else {
          // Aggiunta di un nuovo documento
          url = 'http://localhost:3001/api/addDocument'; // Usa l'endpoint per aggiungere
          method = 'POST'; // Metodo POST per l'aggiunta
        }

        // Esegui la richiesta
        const response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData), // Invia i dati del modulo
        });

        // Controlla se la risposta è positiva
        if (!response.ok) throw new Error('Network response was not ok');
        
        // Ottieni la risposta JSON
        const result = await response.json();

        // Mostra il messaggio di successo
        setMessage(documentId ? 'Document updated successfully!' : 'Document added successfully!');
        setError(''); // Rimuovi eventuali errori

        // Naviga alla pagina dei documenti
        navigate('/documentsPage');
      } catch (error) {
        // Gestisci l'errore
        setError(`Error: ${error.message}`);
        setMessage(''); // Rimuovi eventuali messaggi di successo
      }
    };


    
    return (
      <>
        <AppNavbar isLoggedIn={props.isLoggedIn} handleLogout={props.handleLogout}/>
        
        <Form className="mt-4 mx-5 mb-4" onSubmit={handleSubmit}>
          <Row className="d-flex justify-content-between align-items-center mx-3 mb-3">
            <Col>
            <h1>{documentId ? "Edit Document" : "Add a New Document"}</h1>
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
              <Form.Label className='form-label'>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group as={Col} controlId="formStakeholders">
              <Form.Label className='form-label'>Stakeholders</Form.Label>
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
              <Form.Label className='form-label'>Scale</Form.Label>
              <Form.Control
                placeholder="Enter scale"
                type="text"
                name="scale"
                value={formData.scale}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group as={Col} controlId="formDate">
              <Form.Label className='form-label'>Date</Form.Label>
              <Form.Control
                type="date"
                name="issuanceDate" // Cambiato "date" in "issuanceDate"
                value={formData.issuanceDate}
                onChange={handleChange}
              />
            </Form.Group>
          </Row>

          <Row className="mb-3 mx-3">
            <Form.Group as={Col} controlId="formType">
              <Form.Label className='form-label'>Type</Form.Label>
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
              <Form.Label className='form-label'>Language</Form.Label>
              <Form.Control
                as="select"
                name="language"
                value={formData.language}
                onChange={handleChange}
              >
                <option value="">Select a language</option>
                <option value="English">English</option>
                <option value="Swedish">Swedish</option>
              </Form.Control>
            </Form.Group>

            <Form.Group as={Col} controlId="formPages">
              <Form.Label className='form-label'>Pages</Form.Label>
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
              <Form.Label className='form-label'>Latitude</Form.Label>
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
              <Form.Label className='form-label'>Longitude</Form.Label>
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
              <Form.Label className='form-label'>Description</Form.Label>
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
                  {documentId ? "Save" : "Add"}
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
