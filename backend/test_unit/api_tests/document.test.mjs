import { describe, test, expect, jest, afterEach, afterAll } from "@jest/globals";
import { app, server } from "../../index.mjs";
import request from "supertest";
import db from "../../db/db.mjs";
import DocumentDao from "../../dao/document.mjs";


// Mocking the instance of DocumentDao
jest.mock("../../dao/document.mjs"); 

const baseURL = "/api/";

afterEach(() => {
    jest.restoreAllMocks(); // Clean up mocks after each test
});

afterAll(() => {
    server.close(); // Close the server after all tests
});

describe('GET /api/documents', () => {
    test('should return a list of documents with status 200', async () => {
        
        // Mock data reflecting the structure of the database
        const mockDocuments = [
            {
                id: 1,
                title: "Compilation of responses “So what the people of Kiruna think?” (15)",
                stakeholders: "Kiruna kommun/Residents",
                scale: "Text",
                issuanceDate: "2007",
                type: "Informative document",
                connections: 4,
                language: "Swedish",
                pages: null,
                lat: null,
                lon: null,
                area: null,
                description: null
            },
            {
                id: 2,
                title: "Detail plan for Bolagsomradet Gruvstad-spark (18)",
                stakeholders: "Kiruna kommun",
                scale: "1:8.000",
                issuanceDate: "2010-10-20",
                type: "Prescriptive document",
                connections: 9,
                language: "Swedish",
                pages: "1-32",
                lat: null,
                lon: null,
                area: null,
                description: null
            }
        ];

        // Mock getAllDocuments to resolve with mockDocuments
        DocumentDao.prototype.getAllDocuments.mockResolvedValue(mockDocuments);

        // Send GET request
        const response = await request(app).get(baseURL + 'documents');

        // Check that the response status is 200 and body matches mockDocuments
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockDocuments);
    });

    test('should return a 500 error with message when an error occurs', async () => {
        const errorMessage = 'Database error: Failed to fetch documents';

        // Mock getAllDocuments to reject with an error
        DocumentDao.prototype.getAllDocuments.mockRejectedValue(new Error(errorMessage));

        // Send GET request
        const response = await request(app).get(baseURL + 'documents');

        // Check that the response status is 500 and body contains error message
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: errorMessage });
    });
});

describe('PUT /api/addDescription', () => {

    



    test('should successfully update a document description', async () => {
        const mockId = 1;
        const mockTitle = "Sample Document";
        const mockDescription = "Updated description for the document";

        const mockDocument = { 
            id: mockId, 
            title: mockTitle,
            stakeholders: "Sample stakeholders",
            scale: "1:10000",
            issuanceDate: "2023-01-01",
            type: "Informative",
            connections: 5,
            language: "English",
            pages: "1-10",
            lat: 68.0001,
            lon: 21.0001,
            area: "Sample area",
            description: null 
        };

        DocumentDao.prototype.getDocumentById.mockResolvedValue(mockDocument);
        DocumentDao.prototype.addDocumentDescription.mockResolvedValue({
            id: mockId,
            title: mockTitle,
            description: mockDescription,
            message: 'Description updated successfully.'
        });
    
        // Send PUT request to the API with mockId, mockTitle, and mockDescription
        const response = await request(app)
            .put(baseURL + 'addDescription')
            .send({ id: mockId, title: mockTitle, description: mockDescription });
    
        // Check that the response status is 200 and the response body matches the expected structure
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: 'Document description updated successfully',
            document: {
                id: mockId,
                title: mockTitle,
                description: mockDescription
            }
        });
    });

    test('should return 400 error if title is empty', async () => {
        const mockId = 1;

        // Send PUT request
        const response = await request(app)
            .put(baseURL + 'addDescription')
            .send({ id: mockId});

        // Check response status and body for 400 error

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Description cannot be empty.' });
    });

    test('should return 404 error if document is not found', async () => {
        const mockId = 99;
        const mockTitle = "Nonexistent Document";
        const mockDescription = "Description for nonexistent document";

        // Mock getDocumentById to reject with an error indicating document not found
        DocumentDao.prototype.getDocumentById.mockRejectedValue(new Error('Document not found.'));

        // Send PUT request
        const response = await request(app)
            .put(baseURL + 'addDescription')
            .send({ id: mockId, title: mockTitle, description: mockDescription });

        // Check response status and body for 404 error
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Document not found.' });
    });

    test('should return 400 error if description is empty', async () => {
        const mockId = 1;
        const mockTitle = "Sample Document";
        const mockDescription = " "; // Empty description

        // Send PUT request
        const response = await request(app)
            .put(baseURL + 'addDescription')
            .send({ id: mockId, title: mockTitle, description: mockDescription });

        // Check response status and body for 400 error
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Description cannot be empty.' });
    });

    
    
});

