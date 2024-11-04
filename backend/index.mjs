import cors from 'cors';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import LoginDao from './dao/login.mjs';
import DocumentDao from './dao/document.mjs';

const app = express();
const PORT = 3001;

app.use(express.json());

// CORS middleware
const corsOptions = {
    origin: ["http://localhost:5173"], // we have to choose a single frontend!!
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
                console.error('Error logging out:', err.message);
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

//link documents - to be tested
app.post('/api/linkDocuments', async (req, res) => {
    const { id1, id2 } = req.body;
  
    try {
      const result = await documentDao.linkDocuments(id1, id2);
      res.status(200).json({
        message: 'Documents linked successfully',
        link: result
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });



/* ACTIVATING THE SERVER */
let server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export { app, server };
