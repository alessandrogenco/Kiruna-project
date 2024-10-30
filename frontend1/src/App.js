import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { useState } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import API from './API.mjs';
import LoginForm from './components/Auth';
import HomePage from './components/HomePage'; // Importa il componente HomePage
import ExplorePage from './components/ExplorePage'; // Importa il componente ExplorePage
import LoggedInPage from './components/LoggedInPage';
import Documents from './components/Documents';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    try {
      const user = await API.login(credentials.username, credentials.password);

      if (!user) {
        throw new Error("Wrong credentials.");
      }

      setUser(user);
      setLoggedIn(true);
      navigate('/'); // Reindirizza alla homepage
    } catch (err) {
      console.error("Login error:", err.message);
      throw err;
    }
  };

  return (
    <>
      <Routes>
        {/* Home Page */}
        <Route
          path="/"
          element={<HomePage username={user?.username} />}
        />
        
        {/* Login Page */}
        <Route
          path="/login"
          element={
            loggedIn ? <Navigate to="/loggedInPage" /> : <LoginForm login={handleLogin} />
          }
        />

          {/* Logged In Page */}
          <Route
          path="/loggedInPage"
          element={<LoggedInPage/>}
        />

        {/* Page to Explore */}
        <Route
          path="/explore"
          element={<ExplorePage />}
        />

           {/* Documents Page */}
           <Route
          path="/documents"
          element={<Documents />}
        />

      </Routes>
    </>
  );
}

export default App;
