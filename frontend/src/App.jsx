import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import API from './API.mjs';
import LoginForm from './components/Auth';
import HomePage from './components/HomePage'; // Importa il componente HomePage
import ExplorePage from './components/ExplorePage'; // Importa il componente ExplorePage
import Documents from './components/Documents';
import DocumentControl from './components/DocumentControl';
import DocumentPage from './components/DocumentPage';

function App() {
  const [loggedIn, setLoggedIn] = useState(null); // Inizializza come `null`
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();

  // Login check
  useEffect(() => {
    API.checkLogin()
      .then(user => {
        if (user) {
          setLoggedIn(true);
          setUser(user);
        } else {
          setLoggedIn(false);
          setUser(null);
        }
      })
      .catch(e => {
        setLoggedIn(false);
        setUser(null);
      });
  }, []);


  // Loading documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/documents');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setDocuments(data);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    fetchDocuments();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const user = await API.login(credentials.username, credentials.password);

      if (!user) {
        throw new Error("Wrong credentials.");
      }
      setUser(user);
      setLoggedIn(true);
      navigate('/explore');
    } catch (err) {
      console.error("Login error:", err.message);
      throw err;
    }
  };

  const handleLogout = async () => {
    await API.logout();
    setLoggedIn(false);
    setUser(null);
    navigate('/');
  };

  if (loggedIn === null) {
    return <div>Loading...</div>; // Mostra un messaggio di caricamento
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<HomePage isLoggedIn={loggedIn} handleLogout={handleLogout} />}
        />
        <Route
          path="/login"
          element={
            loggedIn ? <Navigate to="/explore" /> : <LoginForm login={handleLogin} isLoggedIn={loggedIn} handleLogout={handleLogout} />
          }
        />
        <Route
          path="/explore"
          element={<ExplorePage isLoggedIn={loggedIn} handleLogout={handleLogout} documents={documents} setDocuments={setDocuments}/>}
        />
        <Route
          path="/documents"
          element={<Documents documents={documents} setDocuments={setDocuments}/>}
        />
        <Route
          path="/link-documents"
        />
        <Route
          path="/documentsPage"
          element={<DocumentPage isLoggedIn={loggedIn} handleLogout={handleLogout} documents={documents} setDocuments={setDocuments}/>}
        />
        <Route
          path="/addDocument"
          element={<DocumentControl isLoggedIn={loggedIn} handleLogout={handleLogout}/>}
        />
        <Route
          path="/editDocument/:documentId"
          element={<DocumentControl isLoggedIn={loggedIn} handleLogout={handleLogout} documents={documents} />}
        />
      </Routes>
    </>
  );
}


export default App;