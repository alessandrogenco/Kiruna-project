import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { app, server } from "../index.mjs";
import request from "supertest";
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
            const linkResult = await DocumentDao.prototype.linkDocuments(testDocument1.id, testDocument2.id, "2024-11-06", "Informative document");
            expect(linkResult).toEqual({
                idDocument1: testDocument1.id,
                idDocument2: testDocument2.id,
                date: "2024-11-06",
                type: "Informative document",
            });
        });

        test("Rejects if link already exists", async () => {
            await DocumentDao.prototype.linkDocuments(testDocument1.id, testDocument2.id, "2024-11-05", "Informative document");
            await expect(
                DocumentDao.prototype.linkDocuments(testDocument1.id, testDocument2.id, "2024-11-06", "Design document")
            ).rejects.toThrow("Link already exists");
        });
    });

    describe("updateLink", () => {
        test("Successfully updates an existing link", async () => {
            await DocumentDao.prototype.linkDocuments(1, 2, "2024-11-05", "Initial Type");
    
            const updatedLink = await DocumentDao.prototype.updateLink(1, 2, "2024-11-06", "Updated Type");
    
            expect(updatedLink).toEqual({
                id1: 1,
                id2: 2,
                date: "2024-11-06",
                type: "Updated Type"
            });
        });

        test("Throws error if link does not exist", async () => {
            await expect(
                documentDao.updateLink(3, 4, "2024-11-06", "Non-existent Type")
            ).rejects.toThrow("Link not found");
        });

        

        

})

})