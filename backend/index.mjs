import cors from 'cors';
import express from 'express';
import multer from 'multer';
import session from 'express-session';
import passport from 'passport';
import LoginDao from './dao/login.mjs';
import DocumentDao from './dao/document.mjs';
import FileUploadDao from './dao/fileUpload.mjs';
import bodyParser from 'body-parser';


import path from 'path'; 
import fs from 'fs';
import db from './db/db.mjs';


const app = express();
const PORT = 3001;
//multer configuration to manage the upload of a file 
//const storage = multer.memoryStorage(); // Store a file in memory as Buffer 
//const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(process.cwd(), 'backend', 'uploads');  

console.log("Upload directory:", uploadDir);

// Check write permissions for the uploads directory
fs.access(uploadDir, fs.constants.F_OK, (err) => {
    if (err) {
        console.error("Uploads directory does not exist. Creating...");
        fs.mkdir(uploadDir, { recursive: true }, (mkdirErr) => {
            if (mkdirErr) {
                console.error("Error creating uploads directory:", mkdirErr.message);
            } else {
                console.log("Uploads directory created successfully.");
            }
        });
    } else {
        console.log("Uploads directory exists.");
    }
});

fs.access(uploadDir, fs.constants.W_OK, (err) => {
    if (err) {
        if (err.code === 'ENOENT') {
            console.error("Directory does not exist:", uploadDir);
        } else {
            console.error("No write permission for uploads directory:", err.message);
        }
    } else {
        console.log("Uploads directory is writable");
    }
});


// Configure storage and filter for only PDF files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);

        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            cb(new Error('Only PDF files are allowed'), false);
        } else {
            cb(null, true);
        }
    }
});


// CORS middleware
const corsOptions = {
    origin: ["http://localhost:5173"],
    optionsSuccessStatus: 200,
    credentials: true
};
app.use(cors(corsOptions)); // Deve essere prima delle route

app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serialize user
passport.serializeUser((user, done) => {
    done(null, user.username); // Store username in the session
});

// Deserialize user
passport.deserializeUser((username, done) => {
    loginDao.getUserByUsername(username) // Implementare questo metodo nel LoginDao
        .then(user => {
            done(null, user);
        })
        .catch(err => {
            done(err);
        });
});

const loginDao = new LoginDao(); // Assicurati che questa riga sia presente
const documentDao = new DocumentDao(); 
const fileUploadDao = new FileUploadDao();


// Register
app.post('/api/register', async (req, res) => {
    const { username, name, surname, password } = req.body;

    // Check for required fields
    if (!username || !name || !surname || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const result = await loginDao.registerUser(username, password, name, surname);
        res.status(201).json(result);
    } catch (error) {
        if (error.message === 'Username already exists. Please choose another one.') {
            return res.status(409).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        const user = await loginDao.Login(username, password);
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password.' }); 
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            name: user.name,
            surname: user.surname
        };
        
        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Internal server error' }); 
    }
});

// Check currently logged in user
app.get('/api/check-login', (req, res) => {
    if (req.session.user) {
        res.status(200).json({
            message: 'User is logged in',
            user: req.session.user
        });
    } else {
        res.status(401).json({ message: 'User is not logged in' });
    }
});

// Logout 
app.post('/api/logout', (req, res) => {
    if (req.session.user) {
        const username = req.session.user.username;
        
        req.session.destroy((err) => {
            if (err) {
                //console.error('Error logging out:', err.message);
                return res.status(500).json({ error: 'Failed to log out' });
            }
            console.log(`User ${username} has logged out`);
            res.status(200).json({ message: `${username} has logged out successfully` });
        });
    } else {
        res.status(400).json({ error: 'No user is currently logged in' });
    }
});

