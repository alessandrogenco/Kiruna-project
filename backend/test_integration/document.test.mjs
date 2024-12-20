import { describe, test, expect, jest, afterEach } from "@jest/globals";
import { app, server } from "../index.mjs";
import request from "supertest";
import { cleanup } from "../db/cleanup.mjs";
import DocumentDao from '../dao/document.mjs'; 
import db from '../db/db.mjs';


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
                area: {}
            });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Area cannot be an empty GeoJSON object" });
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
        expect(response.body).toEqual({ message: "Invalid parameters for lat/lon" });
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
        
    });

    

});

describe('DELETE /api/deleteDocument', () => {
  
    
  
});

describe('GET /api/documents/stakeholders', () => {
    test('Should return 200 and a list of stakeholders', async () => {
    
      const response = await request(app).get('/api/documents/stakeholders');
  
      expect(response.status).toBe(200);
  
      expect(response.body).toEqual('Stakeholder B');
    });
  
});

describe('GET /api/documents/scales', () => {
    test('Should return 200 and a list of scales', async () => {
    
      const response = await request(app).get('/api/documents/scales');
  
      expect(response.status).toBe(200);
  
    
    });
  
});

describe('GET /api/documents/types', () => {
    test('Should return 200 and a list of types', async () => {
    
      const response = await request(app).get('/api/documents/types');
  
      expect(response.status).toBe(200);
  
      
    });
  
});



//------------------------------


