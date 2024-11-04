import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { useEffect, useState } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import API from './API.mjs';
import LoginForm from './components/Auth';
import HomePage from './components/HomePage';
import ExplorePage from './components/ExplorePage';
import LoggedInPage from './components/LoggedInPage';
import Documents from './components/Documents';
import LinkDocuments from './components/LinkDocuments';
import DocumentUploadForm from './components/DocumentUploadForm'; 

function App() {
  const [loggedIn, setLoggedIn] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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

  const handleLogin = async (credentials) => {
    try {
      const user = await API.login(credentials.username, credentials.password);
      if (!user) {
        throw new Error("Wrong credentials.");
      }
      setUser(user);
      setLoggedIn(true);
      navigate('/');
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
    return <div>Loading...</div>;
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
            loggedIn ? <Navigate to="/loggedInPage" /> : <LoginForm login={handleLogin} />
          }
        />
        <Route
          path="/explore"
          element={<ExplorePage isLoggedIn={loggedIn} handleLogout={handleLogout} />}
        />
        <Route
          path="/documents"
          element={<Documents />}
        />
        <Route
          path="/link-documents"
          element={<LinkDocuments isLoggedIn={loggedIn} handleLogout={handleLogout} />}
        />
        
        <Route
          path="/upload-document"
          element={<DocumentUploadForm />}
        />
      </Routes>
    </>
  );
}

export default App;
