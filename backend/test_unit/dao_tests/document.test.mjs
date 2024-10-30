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