describe('POST /api/addDocument', () => {

    // Test for missing required fields TITLE
    test('should return 400 error if title is empty', async () => {
        const mockId = 1;
        const mockTitle = "";
        const mockDescription = "Description for the document";
        const mockStakeholders = "Sample stakeholders";
        const mockScale = "1:10000";
        const mockIssuanceDate = "2023-01-01";
        const mockType = "Informative";
        const mockConnections = 5;
        const mockLanguage = "English";
        const mockPages = "1-10";
        const mockLat = '';
        const mockLon = '';
        const mockArea = "";

        // Send POST request
        const response = await request(app)
            .post(baseURL + 'addDocument')
            .send({ id: mockId, title: mockTitle, stakeholders: mockStakeholders, scale: mockScale, date: mockIssuanceDate, type: mockType, connections: mockConnections, language: mockLanguage, pages: mockPages, lat: mockLat, lon: mockLon, area: mockArea, description: mockDescription });

        // Check response status and body for 404 error
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Missing required fields' });
    });

    // Test for missing required fields LON
    test('should return 400 error if lat filled and lon empty', async () => {
        const mockId = 1;
        const mockTitle = "";
        const mockDescription = "Description for the document";
        const mockStakeholders = "Sample stakeholders";
        const mockScale = "1:10000";
        const mockIssuanceDate = "2023-01-01";
        const mockType = "Informative";
        const mockConnections = 5;
        const mockLanguage = "English";
        const mockPages = "1-10";
        const mockLat = 68.0001;
        const mockLon = '';
        const mockArea = "";

        // Send POST request
        const response = await request(app)
            .post(baseURL + 'addDocument')
            .send({ id: mockId, title: mockTitle, stakeholders: mockStakeholders, scale: mockScale, date: mockIssuanceDate, type: mockType, connections: mockConnections, language: mockLanguage, pages: mockPages, lat: mockLat, lon: mockLon, area: mockArea, description: mockDescription });

        // Check response status and body for 404 error
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Missing required fields' });
    });

    // Test for missing required fields LAT
    test('should return 400 error if lon filled and lat empty', async () => {
        const mockId = 1;
        const mockTitle = "";
        const mockDescription = "Description for the document";
        const mockStakeholders = "Sample stakeholders";
        const mockScale = "1:10000";
        const mockIssuanceDate = "2023-01-01";
        const mockType = "Informative";
        const mockConnections = 5;
        const mockLanguage = "English";
        const mockPages = "1-10";
        const mockLat = '';
        const mockLon = 21.0001;
        const mockArea = "";

        // Send POST request
        const response = await request(app)
            .post(baseURL + 'addDocument')
            .send({ id: mockId, title: mockTitle, stakeholders: mockStakeholders, scale: mockScale, date: mockIssuanceDate, type: mockType, connections: mockConnections, language: mockLanguage, pages: mockPages, lat: mockLat, lon: mockLon, area: mockArea, description: mockDescription });

        // Check response status and body for 404 error
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Missing required fields' });
    });

    test('should successfully add a document with lat and lon', async () => {
        const mockId = 1;
        const mockTitle = "Sample Document";
        const mockDescription = "Description for the document";
        const mockStakeholders = "Sample stakeholders";
        const mockScale = "1:10000";
        const mockIssuanceDate = "2023-01-01";
        const mockType = "Informative";
        const mockConnections = 5;
        const mockLanguage = "English";
        const mockPages = "1-10";
        const mockLat = 67.8301;
        const mockLon = 20.3001;
        const mockArea = "";

        DocumentDao.prototype.addDocument.mockResolvedValue({
            //id: mockId,
            title: mockTitle,
            stakeholders: mockStakeholders,
            scale: mockScale,
            date: mockIssuanceDate,
            type: mockType,
            connections: mockConnections,
            language: mockLanguage,
            pages: mockPages,
            lat: mockLat,
            lon: mockLon,
            area: mockArea,
            description: mockDescription,
            message: 'Document added successfully.'
        });
    
        // Send POST request to the API with mockId, mockTitle, and mockDescription
        const response = await request(app)
            .post(baseURL + 'addDocument')
            .send({ id: mockId, title: mockTitle, stakeholders: mockStakeholders, scale: mockScale, date: mockIssuanceDate, type: mockType, connections: mockConnections, language: mockLanguage, pages: mockPages, lat: mockLat, lon: mockLon, area: mockArea, description: mockDescription });
    
        // Check that the response status is 200 and the response body matches the expected structure
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            title: mockTitle,
            stakeholders: mockStakeholders,
            scale: mockScale,
            date: mockIssuanceDate,
            type: mockType,
            connections: mockConnections,
            language: mockLanguage,
            pages: mockPages,
            lat: mockLat,
            lon: mockLon,
            area: mockArea,
            description: mockDescription,
            message: 'Document added successfully.'
        });
    });

    // Test per l'aggiunta di un documento con area vuota e lat/lon mancanti
    test("Should return 400 if lat and lon are missing while area is empty", async () => {
        const mockData = {
            id: 1,
            title: "New Document Title",
            stakeholders: "Stakeholder1-Stakeholder2",
            scale: "1:1000",
            issuanceDate: "2023-01-01",
            type: "report",
            connections: ["doc1", "doc2"],
            language: "English",
            pages: 50,
            lat: null,            // lat non fornito
            lon: null,            // lon non fornito
            area: "",            // area vuota
            description: "Description of the new document"
        };
    
        const response = await request(app)
            .post('/api/addDocument')
            .send(mockData);
    
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Missing required fields" });
    });

    

    // Test for INVALIDE LAT
    test('should return 400 error if lat invalid parameter', async () => {
        const mockId = 1;
        const mockTitle = "title";
        const mockDescription = "Description for the document";
        const mockStakeholders = "Sample stakeholders";
        const mockScale = "1:10000";
        const mockIssuanceDate = "2023-01-01";
        const mockType = "Informative";
        const mockConnections = 5;
        const mockLanguage = "English";
        const mockPages = "1-10";
        const mockLat = 90.0000;
        const mockLon = 21.0001;
        const mockArea = "";

        // Send POST request
        const response = await request(app)
            .post(baseURL + 'addDocument')
            .send({ id: mockId, title: mockTitle, stakeholders: mockStakeholders, scale: mockScale, date: mockIssuanceDate, type: mockType, connections: mockConnections, language: mockLanguage, pages: mockPages, lat: mockLat, lon: mockLon, area: mockArea, description: mockDescription });

        // Check response status and body for 400 error
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Invalid parameters for lat/lon' });
    });

    // Test for INVALIDE LON
    test('should return 400 error if lon invalid parameter', async () => {
        const mockId = 1;
        const mockTitle = "title";
        const mockDescription = "Description for the document";
        const mockStakeholders = "Sample stakeholders";
        const mockScale = "1:10000";
        const mockIssuanceDate = "2023-01-01";
        const mockType = "Informative";
        const mockConnections = 5;
        const mockLanguage = "English";
        const mockPages = "1-10";
        const mockLat = 68.0001;
        const mockLon = 24.0001;
        const mockArea = "";

        // Send POST request
        const response = await request(app)
            .post(baseURL + 'addDocument')
            .send({ id: mockId, title: mockTitle, stakeholders: mockStakeholders, scale: mockScale, date: mockIssuanceDate, type: mockType, connections: mockConnections, language: mockLanguage, pages: mockPages, lat: mockLat, lon: mockLon, area: mockArea, description: mockDescription });

        // Check response status and body for 400 error
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Invalid parameters for lat/lon' });
    });

    // Test for LAT, LON and AREA set
    /*test('should return 400 error if lat, lon and area are set', async () => {
        const mockId = 1;
        const mockTitle = "";
        const mockDescription = "Description for the document";
        const mockStakeholders = "Sample stakeholders";
        const mockScale = "1:10000";
        const mockIssuanceDate = "2023-01-01";
        const mockType = "Informative";
        const mockConnections = 5;
        const mockLanguage = "English";
        const mockPages = "1-10";
        const mockLat = 68.0001;
        const mockLon = 22.0001;
        const mockArea = JSON.stringify({  // GeoJSON serializzato in stringa
            type: "Polygon",
            coordinates: [[[0, 0], [1, 1], [1, 0], [0, 0]]]
        });

        // Send POST request
        const response = await request(app)
            .post(baseURL + 'addDocument')
            .send({ id: mockId, title: mockTitle, stakeholders: mockStakeholders, scale: mockScale, date: mockIssuanceDate, type: mockType, connections: mockConnections, language: mockLanguage, pages: mockPages, lat: mockLat, lon: mockLon, area: mockArea, description: mockDescription });

        // Check response status and body for 400 error
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Invalid parameters' });
    });*/
    
});

