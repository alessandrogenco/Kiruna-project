import { useState } from 'react';
import { Alert, Button, Col, Form, Row, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PropTypes from "prop-types";
import '../styles/Auth.css'; 

function LoginForm({ login, isLoggedIn, handleLogout }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        const credentials = { username, password };

        login(credentials)
            .then(() => navigate("/explore", { state: { isLoggedIn, handleLogout } }))
            .catch((err) => {
                if (err.message === "Unauthorized")
                    setErrorMessage("Invalid username and/or password");
                else
                    setErrorMessage(err.message);
                setShow(true);
            });
    };

    return (
        <div className="login-container">
            <div className="glassy-form-container">
                <h2 className="login-title">Login</h2>
                <Form onSubmit={handleSubmit}>
                    <Alert
                        dismissible
                        show={show}
                        onClose={() => setShow(false)}
                        variant="danger"
                        className="alert-danger-custom"
                    >
                        {errorMessage}
                    </Alert>
                    <Form.Group className="mb-3" controlId="username">
                        <Form.Control
                            type="text"
                            value={username}
                            placeholder="Enter your name"
                            onChange={(ev) => setUsername(ev.target.value)}
                            required
                            className="form-control-custom"
                        />
                    </Form.Group>
                    <Form.Group className="mb-4" controlId="password">
                        <Form.Control
                            type="password"
                            value={password}
                            placeholder="Enter your password"
                            onChange={(ev) => setPassword(ev.target.value)}
                            required
                            className="form-control-custom"
                        />
                    </Form.Group>
                    <Button
                        type="submit"
                        className="submit-button"
                    >
                        Log In
                    </Button>
                </Form>
            </div>
        </div>
    );
}

LoginForm.propTypes = {
    login: PropTypes.func.isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
    handleLogout: PropTypes.func.isRequired,
};

export default LoginForm;
