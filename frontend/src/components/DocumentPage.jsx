import AppNavbar from "./Navbar";
import PropTypes from 'prop-types';
import API, {deleteDocument, updateDocument} from '../API.mjs';
import DocumentList from "./DocumentList";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Form, FormControl, Col, Button, InputGroup } from "react-bootstrap";
import '../styles/DocumentPage.css';

function DocumentPage({isLoggedIn, handleLogout, documents = [], setDocuments}) {
    //const [shouldRefresh, setShouldRefresh] = useState(0);
    const [descriptions, setDescriptions] = useState({});
    const [selectedDocument, setSelectedDocument] = useState(null); // State for selected document
    const [showFormModal, setShowFormModal] = useState(false); // State to control the form modal
    const [searchQuery, setSearchQuery] = useState(''); // State for search query
    const [selectedArea, setSelectedArea] = useState('');
    const [message, setMessage] = useState(''); // Add this line
    const [newDocument, setNewDocument] = useState({
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

    const navigate = useNavigate();

    const getDocuments = async () => {
        try {
            const data = await API.getDocuments(); // Chiamata alla funzione getDocuments in API.mjs
            setDocuments(data); // Aggiorna lo stato con i documenti ottenuti
        } catch (error) {
            setMessage('Error fetching documents');
        }
    };
    
    useEffect(() => {
        console.log(documents);        
    }, []);  
    
    const handleAddDocument = async () => {
        const documentData = {
        title: newDocument.title,
        stakeholders: newDocument.stakeholders,
        scale: newDocument.scale,
        date: newDocument.date,
        type: newDocument.type,
        connections: newDocument.connections,
        language: newDocument.language,
        pages: newDocument.pages,
        lat: newDocument.lat,
        lon: newDocument.lon,
        area: newDocument.area,
        description: newDocument.description
        };
        //console.log(documentData);
        try {
            const response = await fetch('http://localhost:3001/api/addDocument', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(documentData),
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const addedDocument = await response.json();
            setDocuments((prevDocuments) => [...prevDocuments, addedDocument]);
            setNewDocument({ title: '', stakeholders: '', scale: '', date: '', type: '', connections: '', language: '', pages: '', lat: '', lon: '', area:'', description: '' });
            setShowFormModal(false);
            setMessage('Document added successfully!');
        } catch (error) {
            console.error('Error adding document:', error);
            setMessage(error.message);
        }
    };
    
    // Funzione per eliminare un documento
    const handleDelete = async (docId) => {
        try {
            await API.deleteDocument(docId); // Chiama l'API per eliminare il documento
            setDocuments((prevDocuments) => prevDocuments.filter((doc) => doc.id !== docId)); // Aggiorna lo stato locale
            setMessage('Document deleted successfully!');
        } catch (error) {
            console.error('Error deleting document:', error);
            setMessage('Error deleting document.');
        }
    };
    
    const handleDocumentClick = (document) => {
        setSelectedDocument(document);
        setNewDocument({
        title: document.title || '',
        stakeholders: document.stakeholders || '',
        scale: document.scale || '',
        date: document.date || '',
        type: document.type || '',
        connections: document.connections || '',
        language: document.language || '',
        pages: document.pages || '',
        lat: document.lat || '',
        lon: document.lon || '',
        area: document.area || '',
        description: document.description || ''
        });
        setShowFormModal(true);
    };
    
    const handleCloseFormModal = () => {
        setShowFormModal(false);
        setNewDocument({
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
        setSelectedDocument(null);
    };
    
    const handleNewDocumentChange = (e) => {
        const { name, value } = e.target;
        setNewDocument((prevDocument) => ({
        ...prevDocument,
        [name]: value,
        }));
    };
    
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };
    
    const filteredDocuments = documents.filter((document) =>
        document.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // validates the latitude coordinates
    function validateLatitude(e){
        let value = e.target.value;
        // check of the correct lat value
        if (value != '' && (value < 67.7500 || value > 68.3333)) {
            alert("Latitude is out of Kiruna Municipality borders!");
            setNewDocument((prevDocument) => ({
            ...prevDocument,
            lat: '',
            }));
            return;
        }
    }
    
    // validates the lognitude coordinates
    function validateLongitude(e){
        let value = e.target.value;
        // check of the correct lat value
        if (value != '' && (value < 20.7833 || value > 21.1333)) {
        alert("Longitude is out of Kiruna Municipality borders!");
        setNewDocument((prevDocument) => ({
            ...prevDocument,
            lon: '',
        }));
        return;
        }
    }
    
    const handleUpdateDocument = async () => {
        if (!newDocument.lat ^ !newDocument.lon) {
            alert('Please enter both latitude and longitude.');
            return;
        }
        if (newDocument.area !== '' && (newDocument.lat || newDocument.lon)) {
            alert('Please enter either area or latitude and longitude.');
            return;
        }
        newDocument.id = selectedDocument.id;
        try {
            const result = await updateDocument(
            newDocument.id,
            newDocument.title,
            newDocument.stakeholders,
            newDocument.scale,
            newDocument.issuanceDate,
            newDocument.type,
            newDocument.connections,
            newDocument.language,
            newDocument.pages,
            newDocument.lat,
            newDocument.lon,
            newDocument.area,
            newDocument.description
            );
            setDocuments((prevDocuments) =>
            prevDocuments.map((doc) =>
                doc.id === newDocument.id ? { ...doc, ...newDocument } : doc
            )
            );
            setShowFormModal(false);
            setSelectedDocument(null);
            setMessage('Document updated successfully!');
        } catch (error) {
            console.error('Error updating document:', error);
            setMessage('Error updating document.');
        }
    };

    return(
        <>
            <AppNavbar isLoggedIn={isLoggedIn} handleLogout={handleLogout}/>
            <Row className="mt-3 mx-2">
                <Col>
                <Form className="d-flex mb-3">
                    <InputGroup>
                        <InputGroup.Text>
                            <i className="bi bi-search"/> {/* Icona di Bootstrap */}
                        </InputGroup.Text>
                        <FormControl
                            type="search"
                            placeholder="Search documents"
                            aria-label="Search"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            style={{ maxWidth: '300px' }}/>
                        </InputGroup>
                    </Form>
                </Col>
                <Col xs="auto" className="text-end">
                    <Button variant="success" onClick={() => navigate('/addDocument', { state: { newDocument } })}>
                        <i className="bi bi-plus me-2"></i> {/* Icona + con margine destro */}
                        Add Document
                    </Button>
                </Col>
            </Row>
            <DocumentList documents={filteredDocuments} updateDocument={handleUpdateDocument} deleteDocument={handleDelete}/>
        </>
    );

}

DocumentPage.propTypes = {
    isLoggedIn: PropTypes.bool,
    handleLogout: PropTypes.func,
};

export default DocumentPage;