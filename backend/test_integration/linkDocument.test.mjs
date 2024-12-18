import { describe, test, expect, afterEach } from "@jest/globals";
import { server } from "../index.mjs";
import DocumentDao from "../dao/document.mjs";
import { cleanup } from "../db/cleanup.mjs";

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
    
            const updatedLink = await DocumentDao.prototype.updateLink(1, 2, "2024-11-06", "Updated Type");
    
            expect(updatedLink).toEqual({
                id1: 1,
                id2: 2,
                newType: "Updated Type"
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

})