describe("POST /api/updateDocument", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Successfully updates a document with valid lat/lon and no area", async () => {
        const mockData = {
            id: 1,
            title: "Updated Document Title",
            stakeholders: "Updated Stakeholder",
            scale: "1:1000",
            issuanceDate: "2023-01-01",
            type: "report",
            connections: ["doc2", "doc3"],
            language: "English",
            pages: 50,
            lat: 67.8301,  // Valido
            lon: 20.3001,  // Valido
            area: "",      // Area non fornita
            description: "Updated description"
        };

        jest.spyOn(DocumentDao.prototype, 'updateDocument').mockResolvedValue({
            ...mockData,
            message: "Document updated successfully."
        });

        const response = await request(app)
            .post('/api/updateDocument')
            .send(mockData);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            ...mockData,
            message: "Document updated successfully."
        });
    });

    test("Successfully updates a document with area and no lat/lon", async () => {
        const mockData = {
            id: 1,
            title: "Updated Document Title",
            stakeholders: "Updated Stakeholder",
            scale: "1:1000",
            issuanceDate: "2023-01-01",
            type: "report",
            connections: ["doc2", "doc3"],
            language: "English",
            pages: 50,
            lat: "",        // Non forniti
            lon: "",        // Non forniti
            area: JSON.stringify({  // GeoJSON serializzato in stringa
                type: "Polygon",
                coordinates: [[[0, 0], [1, 1], [1, 0], [0, 0]]]
            }),
            description: "Updated description"
        };

        jest.spyOn(DocumentDao.prototype, 'updateDocument').mockResolvedValue({
            ...mockData,
            message: "Document updated successfully."
        });

        const response = await request(app)
            .post('/api/updateDocument')
            .send(mockData);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            ...mockData,
            message: "Document updated successfully."
        });
    });

    test("Returns error if required fields (id, title) are missing", async () => {
        const response = await request(app)
            .post('/api/updateDocument')
            .send({ stakeholders: "Updated Stakeholder" }); // `id` e `title` mancanti

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Missing required fields" });
    });

    test("Returns error when lat/lon are missing and area is not provided", async () => {
        const mockData = {
            id: 1,
            title: "Missing Lat/Lon and Area",
            stakeholders: "Updated Stakeholder",
            scale: "1:1000",
            issuanceDate: "2023-01-01",
            type: "report",
            connections: ["doc2", "doc3"],
            language: "English",
            pages: 50,
            lat: "",        // Non forniti
            lon: "",        // Non forniti
            area: "",       // Area non fornita
            description: "Updated description"
        };

        const response = await request(app)
            .post('/api/updateDocument')
            .send(mockData);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Latitude and Longitude are required when Area is not provided" });
    });

    test("Returns error if area is an empty GeoJSON object", async () => {
        const mockData = {
            id: 1,
            title: "Empty GeoJSON Area",
            stakeholders: "Updated Stakeholder",
            scale: "1:1000",
            issuanceDate: "2023-01-01",
            type: "report",
            connections: ["doc2", "doc3"],
            language: "English",
            pages: 50,
            lat: "",        // Non forniti
            lon: "",        // Non forniti
            area: {},       // GeoJSON vuoto
            description: "Updated description"
        };

        const response = await request(app)
            .post('/api/updateDocument')
            .send(mockData);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Area cannot be an empty GeoJSON object" });
    });
});

