import { describe, test, expect, jest, afterEach } from "@jest/globals";
import db from "../../db/db.mjs";
import DocumentDao from "../../dao/document.mjs";

const documentDao = new DocumentDao();

afterEach(() => {
    jest.restoreAllMocks();
});

describe("Add new description", () => {
    test("Successfully added a new description", async () => {
        // Test data
        const id = 1;
        const title = "Document Title";
        const description = "This is a new description";

        // Mocking db.get to simulate finding an existing document
        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, { id, title });  // Document found
        });

        // Mocking db.run to simulate updating the description
        jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null);  // Update successful
        });

        // Call the method and verify the result
        const result = await documentDao.addDocumentDescription(id, title, description);
        
        expect(result).toEqual({
            id,
            title,
            description,
            message: 'Description updated successfully.'
        });
    });

    test("Fails when description is empty", async () => {
        const id = 1;
        const title = "Document Title";
        const description = "";

        await expect(documentDao.addDocumentDescription(id, title, description))
            .rejects
            .toThrow("Description cannot be empty.");
    });

    test("Fails when document is not found", async () => {
        const id = 1;
        const title = "Non-existent Document";
        const description = "New description";

        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, null);  // Document not found
        });

        await expect(documentDao.addDocumentDescription(id, title, description))
            .rejects
            .toThrow("Document not found with the provided ID and title.");
    });

    test("Fails when there is a database error during get", async () => {
        const id = 1;
        const title = "Document Title";
        const description = "New description";

        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(new Error("Database error during get"), null);
        });

        await expect(documentDao.addDocumentDescription(id, title, description))
            .rejects
            .toThrow("Database error: Database error during get");
    });

    test("Fails when there is a database error during update", async () => {
        const id = 1;
        const title = "Document Title";
        const description = "New description";

        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, { id, title });  // Document found
        });

        jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(new Error("Database error during update"));
        });

        await expect(documentDao.addDocumentDescription(id, title, description))
            .rejects
            .toThrow("Database error: Database error during update");
    });
});

    // Test per getDocumentById
describe("Get document by ID", () => {
    test("Successfully retrieves a document by ID", async () => {
        const id = 1;
        const mockDocument = { id, title: "Sample Document", description: "Sample description" };

        // Mocking db.get per simulare il recupero del documento
        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, mockDocument);
        });

        const result = await documentDao.getDocumentById(id);
        
        expect(result).toEqual(mockDocument);
    });

    test("Fails when document is not found by ID", async () => {
        const id = 1;

        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, null);  // Documento non trovato
        });

        await expect(documentDao.getDocumentById(id)).rejects.toThrow("Document not found");
    });

    test("Fails when there is a database error during getDocumentById", async () => {
        const id = 1;

        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(new Error("Database error during getDocumentById"), null);
        });

        await expect(documentDao.getDocumentById(id)).rejects.toThrow("Database error: Database error during getDocumentById");
    });
});

// Test per getAllDocuments
describe("Get all documents", () => {
    test("Successfully retrieves all documents", async () => {
        const mockDocuments = [
            { id: 1, title: "Document 1", description: "Description 1" },
            { id: 2, title: "Document 2", description: "Description 2" }
        ];

        // Mocking db.all per simulare il recupero di tutti i documenti
        jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(null, mockDocuments);
        });

        const result = await documentDao.getAllDocuments();
        
        expect(result).toEqual(mockDocuments);
    });

    test("Fails when there is a database error during getAllDocuments", async () => {
        jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(new Error("Database error during getAllDocuments"), null);
        });

        await expect(documentDao.getAllDocuments()).rejects.toThrow("Database error: Database error during getAllDocuments");
    });
});

// Test per addDocument
describe("Add new document", () => {
    test("Successfully adds a new document", async () => {
        // Test data
        const title = "New Document";
        const stakeholders = "Stakeholder1, Stakeholder2";
        const scale = "1:1000";
        const date = "2024-11-06";
        const type = "Report";
        const connections = "Connection1, Connection2";
        const language = "English";
        const pages = 20;
        const lat = 45.1234;
        const lon = 12.5678;
        const description = "This is a new document description.";

        // Mocking db.run to simulate inserting a new document
        jest.spyOn(db, "run").mockImplementation(function (sql, params, callback) {
            callback(null);  // Simulate successful insertion
        });

        const result = await documentDao.addDocument(
            title, stakeholders, scale, date, type, connections, language, pages, lat, lon, description
        );

        expect(result).toEqual({
            title,
            stakeholders,
            scale,
            date,
            type,
            connections,
            language,
            pages,
            lat,
            lon,
            description,
            message: 'Document added successfully.'
        });
    });

    test("Fails when the title is empty", async () => {
        const title = "";
        const stakeholders = "Stakeholder1, Stakeholder2";
        const scale = "1:1000";
        const date = "2024-11-06";
        const type = "Report";
        const connections = "Connection1, Connection2";
        const language = "English";
        const pages = 20;
        const lat = 45.1234;
        const lon = 12.5678;
        const description = "This is a new document description.";

        await expect(documentDao.addDocument(
            title, stakeholders, scale, date, type, connections, language, pages, lat, lon, description
        )).rejects.toThrow("Title cannot be empty.");
    });

    test("Fails when there is a database error during document insertion", async () => {
        const title = "New Document";
        const stakeholders = "Stakeholder1, Stakeholder2";
        const scale = "1:1000";
        const date = "2024-11-06";
        const type = "Report";
        const connections = "Connection1, Connection2";
        const language = "English";
        const pages = 20;
        const lat = 45.1234;
        const lon = 12.5678;
        const description = "This is a new document description.";

        // Mocking db.run to simulate a database error during insertion
        jest.spyOn(db, "run").mockImplementation(function (sql, params, callback) {
            callback(new Error("Database error while adding document"));
        });

        await expect(documentDao.addDocument(
            title, stakeholders, scale, date, type, connections, language, pages, lat, lon, description
        )).rejects.toThrow("Database error: Database error while adding document");
    });
});
