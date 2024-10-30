import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { useState } from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import API from './API.mjs';
import LoginForm from './components/Auth';
import HomePage from './components/HomePage';
import ExplorePage from './components/ExplorePage';
import Navbar from './components/Navbar';


function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Handle Login Function
  const handleLogin = async (credentials) => {
    try {
      const user = await API.login(credentials.username, credentials.password);

      if (!user) {
        throw new Error("Wrong credentials.");
      }

      setUser(user);
      setLoggedIn(true);
      navigate('/'); // Redirect to the homepage
    } catch (err) {
      console.error("Login error:", err.message);
      throw err;
    }
  };

  // Handle Logout Function
  const handleLogout = () => {
    setUser(null);
    setLoggedIn(false);
    navigate('/login'); // Redirect to login page on logout
  };

  return (
    <>
      

      <Routes>
        {/* Home Page */}
        <Route
          path="/"
          element={<HomePage login={handleLogin}/>}
        />
        
        {/* Login Page 
        <Route
          path="/login"
          element={
            loggedIn ? <Navigate to="/" /> : <LoginForm login={handleLogin} />
          }
        />*/}

        {/* Page to Explore */}
        <Route
          path="/explore"
          element={
            <ExplorePage
              isLoggedIn={loggedIn}
              role={user?.role || "Visitor"}
              onLoginToggle={loggedIn ? handleLogout : () => navigate('/login')}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;
