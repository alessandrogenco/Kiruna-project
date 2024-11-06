import { describe, test, expect, jest, afterEach } from "@jest/globals";
import { app, server } from "../index.mjs";
import request from "supertest";
import { cleanup } from "../db/cleanup.mjs";
// import the dao
import LoginDao from "../dao/login.mjs";
import documentDao from "../dao/document.mjs";

// define baseurl
const baseURL = "/api/";

beforeAll(async () => {
    await cleanup();
})

afterEach(()=>{
    jest.restoreAllMocks()
});

afterAll(() => {
    server.close();
});

describe("POST Added a document", () => {
    test("Successfully added a document", async () => {
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

        const response = await request(app).post(baseURL + "addDocument").send({
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
        });

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

    test("Successfully added a document with lat and lon", async () => {
        const mockTitle = "Sample Document";
        const mockDescription = "Description for the document";
        const mockStakeholders = "Sample stakeholders";
        const mockScale = "1:10000";
        const mockIssuanceDate = "2023-01-01";
        const mockType = "Informative";
        const mockConnections = 5;
        const mockLanguage = "English";
        const mockPages = "1-10";
        const mockLat = 68.0001;
        const mockLon = 21.0001;
        const mockArea = "";

        const response = await request(app).post(baseURL + "addDocument").send({
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
        });

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

    test("Successfully added a document with area", async () => {
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

        const response = await request(app).post(baseURL + "addDocument").send({
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
        });

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

    test('Should return 400 error if title is empty', async () => {
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

        const response = await request(app).post(baseURL + "addDocument").send({
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
        });


        // Check response status and body for 404 error
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Missing required fields' });
    });

    test('Should return 400 error if lat filled and lon empty', async () => {
        const mockTitle = "Sample Document";
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

        const response = await request(app).post(baseURL + "addDocument").send({
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
        });

        // Check response status and body for 404 error
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Missing required fields' });
    });

    test('Should return 400 error if lon filled and lat empty', async () => {
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
        const mockLon = 21.0001;
        const mockArea = "";

        const response = await request(app).post(baseURL + "addDocument").send({
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
        });

        // Check response status and body for 404 error
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Missing required fields' });
    });

    test('Should return 400 error if lat invalid parameter', async () => {
        const mockTitle = "Sample Document";
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

        const response = await request(app).post(baseURL + "addDocument").send({
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
        });

        // Check response status and body for 400 error
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Invalid parameters' });
    });

    test('Should return 400 error if lon invalid parameter', async () => {
        const mockTitle = "Sample Document";
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

        const response = await request(app).post(baseURL + "addDocument").send({
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
        });

        // Check response status and body for 400 error
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'Invalid parameters' });
    });
});

describe('DELETE /api/deleteDocument', () => {
    // Mock deleteDocumentById method from documentDao
    beforeAll(() => {
      jest.spyOn(documentDao.prototype, 'deleteDocumentById');
    });
  
    afterAll(() => {
      documentDao.prototype.deleteDocumentById.mockRestore();
    });
  
    test('Deletes document successfully when valid ID is provided', async () => {
      const mockResult = { id: 1, message: 'Document deleted successfully.' };
      documentDao.prototype.deleteDocumentById.mockResolvedValue(mockResult);
  
      const response = await request(app)
        .post('/api/deleteDocument')
        .send({ id: 1 }); // Send a valid document ID
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(documentDao.prototype.deleteDocumentById).toHaveBeenCalledWith(1);
    });
  
    test('Returns 400 error when ID is not provided', async () => {
        const response = await request(app)
            .post('/api/deleteDocument')
            .send({});
    
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'ID is required.' });
    });
    
    /*
    test('Returns error when no document found with provided ID', async () => {
      documentDao.prototype.deleteDocumentById.mockRejectedValue({message: "No document found with the provided ID"});
  
      const response = await request(app)
        .post('/api/deleteDocument')
        .send({ id: 999 }); // Non-existent ID
  
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "No document found with the provided ID" });
      expect(documentDao.prototype.deleteDocumentById).toHaveBeenCalledWith(999);
    });*/
  });