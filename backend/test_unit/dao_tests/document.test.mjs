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



describe("Link Documents", () => {
    test("Successfully links two documents", async () => {
        const id1 = 1;
        const id2 = 2;
        const linkDate = "2024-11-05";
        const linkType = "Informative document";

        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, { count: 0 });  
        });

        // inserting a new link
        jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null);  
        });

        // updating the connections
        jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null);  
        });

        const result = await documentDao.linkDocuments(id1, id2, linkDate, linkType);
        
        expect(result).toEqual({
            idDocument1: id1,
            idDocument2: id2,
            date: linkDate,
            type: linkType
        });
    });

    test("Fails when link already exists", async () => {
        const id1 = 1;
        const id2 = 2;
        const linkDate = "2024-11-05";
        const linkType = "Informative document";

        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, { count: 1 });  
        });

        await expect(documentDao.linkDocuments(id1, id2, linkDate, linkType))
            .rejects
            .toThrow("Link already exists");
    });

    test("Fails when there is a database error during link check", async () => {
        const id1 = 1;
        const id2 = 2;
        const linkDate = "2024-11-05";
        const linkType = "Informative document";

        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(new Error("Database error during link check"), null);
        });

        await expect(documentDao.linkDocuments(id1, id2, linkDate, linkType))
            .rejects
            .toThrow("Database error: Database error during link check");
    });

    test("Fails when there is a database error during link insertion", async () => {
        const id1 = 1;
        const id2 = 2;
        const linkDate = "2024-11-05";
        const linkType = "Informative document";

        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, { count: 0 });
        });

        jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(new Error("Database error during link insertion"));
        });

        await expect(documentDao.linkDocuments(id1, id2, linkDate, linkType))
            .rejects
            .toThrow("Database error: Database error during link insertion");
    });

    test("Fails when there is a database error during connections update", async () => {
        const id1 = 1;
        const id2 = 2;
        const linkDate = "2024-11-05";
        const linkType = "Informative document";

        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, { count: 0 });  
        });

        jest.spyOn(db, "run")
            .mockImplementationOnce((sql, params, callback) => {
                callback(null);  
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(new Error("Database error during connections update"));  
            });

        await expect(documentDao.linkDocuments(id1, id2, linkDate, linkType))
            .rejects
            .toThrow("Database error: Database error during connections update");
    });

})


describe("Get Document Links", () => {
    test("Successfully retrieves links for a document", async () => {
        const documentId = 1;
        const mockLinks1 = [
            { id: 2, title: "Linked Document 1", date: "2024-11-05", type: "Informative document" },
        ];
        const mockLinks2 = [
            { id: 3, title: "Linked Document 2", date: "2024-11-05", type: "Design document" },
        ];

        jest.spyOn(db, "all").mockImplementationOnce((sql, params, callback) => {
            callback(null, mockLinks1);  
        });

        jest.spyOn(db, "all").mockImplementationOnce((sql, params, callback) => {
            callback(null, mockLinks2);  
        });

        const result = await documentDao.getDocumentLinks(documentId);
        
        expect(result).toEqual([...mockLinks1, ...mockLinks2]);
    });

    test("Document has no links", async () => {
        const documentId = 1;

        jest.spyOn(db, "all").mockImplementationOnce((sql, params, callback) => {
            callback(null, []);  
        });

        jest.spyOn(db, "all").mockImplementationOnce((sql, params, callback) => {
            callback(null, []);  
        });

        const result = await documentDao.getDocumentLinks(documentId);
        
        expect(result).toEqual({ message: `Document ${documentId} has no links` });
    });

    test("Fails when there is a database error during first query", async () => {
        const documentId = 1;

        jest.spyOn(db, "all").mockImplementationOnce((sql, params, callback) => {
            callback(new Error("Database error during query1"), null);
        });

        await expect(documentDao.getDocumentLinks(documentId))
            .rejects
            .toThrow("Database error: Database error during query1");
    });

    test("Fails when there is a database error during second query", async () => {
        const documentId = 1;
        const mockLinks1 = [
            { id: 2, title: "Linked Document 1", date: "2024-11-05", type: "Informative document" },
        ];

        jest.spyOn(db, "all").mockImplementationOnce((sql, params, callback) => {
            callback(null, mockLinks1);  
        });

        jest.spyOn(db, "all").mockImplementationOnce((sql, params, callback) => {
            callback(new Error("Database error during query2"), null);
        });

        await expect(documentDao.getDocumentLinks(documentId))
            .rejects
            .toThrow("Database error: Database error during query2");
    });

})


describe("Update Link", () => {
    test("Successfully updates an existing link", async () => {
        const idDocument1 = 1;
        const idDocument2 = 2;
        const newLinkDate = "2024-11-05";
        const newLinkType = "Updated";

        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, { count: 1 });  
        });

        jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null);  
        });

        const result = await documentDao.updateLink(idDocument1, idDocument2, newLinkDate, newLinkType);

        expect(result).toEqual({
            id1: idDocument1,
            id2: idDocument2,
            date: newLinkDate,
            type: newLinkType,
        });
    });

})