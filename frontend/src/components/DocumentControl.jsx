import { Form, Button, Row, Col, Alert, ListGroup } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import AppNavbar from "./Navbar";
import '../styles/DocumentControl.css';
import MapModal from './MapModal';
import axios from 'axios';
import LinkControl from "./LinkControl";
import API from "../API.mjs";

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
    const [files, setFiles] = useState([]);

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

    const [links, setLinks] = useState([]);
    const [newLinks, setNewLinks] = useState([]);
    const [hasDuplicates, setHasDuplicates] = useState(false);

    useEffect(() => {
      if (documentId) {
        const fetchLinks = async () => {
          try {
            const fetchedData = await API.getDocumentLinks(documentId);
    
            // Estrarre l'array di link dalla risposta (fetchedData.links)
            const fetchedLinks = Array.isArray(fetchedData.links) ? fetchedData.links : [];
            
            // Mappare i link per ottenere solo `id` e `type`
            const processedLinks = fetchedLinks.map(link => ({
              id: link.id,
              type: link.type,
              title: link.title,
            }));
    
            setLinks(processedLinks); // Imposta solo id e type nello stato
          } catch (error) {
            setError('Failed to load links');
          }
        };
    
        fetchLinks(); // Esegui la funzione appena il componente viene renderizzato con `documentId`
      }
    }, [documentId]);    
    

    // Stato per i messaggi di feedback
    const [message, setMessage] = useState('');
    const [error, setError] = useState(''); // Stato per il messaggio di errore

    // Gestore per l'aggiornamento dei campi
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value ?? '' });
    };

    const handleFileChange = (event) => {
      const newFiles = Array.from(event.target.files);
      const uniqueFiles = newFiles.filter(newFile => 
        !files.some(existingFile => existingFile.name === newFile.name && existingFile.size === newFile.size)
      );
      setFiles((prevFiles) => [...prevFiles, ...uniqueFiles]);
    };

    const handleRemoveFile = (index) => {
      setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
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

        if(hasDuplicates){
          return "Duplicate links detected. Please remove duplicates.";
        }
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
  
      // Validazione del form
      const validationError = validateForm();
      if (validationError) {
          setError(validationError);
          setMessage('');
          return;
      }
  
      try {
          // Determina l'URL e il metodo per la creazione o modifica del documento
          let url, method;
          if (documentId) {
              url = 'http://localhost:3001/api/updateDocument'; // Endpoint per aggiornare
              method = 'POST'; // Metodo POST per l'update
          } else {
              url = 'http://localhost:3001/api/addDocument'; // Endpoint per aggiungere
              method = 'POST'; // Metodo POST per l'add
          }
  
          // Esegui la richiesta per creare o aggiornare il documento
          const response = await fetch(url, {
              method: method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData), // Invia i dati del modulo
          });
  
          if (!response.ok) throw new Error('Network response was not ok');
  
          // Ottieni il risultato della richiesta
          const result = await response.json();
          const newDocumentId = result.id; // Ottieni l'id del documento creato o aggiornato
          
          if(files && files.length > 0) {
            // Carica i file
            const formDataFiles = new FormData();
            for (let i = 0; i < files.length; i++) {
                formDataFiles.append('resourceFiles', files[i]);
            }

            await axios.post(
                `http://localhost:3001/api/upload?documentId=${newDocumentId}`,
                formDataFiles,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
          }
  
          // Creazione dei link
          const createLinks = async () => {
              for (const link of newLinks) {
                  try {
                    console.log(newDocumentId);
                    console.log(link.targetDocumentId);
                    console.log(link.linkType);
                    await API.linkDocument(
                      newDocumentId,    // id del documento corrente
                      link.id,          // id del documento da collegare (era link.targetDocumentId)
                      link.type         // tipo di collegamento (era link.linkType)
                  );
                  } catch (error) {
                      console.error('Error linking documents:', error);
                      setError('Some links could not be created');
                  }
              }
          };
  
          await createLinks(); // Crea i link

          setNewLinks([]);
  
          // Mostra il messaggio di successo
          setMessage(documentId ? 'Document updated successfully!' : 'Document added successfully!');
          setError('');
  
          // Naviga alla pagina dei documenti
          navigate('/documentsPage');
      } catch (error) {
          console.error('Error during submission:', error);
          setError(`Error: ${error.message}`);
          setMessage('');
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

          <div className="document-section">
          <Row className="mb-3 mx-3 mt-3">
            <Form.Group as={Col} controlId="formTitle" className="me-4">
              <Form.Label className='form-label'>Title</Form.Label>
              <Form.Control className="form-control"
                type="text"
                placeholder="Enter title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group as={Col} controlId="formStakeholders" className="me-4">
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
          
          <Row className="mb-4 mx-3">
            <Form.Group as={Col} controlId="formScale" className="me-4">
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
              <Row className="d-flex justify-content-end mx-3">
                <Form.Label className='form-label text-center'>Date</Form.Label>
                <Col as={Col} className="d-flex">
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
                <Col as={Col} className="d-flex">
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
                <Col as={Col} className="d-flex">
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

          <Row className="mb-4 mx-3">
            <Form.Group as={Col} controlId="formType" className="me-4">
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

            <Form.Group as={Col} controlId="formLanguage" className="me-4">
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

            <Form.Group as={Col} controlId="formPages" className="me-4">
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

          <Row className="mb-4 mx-3">
            <Form.Group as={Col} controlId="formLat" className="me-4">
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
            <Form.Group as={Col} controlId="formLon" className="me-4">
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

            <Form.Group as={Col} className="d-flex justify-content-center me-4">
            <Button variant="outline-success" style={{marginTop: "32px"}} onClick={handleMapSelection}>
             Select Location on Map
            </Button>
            </Form.Group>
          </Row>

          <MapModal
              show={showMapModal}
              handleClose={handleCloseMapModal}
              onLocationSelect={handleLocationSelect}
          />
          
          <Row className="mb-4 mx-3">
          <label className="form-label ms-3 mb-0">Add original resources</label>
            <Col md={8}>
              <div className="mt-2">
                <input 
                  type="file" 
                  id="fileInput" 
                  multiple 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange} 
                />
                <label 
                  htmlFor="fileInput" 
                  className="btn btn-outline-success" 
                  style={{ cursor: 'pointer' , width: '150px'}}
                >
                  Upload files
                </label>
              </div>
            </Col>
          </Row>
          <Row className="mb-3 mx-3">
            <Col md={4}>
              <ListGroup>
                  {files.map((file, index) => (
                    <ListGroup.Item key={index}>
                      <span style={{ paddingTop: '2px', display: 'inline-block' }}>{file.name}</span>
                      <Button variant="danger" size="sm" onClick={() => handleRemoveFile(index)} style={{ float: 'right' }}>Remove</Button>
                    </ListGroup.Item>
                  ))}
              </ListGroup>
            </Col>
          </Row>

          <Row className="mx-3 mb-4">
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
          </div>
          
          <div className="link-section">
          <LinkControl selectedId={documentId} links={links} newLinks={newLinks} setNewLinks={setNewLinks} setHasDuplicates={setHasDuplicates} hasDuplicates={hasDuplicates}/>
          </div>

          <Row className="mx-3 mt-5">
            <Col className="d-flex justify-content-center pb-5">
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
