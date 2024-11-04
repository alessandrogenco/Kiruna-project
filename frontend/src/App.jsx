import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import API from './API.mjs';
import LoginForm from './components/Auth';
import HomePage from './components/HomePage';
import ExplorePage from './components/ExplorePage';
import Navbar from './components/Navbar';
import Documents from './components/Documents';
import LinkDocuments from './components/LinkDocuments';
import MessageModal from './components/MessageModal'; // Import the MessageModal component

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalType, setModalType] = useState(''); // State to determine which component to render
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    try {
      const user = await API.login(credentials.username, credentials.password);

      if (!user) {
        throw new Error("Wrong credentials.");
      }

      setUser(user);
      setLoggedIn(true);
      navigate('/'); // Navigate to the home page after successful login
    } catch (error) {
      console.error(error);
      // Handle login error (e.g., show an error message)
    }
  };

  
  const handleLogout = () => {
    setUser(null);
    setLoggedIn(false);
    navigate('/login'); // Navigate to the login page after logout
  };


  const handleShowModal = (content, type) => {
    setModalContent(content);
    setModalType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalContent('');
    setModalType('');
  };

  return (
    <div className="App">
      <Navbar
        loggedIn={loggedIn}
        user={user}
        handleLoginClick={handleLogin}
        handleShowModal={handleShowModal} // Pass the handler to show the modal
      />
      <MessageModal show={showModal} handleClose={handleCloseModal} message={modalContent} modalType={modalType} />
      <Routes>
        
        {/* Home Page */}
        <Route
          path="/"
          element={<HomePage />}
        />


        {/* Login Page */}
        <Route
          path="/login"
          element={
            loggedIn ? <Navigate to="/" /> : <LoginForm login={handleLogin} />
          }
        />

        {/* Page to Explore */}
        <Route
          path="/explore"
          element={
            loggedIn ? <ExplorePage /> : <Navigate to="/login" />
          }
        />

        {/* Home Page */}
        <Route
          path="/documents"
          element={<Documents />}
        />
        <Route
          path="/link-documents"
          element={<LinkDocuments isLoggedIn={loggedIn} handleLogout={handleLogout} />}
        />
      </Routes>
    </div>
  );
}

export default App;