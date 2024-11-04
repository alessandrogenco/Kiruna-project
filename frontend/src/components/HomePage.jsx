import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import HomePage from './HomePage';
import ExplorePage from './ExplorePage';
import Navbar from './Navbar';
import MessageModal from './MessageModal'; // Import the MessageModal component

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
        {/* Register Page */}
        <Route
          path="/register"
          element={<Register />}
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
          path="/"
          element={loggedIn ? <HomePage /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
}

export default App;