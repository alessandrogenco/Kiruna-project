import { describe, test, expect, jest, afterEach, afterAll } from "@jest/globals";
import { app, server } from "../../index.mjs";
import request from "supertest";
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
    test('should successfully add a document', async () => {
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
        const mockLat = '';
        const mockLon = '';
        const mockArea = "";

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
            lat: '',
            lon: '',
            area: "",
            description: null 
        };

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
            lat: mockLat,
            lon: mockLon,
            area: "",
            description: null 
        };

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

    test('should successfully add a document with area', async () => {
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
        const mockLat = '';
        const mockLon = '';
        const mockArea = "Sample area";

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
            lat: '',
            lon: '',
            area: mockArea,
            description: null 
        };

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

    // Test for INVALIDE LAT
    test('should return 400 error if lat invalid parameter', async () => {
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
        const mockLat = 90.0000;
        const mockLon = 21.0001;
        const mockArea = "";

        // Send POST request
        const response = await request(app)
            .post(baseURL + 'addDocument')
            .send({ id: mockId, title: mockTitle, stakeholders: mockStakeholders, scale: mockScale, date: mockIssuanceDate, type: mockType, connections: mockConnections, language: mockLanguage, pages: mockPages, lat: mockLat, lon: mockLon, area: mockArea, description: mockDescription });

        // Check response status and body for 400 error
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Invalid parameters' });
    });

    // Test for INVALIDE LON
    test('should return 400 error if lon invalid parameter', async () => {
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
        const mockArea = "";

        // Send POST request
        const response = await request(app)
            .post(baseURL + 'addDocument')
            .send({ id: mockId, title: mockTitle, stakeholders: mockStakeholders, scale: mockScale, date: mockIssuanceDate, type: mockType, connections: mockConnections, language: mockLanguage, pages: mockPages, lat: mockLat, lon: mockLon, area: mockArea, description: mockDescription });

        // Check response status and body for 400 error
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Invalid parameters' });
    });

    // Test for LAT, LON and AREA set
    test('should return 400 error if lat, lon and area are set', async () => {
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
        const mockArea = "Sample area";

        // Send POST request
        const response = await request(app)
            .post(baseURL + 'addDocument')
            .send({ id: mockId, title: mockTitle, stakeholders: mockStakeholders, scale: mockScale, date: mockIssuanceDate, type: mockType, connections: mockConnections, language: mockLanguage, pages: mockPages, lat: mockLat, lon: mockLon, area: mockArea, description: mockDescription });

        // Check response status and body for 400 error
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Invalid parameters' });
    });
    
});

describe("POST /api/updateDocument", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Successfully updates a document", async () => {
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
            lat: 68.0000,
            lon: 20.9000,
            area: "",
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

    test("Successfully updates a document", async () => {
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
            lat: '',
            lon: '',
            area: "Sample Area",
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

    test("Returns error if required fields are missing", async () => {
        const response = await request(app)
            .post('/api/updateDocument')
            .send({ id: 1 }); // `title` missing

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Missing required fields" });
    });
    
    test("Returns error for invalid lat without area", async () => {

        const mockData = {
            id: 1,
            title: "Invalid Lat Test",
            stakeholders: "Updated Stakeholder",
            scale: "1:1000",
            issuanceDate: "2023-01-01",
            type: "report",
            connections: ["doc2", "doc3"],
            language: "English",
            pages: 50,
            lat: 70.0000,  // Outside permitted range
            lon: 21.0000,  // Outside permitted range
            area: "", // area is empty
            description: "Updated description"
        };

        const response = await request(app)
            .post('/api/updateDocument')
            .send(mockData);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Invalid parameters" });

    });

    test("Returns error for invalid lon without area", async () => {
        const invalidData = {
            id: 1,
            title: "Invalid Lon Test",
            lat: 68.0000,  // Outside permitted range
            lon: 12.0000,  // Outside permitted range
            area: "", // area is empty
        };

        const response = await request(app)
            .post('/api/updateDocument')
            .send(invalidData);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Invalid parameters" });
    });


    test("Returns error when both area and lat/lon are provided", async () => {
        const invalidData = {
            id: 1,
            title: "Invalid Area/LatLon Combo",
            lat: 68.0000,
            lon: 20.9000,
            area: "Sample Area",
        };

        const response = await request(app)
            .post('/api/updateDocument')
            .send(invalidData);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Invalid parameters" });
    });
    
    test("Returns error if lat or lon is partially missing", async () => {
        const missingLonData = {
            id: 1,
            title: "Partial Lat/Lon Test",
            lat: 68.0000,  // lat provided
            area: ""       // area is empty
        };

        const response = await request(app)
            .post('/api/updateDocument')
            .send(missingLonData);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Missing required fields" });
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
