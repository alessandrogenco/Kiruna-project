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

app.get('/api/documents/stakeholders', async (req, res) => {
    try {
        const stakeholders = await documentDao.showStakeholders();
        res.status(200).json(stakeholders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/documents/scales', async (req, res) => {
    try {
        const scales = await documentDao.showScales();
        res.status(200).json(scales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/documents/types', async (req, res) => {
    try {
        const types = await documentDao.showTypes();
        res.status(200).json(types);
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

app.post('/api/addDocument', async (req, res) => {
    console.log("Data received by /api/addDocument:", req.body); // Log dei dati ricevuti

    const { title, stakeholders, scale, issuanceDate, type, connections, language, pages, lat, lon, area, description } = req.body;

    try {
        // Validazione parametri
        if (!title || (!area && (!lat || !lon))) {
            throw new Error("Missing required fields");
        }

        if (area) {
            try {
                JSON.parse(area); // Controlla se area è un JSON valido
            } catch {
                throw new Error("Invalid JSON for area");
            }
        }

        // Verifica lat/lon
        if ((lat < 67.3562 || lat > 69.0599) || (lon < 17.8998 || lon > 23.2867)) {
            throw new Error("Invalid parameters for lat/lon");
        }

        console.log("Adding document...");

        const result = await documentDao.addDocument(title, stakeholders, scale, issuanceDate || null, type, connections, language, pages, lat, lon, area, description);
        res.status(200).json(result); // Risposta positiva con il documento aggiunto
    } catch (error) {
        console.error("Error in /api/addDocument:", error); // Log dettagliato per debug
        res.status(400).json({ message: error.message }); // Risposta con messaggio di errore
    }
});


//link documents
app.post('/api/linkDocuments', async (req, res) => {
    const { id1, id2, linkType } = req.body;

    try {
       
    
        if (linkType.trim() === '') {
            throw new Error('The link type must be a non-empty string');
        }

        const result = await documentDao.linkDocuments(id1, id2, linkType);
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

app.put('/api/updateLink', async (req, res) => {
    const { idDocument1, idDocument2, linkType, newLinkType } = req.body;

    try {
        if (newLinkType.trim() === '') {
            throw new Error('The new link type must be a non-empty string');
        }

        // Chiamata al DAO per aggiornare il link
        const updatedLink = await documentDao.updateLink(idDocument1, idDocument2, linkType, newLinkType);

        // Risposta di successo
        res.status(200).json({
            message: 'Link updated successfully',
            link: updatedLink
        });
    } catch (error) {
        // Gestione errori
        if (error.message === 'Link not found') {
            res.status(404).json({ message: error.message });
        } else if (error.message === 'The new type is the same as the current type') {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
});


/**
 * API to delete a link between two docs
 */
app.delete('/api/deleteLink', async (req, res) => {
    const { idDocument1, idDocument2, linkType } = req.body;

    // Validazione dei parametri
    if (!idDocument1 || !idDocument2 || !linkType) {
        return res.status(400).json({ error: 'idDocument1, idDocument2 e linkType sono obbligatori' });
    }

    try {
        const result = await documentDao.deleteLink(idDocument1, idDocument2, linkType);
        return res.status(200).json({
            message: 'Link eliminato con successo',
            data: result
        });
    } catch (error) {
        if (error.message === 'Link not found') {
            return res.status(404).json({ error: 'Il link specificato non esiste' });
        }
        console.error('Errore durante l\'eliminazione del link:', error.message);
        return res.status(500).json({ error: 'Errore interno del server' });
    }
});


app.post('/api/updateDocument', async (req, res) => {
    console.log("Data received by /api/updateDocument:", req.body);

    const { id, title, stakeholders, scale, issuanceDate, type, connections, language, pages, lat, lon, area, description } = req.body;

    if (!id || !title) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // Check if area is a valid GeoJSON object or empty
        if (area && typeof area === 'object' && Object.keys(area).length === 0) {
            return res.status(400).json({ message: "Area cannot be an empty GeoJSON object" });
        }

        if (!area && (!lat || !lon)) {
            return res.status(400).json({ message: "Latitude and Longitude are required when Area is not provided" });
        }    

        if ((lat < 67.3562 || lat > 69.0599) || (lon < 17.8998 || lon > 23.2867)) {
            throw new Error("Invalid parameters for lat/lon");
        }

        const result = await documentDao.updateDocument(id, title, stakeholders, scale, issuanceDate, type, connections, language, pages, lat, lon, area, description);
        
        res.status(200).json(result); 
    } catch (error) {
        console.error("Error in /api/updateDocument:", error); 
        res.status(400).json({ message: error.message }); 
    }
});

//-------------------------------

app.post('/api/deleteDocument', async (req, res) => {
   

    const { id } = req.body;
    
    
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


app.post('/api/upload', upload.array('resourceFiles'), async (req, res) => {
    try {
      const { documentId } = req.query;
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const result = await fileUploadDao.addOriginalResources(documentId, req.files);
  
      res.status(201).json({
        message: 'Files uploaded successfully',
        resourcesIds: result.resourcesIds,
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

app.post('/api/updateDocumentGeoreference', async (req, res) => {
    const { id, lat, lon, area } = req.body;
  
    try {
      if (!id) {
        return res.status(400).json({ message: 'Document ID is required' });
      }
  
      if (!lat && !lon && !area) {
        return res.status(400).json({ message: 'Georeferencing data (lat/lon/area) is required' });
      }
  
      let query;
      let params;
  
      if (lat && lon) {

        query = `UPDATE Documents SET lat = ?, lon = ?, area = ? WHERE id = ?`;
        params = [lat, lon, id];
      } else if (area) {
        const areaGeoJson = JSON.parse(area);
        const centroid = turf.centroid(areaGeoJson);
        const [centroidLon, centroidLat] = centroid.geometry.coordinates;
        
        query = `UPDATE Documents SET area = ?, lat = ?, lon = ? WHERE id = ?`;
        params = [area, centroidLat, centroidLon, id];
    }
  
      await new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
          if (err) reject(err);
          resolve();
        });
      });
  
      res.status(200).json({ message: 'Georeferencing updated successfully' });
    } catch (error) {
      console.error('Error updating georeferencing:', error.message);
      res.status(500).json({ message: 'Failed to update georeferencing', error: error.message });
    }
  });
  
  


  app.get('/api/getDocumentLocations', async (req, res) => {
    try {
      const locations = await new Promise((resolve, reject) => {
        db.all(
          `SELECT id, title, lat, lon, area, description, type FROM Documents WHERE lat IS NOT NULL OR area IS NOT NULL`,
          (err, rows) => {
            if (err) reject(err);
            resolve(rows);
          }
        );
      });
  
      if (locations.length === 0) {
        return res.status(404).json({ message: 'No georeferenced locations found' });
      }
  
      res.status(200).json(locations); 
    } catch (error) {
      console.error('Error fetching georeferenced locations:', error.message);
      res.status(500).json({ message: 'Failed to fetch georeferenced locations', error: error.message });
    }
  });

  app.get('/api/getDocumentLocation/:id', async (req, res) => {
    const documentId = req.params.id; 

    try {
        if (!documentId) {
            return res.status(400).json({ message: 'Document ID is required' });
        }

        const documentLocation = await new Promise((resolve, reject) => {
            db.get(
                `SELECT id, title, lat, lon, area, description FROM Documents WHERE id = ? AND (lat IS NOT NULL OR area IS NOT NULL)`,
                [documentId],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });

        if (!documentLocation) {
            return res.status(404).json({ message: 'No georeferenced location found for the specified document' });
        }

        res.status(200).json(documentLocation);
    } catch (error) {
        console.error('Error fetching georeferenced location:', error.message);
        res.status(500).json({ message: 'Failed to fetch georeferenced location', error: error.message });
    }
});

  
  
  
  


/* ACTIVATING THE SERVER */
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export { app, server };