// Get all documents
app.get('/api/documents', async (req, res) => {
    try {
        const documents = await documentDao.getAllDocuments();
        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add the description
app.put('/api/addDescription', async (req, res) => {
    const { id, title, description } = req.body;

    try {
        if (!description || description.trim() === "") {
            throw new Error('Description cannot be empty.');
        }

        const document = await documentDao.getDocumentById(id);
        if (!document || document.title !== title) {
            throw new Error('Document not found.');
        }

        const result = await documentDao.addDocumentDescription(id, title, description);

        res.status(200).json({
            message: 'Document description updated successfully',
            document: {
                id: result.id,
                title: result.title,
                description: result.description
            }
        });
    } catch (error) {
        if (error.message.includes('Document not found')) {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

// Add a document
app.post('/api/addDocument', async (req, res) => {
    console.log("Data received by /api/addDocument:", req.body); // Log dei dati ricevuti

    const { title, stakeholders, scale, issuanceDate, type, connections, language, pages, lat, lon, area, description } = req.body;
    console.log("Received document data:", req.body);

    try {
        // Check if area is empty and lat/lon are provided
        if(area.trim() === '' && lat && lon){
            // Check if lat and lon are valid
            if ((lat < 67.82 || lat > 67.8800) || (lon < 20.1200 || lon > 20.400)) {
                throw new Error("Invalid parameters");
            }
        }
        
        // Check if area is not empty and lat or lon are provided
        if(area.trim() !== '' && (lat || lon)){
            throw new Error("Invalid parameters");
        }
        if (!title || (!area && (!lat ^ !lon))) {
            throw new Error("Missing required fields" );
        }

        const result = await documentDao.addDocument(title, stakeholders, scale, issuanceDate, type, connections, language, pages, lat, lon, area, description);
        res.status(200).json(result); // Risposta positiva con il documento aggiunto
    } catch (error) {
        console.error("Error in /api/addDocument:", error); // Log dettagliato per debug
        res.status(400).json({ message: error.message }); // Risposta con messaggio di errore
    }
});

//link documents
app.post('/api/linkDocuments', async (req, res) => {
    const { id1, id2, /*linkDate,*/ linkType } = req.body;

    try {
        /*if (linkDate.trim() === '') {
            throw new Error('The link date must be a non-empty string');
        }*/
    
        if (linkType.trim() === '') {
            throw new Error('The link type must be a non-empty string');
        }

        const result = await documentDao.linkDocuments(id1, id2, /*linkDate,*/ linkType);
        res.status(200).json({
            message: 'Documents linked successfully',
            link: result
        });
    } catch (error) {
        if (error.message === 'Link already exists') {
            res.status(409).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
  });

app.get('/api/documentLinks/:id', async (req, res) => {
    const documentId = req.params.id;

    try {
        const links = await documentDao.getDocumentLinks(documentId);
        console.log("Links:", links);
        if (links.message) {
            console.log(links.message);
            res.status(200).json({ message: links.message });
        } else {
            console.log(links);
            res.status(200).json({
                message: 'Document links fetched successfully',
                links: links
            });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/api/links', async (req, res) => {
    const { idDocument1, idDocument2, newLinkDate, newLinkType } = req.body;

    try {
        if (newLinkDate.trim() === '') {
            throw new Error('The new link date must be a non-empty string');
        }
    
        if (newLinkType.trim() === '') {
            throw new Error('The new link type must be a non-empty string');
        }

        const updatedLink = await documentDao.updateLink(idDocument1, idDocument2, newLinkDate, newLinkType);
        res.status(200).json({
            message: 'Link updated successfully',
            link: updatedLink
        });
    } catch (error) {
        if (error.message === 'Link not found') {
            res.status(404).json({ message: error.message });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
});

/*app.post('/api/newDocuments', upload.single('file'), async (req, res) => {
    try {
        const { name } = req.body;
        const file = req.file?.buffer; // Get the buffer of the file just uploaded 

        // Check the needed filds
        if (!name || !file) {
            return res.status(400).json({ error: 'Name and file are required' });
        }

        const result = await documentDao.newDocument(name, file);

        // success response
        res.status(201).json(result);
    } catch (error) {
        console.error('Error inserting document:', error.message);
        res.status(500).json({ error: error.message });
    }
});*/

/*app.post('/api/newDocuments', upload.single('file'), async (req, res) => {
    try {
        const { name } = req.body;
        const file = req.file?.buffer; // Get the buffer of the file just uploaded 
        const documentDetails = {
            title: req.body.title,
            stakeholders: req.body.stakeholders,
            scale: req.body.scale,
            issuanceDate: req.body.issuanceDate,
            type: req.body.type,
            connections: req.body.connections,
            language: req.body.language,
            pages: req.body.pages,
            lat: req.body.lat,
            lon: req.body.lon,
            description: req.body.description,
        };

        // Check the needed filds
        if (!name || !file || !documentDetails.title) {
            return res.status(400).json({ error: 'Name, file, and title are required' });
        }

        const result = await documentDao.newDocument(name, file, documentDetails);

        // Success response
        res.status(201).json(result);
    } catch (error) {
        console.error('Error inserting document:', error.message);
        res.status(500).json({ error: error.message });
    }
});*/

app.post('/api/updateDocument', async (req, res) => {
    console.log("Data received by /api/updateDocument:", req.body); // Log dei dati ricevuti

    const { id, title, stakeholders, scale, issuanceDate, type, connections, language, pages, lat, lon, area, description } = req.body;
    console.log("Received document update data:", req.body);
    
    // Verifica che i campi necessari siano presenti
    if (!id || !title) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // Check if area is empty and lat/lon are provided
        if(area.trim() === '' && lat && lon){
            // Check if lat and lon are valid
            if ((lat < 67.82 || lat > 67.8800) || (lon < 20.1200 || lon > 20.400)) {
                throw new Error("Invalid parameters");
            }
        }
        
        // Check if area is not empty and lat or lon are provided
        if(area.trim() !== '' && (lat || lon)){
            throw new Error("Invalid parameters");
        }
        if (!area && (!lat ^ !lon)) {
            throw new Error("Missing required fields" );
        }

        const result = await documentDao.updateDocument(id, title, stakeholders, scale, issuanceDate, type, connections, language, pages, lat, lon, area, description);
        res.status(200).json(result); // Risposta positiva con il documento aggiornato
    } catch (error) {
        console.error("Error in /api/updateDocument:", error); // Log dettagliato per debug
        res.status(400).json({ message: error.message }); // Risposta con messaggio di errore
    }
});

app.post('/api/deleteDocument', async (req, res) => {
    //console.log("Data received by /api/deleteDocument:", req.body); // Log dei dati ricevuti

    const { id } = req.body;
    //console.log("Received document ID:", id);
    
    if (!id) {
        return res.status(400).json({ message: "ID is required." });
    }

    try {
        const result = await documentDao.deleteDocumentById(id); // Utilizza il metodo deleteDocumentById dal tuo DAO
        res.status(200).json(result); // Risposta positiva con il risultato della cancellazione
    } catch (error) {
        console.error("Error in /api/deleteDocument:", error); // Log dettagliato per debug
        res.status(400).json({ message: error.message }); // Risposta con messaggio di errore
    }
});



app.use(bodyParser.raw({ type: 'application/octet-stream', limit: '100mb' }));

//Upload files
app.post('/api/upload', async (req, res) => {
    try {
        const { documentId, resourceType, description } = req.query;

        console.log("documentId:", documentId);
        console.log("resourceType:", resourceType);
        console.log("description:", description);
        console.log("fileData (body):", req.body);

        if (!documentId || !resourceType || !description || !req.body) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const resource = {
            resourceType,
            fileData: req.body, 
            description
        };

        const result = await fileUploadDao.addOriginalResource(documentId, resource);
        res.status(201).json({
            message: 'File uploaded successfully',
            resourceId: result.resourceId
        });
    } catch (error) {
        console.error('Error in /api/upload:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

//Get files
app.get('/api/files/:documentId', async (req, res) => {
    const documentId = req.params.documentId;

    try {
        const files = await fileUploadDao.getFilesByDocumentId(documentId);

        if (files.length > 0) {
            res.status(200).json(files);
        } else {
            res.status(404).json({ message: 'No files found for the specified document ID' });
        }
    } catch (error) {
        console.error('Error fetching files:', error.message);
        res.status(500).json({ message: 'Failed to fetch files', error: error.message });
    }
});


/* ACTIVATING THE SERVER */
let server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export { app, server };
