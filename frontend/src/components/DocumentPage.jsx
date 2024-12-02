import AppNavbar from "./Navbar";
import PropTypes from 'prop-types';
import API, {updateDocument} from '../API.mjs';
import DocumentList from "./DocumentList";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Form, FormControl, Col, Button, InputGroup } from "react-bootstrap";


function DocumentPage({isLoggedIn, handleLogout, documents = [], setDocuments}) {
    //const [shouldRefresh, setShouldRefresh] = useState(0);
    const [selectedDocument, setSelectedDocument] = useState(null); // State for selected document
    const [searchQuery, setSearchQuery] = useState(''); // State for search query
    const [filterType, setFilterType] = useState('');
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
            console.error('Error fetching documents:', error);
        }
    };
    
    useEffect(() => {
        console.log(documents);  
        getDocuments();      
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
        } catch (error) {
            console.error('Error adding document:', error);
            console.log(documentData);
        }
    };
    
    // Funzione per eliminare un documento
    const handleDelete = async (docId) => {
        try {
            await API.deleteDocument(docId); // Chiama l'API per eliminare il documento
            setDocuments((prevDocuments) => prevDocuments.filter((doc) => doc.id !== docId)); // Aggiorna lo stato locale

        } catch (error) {
            console.error('Error deleting document:', error);

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
    
    const handleFilterChange = (e) => {
        setFilterType(e.target.value); // Update filter type
    };

    const filteredDocuments = documents.filter((document) =>
        document.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (filterType === '' || document.type === filterType)
    );
    
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
            setSelectedDocument(null);

        } catch (error) {
            console.error('Error updating document:', error);

        }
    };

    return(
        <>
            <AppNavbar isLoggedIn={isLoggedIn} handleLogout={handleLogout}/>
            <Row className="mt-3 mx-2">
                <Col>
                    <Form className="d-flex mb-3 align-items-center">
                        <InputGroup style={{ width: '300px', marginRight: '10px' }}>
                            <InputGroup.Text>
                                <i className="bi bi-search" />
                            </InputGroup.Text>
                            <FormControl
                                type="search"
                                placeholder="Search documents"
                                aria-label="Search"
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </InputGroup>
                        <Form.Select
                            value={filterType}
                            onChange={handleFilterChange}
                            style={{ width: '150px' }}
                        >
                            <option value="">All Types</option>
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
                        </Form.Select>
                    </Form>
                </Col>
                <Col xs="auto" className="text-end">
                    <Button variant="success" onClick={() => navigate('/addDocument', { state: { newDocument } })}>
                        <i className="bi bi-plus me-2"></i> Add Document
                    </Button>
                </Col>
            </Row>
            <DocumentList 
                documents={filteredDocuments} 
                updateDocument={handleUpdateDocument} 
                deleteDocument={handleDelete}
            />
        </>
    );
}

DocumentPage.propTypes = {
    isLoggedIn: PropTypes.bool,
    handleLogout: PropTypes.func,
    documents: PropTypes.array,
    setDocuments: PropTypes.func
};

export default DocumentPage;