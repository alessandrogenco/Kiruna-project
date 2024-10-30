import { useState } from 'react';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PropTypes from "prop-types";

function LoginForm(props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [show, setShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        const credentials = { username, password };

        props.login(credentials)
            .then(() => navigate("/explore"))
            .catch((err) => {
                if (err.message === "Unauthorized")
                    setErrorMessage("Invalid username and/or password");
                else
                    setErrorMessage(err.message);
                setShow(true);
            });
    };

    return (
        <Row className="vh-100 justify-content-center align-items-center">
            <Col xs={10} sm={8} md={6} lg={4} className="mx-auto">
                <h1 className="text-center pb-3">Login</h1>
                <Form onSubmit={handleSubmit}>
                    <Alert
                        dismissible
                        show={show}
                        onClose={() => setShow(false)}
                        variant="danger">
                        {errorMessage}
                    </Alert>
                    <Form.Group className="mb-3" controlId="username">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            value={username}
                            placeholder="Enter your username."
                            onChange={(ev) => setUsername(ev.target.value)}
                            required={true}
                            className="w-100"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={password}
                            placeholder="Enter the password."
                            onChange={(ev) => setPassword(ev.target.value)}
                            required={true}
                            className="w-100"
                        />
                    </Form.Group>
                    <Button className="mt-3 w-auto btn-sm custom-login-button mx-auto d-block" type="submit">Login</Button>
                    <hr className="custom-divider" /> 
                    <Button className="mt-2 w-100 btn-sm custom-login-button" type="button" onClick={() => navigate("/explore")}>Start to Explore</Button>
                </Form>
            </Col>
        </Row>
    );
}

LoginForm.propTypes = {
    login: PropTypes.func,
};

export default LoginForm;
