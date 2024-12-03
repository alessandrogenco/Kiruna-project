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
describe("Add new document and delete it", () => {
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
        const lat = 68.0001;
        const lon = 21.0001;
        const area = "";
        const description = "This is a new document description.";

        // Mocking db.run to simulate inserting a new document
        jest.spyOn(db, "run").mockImplementation(function (sql, params, callback) {
            callback.call({ lastID: 1 }, null);  // Simulate successful insertion
        });

        const result = await documentDao.addDocument(
            title, stakeholders, scale, date, type, connections, language, pages, lat, lon, area, description
        );

        expect(result).toEqual({
            id: 1,
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
            area,
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
        const lat = 68.0001;
        const lon = 21.0001;
        const area = "";
        const description = "This is a new document description.";

        await expect(documentDao.addDocument(
            title, stakeholders, scale, date, type, connections, language, pages, lat, lon, area, description
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
        const lat = 68.0001;
        const lon = 21.0001;
        const area = "";
        const description = "This is a new document description.";

        // Mocking db.run to simulate a database error during insertion
        jest.spyOn(db, "run").mockImplementation(function (sql, params, callback) {
            callback(new Error("Database error while adding document"));
        });

        await expect(documentDao.addDocument(
            title, stakeholders, scale, date, type, connections, language, pages, lat, lon, area, description
        )).rejects.toThrow("Database error while adding document");
    });

    test("Successfully deletes a document", async () => {
        // Test data
        const mockId = 1;
    
        // Mocking db.run to simulate deletion of a document
        const mockRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            // Mocking `this` to simulate `changes` property in db.run function
            callback.call({ changes: 1 }, null); // `this.changes = 1` to simulate one row deleted
        });
    
        const result = await documentDao.deleteDocumentById(mockId);
    
        expect(result).toEqual({ id: mockId, message: 'Document deleted successfully.' });
    
        // Clean up the mock
        mockRun.mockRestore();
    });
    
    test("Error when deleting a non-existing document", async () => {
        // Test data
        const mockId = 1;
    
        // Mocking db.run to simulate deletion of a document
        const mockRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            // Mock `this` to simulate `changes` property in db.run function
            callback.call({ changes: 0 }, null); // `this.changes = 0` to simulate no rows deleted
        });
    
        // Expect the promise to reject with a specific error message
        await expect(documentDao.deleteDocumentById(mockId)).rejects.toThrow('No document found with the provided ID');
    
        // Clean up the mock
        mockRun.mockRestore();
    });

    //delete document no id
    test("Error when deleting a document with no ID", async () => {
        await expect(documentDao.deleteDocumentById(null)).rejects.toThrow('ID cannot be empty.');
    });
    
    //delete document db error
    test("Error when there is a database error during delete", async () => {
        // Test data
        const mockId = 1;
    
        // Mocking db.run to simulate a database error
        const mockRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(new Error('Database error during delete'), null);
        });
    
        // Expect the promise to reject with a specific error message
        await expect(documentDao.deleteDocumentById(mockId)).rejects.toThrow('Database error: Database error during delete');
    
        // Clean up the mock
        mockRun.mockRestore();
    });

});

describe("Update document test", () => {
    // Test data
    const validId = 1;
    const title = "Updated Title";
    const stakeholders = "Updated Stakeholders";
    const scale = "1:10.000";
    const issuanceDate = "2022-01-01";
    const type = "Report";
    const connections = "Related Documents";
    const language = "English";
    const pages = 10;
    const lat = 68.0001;
    const lon = 21.0001;
    const area = "";
    const description = "Updated description.";

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("Successfully updates a document", async () => {
        // Mock db.run to simulate a successful update
        const mockRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback.call({ changes: 1 }, null); // Simulate `this.changes = 1`
        });

        const result = await documentDao.updateDocument(validId, title, stakeholders, scale, issuanceDate, type, connections, language, pages, lat, lon, area, description);

        expect(result).toEqual({
            id: validId,
            title,
            stakeholders,
            scale,
            issuanceDate,
            type,
            connections,
            language,
            pages,
            lat,
            lon,
            area,
            description,
            message: 'Document updated successfully.'
        });

        // Clean up mock
        mockRun.mockRestore();
    });

    test("Throws error if ID is missing", async () => {
        await expect(documentDao.updateDocument(null, title, stakeholders, scale, issuanceDate, type, connections, language, pages, lat, lon, area, description))
            .rejects.toThrow('ID is required.');
    });

    test("Throws error if no document is found with the provided ID", async () => {
        // Mock db.run to simulate no changes in the database
        const mockRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback.call({ changes: 0 }, null); // Simulate `this.changes = 0`
        });

        await expect(documentDao.updateDocument(validId, title, stakeholders, scale, issuanceDate, type, connections, language, pages, lat, lon, area, description))
            .rejects.toThrow('No document found with the provided ID.');

        // Clean up mock
        mockRun.mockRestore();
    });

    //db run error

    test("Throws error if there is a database error during update", async () => {
        // Mock db.run to simulate a database error
        const mockRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(new Error('Database error during update'), null);
        });

        await expect(documentDao.updateDocument(validId, title, stakeholders, scale, issuanceDate, type, connections, language, pages, lat, lon, area, description))
            .rejects.toThrow('Database error: Database error during update');

        // Clean up mock
        mockRun.mockRestore();
    });
});

