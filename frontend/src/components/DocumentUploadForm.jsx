import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';


function DocumentUploadForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  const insertionTime = new Date().toISOString(); 

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      title,
      description,
      latitude,
      longitude,
      address,
      insertionTime,
    };
    if (file) {
      formData.file = file;
    }
    console.log("Submitting form with data:", formData);
  };

  return (
    <Container className="mt-5 mb-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <h3 className="text-center mb-4">Upload and Georeference Document</h3>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="title" className="mb-3">
                  <Form.Label>Document Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter document title"
                    required
                  />
                </Form.Group>

                <Form.Group controlId="description" className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter a brief description of the document"
                  />
                </Form.Group>

                <Form.Group controlId="file" className="mb-3">
                  <Form.Label>File Upload</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group controlId="latitude" className="mb-3">
                      <Form.Label>Latitude</Form.Label>
                      <Form.Control
                        type="number"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="e.g., 40.7128"
                        min="-90"
                        max="90"
                        step="0.0001"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="longitude" className="mb-3">
                      <Form.Label>Longitude</Form.Label>
                      <Form.Control
                        type="number"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="e.g., -74.0060"
                        min="-180"
                        max="180"
                        step="0.0001"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group controlId="address" className="mb-3">
                  <Form.Label>Address (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter address or location name"
                  />
                </Form.Group>

            

                <Button variant="primary" type="submit" className="w-100 mt-4">
                  Submit Document with Geolocation
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default DocumentUploadForm;