describe("DELETE /api/deleteDocument", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Successfully deletes a document", async () => {
        const mockId = 1;

        // Mock `deleteDocumentById` to simulate successful deletion
        jest.spyOn(DocumentDao.prototype, 'deleteDocumentById').mockResolvedValue({
            id: mockId,
            message: 'Document deleted successfully.'
        });

        const response = await request(app)
            .post('/api/deleteDocument')
            .send({ id: mockId });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: mockId,
            message: 'Document deleted successfully.'
        });
    });

    test("Returns error if ID is missing", async () => {
        const response = await request(app)
            .post('/api/deleteDocument')
            .send({}); // No ID provided

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            message: 'ID is required.'
        });
    });

    test("Returns error if document doesn't exist", async () => {
        const mockId = 99;

        // Mock `deleteDocumentById` to simulate a non-existing document
        jest.spyOn(DocumentDao.prototype, 'deleteDocumentById').mockRejectedValue(
            new Error('No document found with the provided ID.')
        );

        const response = await request(app)
            .post('/api/deleteDocument')
            .send({ id: mockId });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            message: 'No document found with the provided ID.'
        });
    });
});

describe('GET /api/documents/stakeholders', () => {
    test('Should return 200 and a list of stakeholders', async () => {
      const stakeholders = 'Sample stakeholders - Stakeholder A - Stakeholder B';
      DocumentDao.prototype.showStakeholders.mockResolvedValue(stakeholders);

      const response = await request(app).get('/api/documents/stakeholders');
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual(stakeholders);
    });
  
    test('Should return 500 if there is an internal server error', async () => {
        DocumentDao.prototype.showStakeholders.mockRejectedValue(new Error("Database error"));
  
        const response = await request(app).get('/api/documents/stakeholders');
    
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            message: 'Database error'
        });      
    });
});

