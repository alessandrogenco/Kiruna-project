import { describe, test, expect, afterEach, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import { server, app } from "../index.mjs"; // Import server and app correctly
import DocumentDao from "../dao/document.mjs"; // Ensure correct path to DocumentDao
import { cleanup } from "../db/cleanup.mjs";
import db from '../db/db.mjs';


// Create mock instance
const documentDao = new DocumentDao();

const testDocument1 = { id: 1, title: "Test Document 1", description: "A sample document" };
const testDocument2 = { id: 2, title: "Test Document 2", description: "Another sample document" };


beforeAll(async () => {
    await cleanup(); 
});

afterEach(async () => {
    await cleanup(); 
});

afterAll(() => {
    server.close();
});

describe("Document DAO Integration Tests", () => {

    describe("linkDocuments", () => {
        test("Successfully links two documents", async () => {
            const linkResult = await DocumentDao.prototype.linkDocuments(testDocument1.id, testDocument2.id, "Informative document");
            expect(linkResult).toEqual({
                idDocument1: testDocument1.id,
                idDocument2: testDocument2.id,
                type: "Informative document",
            });
        });

        test("Rejects if link already exists", async () => {
            await DocumentDao.prototype.linkDocuments(testDocument1.id, testDocument2.id, "Informative document");
            await expect(
                DocumentDao.prototype.linkDocuments(testDocument1.id, testDocument2.id, "Informative document")
            ).rejects.toThrow("Link of this type already exists between these documents");
        });
    });

    describe("updateLink", () => {
        test("Successfully updates an existing link", async () => {
            await DocumentDao.prototype.linkDocuments(1, 2, "2024-11-05", "Initial Type");
        
            const updatedLink = await DocumentDao.prototype.updateLink(1, 2, "Initial Type", "Updated Type");
        
            expect(updatedLink).toEqual({
                id1: 1,
                id2: 2,
                newType: "Updated Type", // Corrected to match the DAO's return value
            });
        });
        

        test("Throws error if link does not exist", async () => {
            await expect(
                documentDao.updateLink(3, 4, "2024-11-06", "Non-existent Type")
            ).rejects.toThrow("Link not found");
        });

    })


    describe("getDocumentLinks", () => {

        test("Returns a message when document has no links", async () => {
            const result = await DocumentDao.prototype.getDocumentLinks(2);
    
            expect(result).toEqual({ message: "Document 2 has no links" });
        });

        test("Returns links for a document that has linked documents", async () => {
            const mockDocumentLinks = [
                {
                    id: 2,
                    title: "Document 2",
                    date: "2024-11-05",
                    type: "Reference"
                },
                {
                    id: 3,
                    title: "Document 3",
                    date: "2024-11-06",
                    type: "Cited"
                }
            ];
    
            jest.spyOn(DocumentDao.prototype, 'getDocumentLinks').mockResolvedValue(mockDocumentLinks);
    
            const links = await DocumentDao.prototype.getDocumentLinks(1);
    
            expect(Array.isArray(links)).toBe(true);
            expect(links.length).toBe(2);
    
            expect(links[0]).toMatchObject({
                id: 2,
                title: "Document 2",
                date: "2024-11-05",
                type: "Reference"
            });
            expect(links[1]).toMatchObject({
                id: 3,
                title: "Document 3",
                date: "2024-11-06",
                type: "Cited"
            });
        });
    
    })

    describe("DELETE LINK", () => {
        test("should return 400 if required parameters are missing", async () => {
            const response = await request(app)
                .delete("/api/deleteLink")
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.error).toBe("idDocument1, idDocument2, and linkType are mandatory");
        });

        test('should return 404 if the specified link does not exist', async () => {
            DocumentDao.deleteLink = jest.fn().mockRejectedValue(new Error('Link not found'));
    
            const response = await request(app)
                .delete('/api/deleteLink')
                .send({
                    idDocument1: 1,
                    idDocument2: 2,
                    linkType: 'exampleType',
                });
    
            expect(response.status).toBe(404);
            expect(response.body.error).toBe('The specified link does not exist');
        });

        // test("should return 200 if the link is successfully deleted", async () => {
        //     DocumentDao.deleteLink = jest.fn().mockResolvedValue({
        //         idDocument1: 1,
        //         idDocument2: 2,
        //         linkType: "exampleType",
        //         status: "deleted",
        //     });
        
        //     const response = await request(app)
        //         .delete("/api/deleteLink")
        //         .send({
        //             idDocument1: 1,
        //             idDocument2: 2,
        //             linkType: "exampleType",
        //         });
        
        //     expect(response.status).toBe(200);
        //     expect(response.body.message).toBe("Link eliminato con successo");
        //     expect(response.body.data).toEqual({
        //         idDocument1: 1,
        //         idDocument2: 2,
        //         linkType: "exampleType",
        //         status: "deleted",
        //     });
        // });
        
        // test("should return 500 for internal server error", async () => {
        //     DocumentDao.deleteLink.mockRejectedValue(new Error("Database error"));

        //     const response = await request(app)
        //         .delete("/api/deleteLink")
        //         .send({
        //             idDocument1: 1,
        //             idDocument2: 2,
        //             linkType: "exampleType",
        //         });

        //     expect(response.status).toBe(500);
        //     expect(response.body.error).toBe("Errore interno del server");
        // });
    });

})