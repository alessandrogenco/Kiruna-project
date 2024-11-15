import { Form, Button, Row, Col, Alert } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import AppNavbar from "./Navbar";
import '../styles/DocumentControl.css';
import MapModal from './MapModal';


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
    const [showMapModal, setShowMapModal] = useState(false);


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

    const handleDateChange = (e) => {
      const { name, value } = e.target;
      let newValue = value;

      if (name === 'year') {
        if (newValue.length > 4) {
          newValue = newValue.slice(0, 4);
        }
        if (newValue.length === 4 && (newValue < 1800 || newValue > new Date().getFullYear())) {
          newValue = '';
        }
      } else if (name === 'month') {
        if (newValue.length > 2) {
          newValue = newValue.slice(0, 2);
        }
        if (newValue < 1 || newValue > 12) {
          newValue = '';
        }
      } else if (name === 'day') {
        if (newValue.length > 2) {
          newValue = newValue.slice(0, 2);
        }
        const daysInMonth = getDaysInMonth(formData.issuanceDate.split('-')[0], formData.issuanceDate.split('-')[1]);
        if (newValue < 1 || newValue > daysInMonth) {
          newValue = '';
        }
      }
      
      setFormData((prevFormData) => {
        const dateParts = prevFormData.issuanceDate.split('-');
        if (name === 'year') {
          dateParts[0] = newValue;
        } else if (name === 'month') {
          dateParts[1] = newValue;
        } else if (name === 'day') {
          dateParts[2] = newValue;
        }

        let updatedDate = '';
        if (Array.isArray(dateParts)) {
          updatedDate = dateParts.filter(part => part !== '').join('-');
        } else {
          updatedDate = dateParts;        
        }
        
        const updatedFormData = { ...prevFormData, issuanceDate: updatedDate };

        // If the month or year changes, reset the day if it is invalid
        if (name === 'month' || name === 'year') {
          const daysInMonth = getDaysInMonth(dateParts[0], dateParts[1]);
          if (dateParts[2] && (parseInt(dateParts[2], 10) > daysInMonth || newValue === '')) {
            dateParts[2] = '';
            updatedFormData.issuanceDate = dateParts.filter(part => part !== '').join('-');
          }
        }

        return updatedFormData;
      });
    }
    
    // Funzione di validazione
    function validateForm() {
        const lat = parseFloat(formData.lat);
        const lon = parseFloat(formData.lon);

        if (lat < 67.82 || lat > 67.8800) {
            return "Latitude is out of Kiruna Municipality borders!";
        }
        if (lon < 20.1200 || lon > 20.4000) {
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

    const handleMapSelection = () => {
      setShowMapModal(true);
    };
    
    const handleLocationSelect = (position) => {
      setFormData({ ...formData, lat: position[0], lon: position[1] });
    };
  
    const handleCloseMapModal = () => {
      setShowMapModal(false);
    };

    const getDaysInMonth = (year, month) => {
      if (!year || !month) {
        return 31;
      }
      return new Date(year, month, 0).getDate();
    }

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
              <Form.Control className="form-control"
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
            <Form.Group as={Col} md={4} controlId="formScale">
              <Form.Label className='form-label'>Scale</Form.Label>
              <Form.Control
                placeholder="Enter scale"
                type="text"
                name="scale"
                value={formData.scale}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group as={Col} md={7} controlId="formDate" className="mx-5">
              <Row className="d-flex justify-content-end mx-8">
                <Form.Label className='form-label text-center'>Date</Form.Label>
                <Col md={4} className="d-flex">
                  <Form.Control
                    type="number"
                    name="year"
                    placeholder="YYYY"
                    value={formData.issuanceDate.split('-')[0] || ''}
                    onChange={handleDateChange}
                    min="1800"
                    max={new Date().getFullYear()}
                    onKeyDown={(e) => {
                      if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Delete') {
                        e.preventDefault();
                      }
                    }}
                  />
                </Col>
                <Col md={4} className="d-flex">
                  <Form.Control
                    type="number"
                    name="month"
                    placeholder="MM"
                    value={formData.issuanceDate.split('-')[1] || ''}
                    onChange={handleDateChange}
                    min="1"
                    max="12"
                    disabled={!formData.issuanceDate.split('-')[0]  || formData.issuanceDate.split('-')[0] < 1800}
                    onKeyDown={(e) => {
                      if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Delete') {
                        e.preventDefault();
                      }
                    }}
                  />
                </Col>
                <Col md={4} className="d-flex">
                  <Form.Control
                    type="number"
                    name="day"
                    placeholder="DD"
                    value={formData.issuanceDate.split('-')[2] || ''}
                    onChange={handleDateChange}
                    min="1"
                    max={getDaysInMonth(formData.issuanceDate.split('-')[0], formData.issuanceDate.split('-')[1])}
                    disabled={!formData.issuanceDate.split('-')[1]  || formData.issuanceDate.split('-')[1] < 1}
                    onKeyDown={(e) => {
                      if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Delete') {
                        e.preventDefault();
                      }
                    }}
                  />
                </Col>
              </Row>
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

          <Row className="mb-3 mx-3 d-flex justify-content-between">
            <Form.Group as={Col} controlId="formLat" md = {3}className="mr-3">
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
            <Form.Group as={Col} controlId="formLon" md = {3} className="mr-3">
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

            <Form.Group as={Col} md={2} className="d-flex align-items-center">
            <Button variant="secondary" className="mt-3" onClick={handleMapSelection}>
             Select Location on Map
            </Button>
            </Form.Group>
          </Row>

          <MapModal
              show={showMapModal}
              handleClose={handleCloseMapModal}
              onLocationSelect={handleLocationSelect}
          />

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
