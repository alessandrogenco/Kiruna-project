import React, { useState } from 'react';
import {Col, Form, Row } from 'react-bootstrap';

function Register() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <Row className="vh-100 justify-content-center align-items-center">
        <Col xs={10} sm={8} md={6} lg={4} className="mx-auto">
        <h1 className="text-center pb-3">Register</h1>
        <Form.Group className="mb-3" controlId="username">
        <Form.Label>Username</Form.Label>
        <Form.Control
            type="text"
            value={username}
            placeholder="Enter your game username."
            onChange={(ev) => setUsername(ev.target.value)}
            required={true}
            className="w-100"
            />
        </Form.Group>
        <Form.Group className="mb-3" controlId="name">
        <Form.Label>Name</Form.Label>
        <Form.Control
            type="text"
            value={name}
            placeholder="Enter your game username."
            onChange={(ev) => setName(ev.target.value)}
            required={true}
            className="w-100"
            />
        </Form.Group>
        <Form.Group className="mb-3" controlId="surname">
        <Form.Label>Surname</Form.Label>
        <Form.Control
            type="text"
            value={surname}
            placeholder="Enter your game username."
            onChange={(ev) => setSurname(ev.target.value)}
            required={true}
            className="w-100"
            />
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
        <Form.Label>Password</Form.Label>
        <Form.Control
            type="text"
            value={password}
            placeholder="Enter your game username."
            onChange={(ev) => setPassword(ev.target.value)}
            required={true}
            className="w-100"
            />
        </Form.Group>
        </Col>
    </Row>
  );
}

export default Register;