describe('Show Stakeholders', () => {
    test('Successfully retrieves a concatenated list of stakeholders', async () => {
        const mockResult = { stakeholders: 'LKAB - Kiruna Kommun' };

        const mockGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, mockResult);
        });

        const result = await documentDao.showStakeholders();
        expect(result).toBe('LKAB - Kiruna Kommun');
    });

    test('Throws error if there is a database error', async () => {
        const mockError = new Error('Failed to get stakeholders');

        const mockGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(new Error('Failed to get stakeholders'), null);
        });

        await expect(documentDao.showStakeholders()).rejects.toThrow('Database error: Failed to get stakeholders');
    });
});

describe('Show Scales', () => {
    test('Successfully retrieves a list of scales', async () => {
        const mockResult = [{name: "1:10000"}, {name: "large"}, {name: "small"}];
        
        const mockAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(null, mockResult);
        });

        const result = await documentDao.showScales();
        expect(result).toEqual(mockResult);
    });

    test('Throws error if there is a database error', async () => {

        const mockAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(new Error('Failed to get scales'), null);
        });

        await expect(documentDao.showScales()).rejects.toThrow('Database error: Failed to get scales');
    });
});

describe('Show Types', () => {
    test('Successfully retrieves a list of types', async () => {
        const mockResult = [{"name": "Informative"}, {"name": "research"}, {"name": "summary"}];
        
        const mockAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(null, mockResult);
        });

        const result = await documentDao.showTypes();
        expect(result).toEqual(mockResult);
    });

    test('Throws error if there is a database error', async () => {

        const mockAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(new Error('Failed to get types'), null);
        });

        await expect(documentDao.showTypes()).rejects.toThrow('Database error: Failed to get types');
    });
});

describe('Check and add Stakeholders', () => {
    test('Stakeholder already exists', async () => {
      jest.spyOn(db,'get').mockImplementation((query, params, callback) => {
        callback(null, { name: "LKAB" });
      });
      
      const result = await documentDao.checkAndAddStakeholders("LKAB");
      
      expect(result).toEqual([{ message: 'Stakeholder already exists.' }]);
    });

    test('should return a database error while checking stakeholders', async () => {
        jest.spyOn(db,'get').mockImplementation((query, params, callback) => {
          callback(new Error("Failed to access the stakeholder table"), null);
        });
        
        await expect(documentDao.checkAndAddStakeholders("LKAB")).rejects.toThrow('Database error: Failed to access the stakeholder table');

    });

    test('Stakeholder added successfully', async () => {
        jest.spyOn(db,'get').mockImplementation((query, params, callback) => {
          callback(null, null);
        });
        jest.spyOn(db,'run').mockImplementation((query, params, callback) => {
            callback(null);
        });

        const result = await documentDao.checkAndAddStakeholders("LKAB");
        
        expect(result).toEqual([{ message: 'Stakeholder added successfully.' }]);
      });
  
      test('should return a database error while adding stakeholders', async () => {
          jest.spyOn(db,'get').mockImplementation((query, params, callback) => {
            callback(null, null);
          });
          jest.spyOn(db,'run').mockImplementation((query, params, callback) => {
            callback(new Error("Failed to access the stakeholder table"));
          });
          
          await expect(documentDao.checkAndAddStakeholders("LKAB")).rejects.toThrow('Database error: Failed to access the stakeholder table');
  
      });

});