describe('GET /api/documents/scales', () => {
    test('Should return 200 and a list of scales', async () => {
      const scales = [{"name": "1:10000"}, {"name": "large"}, {"name": "small"}];
      DocumentDao.prototype.showScales.mockResolvedValue(scales);

      const response = await request(app).get('/api/documents/scales');
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual(scales);
    });
  
    test('Should return 500 if there is an internal server error', async () => {
        DocumentDao.prototype.showScales.mockRejectedValue(new Error("Database error"));
  
        const response = await request(app).get('/api/documents/scales');
    
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            message: 'Database error'
        });      
    });
});

describe('GET /api/documents/types', () => {
    test('Should return 200 and a list of types', async () => {
      const types = [{"name": "Informative"}, {"name": "research"}, {"name": "summary"}];
      DocumentDao.prototype.showTypes.mockResolvedValue(types);

      const response = await request(app).get('/api/documents/types');
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual(types);
    });
  
    test('Should return 500 if there is an internal server error', async () => {
        DocumentDao.prototype.showTypes.mockRejectedValue(new Error("Database error"));
  
        const response = await request(app).get('/api/documents/types');
    
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            message: 'Database error'
        });      
    });
});

describe('POST /api/updateDocumentGeoreference', () => {
    test('should return 400 if document ID is not provided', async () => {
      const response = await request(app)
        .post('/api/updateDocumentGeoreference')
        .send({ lat: 68.0, lon: 20.0 });
  
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Document ID is required');
    });
  
    test('should return 400 if no georeferencing data is provided', async () => {
      const response = await request(app)
        .post('/api/updateDocumentGeoreference')
        .send({ id: 1 });
  
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Georeferencing data (lat/lon/area) is required');
    });
  
    test('should update georeferencing with lat and lon', async () => {
      const response = await request(app)
        .post('/api/updateDocumentGeoreference')
        .send({ id: 1, lat: 68.0, lon: 20.0 });
  
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Georeferencing updated successfully');
    });
  
    test('should update georeferencing with area', async () => {
      const response = await request(app)
        .post('/api/updateDocumentGeoreference')
        .send({ id: 1, area: 'New Area' });
  
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Georeferencing updated successfully');
    });
  
    test('should handle database error when updating georeferencing', async () => {
      jest.spyOn(db,'run').mockImplementationOnce((query, params, callback) => {
        callback(new Error('Database error'));
      });
  
      const response = await request(app)
        .post('/api/updateDocumentGeoreference')
        .send({ id: 1, lat: 68.0, lon: 20.0 });
  
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to update georeferencing');
      expect(response.body.error).toBe('Database error');
    });
});

