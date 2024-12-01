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
  const [stakeholderList, setStakeholderList] = useState("");
  const [scaleList, setScaleList] = useState([]);
  const [typeList, setTypeList] = useState([]);
  const [showNewTypeInput, setShowNewTypeInput] = useState(false);
  const [showNewScaleInput, setShowNewScaleInput] = useState(false);
  const [showNewStakeholderInput, setShowNewStakeholderInput] = useState(false);

  const existingDocument = location.state?.document;
  const explorePage = location.state?.explorePage;

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
      description: existingDocument?.description || '',
      newStakeholder: '',
    });
    const [showMapModal, setShowMapModal] = useState(false);
    const [files, setFiles] = useState([]);

    const [errors, setErrors] = useState({
      title: "",
      stakeholders: "",
      scale: "",
      type: "",
      description: "",
      pages: "",

    });

    useEffect(() => {

    const getStakeholders = async () => {
      const response = await axios.get('http://localhost:3001/api/documents/stakeholders');
      
      if (typeof response.data === 'string') {
      
        setStakeholderList(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
      }
    };
    
    const getScales = async () => {
      const response = await axios.get('http://localhost:3001/api/documents/scales');
      setScaleList(response.data);
    };
    
    const getTypes = async () => {
      const response = await axios.get('http://localhost:3001/api/documents/types');
      setTypeList(response.data);
    };

    getStakeholders();
    getScales();
    getTypes();
    }, []);


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
      
      if(name === 'scale' && value === 'add_new_scale') {
        setShowNewScaleInput(true);
      } else if (name === 'type' && value === 'add_new_type') {
        setShowNewTypeInput(true);
      } else if (name === 'stakeholders' && value === 'add_new_stakeholder') {
        setShowNewStakeholderInput(true);
      }else {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: value,
        }));
        if (name === 'type') {
          setShowNewTypeInput(false);
        }else if (name === 'scale') {
          setShowNewScaleInput(false);
        }else if (name === 'stakeholders') {
          setShowNewStakeholderInput(false);
        }
      }
    
      if (name === "lat" || name === "lon") {
        // Regex to allow only floating-point numbers
        const floatRegex = /^-?\d*(\.\d*)?$/;
        if (value === "" || floatRegex.test(value)) {
          setFormData({ ...formData, [name]: value });
        }
      } else {
        setFormData({ ...formData, [name]: value ?? "" });
      }
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

    const handleCheckboxChange = (e) => {
      const { value, checked } = e.target;
      const stakeholdersArray = formData.stakeholders ? formData.stakeholders.split(' - ') : [];
      const updatedStakeholders = checked
        ? [...stakeholdersArray, value]
        : stakeholdersArray.filter((stakeholder) => stakeholder !== value);
      setFormData((prevFormData) => ({
        ...prevFormData,
        stakeholders: updatedStakeholders.join(' - '),
      }));
    };

    const validateForm = () => {
      let valid = true;
      const newErrors = {};
    
        if (!formData.title) {
          newErrors.title = "Title is required";
          valid = false;
        }
        if (formData.stakeholders.length === 0) {
          newErrors.stakeholders = "At least one stakeholder must be selected";
          valid = false;
        }
        if (!formData.scale) {
          newErrors.scale = "Scale is required";
          valid = false;
        }
        if (!formData.issuanceDate) {
          newErrors.issuanceDate = "Issuance Date is required";
          valid = false;
        }
        if (!formData.type) {
          newErrors.type = "Type is required";
          valid = false;
        }
        if (!formData.description) {
          newErrors.description = "Description is required";
          valid = false;
        }
        if (!formData.pages || !/^\d+(-\d+)?$/.test(formData.pages)) {
          newErrors.pages = "Pages must be a valid number or range (e.g., 1-32)";
          valid = false;
        }
        if (!formData.lat) {
          newErrors.lat = "Latitude is required";
          valid = false;
        } else if (isNaN(parseFloat(formData.lat))) {
          newErrors.lat = "Latitude must be a number";
          valid = false;
        }
      
        if (!formData.lng) {
          newErrors.lon = "Longitude is required";
          valid = false;
        } else if (isNaN(parseFloat(formData.lng))) {
          newErrors.lon = "Longitude must be a number";
          valid = false;
        }
    
      setErrors(newErrors);
        return valid;
    };
    
    // Funzione di validazione
    function validateCoordinates() {
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
      console.log('Form Data:', formData);

      const stakeholdersString = formData.stakeholders.join('-');
    
      const updatedFormData = {
      ...formData,
      stakeholders: stakeholdersString,
    };
    


      // if (!validateForm()) {
        
      //   console.log('Validation Errors:', errors);
      //   setError("Please fill out all required fields.");
      //   return;
      // }
  
      // Validazione del form
      const validationError = validateCoordinates();
      if (validationError) {   
          console.log('Validation Errors:', errors);
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
              body: JSON.stringify(updatedFormData), // Invia i dati del modulo
          });
  
          if (!response.ok) {
            const errorText = await response.text();  // Retrieve the error message from the response
            console.error(`Error during fetch: ${response.status} - ${errorText}`);
            throw new Error(`Network response was not ok: ${response.status}`);
        }  
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
  
          // Naviga alla pagina precedente
          explorePage ? navigate('/explore') : navigate('/documentsPage');
      } catch (error) {
          console.error('Error during submission:', error);
          setError(`Error: ${error.message}`);
          setMessage('');
      }
  };
  

    const handleMapSelection = () => {
      setShowMapModal(true);
    };
    
    const handleLocationSelect = (locationData) => {
      if (locationData.type === 'point') {
        setFormData({ ...formData, lat: locationData.coordinates[0], lon: locationData.coordinates[1] });
      } else if (locationData.type === 'area') {
        setFormData({ ...formData, area: JSON.stringify(locationData.geometry) });
      }
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


  const handleAddType = () => {
    if (formData.newType.trim() !== '') {
      setTypeList((prevList) => [
        ...prevList,
        { id: prevList.length + 1, name: formData.newType }
      ]);
      setFormData((prevFormData) => ({
        ...prevFormData,
        type: formData.newType,
        newType: ''
      }));
      setShowNewTypeInput(false);
    }
  };

  const handleAddScale = () => {
    if (formData.newScale.trim() !== '') {
      setScaleList((prevList) => [
        ...prevList,
        { id: prevList.length + 1, name: formData.newScale }
      ]);
      setFormData((prevFormData) => ({
        ...prevFormData,
        scale: formData.newScale,
        newScale: ''
      }));
      setShowNewScaleInput(false);
    }
  };


 const handleAddStakeholder = () => {
  if (formData.newStakeholder.trim() !== '') {
    // Aggiungi il nuovo stakeholder alla lista degli stakeholder
    setStakeholderList((prevList) => [
      ...prevList,
      { id: prevList.length + 1, name: formData.newStakeholder }
    ]);

    // Aggiorna la stringa degli stakeholder nel formData
    const updatedStakeholders = formData.stakeholders
      ? `${formData.stakeholders} - ${formData.newStakeholder}`
      : formData.newStakeholder;

    setFormData((prevFormData) => ({
      ...prevFormData,
      stakeholders: updatedStakeholders,
      newStakeholder: ''
    }));

    setShowNewStakeholderInput(false);
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

          <div className="document-section">
          <Row className="mb-3 mx-3 mt-3">
            <Form.Group as={Col} controlId="formTitle" className="me-4">
              <Form.Label className='form-label'>
              Title <span className="required-asterisk" style={{ color: 'red' }}>*</span>
              </Form.Label>
              <Form.Control className="form-control"
                type="text"
                placeholder="Enter title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                isInvalid={!!errors.title}

              />
                {errors.title && <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>}

            </Form.Group>

          <Form.Group as={Col} controlId="formStakeholders" className="me-4">
             <Form.Label className='form-label'>
             Stakeholders <span className="required-asterisk" style={{ color: 'red' }}>*</span>
             </Form.Label>

            <Form.Control
              as="fieldset"
              style={{
              border: '1px solid #ced4da',
              borderRadius: '5px',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              }}
  >
              {stakeholderList.split(' - ').map((stakeholder) => (
            <Form.Check
            key={stakeholder}
            type="checkbox"
            label={stakeholder}
            name="stakeholders"
            value={stakeholder}
            checked={formData.stakeholders.split(' - ').includes(stakeholder)}
            onChange={handleCheckboxChange}
            className="mb-2"
            />
             ))}
              <Form.Check
                 type="checkbox"
                 label="Add new"
                 name="stakeholders"
                 value="add_new_stakeholder"
                 checked={formData.stakeholders.split(' - ').includes("add_new_stakeholder")}
                 onChange={handleCheckboxChange}
                 className="mb-2"
              />
             {stakeholderList.split(' - ').includes("add_new_stakeholder") && (
                <div className="d-flex align-items-center mt-2">
                  <Form.Control
                    type="text"
                    placeholder="Enter new stakeholder"
                    name="newStakeholder"
                    value={formData.newStakeholder}
                    onChange={handleChange}
                    className="me-2"
                  />
                  <Button variant="primary" onClick={handleAddStakeholder}>
                    Add
                  </Button>
                </div>
              )}


            </Form.Control>

            {errors.stakeholders && <div className="text-danger">{errors.stakeholders}</div>}
          </Form.Group>

          </Row>
          
          <Row className="mb-4 mx-3">
            <Form.Group as={Col} controlId="formScale" className="me-4">
              <Form.Label className='form-label'>
                Scale <span className="required-asterisk" style={{ color: 'red' }}>*</span>
              </Form.Label>
              <Form.Control
                as = "select"
                name="scale"
                value={formData.scale}
                onChange={handleChange}
                isInvalid={!!errors.scale}
                >
                <option value="">Select a scale</option> 
                {scaleList.map(scale => (
                <option key={scale.name} value={scale.name}>
                  {scale.name}
                </option>
              ))}          
              <option value="add_new_scale">Add a scale</option>
            </Form.Control>
            {showNewScaleInput && (
              <div className="d-flex align-items-center mt-2">
                <Form.Control
                  type="text"
                  placeholder="Enter new scale"
                  name="newScale"
                  value={formData.newScale}
                  onChange={handleChange}
                  className="me-2"
                />
                <Button variant="primary" onClick={handleAddScale}>
                  Add
                </Button>
              </div>
            )}
              {errors.scale && <Form.Control.Feedback type="invalid">{errors.scale}</Form.Control.Feedback>}

            </Form.Group>


            <Form.Group as={Col} controlId="formDate">
              <Row className="d-flex justify-content-end mx-3">
                <Form.Label className='form-label text-center'>
                  Date 
                </Form.Label>
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
              <Form.Label className='form-label'>
                Type <span className="required-asterisk" style={{ color: 'red' }}>*</span>
              </Form.Label>
              <Form.Control
                as="select"
                name="type"
                placeholder="Select a type"
                value={formData.type}
                onChange={handleChange}
                isInvalid={!!errors.type}
              >
              <option value="">Select a type</option>
                 {typeList.map(type => (
                <option key={type.name} value={type.name}>
                  {type.name}
                </option>
              ))}
              <option value="add_new_type">Add a type</option>
              </Form.Control>
              {showNewTypeInput && (
              <div className="d-flex align-items-center mt-2">
                <Form.Control
                  type="text"
                  placeholder="Enter new type"
                  name="newType"
                  value={formData.newType}
                  onChange={handleChange}
                  className="me-2"
                />
                <Button variant="primary" onClick={handleAddType}>
                  Add
                </Button>
              </div>
            )}

              {errors.type && <Form.Control.Feedback type="invalid">{errors.type}</Form.Control.Feedback>}

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
                isInvalid={!!errors.pages}
                onKeyDown={(e) => {
                  if (!/[0-9-]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Delete') {
                    e.preventDefault();
                  }
                }}
              />
              {errors.pages && <Form.Control.Feedback type="invalid">{errors.pages}</Form.Control.Feedback>}

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
              <Button variant="outline-success" style={{marginLeft: '-220px', marginTop: "36px"}} onClick={handleMapSelection}>
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
              <Form.Label className='form-label'>
              Description <span className="required-asterisk" style={{ color: 'red' }}>*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                placeholder="Enter description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                isInvalid={!!errors.description} // Show error styling if invalid

              />
              {errors.description && <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>}

            </Form.Group>
          </Row>
          </div>
          
          <div className="link-section">
          <LinkControl selectedId={documentId} links={links} newLinks={newLinks} setNewLinks={setNewLinks} setHasDuplicates={setHasDuplicates} hasDuplicates={hasDuplicates}/>
          </div>

          {/* Banner di errore */}
          {error && (
            <Alert variant="danger" className="mx-3 mt-4">
              {error}
            </Alert>
          )}

          {/* Banner di successo */}
          {message && (
            <Alert variant="success" className="mx-3 mt-4">
              {message}
            </Alert>
          )}

          <Row className="mx-3 mt-5">
            <Col className="d-flex justify-content-center pb-5">
                <Button className="me-3" variant="success" type="submit">
                  {documentId ? "Save" : "Add"}
                </Button>
                <Button variant="danger" onClick={() => explorePage ? navigate('/explore') : navigate('/documentsPage')}>
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