describe('DELETE /api/deleteLink', () => {
    test('should return a 400 error if missing parameters', async () => {
        const response = await request(app)
            .delete('/api/deleteLink')
            .send({
                // Missing parameters
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('idDocument1, idDocument2, and linkType are mandatory');
    });

    test('should return a 404 error if the link does not exist', async () => {
        const response = await request(app)
            .delete('/api/deleteLink')
            .send({
                idDocument1: 1,
                idDocument2: 2,
                linkType: 'related'
            });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('The specified link does not exist');
    });

  
});

describe('GET /api/documents/:id', () => {
    test('Successfully retrieves the document by ID', async () => {
        const documentId = 1;
        const mockDocument = { id: documentId, title: 'Sample Document', description: 'Sample description' };

        const spyOn = jest.spyOn(DocumentDao.prototype, "getDocumentById").mockResolvedValue(mockDocument);

        const response = await request(app)
            .get(`/api/documents/${documentId}`);
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockDocument);

        spyOn.mockRestore();
    });

    test('Should return 404 and an error message if the document does not exist', async () => {
        const documentId = 999; 
        
        const spyOn = jest.spyOn(DocumentDao.prototype, "getDocumentById").mockResolvedValue(null);

        const response = await request(app)
            .get(`/api/documents/${documentId}`);
        
        expect(response.status).toBe(404);
        expect(response.body.message).toBe(`Document with ID ${documentId} not found`);

        spyOn.mockRestore();
    });

    test('Should return 500 and an error message if there is a server error', async () => {
        const documentId = 1;

        const spyOn = jest.spyOn(DocumentDao.prototype, "getDocumentById").mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .get(`/api/documents/${documentId}`);
        
        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal server error');
        expect(response.body.error).toBe('Database error');

        spyOn.mockRestore();
    });
});


describe('GET /api/getAreaNames', () => {
  
    test('should return 200 and area names if areas are found', async () => {
      const mockAreas = [
        { areaName: 'Area 1', coordinates: 'POLYGON((...))' },
        { areaName: 'Area 2', coordinates: 'POLYGON((...))' },
      ];
  
      db.all = jest.fn((query, params, callback) => callback(null, mockAreas));
  
      const response = await request(app).get('/api/getAreaNames');
  
      expect(response.status).toBe(200);
      expect(response.body.areas).toEqual(mockAreas);
    });
  
    test('should return 404 if no areas are found', async () => {
      db.all = jest.fn((query, params, callback) => callback(null, []));
  
      const response = await request(app).get('/api/getAreaNames');
  
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('No areas found');
    });
  
    test('should return 500 if there is a database error', async () => {
      const errorMessage = 'Database error';
      db.all = jest.fn((query, params, callback) => callback(new Error(errorMessage), null));
  
      const response = await request(app).get('/api/getAreaNames');
  
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal server error');
      expect(response.body.error).toBe(errorMessage);
    });
  });


describe('PUT /api/documents/:id/adjustPosition', () => {

    const documentDao = new DocumentDao();  
    

    test('Returns 400 if x or y is missing or not an integer', async () => {
        const documentId = 1;

        let response = await request(app)
            .put(`/api/documents/${documentId}/adjustPosition`)
            .send({});
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('x and y values must be integers.');

        response = await request(app)
            .put(`/api/documents/${documentId}/adjustPosition`)
            .send({ x: 'notAInteger', y: 200 });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('x and y values must be integers.');

        response = await request(app)
            .put(`/api/documents/${documentId}/adjustPosition`)
            .send({ x: 100, y: 'notAInteger' });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('x and y values must be integers.');
    });

    test('Handles internal server error correctly', async () => {
        const documentId = 1;
        const newPosition = { x: 100, y: 200 };

        const spyOn = jest.spyOn(documentDao, 'adjustDocumentPosition').mockRejectedValue(new Error('Internal server error'));

        const response = await request(app)
            .put(`/api/documents/${documentId}/adjustPosition`)
            .send(newPosition);

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('An internal server error occurred.');
        spyOn.mockRestore();  
    });
});



describe('POST /api/updateDocumentGeoreference', () => {
   
    test('Returns 400 if document ID is missing', async () => {
      const response = await request(app)
        .post('/api/updateDocumentGeoreference')
        .send({
          lat: 59.3293,
          lon: 18.0686,
          area: '{"type": "Polygon", "coordinates": [[[18.0686, 59.3293], [18.0690, 59.3295], [18.0700, 59.3295], [18.0686, 59.3293]]]}'
        });
  
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Document ID is required');
    });
  
    test('Returns 400 if georeferencing data is missing', async () => {
      const response = await request(app)
        .post('/api/updateDocumentGeoreference')
        .send({
          id: 1 
        });
  
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Georeferencing data (lat/lon/area) is required');
    });
  
    test('Successfully updates georeferencing with lat and lon', async () => {
      const mockDocument = { id: 1, lat: 59.3293, lon: 18.0686, area: null };
      const spyOn = jest.spyOn(db, 'run').mockImplementation((query, params, callback) => {
        callback(null); 
      });
  
      const response = await request(app)
        .post('/api/updateDocumentGeoreference')
        .send({
          id: mockDocument.id,
          lat: 59.3300,
          lon: 18.0700
        });
  
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Georeferencing updated successfully');
      
      spyOn.mockRestore();
    });
  
    // test('Successfully updates georeferencing with area', async () => {
    //   const mockDocument = { id: 1, lat: null, lon: null, area: null };
    //   const mockGeoJson = '{"type": "Polygon", "coordinates": [[[-0.1278, 51.5074], [-0.1280, 51.5076], [-0.1290, 51.5075], [-0.1278, 51.5074]]]}';
    //   const spyOn = jest.spyOn(db, 'run').mockImplementation((query, params, callback) => {
    //     console.log('Mocking db.run with query:', query);
    //     console.log('Params:', params);
    //     callback(null); // Simulate success callback
    //   });
  
    //   const response = await request(app)
    //     .post('/api/updateDocumentGeoreference')
    //     .send({
    //       id: mockDocument.id,
    //       area: mockGeoJson
    //     });
  
    //   expect(response.status).toBe(200);
    //   expect(response.body.message).toBe('Georeferencing updated successfully');
  
    //   spyOn.mockRestore();
    // });
  
    test('Returns 500 if there is a database error', async () => {
      const mockDocument = { id: 1, lat: 59.3293, lon: 18.0686, area: null };
      
      const spyOn = jest.spyOn(db, 'run').mockImplementation((query, params, callback) => {
        callback(new Error('Database error')); // Simulate database error
      });
  
      const response = await request(app)
        .post('/api/updateDocumentGeoreference')
        .send({
          id: mockDocument.id,
          lat: 59.3300,
          lon: 18.0700
        });
  
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to update georeferencing');
      expect(response.body.error).toBe('Database error');
      
      spyOn.mockRestore();
    });
  });