describe('GET /api/getDocumentLocations', () => {
    test('should return 200 and the list of georeferenced locations', async () => {
      const mockData = [
        {
          id: 1,
          title: 'Document 1',
          lat: 68.0,
          lon: 20.0,
          area: 'Area 1',
          description: 'Description 1',
          type: 'type1'
        },
        {
          id: 2,
          title: 'Document 2',
          lat: 68.0,
          lon: 20.0,
          area: 'Area 2',
          description: 'Description 2',
          type: 'type2'
        }
      ];
  
      jest.spyOn(db,'all').mockImplementationOnce((query, callback) => {
        callback(null, mockData);
      });
  
      const response = await request(app)
        .get('/api/getDocumentLocations');
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
    });
  
    test('should return 404 if no georeferenced locations are found', async () => {
      jest.spyOn(db,'all').mockImplementationOnce((query, callback) => {
        callback(null, []);
      });
  
      const response = await request(app)
        .get('/api/getDocumentLocations');
  
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('No georeferenced locations found');
    });
  
    test('should return 500 if there is a database error', async () => {
      jest.spyOn(db,'all').mockImplementationOnce((query, callback) => {
        callback(new Error('Database error'));
      });
  
      const response = await request(app)
        .get('/api/getDocumentLocations');
  
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to fetch georeferenced locations');
      expect(response.body.error).toBe('Database error');
    });
});

describe('GET /api/getDocumentLocation/:id', () => {
    test('should return 404 if no georeferenced location is found for the specified document', async () => {
      const documentId = '1';
  
      jest.spyOn(db,'get').mockImplementationOnce((query, params, callback) => {
        callback(null, null);
      });
  
      const response = await request(app)
        .get(`/api/getDocumentLocation/${documentId}`);
  
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('No georeferenced location found for the specified document');
    });
  
    test('should return 200 and document location if georeferenced location is found', async () => {
      const documentId = '1';
      const mockLocation = {
        id: '1',
        title: 'Test Document',
        lat: 68.0,
        lon: 20.0,
        area: 'Test Area',
        description: 'Test Description'
      };
  
      jest.spyOn(db,'get').mockImplementationOnce((query, params, callback) => {
        callback(null, mockLocation);
      });
  
      const response = await request(app)
        .get(`/api/getDocumentLocation/${documentId}`);
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLocation);
    });
  
    test('should return 500 if there is a database error', async () => {
      const documentId = '1';
  
      jest.spyOn(db,'get').mockImplementationOnce((query, params, callback) => {
        callback(new Error('Database error'));
      });
  
      const response = await request(app)
        .get(`/api/getDocumentLocation/${documentId}`);
  
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to fetch georeferenced location');
      expect(response.body.error).toBe('Database error');
    });
});