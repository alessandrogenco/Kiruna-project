import { describe, test, expect, jest, afterEach } from "@jest/globals";
import { app, server } from "../index.mjs";
import request from "supertest";
import { cleanup } from "../db/cleanup.mjs";


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
        const mockLat = 67.8301;
        const mockLon = 20.3001;
        const mockArea = "";

        const response = await request(app).post(baseURL + "addDocument").send({
            title: mockTitle,
            stakeholders: mockStakeholders,
            scale: mockScale,
            issuanceDate: mockIssuanceDate,
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
            id: expect.any(Number),
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
        const mockLat = 67.8301;
        const mockLon = 20.3001;
        const mockArea = "";

        const response = await request(app).post(baseURL + "addDocument").send({
            title: mockTitle,
            stakeholders: mockStakeholders,
            scale: mockScale,
            issuanceDate: mockIssuanceDate,
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
            id: expect.any(Number),
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
        const mockArea = "{\"type\":\"FeatureCollection\",\"features\":[{\"id\":\"f38f71334e8447fbb141f1b1c48a286c\",\"type\":\"Feature\",\"properties\":{},\"geometry\":{\"coordinates\":[[[20.239686143658616,67.84183826990176],[20.235568234386562,67.83264710999458],[20.279835759065435,67.83238815166152],[20.239686143658616,67.84183826990176]]],\"type\":\"Polygon\"}}]}";

        const response = await request(app).post(baseURL + "addDocument").send({
            title: mockTitle,
            stakeholders: mockStakeholders,
            scale: mockScale,
            issuanceDate: mockIssuanceDate,
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
            id: expect.any(Number),
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
        expect(response.body).toEqual({ message: 'Invalid parameters for lat/lon' });
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
        const mockLon = 24.0001;
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
        expect(response.body).toEqual({ message: 'Invalid parameters for lat/lon' });
    });
});


describe('POST /api/updateDocument', () => {

    test('Updates document successfully with valid fields', async () => {
        const documentId = await request(app).get('/api/documents').then((response) => response.body[0].id);
        const mockResult = {
            id: documentId,
            title: 'Updated Document',
            stakeholders: 'Stakeholder A',
            scale: 'large',
            issuanceDate: '2022-01-01',
            type: 'research',
            connections: 3,
            language: 'EN',
            pages: 10,
            lat: 67.8301,
            lon: 20.3001,
            area: '',
            description: 'An updated description,',
        };

        const response = await request(app)
            .post('/api/updateDocument')
            .send(mockResult);

        expect(response.status).toBe(200);
        mockResult.message = 'Document updated successfully.';
        expect(response.body).toEqual(mockResult);
    });

    
    test('Returns 400 error for missing required fields (id, title)', async () => {
        const response = await request(app)
            .post('/api/updateDocument')
            .send({
                stakeholders: 'Stakeholder A',
                scale: 'large',
                issuanceDate: '2022-01-01',
                type: 'research'
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Missing required fields" });
    });

    test('Returns 400 error for invalid area and lat/lon combination', async () => {
        const response = await request(app)
            .post('/api/updateDocument')
            .send({
                id: 1,
                title: 'Document with Invalid Area and Lat/Lon',
                stakeholders: 'Stakeholder A',
                scale: 'large',
                issuanceDate: '2022-01-01',
                type: 'research',
                lat: 67.9,
                lon: 20.8,
                area: 'North Zone'
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Invalid parameters" });
    });

    test('Returns 400 error for out-of-range latitude and longitude', async () => {
        const response = await request(app)
            .post('/api/updateDocument')
            .send({
                id: 1,
                title: 'Document with Invalid Lat/Lon',
                stakeholders: 'Stakeholder A',
                scale: 'large',
                issuanceDate: '2022-01-01',
                type: 'research',
                lat: 66.5, // Out of valid range
                lon: 20.8,
                area: ''
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Invalid parameters" });
    });

    test('Returns error when no document found with provided ID', async () => {
        const mockError = new Error('No document found with the provided ID.');

        const response = await request(app)
            .post('/api/updateDocument')
            .send({
                id: 999, // Non-existent ID
                title: 'Non-existent Document',
                stakeholders: 'Stakeholder B',
                scale: 'small',
                issuanceDate: '2023-01-01',
                type: 'summary',
                connections: 5,
                language: 'EN',
                pages: 5,
                lat: 67.8301,
                lon: 20.3001,
                area: '',
                description: 'Non-existent document description',
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: mockError.message });
    });

    

});

describe('DELETE /api/deleteDocument', () => {
  
    test('Deletes document successfully when valid ID is provided', async () => {
      const documentId = await request(app).get('/api/documents').then((response) => response.body[0].id);

      const response = await request(app)
        .post('/api/deleteDocument')
        .send({ id: documentId}); // Send a valid document ID
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual({id: documentId, message: 'Document deleted successfully.'});
    });
  
    test('Returns 400 error when ID is not provided', async () => {
        const response = await request(app)
            .post('/api/deleteDocument')
            .send({});
    
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: 'ID is required.' });
    });
    
  
});

describe('GET /api/documents/stakeholders', () => {
    test('Should return 200 and a list of stakeholders', async () => {
    
      const response = await request(app).get('/api/documents/stakeholders');
  
      expect(response.status).toBe(200);
  
      expect(response.body).toEqual('Sample stakeholders - Stakeholder A - Stakeholder B');
    });
  
});

describe('GET /api/documents/scales', () => {
    test('Should return 200 and a list of scales', async () => {
    
      const response = await request(app).get('/api/documents/scales');
  
      expect(response.status).toBe(200);
  
      expect(response.body).toEqual([{"name": "1:10000"}, {"name": "large"}, {"name": "small"}]);
    });
  
});

describe('GET /api/documents/types', () => {
    test('Should return 200 and a list of types', async () => {
    
      const response = await request(app).get('/api/documents/types');
  
      expect(response.status).toBe(200);
  
      expect(response.body).toEqual([{"name": "Informative"}, {"name": "research"}, {"name": "summary"}]);
    });
  
});