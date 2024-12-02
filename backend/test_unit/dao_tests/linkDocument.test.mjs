import { describe, test, expect, jest, afterEach } from "@jest/globals";
import db from "../../db/db.mjs";
import DocumentDao from "../../dao/document.mjs";

const documentDao = new DocumentDao();

afterEach(() => {
    jest.restoreAllMocks();
});
describe("Link Documents", () => {
    test("Successfully links two documents", async () => {
        const id1 = 1;
        const id2 = 2;
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

        const result = await documentDao.linkDocuments(id1, id2, linkType);
        
        expect(result.idDocument1).toEqual(id1);
        expect(result.idDocument2).toEqual(id2);
        expect(result.type).toEqual(linkType);
       
    });

    test("Fails when link already exists", async () => {
        const id1 = 1;
        const id2 = 2;
        const linkType = "Informative document";

        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, { count: 1 });  
        });

        await expect(documentDao.linkDocuments(id1, id2, linkType))
            .rejects
            .toThrow("Link of this type already exists between these documents");
    });

    test("Fails when there is a database error during link check", async () => {
        const id1 = 1;
        const id2 = 2;
        const linkType = "Informative document";

        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(new Error("Database error during link check"), null);
        });

        await expect(documentDao.linkDocuments(id1, id2, linkType))
            .rejects
            .toThrow("Database error: Database error during link check");
    });

    test("Fails when there is a database error during link insertion", async () => {
        const id1 = 1;
        const id2 = 2;
        const linkType = "Informative document";

        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, { count: 0 });
        });

        jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(new Error("Database error during link insertion"));
        });

        await expect(documentDao.linkDocuments(id1, id2, linkType))
            .rejects
            .toThrow("Database error: Database error during link insertion");
    });

    test("Fails when there is a database error during connections update", async () => {
        const id1 = 1;
        const id2 = 2;
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

        await expect(documentDao.linkDocuments(id1, id2, linkType))
            .rejects
            .toThrow("Database error: Database error during connections update");
    });

})


describe("Get Document Links", () => {
    test("Successfully retrieves links for a document", async () => {
        const documentId = 1;
        const mockLinks1 = [
            { id: 2, title: "Linked Document 1", type: "Informative document" },
        ];
        const mockLinks2 = [
            { id: 3, title: "Linked Document 2",  type: "Design document" },
        ];

        jest.spyOn(db, "all").mockImplementationOnce((sql, params, callback) => {
            callback(null, mockLinks1);  
        });

        jest.spyOn(db, "all").mockImplementationOnce((sql, params, callback) => {
            callback(null, mockLinks2);  
        });

        const result = await documentDao.getDocumentLinks(documentId);
        
        expect(result.id1).toEqual(mockLinks1.id);
        expect(result.id2).toEqual(mockLinks2.id);
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

        expect(result.id1).toEqual(idDocument1);
        expect(result.id2).toEqual(idDocument2);
        expect(result.type).toEqual(newLinkType);
       
    });

    test("Link does not exist", async () => {
        const idDocument1 = 1;
        const idDocument2 = 2;
        const newLinkDate = "2024-11-05";
        const newLinkType = "Updated";

        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, { count: 0 });  
        });

        await expect(documentDao.updateLink(idDocument1, idDocument2, newLinkDate, newLinkType))
            .rejects
            .toThrow("Link not found");
    });

    test("Fails when there is a database error while checking the link", async () => {
        const idDocument1 = 1;
        const idDocument2 = 2;
        const newLinkDate = "2024-11-05";
        const newLinkType = "Updated ";

        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(new Error("Database error during link check"), null);
        });

        await expect(documentDao.updateLink(idDocument1, idDocument2, newLinkDate, newLinkType))
            .rejects
            .toThrow("Database error: Database error during link check");
    });

    test("Fails when there is a database error while updating the link", async () => {
        const idDocument1 = 1;
        const idDocument2 = 2;
        const newLinkDate = "2024-11-05";
        const newLinkType = "Updated";

        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, { count: 1 }); 
        });

        jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(new Error("Database error during link update"));
        });

        await expect(documentDao.updateLink(idDocument1, idDocument2, newLinkDate, newLinkType))
            .rejects
            .toThrow("Database error: Database error during link update");
    });

})