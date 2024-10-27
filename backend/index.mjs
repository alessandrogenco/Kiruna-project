import cors from'cors';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import LoginDao from './dao/login.mjs'

const app = express();
const PORT = 3001;

app.use(express.json());

const corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004", "http://localhost:3005"],
    optionsSuccessStatus: 200,
    credentials: true
  };
  app.use(cors(corsOptions));

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
    loginDao.getUserByUsername(username) // You need to implement this method
        .then(user => {
            done(null, user);
        })
        .catch(err => {
            done(err);
        });
});



const loginDao = new LoginDao(); // Ensure this line is present

  //Register
  app.post('/api/register', async (req, res) => {
    const { username, name, surname, password } = req.body;

    // Check for required fields
    if (!username || !name || !surname || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const result = await loginDao.registerUser(username, password, name, surname);
        res.status(201).json( result);
    } catch (error) {
        //console.error('Registration error:', error.message);
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

  


/* ACTIVATING THE SERVER */
let server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

export { app, server }