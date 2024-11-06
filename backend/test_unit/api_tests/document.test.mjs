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

        // Mock document data for getDocumentById to simulate a valid document found in the database
        const mockDocument = { 
            id: mockId, 
            title: mockTitle,
            description: null
        };

        // Mock getDocumentById to return the mock document with the same ID and title
        DocumentDao.prototype.getDocumentById.mockResolvedValue(mockDocument);

        // Mock addDocumentDescription to return the updated document with the new description
        DocumentDao.prototype.addDocumentDescription = jest.fn().mockResolvedValue({
            id: mockId,
            title: mockTitle,
            description: mockDescription
        });

        // Send PUT request with id, title, and description
        const response = await request(app)
            .put(baseURL + 'addDescription')
            .send({ id: mockId, title: mockTitle, description: mockDescription });

        // Check that the response status is 200 and the body contains the correct document data
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
        DocumentDao.prototype.getDocumentById.mockRejectedValue(new Error('Document not found'));

        // Send PUT request
        const response = await request(app)
            .put(baseURL + 'addDescription')
            .send({ id: mockId, title: mockTitle, description: mockDescription });

        // Check response status and body for 404 error
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Document not found' });
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
